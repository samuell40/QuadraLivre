import api from "@/axios"
import { useCampeonatoStore } from "@/storecampeonato"

export async function carregarCampeonato(route) {
  const store = useCampeonatoStore()
  const campeonatoStore = store.campeonatoAtivo
  const routeId = Number(route?.query?.id || 0)
  const storeId = Number(campeonatoStore?.id || 0)

  if (!routeId && campeonatoStore) {
    return campeonatoStore
  }

  const possuiDetalhesSuficientes =
    storeId === routeId &&
    Array.isArray(campeonatoStore?.agendamentos) &&
    Array.isArray(campeonatoStore?.times) &&
    Array.isArray(campeonatoStore?.placares)

  if (possuiDetalhesSuficientes) {
    return campeonatoStore
  }

  const id = routeId || storeId
  if (!id) return null

  const res = await api.get(`/campeonato/${id}`)
  store.setCampeonato(res.data)

  return res.data
}
