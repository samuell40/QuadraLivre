import { io } from 'socket.io-client'
import api from '@/axios'

export const EVENTO_CAMPEONATO_ATUALIZADO = 'campeonato:atualizado'

let socket = null

function resolverUrlSocket() {
  const baseUrl = String(api?.defaults?.baseURL || '').trim()
  if (baseUrl) return baseUrl.replace(/\/+$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return 'http://localhost:3000'
}

export function obterSocket() {
  if (!socket) {
    socket = io(resolverUrlSocket(), {
      transports: ['websocket', 'polling'],
      autoConnect: true
    })
  }

  return socket
}

export function inscreverCampeonatoSocket(campeonatoId) {
  const id = Number(campeonatoId)
  if (!id) return

  obterSocket().emit('campeonato:inscrever', { campeonatoId: id })
}

export function desinscreverCampeonatoSocket(campeonatoId) {
  const id = Number(campeonatoId)
  if (!id || !socket) return

  socket.emit('campeonato:desinscrever', { campeonatoId: id })
}
