import { defineStore } from "pinia"

export const useWebSocketStore = defineStore("websocket", {
  state: () => ({
    ws: null,
    connected: false,
    partidasAtivas: [],
    partidasEncerradas: [],
    placares: {} // chave: partidaId, valor: dados do placar
  }),

  actions: {
    iniciar() {
      // Evita múltiplas conexões
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return

      this.ws = new WebSocket("ws://localhost:3000/placares")

      this.ws.onopen = () => {
        this.connected = true
        console.log("WebSocket conectado")
      }

      this.ws.onclose = () => {
        this.connected = false
        console.warn("WebSocket desconectado, tentando reconectar em 5s...")
        setTimeout(() => this.iniciar(), 5000)
      }

      this.ws.onerror = (err) => {
        console.error("Erro no WebSocket:", err)
        this.ws.close()
      }

      this.ws.onmessage = (event) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return

        try {
          const data = JSON.parse(event.data)
          const toBool = (v) => v === true || v === 1 || v === "1"

          switch (data.tipo) {
            // Snapshot inicial: recebe todas as partidas
            case "snapshotPartidas": {
              const partidas = Array.isArray(data.partidas) ? data.partidas : []

              this.partidasAtivas = partidas
                .filter(p => !toBool(p.finalizada))
                .map(p => ({
                  ...p,
                  woTimeA: toBool(p.woTimeA),
                  woTimeB: toBool(p.woTimeB),
                  finalizada: false,
                  emIntervalo: toBool(p.emIntervalo),
                }))

              this.partidasEncerradas = partidas
                .filter(p => toBool(p.finalizada))
                .map(p => ({
                  ...p,
                  woTimeA: toBool(p.woTimeA),
                  woTimeB: toBool(p.woTimeB),
                  finalizada: true,
                  emIntervalo: false,
                }))
              break
            }

            // Nova partida começou → entra em "ativas"
            case "partidaIniciada": {
              const partida = {
                ...data.partida,
                woTimeA: toBool(data.partida.woTimeA),
                woTimeB: toBool(data.partida.woTimeB),
                finalizada: false,
                emIntervalo: toBool(data.partida.emIntervalo),
              }

              if (!this.partidasAtivas.some(p => p.id === partida.id)) {
                this.partidasAtivas.unshift(partida)
              }
              break
            }

            // Partida finalizou → sai de "ativas" e entra em "encerradas"
            case "partidaEncerrada": {
              const partida = {
                ...data.partida,
                woTimeA: toBool(data.partida.woTimeA),
                woTimeB: toBool(data.partida.woTimeB),
                finalizada: true,
                emIntervalo: false,
              }

              this.partidasAtivas = this.partidasAtivas.filter(p => p.id !== partida.id)
              if (!this.partidasEncerradas.some(p => p.id === partida.id)) {
                this.partidasEncerradas.unshift(partida)
              }
              break
            }

            // Atualização de placar em tempo real
            case "placarUpdate": {
              this.placares[data.partidaId] = {
                pontosTimeA: data.pontosTimeA,
                pontosTimeB: data.pontosTimeB,
                faltasTimeA: data.faltasTimeA,
                faltasTimeB: data.faltasTimeB,
                substituicoesTimeA: data.substituicoesTimeA,
                substituicoesTimeB: data.substituicoesTimeB,
                tempoSegundos: data.tempoSegundos,
                woTimeA: toBool(data.woTimeA),
                woTimeB: toBool(data.woTimeB),
                emIntervalo: toBool(data.emIntervalo),
              }

              // Atualiza a partida ativa correspondente
              const index = this.partidasAtivas.findIndex(p => p.id === data.partidaId)
              if (index !== -1) {
                this.partidasAtivas[index] = {
                  ...this.partidasAtivas[index],
                  ...this.placares[data.partidaId],
                }
              }
              break
            }

            default:
              console.warn("Evento WS não tratado:", data)
          }
        } catch (err) {
          console.error("Erro ao processar mensagem WS:", err)
        }
      }
    },
  }
})