<template>
  <router-view/>
</template>

<script>
import Swal from 'sweetalert2'
import {
  EVENTO_NOTIFICACAO_PARTIDA_CRIADA,
  obterSocket
} from '@/services/socket'

export default {
  name: 'App',

  data() {
    return {
      socket: null,
      onSocketPartidaCriada: null,
      onSocketConnect: null,
      onSocketConnectError: null,
      onSocketDisconnect: null,
      onSocketAny: null
    }
  },

  mounted() {
    this.conectarSocketNotificacoes()
    this.garantirPermissaoNotificacao()
  },

  beforeUnmount() {
    this.desconectarSocketNotificacoes()
  },

  methods: {
    conectarSocketNotificacoes() {
      this.socket = obterSocket()

      if (!this.onSocketPartidaCriada) {
        this.onSocketPartidaCriada = (payload) => this.tratarNotificacaoPartidaCriada(payload)
      }

      if (!this.onSocketConnect) {
        this.onSocketConnect = () => {
          console.log('[socket] conectado para notificações:', this.socket?.id)
        }
      }
      if (!this.onSocketConnectError) {
        this.onSocketConnectError = (error) => {
          console.error('[socket] erro de conexão:', error?.message || error)
        }
      }
      if (!this.onSocketDisconnect) {
        this.onSocketDisconnect = (reason) => {
          console.warn('[socket] desconectado:', reason)
        }
      }
      if (!this.onSocketAny) {
        this.onSocketAny = (evento, payload) => {
          if (evento === 'ping' || evento === 'pong') return
          console.log('[socket] evento recebido:', evento, payload || '')
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

      this.socket.off(EVENTO_NOTIFICACAO_PARTIDA_CRIADA, this.onSocketPartidaCriada)
      this.socket.on(EVENTO_NOTIFICACAO_PARTIDA_CRIADA, this.onSocketPartidaCriada)

      if (!this.socket.connected) {
        this.socket.connect()
      }
    },

    desconectarSocketNotificacoes() {
      if (this.socket && this.onSocketPartidaCriada) {
        this.socket.off(EVENTO_NOTIFICACAO_PARTIDA_CRIADA, this.onSocketPartidaCriada)
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
      this.onSocketPartidaCriada = null
      this.onSocketConnect = null
      this.onSocketConnectError = null
      this.onSocketDisconnect = null
      this.onSocketAny = null
    },

    async garantirPermissaoNotificacao() {
      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'default') return

      try {
        await Notification.requestPermission()
      } catch (error) {
        console.warn('Não foi possível solicitar permissão de notificação:', error)
      }
    },

    tratarNotificacaoPartidaCriada(payload = {}) {
      const timeA = String(payload?.timeA || 'Time A')
      const timeB = String(payload?.timeB || 'Time B')
      const pontosA = Number(payload?.pontosTimeA ?? 0)
      const pontosB = Number(payload?.pontosTimeB ?? 0)
      const campeonatoNome = String(payload?.campeonatoNome || '').trim()
      const descricaoPartida = `${timeA} x ${timeB} | Placar: ${pontosA} x ${pontosB}`

      const titulo = campeonatoNome
        ? `Nova partida criada (${campeonatoNome})`
        : 'Nova partida criada'

      console.log('[socket] notificação de partida criada recebida:', payload)

      if (document.visibilityState === 'visible') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: titulo,
          text: descricaoPartida,
          timer: 6000,
          timerProgressBar: true,
          showConfirmButton: false
        })
      }

      if (typeof window === 'undefined' || !('Notification' in window)) return
      if (Notification.permission !== 'granted') return

      try {
        const notificacao = new Notification(titulo, {
          body: `${timeA} x ${timeB}\nPlacar: ${pontosA} x ${pontosB}`,
          tag: payload?.partidaId ? `partida-${payload.partidaId}` : undefined
        })

        notificacao.onclick = () => {
          window.focus()
          if (this.$route?.name !== 'visualizar_placarhome') {
            this.$router.push({ name: 'visualizar_placarhome' }).catch(() => {})
          }
          notificacao.close()
        }
      } catch (error) {
        console.warn('Falha ao mostrar notificação nativa:', error)
      }
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

body{
  margin: 0;
  font-family: 'Montserrat', sans-serif; 
}

</style>

