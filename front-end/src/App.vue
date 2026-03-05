<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="keepAliveRouteNames" :max="25">
      <component
        :is="Component"
        v-if="deveManterEmCache(route)"
        :key="obterChaveCacheRota(route)"
      />
    </keep-alive>

    <component
      :is="Component"
      v-if="!deveManterEmCache(route)"
      :key="route.fullPath"
    />
  </router-view>

  <div v-if="partidasAoVivoOrdenadas.length" class="live-feed-stack">
    <button
      v-for="partida in partidasAoVivoOrdenadas"
      :key="`live-feed-${partida.partidaId}`"
      type="button"
      class="live-feed-card"
      @click="abrirPainelPartidasAoVivo(partida)"
    >
      <div class="live-feed-header">
        <span class="live-feed-status" :class="classeStatusLive(partida.status)">
          {{ rotuloStatusLive(partida.status) }}
        </span>
        <span class="live-feed-campeonato">{{ partida.campeonatoNome || 'Campeonato' }}</span>
      </div>

      <div class="live-feed-placar">
        <span class="live-team">{{ partida.timeA || 'Time A' }}</span>
        <strong class="live-score">{{ partida.pontosTimeA }} x {{ partida.pontosTimeB }}</strong>
        <span class="live-team">{{ partida.timeB || 'Time B' }}</span>
      </div>

      <div class="live-feed-footer">
        <span v-if="partida.quadra" class="live-quadra">{{ partida.quadra }}</span>
        <span class="live-updated">Atualizado agora</span>
      </div>
    </button>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import {
  EVENTO_NOTIFICACAO_PARTIDA_AO_VIVO,
  obterSocket
} from '@/services/socket'
import {
  getDataVersion,
  subscribeDataVersion
} from '@/services/dataVersion'

const SOCKET_DEBUG = import.meta.env.DEV

export default {
  name: 'App',

  data() {
    return {
      socket: null,
      onSocketPartidaAoVivo: null,
      onSocketConnect: null,
      onSocketConnectError: null,
      onSocketDisconnect: null,
      onSocketAny: null,
      partidasAoVivo: {},
      notificacoesNativasPorPartida: {},
      keepAliveRouteNames: [],
      routeRevisionMap: {},
      routeDirtyMap: {},
      routeVisitedMap: {},
      lastDataVersionProcessada: getDataVersion(),
      unsubscribeDataVersion: null
    }
  },

  mounted() {
    this.inicializarCacheRotas()
    this.unsubscribeDataVersion = subscribeDataVersion(this.onDataVersionChange)
    this.conectarSocketNotificacoes()
    this.garantirPermissaoNotificacao()
  },

  beforeUnmount() {
    if (typeof this.unsubscribeDataVersion === 'function') {
      this.unsubscribeDataVersion()
      this.unsubscribeDataVersion = null
    }
    this.desconectarSocketNotificacoes()
  },

  watch: {
    $route: {
      immediate: true,
      handler(rotaAtual) {
        this.tratarEntradaRota(rotaAtual)
      }
    }
  },

  computed: {
    partidasAoVivoOrdenadas() {
      return Object.values(this.partidasAoVivo || {})
        .filter((partida) => Number(partida?.partidaId) > 0)
        .sort((a, b) => Number(b?.atualizadoTimestamp || 0) - Number(a?.atualizadoTimestamp || 0))
        .slice(0, 4)
    }
  },

  methods: {
    inicializarCacheRotas() {
      const nomes = this.$router.getRoutes()
        .filter((route) => typeof route?.name === 'string')
        .filter((route) => route?.meta?.keepAlive !== false)
        .map((route) => String(route.name))

      this.keepAliveRouteNames = Array.from(new Set(nomes))
    },

    deveManterEmCache(route) {
      if (!route || typeof route?.name !== 'string') return false
      return route?.meta?.keepAlive !== false
    },

    obterNomeRota(route) {
      return typeof route?.name === 'string' ? String(route.name) : ''
    },

    obterChaveCacheRota(route) {
      const nomeRota = this.obterNomeRota(route)
      if (!nomeRota) return String(route?.fullPath || '')

      const revisao = Number(this.routeRevisionMap[nomeRota] || 0)
      return `${nomeRota}:${revisao}`
    },

    tratarEntradaRota(route) {
      if (!this.deveManterEmCache(route)) return

      const nomeRota = this.obterNomeRota(route)
      if (!nomeRota) return

      if (this.routeRevisionMap[nomeRota] == null) {
        this.routeRevisionMap[nomeRota] = 0
      }

      const jaVisitada = Boolean(this.routeVisitedMap[nomeRota])
      const rotaSuja = Boolean(this.routeDirtyMap[nomeRota])

      if (jaVisitada && rotaSuja) {
        this.routeRevisionMap[nomeRota] = Number(this.routeRevisionMap[nomeRota] || 0) + 1
        this.routeDirtyMap[nomeRota] = false
      }

      this.routeVisitedMap[nomeRota] = true
    },

    onDataVersionChange(detail = {}) {
      const versao = Number(detail?.version ?? getDataVersion())
      if (!Number.isFinite(versao)) return
      if (versao <= Number(this.lastDataVersionProcessada || 0)) return

      this.lastDataVersionProcessada = versao

      Object.keys(this.routeVisitedMap).forEach((nomeRota) => {
        if (this.routeVisitedMap[nomeRota]) {
          this.routeDirtyMap[nomeRota] = true
        }
      })
    },

    conectarSocketNotificacoes() {
      this.socket = obterSocket()

      if (!this.onSocketPartidaAoVivo) {
        this.onSocketPartidaAoVivo = (payload) => this.tratarNotificacaoPartidaAoVivo(payload)
      }

      if (!this.onSocketConnect) {
        this.onSocketConnect = () => {
          if (SOCKET_DEBUG) {
            console.log('[socket] conectado para notificacoes:', this.socket?.id)
          }
        }
      }

      if (!this.onSocketConnectError) {
        this.onSocketConnectError = (error) => {
          if (SOCKET_DEBUG) {
            console.error('[socket] erro de conexao:', error?.message || error)
          }
        }
      }

      if (!this.onSocketDisconnect) {
        this.onSocketDisconnect = (reason) => {
          if (SOCKET_DEBUG) {
            console.warn('[socket] desconectado:', reason)
          }
        }
      }

      if (!this.onSocketAny) {
        this.onSocketAny = (evento, payload) => {
          if (evento === 'ping' || evento === 'pong') return
          if (SOCKET_DEBUG) {
            console.log('[socket] evento recebido:', evento, payload || '')
          }
        }
      }

      this.socket.off('connect', this.onSocketConnect)
      this.socket.off('connect_error', this.onSocketConnectError)
      this.socket.off('disconnect', this.onSocketDisconnect)
      this.socket.offAny(this.onSocketAny)

      this.socket.on('connect', this.onSocketConnect)
      this.socket.on('connect_error', this.onSocketConnectError)
      this.socket.on('disconnect', this.onSocketDisconnect)
      this.socket.onAny(this.onSocketAny)

      this.socket.off(EVENTO_NOTIFICACAO_PARTIDA_AO_VIVO, this.onSocketPartidaAoVivo)
      this.socket.on(EVENTO_NOTIFICACAO_PARTIDA_AO_VIVO, this.onSocketPartidaAoVivo)

      if (!this.socket.connected) {
        this.socket.connect()
      }
    },

    desconectarSocketNotificacoes() {
      if (this.socket && this.onSocketPartidaAoVivo) {
        this.socket.off(EVENTO_NOTIFICACAO_PARTIDA_AO_VIVO, this.onSocketPartidaAoVivo)
      }
      if (this.socket && this.onSocketConnect) {
        this.socket.off('connect', this.onSocketConnect)
      }
      if (this.socket && this.onSocketConnectError) {
        this.socket.off('connect_error', this.onSocketConnectError)
      }
      if (this.socket && this.onSocketDisconnect) {
        this.socket.off('disconnect', this.onSocketDisconnect)
      }
      if (this.socket && this.onSocketAny) {
        this.socket.offAny(this.onSocketAny)
      }
      this.onSocketPartidaAoVivo = null
      this.onSocketConnect = null
      this.onSocketConnectError = null
      this.onSocketDisconnect = null
      this.onSocketAny = null

      Object.values(this.notificacoesNativasPorPartida || {}).forEach((notificacao) => {
        try {
          if (notificacao && typeof notificacao.close === 'function') {
            notificacao.close()
          }
        } catch (error) {
          if (SOCKET_DEBUG) {
            console.warn('[notificacao] erro ao fechar notificacao nativa:', error)
          }
        }
      })

      this.notificacoesNativasPorPartida = {}
    },

    async garantirPermissaoNotificacao() {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'default') return

      try {
        await Notification.requestPermission()
      } catch (error) {
        console.warn('Nao foi possivel solicitar permissao de notificacao:', error)
      }
    },

    ehStatusEncerrado(status) {
      const statusNormalizado = String(status || '').toUpperCase()
      return ['FINALIZADA', 'CANCELADA', 'DELETADA'].includes(statusNormalizado)
    },

    rotuloStatusLive(status) {
      const statusNormalizado = String(status || '').toUpperCase()
      if (statusNormalizado === 'EM_ANDAMENTO') return 'AO VIVO'
      if (statusNormalizado === 'AGENDADA' || statusNormalizado === 'AGENDADA_HOJE') return 'AGENDADA'
      if (statusNormalizado === 'ADIADA') return 'ADIADA'
      if (statusNormalizado === 'FINALIZADA') return 'FINALIZADA'
      if (statusNormalizado === 'CANCELADA') return 'CANCELADA'
      return 'EM ACOMPANHAMENTO'
    },

    classeStatusLive(status) {
      const statusNormalizado = String(status || '').toUpperCase()
      if (statusNormalizado === 'EM_ANDAMENTO') return 'is-live'
      if (statusNormalizado === 'ADIADA') return 'is-paused'
      return 'is-default'
    },

    normalizarPayloadPartidaAoVivo(payload = {}) {
      const partidaId = Number(payload?.partidaId || 0)
      const status = String(payload?.status || '').toUpperCase()
      const atualizadoEm = String(payload?.atualizadoEm || new Date().toISOString())
      const atualizadoTimestamp = new Date(atualizadoEm).getTime()

      return {
        tipo: String(payload?.tipo || 'PARTIDA_ATUALIZADA'),
        partidaId,
        campeonatoId: Number(payload?.campeonatoId || 0) || null,
        campeonatoNome: String(payload?.campeonatoNome || '').trim(),
        timeA: String(payload?.timeA || 'Time A'),
        timeB: String(payload?.timeB || 'Time B'),
        pontosTimeA: Number(payload?.pontosTimeA ?? 0),
        pontosTimeB: Number(payload?.pontosTimeB ?? 0),
        status,
        encerrada: Boolean(payload?.encerrada) || this.ehStatusEncerrado(status),
        quadra: String(payload?.quadra || '').trim(),
        atualizadoEm,
        atualizadoTimestamp: Number.isFinite(atualizadoTimestamp) ? atualizadoTimestamp : Date.now()
      }
    },

    removerPartidaAoVivo(partidaId) {
      const id = Number(partidaId || 0)
      if (!id) return

      const atualizadas = { ...this.partidasAoVivo }
      delete atualizadas[id]
      this.partidasAoVivo = atualizadas

      const notificacao = this.notificacoesNativasPorPartida[id]
      if (notificacao && typeof notificacao.close === 'function') {
        try {
          notificacao.close()
        } catch (error) {
          if (SOCKET_DEBUG) {
            console.warn('[notificacao] erro ao fechar notificacao nativa da partida:', id, error)
          }
        }
      }

      const mapaNativas = { ...this.notificacoesNativasPorPartida }
      delete mapaNativas[id]
      this.notificacoesNativasPorPartida = mapaNativas
    },

    exibirToastPartidaAoVivo(partida) {
      const tipo = String(partida?.tipo || '')
      if (!['PARTIDA_CRIADA', 'PARTIDA_INICIADA', 'PARTIDA_FINALIZADA'].includes(tipo)) return
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return

      const titulo = tipo === 'PARTIDA_FINALIZADA'
        ? 'Partida finalizada'
        : tipo === 'PARTIDA_INICIADA'
          ? 'Partida em andamento'
          : 'Partida criada'

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: tipo === 'PARTIDA_FINALIZADA' ? 'success' : 'info',
        title: titulo,
        text: `${partida.timeA} ${partida.pontosTimeA} x ${partida.pontosTimeB} ${partida.timeB}`,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      })
    },

    notificarPartidaAoVivoNoSistema(partida) {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      const id = Number(partida?.partidaId || 0)
      if (!id) return

      const titulo = `${partida.timeA} ${partida.pontosTimeA} x ${partida.pontosTimeB} ${partida.timeB}`
      const statusLabel = this.rotuloStatusLive(partida.status)
      const body = [
        partida.campeonatoNome || 'Campeonato',
        statusLabel,
        partida.quadra || ''
      ].filter(Boolean).join(' | ')

      const tag = `partida-live-${id}`
      const encerrada = Boolean(partida.encerrada)

      try {
        const notificacaoAnterior = this.notificacoesNativasPorPartida[id]
        if (notificacaoAnterior && typeof notificacaoAnterior.close === 'function') {
          notificacaoAnterior.close()
        }

        const notificacao = new Notification(titulo, {
          body,
          tag,
          renotify: false,
          requireInteraction: !encerrada,
          silent: true
        })

        notificacao.onclick = () => {
          window.focus()
          this.abrirPainelPartidasAoVivo(partida)
          notificacao.close()
        }

        const mapa = { ...this.notificacoesNativasPorPartida, [id]: notificacao }
        this.notificacoesNativasPorPartida = mapa

        if (encerrada) {
          setTimeout(() => {
            try {
              notificacao.close()
            } catch (error) {
              if (SOCKET_DEBUG) {
                console.warn('[notificacao] erro ao fechar notificacao encerrada:', error)
              }
            }
          }, 4000)
        }
      } catch (error) {
        if (SOCKET_DEBUG) {
          console.warn('Falha ao mostrar notificacao nativa:', error)
        }
      }
    },

    abrirPainelPartidasAoVivo(partida = {}) {
      const query = {}
      if (Number(partida?.partidaId || 0)) {
        query.partidaId = Number(partida.partidaId)
      }

      if (this.$route?.name !== 'visualizar_placarhome') {
        this.$router.push({ name: 'visualizar_placarhome', query }).catch(() => {})
      }
    },

    tratarNotificacaoPartidaAoVivo(payload = {}) {
      const partida = this.normalizarPayloadPartidaAoVivo(payload)
      if (!partida.partidaId) return

      if (SOCKET_DEBUG) {
        console.log('[socket] notificacao ao vivo recebida:', partida)
      }

      if (partida.encerrada) {
        this.removerPartidaAoVivo(partida.partidaId)
        this.exibirToastPartidaAoVivo(partida)
        this.notificarPartidaAoVivoNoSistema(partida)
        return
      }

      this.partidasAoVivo = {
        ...this.partidasAoVivo,
        [partida.partidaId]: partida
      }

      this.exibirToastPartidaAoVivo(partida)
      this.notificarPartidaAoVivoNoSistema(partida)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Montserrat', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
}
img:focus {
  outline: none;
}

body {
  margin: 0;
  font-family: 'Montserrat', sans-serif;
}

.live-feed-stack {
  position: fixed;
  right: 14px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  max-width: min(420px, calc(100vw - 24px));
}

.live-feed-card {
  width: 100%;
  border: 1px solid rgba(33, 55, 121, 0.24);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f2f6ff 100%);
  box-shadow: 0 10px 24px rgba(16, 24, 40, 0.16);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.live-feed-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(16, 24, 40, 0.2);
}

.live-feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.live-feed-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.live-feed-status.is-live {
  color: #b42318;
  background: #fee4e2;
}

.live-feed-status.is-paused {
  color: #92400e;
  background: #fef3c7;
}

.live-feed-status.is-default {
  color: #1d4ed8;
  background: #dbeafe;
}

.live-feed-campeonato {
  font-size: 12px;
  color: #344054;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.live-feed-placar {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) auto minmax(90px, 1fr);
  align-items: center;
  gap: 8px;
}

.live-team {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.live-team:last-child {
  text-align: right;
}

.live-score {
  font-size: 18px;
  color: #0b1f55;
}

.live-feed-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.live-quadra,
.live-updated {
  font-size: 11px;
  color: #667085;
}

@media (max-width: 640px) {
  .live-feed-stack {
    right: 8px;
    left: 8px;
    bottom: 8px;
    max-width: none;
  }
}
</style>
