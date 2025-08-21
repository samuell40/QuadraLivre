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

    <!-- Jogos, Vitórias, Derrotas -->
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
        <p>Vitórias</p>
        <div class="controls">
          <button @click="decrement('vitorias', 'vitoria')">−</button>
          <span>{{ placarLocal.vitorias.valor }}</span>
          <button @click="increment('vitorias', 'vitoria')">+</button>
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

    <!-- Sets e Resultados -->
    <div class="line">
      <div class="box-small">
        <p>Sets Vencidos</p>
        <div class="controls">
          <button @click="decrement('setsVencidos')">−</button>
          <span>{{ placarLocal.setsVencidos.valor }}</span>
          <button @click="increment('setsVencidos')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>2x0</p>
        <div class="controls">
          <button @click="decrement('doiszero')">−</button>
          <span>{{ placarLocal.doiszero.valor }}</span>
          <button @click="increment('doiszero')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>2x1</p>
        <div class="controls">
          <button @click="decrement('doisum')">−</button>
          <span>{{ placarLocal.doisum.valor }}</span>
          <button @click="increment('doisum')">+</button>
        </div>
      </div>
    </div>

    <div class="line">
      <div class="box-small">
        <p>1x2</p>
        <div class="controls">
          <button @click="decrement('umdois')">−</button>
          <span>{{ placarLocal.umdois.valor }}</span>
          <button @click="increment('umdois')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>0x2</p>
        <div class="controls">
          <button @click="decrement('zerodois')">−</button>
          <span>{{ placarLocal.zerodois.valor }}</span>
          <button @click="increment('zerodois')">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>W.O</p>
        <div class="controls">
          <button @click="decrement('wo')">−</button>
          <span>{{ placarLocal.wo.valor }}</span>
          <button @click="increment('wo')">+</button>
        </div>
      </div>
    </div>

    <button class="btn-save1" @click="salvar">Salvar</button>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'PlacarVoleiAreia',
  props: {
    placar: { type: Object, required: true },
    timeAtivo: { type: Boolean, required: true },
    timeSelecionado: { type: String, required: false }
  },
  data() {
    return {
      placarLocal: JSON.parse(JSON.stringify(this.placar))
    };
  },
  watch: {
    placar: {
      handler(novo) {
        this.placarLocal = JSON.parse(JSON.stringify(novo));
      },
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
      if (tipo === 'vitoria') this.placarLocal.pts.valor += 2; // geralmente futevôlei soma 2 pts por vitória
    },
    decrement(campo, tipo = '') {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de alterar o placar.', 'warning');
        return;
      }
      if (this.placarLocal[campo].valor > 0) {
        this.placarLocal[campo].valor--;
        if (tipo === 'vitoria' && this.placarLocal.pts.valor >= 2) this.placarLocal.pts.valor -= 2;
      }
    },
    salvar() {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      const dadosParaSalvar = {
        pontuacao: this.placarLocal.pts.valor,
        jogos: this.placarLocal.pj.valor,
        vitorias: this.placarLocal.vitorias.valor,
        derrotas: this.placarLocal.derrotas.valor,
        setsVencidos: this.placarLocal.setsVencidos.valor,
        vitoria2x0: this.placarLocal.doiszero.valor,
        vitoria2x1: this.placarLocal.doisum.valor,
        derrota2x1: this.placarLocal.umdois.valor,
        derrota2x0: this.placarLocal.zerodois.valor,
        derrotaWo: this.placarLocal.wo.valor
      };
      this.$emit('salvar', dadosParaSalvar);
    }
  }
};
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
