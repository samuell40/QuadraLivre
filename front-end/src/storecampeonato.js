// storecampeonato.js
import { defineStore } from 'pinia'

export const useCampeonatoStore = defineStore('campeonato', {
  state: () => ({
    selecionado: JSON.parse(localStorage.getItem('campeonatoAtivo')) || null
  }),

  getters: {
    campeonatoAtivo: (state) => state.selecionado
  },

  actions: {
    setCampeonato(campeonato) {
      this.selecionado = campeonato
      localStorage.setItem('campeonatoAtivo', JSON.stringify(campeonato))
    },

    limparCampeonato() {
      this.selecionado = null
      localStorage.removeItem('campeonatoAtivo')
    }
  }
})