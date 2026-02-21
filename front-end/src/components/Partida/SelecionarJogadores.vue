<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Selecione os Jogadores</h2>
        <button type="button" class="btn-close-x" @click="$emit('fechar')">x</button>
      </div>

      <div class="colunas">
        <div class="coluna">
          <h3>{{ time1Nome }}</h3>

          <div class="contador">
            <template v-if="regraLivre">
              Selecionados: {{ selecionadosTime1.length }}
            </template>
            <template v-else>
              Selecionados: {{ selecionadosTime1.length }} / {{ regra.porTime }}
            </template>
          </div>

          <div v-for="(jogadores, funcao) in jogadoresPorFuncaoTime1" :key="funcao">
            <h4 class="funcao-titulo">{{ funcao }}</h4>

            <div v-for="j in jogadores" :key="j.id" class="jogador-card">
              <label class="jogador-label">
                <input
                  type="checkbox"
                  v-model="selecionadosTime1"
                  :value="j.id"
                  :disabled="!regraLivre && selecionadosTime1.length >= regra.porTime && !selecionadosTime1.includes(j.id)"
                />

                <div class="jogador-info">
                  <img :src="j.foto" alt="Foto" class="foto-jogador" />
                  <div class="dados-jogador">
                    <span class="nome">{{ j.nome }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="coluna">
          <h3>{{ time2Nome }}</h3>

          <div class="contador">
            <template v-if="regraLivre">
              Selecionados: {{ selecionadosTime2.length }}
            </template>
            <template v-else>
              Selecionados: {{ selecionadosTime2.length }} / {{ regra.porTime }}
            </template>
          </div>

          <div v-for="(jogadores, funcao) in jogadoresPorFuncaoTime2" :key="funcao">
            <h4 class="funcao-titulo">{{ funcao }}</h4>

            <div v-for="j in jogadores" :key="j.id" class="jogador-card">
              <label class="jogador-label">
                <input
                  type="checkbox"
                  v-model="selecionadosTime2"
                  :value="j.id"
                  :disabled="!regraLivre && selecionadosTime2.length >= regra.porTime && !selecionadosTime2.includes(j.id)"
                />

                <div class="jogador-info">
                  <img :src="j.foto" alt="Foto" class="foto-jogador" />
                  <div class="dados-jogador">
                    <span class="nome">{{ j.nome }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save1" @click="confirmar">
          Iniciar Partida
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  props: {
    aberto: Boolean,
    jogadoresTime1: {
      type: Array,
      default: () => []
    },
    jogadoresTime2: {
      type: Array,
      default: () => []
    },
    time1Nome: String,
    time2Nome: String,
    regra: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      selecionadosTime1: [],
      selecionadosTime2: []
    }
  },

  watch: {
    aberto(valor) {
      if (valor) {
        this.selecionadosTime1 = []
        this.selecionadosTime2 = []
      }
    }
  },

  computed: {
    regraLivre() {
      return !!this.regra?.livre
    },
    jogadoresPorFuncaoTime1() {
      return this.agruparPorFuncao(this.jogadoresTime1)
    },
    jogadoresPorFuncaoTime2() {
      return this.agruparPorFuncao(this.jogadoresTime2)
    }
  },

  methods: {
    agruparPorFuncao(jogadores) {
      return jogadores.reduce((acc, jogador) => {
        const funcao =
          jogador.funcao && jogador.funcao.nome
            ? jogador.funcao.nome
            : 'Sem Funcao'

        if (!acc[funcao]) acc[funcao] = []
        acc[funcao].push(jogador)
        return acc
      }, {})
    },

    confirmar() {
      if (this.regraLivre) {
        const minPorTime = Number(this.regra?.minPorTime || 1)
        if (
          this.selecionadosTime1.length < minPorTime ||
          this.selecionadosTime2.length < minPorTime
        ) {
          Swal.fire({
            icon: 'warning',
            title: 'Numero invalido de jogadores',
            text: `Cada time deve ter pelo menos ${minPorTime} jogador(es).`,
            confirmButtonColor: '#3b82f6'
          })
          return
        }
      } else {
        if (
          this.selecionadosTime1.length !== this.regra.porTime ||
          this.selecionadosTime2.length !== this.regra.porTime
        ) {
          Swal.fire({
            icon: 'warning',
            title: 'Numero invalido de jogadores',
            text: `Cada time deve ter exatamente ${this.regra.porTime} jogadores.`,
            confirmButtonColor: '#3b82f6'
          })
          return
        }

        const totalJogadores =
          this.selecionadosTime1.length +
          this.selecionadosTime2.length

        if (totalJogadores !== this.regra.total) {
          Swal.fire({
            icon: 'warning',
            title: 'Quantidade total incorreta',
            text: `A partida deve ter exatamente ${this.regra.total} jogadores.`,
            confirmButtonColor: '#3b82f6'
          })
          return
        }
      }

      this.$emit('confirmar', {
        time1: this.selecionadosTime1,
        time2: this.selecionadosTime2
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;

  display: flex;
  flex-direction: column;
}

.modal-content h2 {
  margin-bottom: 16px;
  color: #3b82f6;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin-bottom: 0;
}

.btn-close-x {
  width: 34px;
  height: 34px;
  border: 1px solid #3b82f6;
  border-radius: 999px;
  background: #fff;
  color: #3b82f6;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
}

.contador {
  font-size: 17px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  background: #fff;
  padding: 6px 0;
  position: sticky;
  top: 48px;
  z-index: 1;
  border-bottom: 1px solid #e5e7eb;
}

.colunas {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.coluna {
  flex: 1;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
  overflow-y: auto;
}

.coluna::-webkit-scrollbar {
  width: 6px;
}

.coluna::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.coluna h3 {
  border-bottom: 1px solid #3b82f6;
  padding: 10px;
  margin: -10px -15px 10px -15px;
  color: #3b82f6;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.funcao-titulo {
  margin: 10px 0 8px;
  color: #7e7e7e;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  font-size: 16px;
}

.jogador-card {
  margin-bottom: 8px;
}

.jogador-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.foto-jogador {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.nome {
  font-weight: 600;
  font-size: 14px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-save1 {
  flex: 1;
  padding: 12px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
  background-color: #3b82f6;
}

@media (max-width: 768px) {
  .colunas {
    flex-direction: column;
  }

  .coluna {
    max-height: 35vh;
  }
}
</style>
