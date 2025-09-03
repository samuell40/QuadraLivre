import { defineStore } from "pinia"

export const useWebSocketStore = defineStore("websocket", {
  state: () => ({
    ws: null,
    connected: false,
    partidasAtivas: [],
    partidasEncerradas: [],
    placares: {}
  }),

  actions: {
    iniciar() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return

      this.ws = new WebSocket("ws://localhost:3000/placares")

      this.ws.onopen = () => {
        this.connected = true
        console.log("WebSocket conectado")
      }

      this.ws.onclose = () => {
        this.connected = false
        console.warn("WebSocket desconectado, tentando reconectar...")
        setTimeout(() => this.iniciar(), 5000)
      }

      this.ws.onerror = (err) => {
        console.error("Erro no WebSocket:", err)
        this.ws.close()
      }
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.tipo === "snapshotPartidas") {
            this.partidasAtivas = Array.isArray(data.partidas) ? data.partidas : [];
          }

          if (data.tipo === "partidaIniciada") {
            const jaExiste = this.partidasAtivas.some(p => p.id === data.partidaId);
            if (!jaExiste) {
              this.partidasAtivas.unshift(data);
            }
          }


          if (data.tipo === "placarUpdate") {
            const index = this.partidasAtivas.findIndex(pa => pa.id === data.partidaId);

            if (data.finalizada) {
              if (index >= 0) {
                const encerrada = { ...this.partidasAtivas[index], ...data, finalizada: true };
                this.partidasAtivas.splice(index, 1);
                this.partidasEncerradas.unshift(encerrada);
              }
            } else {
              if (index >= 0) {
                this.partidasAtivas[index] = { ...this.partidasAtivas[index], ...data };
              } else {
                this.partidasAtivas.push(data);
              }
            }
          }


          if (data.tipo === "partidaPausada" || data.tipo === "partidaRetomada") {
            const index = this.partidasAtivas.findIndex(pa => pa.id === data.partidaId);
            if (index >= 0) {
              this.partidasAtivas[index] = { ...this.partidasAtivas[index], ...data };
            }
          }

          if (data.tipo === "partidasLimpas") {
            this.partidasAtivas = this.partidasAtivas.filter(
              p => p.modalidadeId !== data.modalidadeId
            );
            this.partidasEncerradas = this.partidasEncerradas.filter(
              p => p.modalidadeId !== data.modalidadeId
            );
          }

          if (data.tipo === "visibilidadeAtualizada") {
            if (data.acao === "ocultarGeral" || data.acao === "mostrarGeral") {
              this.placares = {};

              data.placares.forEach(p => {
                const modalidadeNome = p.time?.modalidade?.nome;
                if (!this.placares[modalidadeNome]) this.placares[modalidadeNome] = [];
                this.placares[modalidadeNome].push(p);
              });
            }

            if (data.acao === "ocultarModalidade" || data.acao === "mostrarModalidade") {
              const modalidadeNome = data.modalidade;
              this.placares[modalidadeNome] = data.placares || [];
            }
          }

        } catch (err) {
          console.error("Erro ao processar mensagem WS:", err);
        }
      };
    }
  }
})