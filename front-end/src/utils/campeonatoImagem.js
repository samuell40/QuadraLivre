import fotoPadraoCampeonato from '@/assets/foto_campeonato.png'

export const FOTO_PADRAO_CAMPEONATO = fotoPadraoCampeonato
export const FOTO_PADRAO_CAMPEONATO_LEGACY = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/imagem_campeonatos.png'

export function isFotoPadraoCampeonato(foto) {
  const fotoNormalizada = String(foto || '').trim()
  return fotoNormalizada === FOTO_PADRAO_CAMPEONATO || fotoNormalizada === FOTO_PADRAO_CAMPEONATO_LEGACY
}

export function obterFotoCardCampeonato(foto) {
  const fotoNormalizada = String(foto || '').trim()
  if (isFotoPadraoCampeonato(fotoNormalizada)) return FOTO_PADRAO_CAMPEONATO
  return fotoNormalizada || FOTO_PADRAO_CAMPEONATO
}
