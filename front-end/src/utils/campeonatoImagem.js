export const FOTO_PADRAO_CAMPEONATO = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/imagem_campeonatos.png'

export function isFotoPadraoCampeonato(foto) {
  return String(foto || '').trim() === FOTO_PADRAO_CAMPEONATO
}

export function obterFotoCardCampeonato(foto) {
  const fotoNormalizada = String(foto || '').trim()
  return fotoNormalizada || FOTO_PADRAO_CAMPEONATO
}
