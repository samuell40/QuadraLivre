import { defineStore } from 'pinia'

export const useCampeonatoStore = defineStore('campeonato', {
  state: () => ({
    selecionado: null
  }),

  getters: {
    campeonatoAtivo: (state) => state.selecionado
  },

  actions: {
    setCampeonato(campeonato) {
      this.selecionado = campeonato
    },

    limparCampeonato() {
      this.selecionado = null
    }
  },

  persist: {
    key: 'campeonato',
    storage: localStorage
  }
})