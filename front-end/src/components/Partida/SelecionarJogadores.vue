<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Selecione os Jogadores</h2>

      <div class="colunas">
        <div class="coluna">
          <h3>{{ time1Nome }}</h3>

          <div v-for="(jogadores, funcao) in jogadoresPorFuncaoTime1" :key="funcao">
            <h4 class="funcao-titulo">{{ funcao }}</h4>
            <div v-for="j in jogadores" :key="j.id" class="jogador-card">
              <label class="jogador-label">
                <input type="checkbox" v-model="selecionadosTime1" :value="j.id" />
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

          <div v-for="(jogadores, funcao) in jogadoresPorFuncaoTime2" :key="funcao">
            <h4 class="funcao-titulo">{{ funcao }}</h4>
            <div v-for="j in jogadores" :key="j.id" class="jogador-card">
              <label class="jogador-label">
                <input type="checkbox" v-model="selecionadosTime2" :value="j.id" />
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
        <button class="btn-save1" @click="confirmar">Iniciar Partida</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    aberto: Boolean,
    jogadoresTime1: Array,
    jogadoresTime2: Array,
    time1Nome: String,
    time2Nome: String
  },
  data() {
    return {
      selecionadosTime1: [],
      selecionadosTime2: []
    }
  },
  computed: {
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
        const funcao = jogador.funcao && jogador.funcao.nome ? jogador.funcao.nome : "Sem Função";
        if (!acc[funcao]) acc[funcao] = [];
        acc[funcao].push(jogador);
        return acc;
      }, {});
    },
    confirmar() {
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
  padding: 30px 40px;
  border-radius: 10px;
  width: 900px;
  max-width: 95%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
  text-align: left;
}

.colunas {
  display: flex;
  gap: 20px;
}

.coluna {
  flex: 1;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
}

.coluna h3 {
  border-bottom: 1px solid #3b82f6;
  padding: 10px;
  margin: 0 -10px 10px -10px;
  color: #3b82f6;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
}

.funcao-titulo {
  margin: 10px 0 8px;
  color: #7E7E7E;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
  font-size: 18px;
}

.jogador-card {
  margin-bottom: 10px;
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
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.dados-jogador {
  display: flex;
  flex-direction: column;
}

.nome {
  font-weight: bold;
  font-size: 14px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save1,
.btn-cancel-placar {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save1 {
  background-color: #3b82f6;
}

.btn-cancel-placar {
  background-color: #7e7e7e;
}
</style>