<template>
  <div class="team" v-if="timeAtivo">
    <!-- Pontos -->
    <div class="line">
      <div class="box-small">
        <p>Pontos</p>
        <div class="controls espacamento">
          <button @click="decrement(placar.pts)" :disabled="!placar.nome">−</button>
          <span>{{ placar.pts.valor }}</span>
          <button @click="increment(placar.pts)" :disabled="!placar.nome">+</button>
        </div>
      </div>
    </div>

    <div class="line">
      <div class="box-small">
        <p>Partidas Jogadas</p>
        <div class="controls">
          <button @click="decrement(placar.pj)" :disabled="!placar.nome">−</button>
          <span>{{ placar.pj.valor }}</span>
          <button @click="increment(placar.pj)" :disabled="!placar.nome">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>Vitórias</p>
        <div class="controls">
          <button @click="decrement(placar.vitorias)" :disabled="!placar.nome">−</button>
          <span>{{ placar.vitorias.valor }}</span>
          <button @click="increment(placar.vitorias)" :disabled="!placar.nome">+</button>
        </div>
      </div>

      <div class="box-small">
        <p>Derrotas</p>
        <div class="controls">
          <button @click="decrement(placar.derrotas)" :disabled="!placar.nome">−</button>
          <span>{{ placar.derrotas.valor }}</span>
          <button @click="increment(placar.derrotas)" :disabled="!placar.nome">+</button>
        </div>
      </div>
    </div>

    <div class="line">
      <div class="box-small">
        <p>Sets Vencidos</p>
        <div class="controls">
          <button @click="decrement(placar.setsVencidos)" :disabled="!placar.nome">−</button>
          <span>{{ placar.setsVencidos.valor }}</span>
          <button @click="increment(placar.setsVencidos)" :disabled="!placar.nome">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>2x0</p>
        <div class="controls">
          <button @click="decrement(placar.doiszero)" :disabled="!placar.nome">−</button>
          <span>{{ placar.doiszero.valor }}</span>
          <button @click="increment(placar.doiszero)" :disabled="!placar.nome">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>2x1</p>
        <div class="controls">
          <button @click="decrement(placar.doisum)" :disabled="!placar.nome">−</button>
          <span>{{ placar.doisum.valor }}</span>
          <button @click="increment(placar.doisum)" :disabled="!placar.nome">+</button>
        </div>
      </div>
    </div>

    <div class="line">
      <div class="box-small">
        <p>1x2</p>
        <div class="controls">
          <button @click="decrement(placar.umdois)" :disabled="!placar.nome">−</button>
          <span>{{ placar.umdois.valor }}</span>
          <button @click="increment(placar.umdois)" :disabled="!placar.nome">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>0x2</p>
        <div class="controls">
          <button @click="decrement(placar.zerodois)" :disabled="!placar.nome">−</button>
          <span>{{ placar.zerodois.valor }}</span>
          <button @click="increment(placar.zerodois)" :disabled="!placar.nome">+</button>
        </div>
      </div>
      <div class="box-small">
        <p>W.O</p>
        <div class="controls">
          <button @click="decrement(placar.wo)" :disabled="!placar.nome">−</button>
          <span>{{ placar.wo.valor }}</span>
          <button @click="increment(placar.wo)" :disabled="!placar.nome">+</button>
        </div>
      </div>
    </div>

    <button class="btn-save1" @click="salvar">Salvar</button>
  </div>
</template>

<script>
export default {
  name: 'PlacarVoleibol',
  props: {
    placar: {
      type: Object,
      required: true
    },
    timeAtivo: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    increment(obj) {
      obj.valor++;
    },
    decrement(obj) {
      if (obj.valor > 0) {
        obj.valor--;
      }
    },
    salvar() {
      const dadosParaSalvar = {
        pontuacao: this.placar.pts.valor,
        jogos: this.placar.pj.valor,
        vitorias: this.placar.vitorias.valor,
        derrotas: this.placar.derrotas.valor,
        setsVencidos: this.placar.setsVencidos.valor,
        vitoria2x0: this.placar.doiszero.valor,
        vitoria2x1: this.placar.doisum.valor,
        derrota2x1: this.placar.umdois.valor,
        derrota2x0: this.placar.zerodois.valor,
        derrotaWo: this.placar.wo.valor,
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

.btn-voleibol {
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
