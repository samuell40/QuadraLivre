import api from "@/axios"
import { useCampeonatoStore } from "@/storecampeonato"

export async function carregarCampeonato(route) {
  const store = useCampeonatoStore()

  if (store.campeonatoAtivo) {
    return store.campeonatoAtivo
  }

  // LocalStorage
  const salvo = localStorage.getItem('campeonatoAtivo')
  if (salvo) {
    const campeonato = JSON.parse(salvo)
    store.setCampeonato(campeonato)
    return campeonato
  }

  const id = route.query.id
  if (!id) return null

  const res = await api.get(`/campeonato/${id}`)
  store.setCampeonato(res.data)
  return res.data
}