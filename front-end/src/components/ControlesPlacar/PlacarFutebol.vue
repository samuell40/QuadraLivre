<template>
  <div class="team" v-if="timeAtivo">
    <!-- Pontos -->
    <div class="line">
      <div class="box-small">
        <p>Pontos</p>
        <div class="controls espacamento">
          <button @click="decrement('pts')">−</button>
          <span>{{ placarLocal.pts.valor }}</span>
          <button @click="increment('pts')">+</button>
        </div>
      </div>
    </div>

    <!-- Vitórias, Empates, Derrotas -->
    <div class="line">
      <div class="box-small">
        <p>Vitórias</p>
        <div class="controls">
          <button @click="decrement('vitorias', 'vitoria')">−</button>
          <span>{{ placarLocal.vitorias.valor }}</span>
          <button @click="increment('vitorias', 'vitoria')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Empates</p>
        <div class="controls">
          <button @click="decrement('empates', 'empate')">−</button>
          <span>{{ placarLocal.empates.valor }}</span>
          <button @click="increment('empates', 'empate')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Derrotas</p>
        <div class="controls">
          <button @click="decrement('derrotas')">−</button>
          <span>{{ placarLocal.derrotas.valor }}</span>
          <button @click="increment('derrotas')">+</button>
        </div>
      </div>
    </div>

    <!--Jogadas -->
    <div class="line">
      <div class="box-small">
        <p>Partidas Jogadas</p>
        <div class="controls">
          <button @click="decrement('pj')">−</button>
          <span>{{ placarLocal.pj.valor }}</span>
          <button @click="increment('pj')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Gols Marcados</p>
        <div class="controls">
          <button @click="decrement('golspro')">−</button>
          <span>{{ placarLocal.golspro.valor }}</span>
          <button @click="increment('golspro')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Gols Sofridos</p>
        <div class="controls">
          <button @click="decrement('golsofridos')">−</button>
          <span>{{ placarLocal.golsofridos.valor }}</span>
          <button @click="increment('golsofridos')">+</button>
        </div>
      </div>
    </div>

    <!--Cartões Amarelos e Vermelhos -->
    <div class="line">
      <div class="box-small">
        <p>Cartão amarelo</p>
        <div class="controls">
          <button @click="decrement('cartaoamarelo')">−</button>
          <span>{{ placarLocal.cartaoamarelo.valor }}</span>
          <button @click="increment('cartaoamarelo')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Cartão Vermelho</p>
        <div class="controls">
          <button @click="decrement('cartaovermelho')">−</button>
          <span>{{ placarLocal.cartaovermelho.valor }}</span>
          <button @click="increment('cartaovermelho')">+</button>
        </div>
      </div>
    </div>

    <button class="btn-save1" @click="salvar">Salvar</button>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
export default {
  name: 'PlacarFutebol',
  props: {
    placar: { type: Object, required: true },
    timeAtivo: { type: Boolean, required: true },
    timeSelecionado: { type: String, required: false }
  },
  data() {
    return { placarLocal: JSON.parse(JSON.stringify(this.placar)) };
  },
  watch: {
    placar: {
      handler(novo) { this.placarLocal = JSON.parse(JSON.stringify(novo)); },
      immediate: true,
      deep: true
    }
  },
  methods: {
    increment(campo, tipo = '') {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de alterar o placar.', 'warning');
        return;
      }
      this.placarLocal[campo].valor++;
      if (tipo === 'vitoria') this.placarLocal.pts.valor += 3;
      else if (tipo === 'empate') this.placarLocal.pts.valor += 1;
    },
    decrement(campo, tipo = '') {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de alterar o placar.', 'warning');
        return;
      }
      if (this.placarLocal[campo].valor > 0) {
        this.placarLocal[campo].valor--;
        if (tipo === 'vitoria' && this.placarLocal.pts.valor >= 3) this.placarLocal.pts.valor -= 3;
        else if (tipo === 'empate' && this.placarLocal.pts.valor >= 1) this.placarLocal.pts.valor -= 1;
      }
    },
    salvar() {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      const saldoDeGols = this.placarLocal.golspro.valor - this.placarLocal.golsofridos.valor;
      const dadosParaSalvar = {
        pontuacao: this.placarLocal.pts.valor,
        jogos: this.placarLocal.pj.valor,
        golsPro: this.placarLocal.golspro.valor,
        golsSofridos: this.placarLocal.golsofridos.valor,
        saldoDeGols,
        empates: this.placarLocal.empates.valor,
        vitorias: this.placarLocal.vitorias.valor,
        derrotas: this.placarLocal.derrotas.valor,
        cartoesAmarelos: this.placarLocal.cartaoamarelo.valor,
        cartoesVermelhos: this.placarLocal.cartaovermelho.valor
      };
      this.$emit('salvar', dadosParaSalvar);
    }
  }
}
</script>

<style scoped>
.line {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 20px;
}


.box-small {
  flex: 1;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  margin-left: 15%;
}

.botoes {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-right: -5%;
}

.btn-placar {
  background-color: #7E7E7E;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-modalidade {
  background-color: #3B82F6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-add {
  background-color: #152147;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.game {
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-left: 15%;
}

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-bottom: 10px;
}

.dropdown-row {
  display: flex;
  gap: 20px;
  width: 90%;
  margin-left: 15%;
}

.dropdown-row .team {
  flex: 1;
}

.box,
.box-small {
  background: #f1f1f1;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  text-align: center;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
}

.controls button {
  background-color: #1e3a8a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
}


.espacamento {
  gap: 27%;
}


.controls button:last-child {
  background-color: #3b82f6;
}


.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}


.btn-cancel {
  background-color: #7E7E7E;
  flex: 1;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
}

.btn-save1 {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}
</style>
