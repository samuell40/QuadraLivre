import fotoPadraoTime from '@/assets/foto_time.png'

export const FOTO_PADRAO_TIME = fotoPadraoTime

export function obterFotoTime(foto) {
  const fotoNormalizada = String(foto || '').trim()
  return fotoNormalizada || FOTO_PADRAO_TIME
}
