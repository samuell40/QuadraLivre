import api from "@/axios"
import { useCampeonatoStore } from "@/storecampeonato"

export async function carregarCampeonato(route) {
  const store = useCampeonatoStore()

  if (store.campeonatoAtivo) {
    return store.campeonatoAtivo
  }

  const id = route.query.id
  if (!id) return null

  const res = await api.get(`/campeonato/${id}`)
  store.setCampeonato(res.data)

  return res.data
}