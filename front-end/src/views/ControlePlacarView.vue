<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Placar</h1>
      </div>

      <div class="game">
        <div class="team">
          <select v-model="jogo.timeA.nome" class="dropdown">
            <option disabled value="">Selecione um time</option>
            <option v-for="(time, i) in times" :key="i" :value="time">{{ time }}</option>
          </select>

          <div class="line">
            <div class="box-small">
              <p>Pontos</p>
              <div class="controls espacamento">
                <button @click="decrement(jogo.timeA.pts)">−</button>
                <span>{{ jogo.timeA.pts.valor }}</span>
                <button @click="increment(jogo.timeA.pts)">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Gols Marcados</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.gols)">−</button>
                <span>{{ jogo.timeA.gols.valor }}</span>
                <button @click="increment(jogo.timeA.gols)">+</button>
              </div>
            </div>

            <div class="box-small">
              <p>Empates</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.empates)">−</button>
                <span>{{ jogo.timeA.empates.valor }}</span>
                <button @click="increment(jogo.timeA.empates)">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Vitórias</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.vitorias)">−</button>
                <span>{{ jogo.timeA.vitorias.valor }}</span>
                <button @click="increment(jogo.timeA.vitorias)">+</button>
              </div>
            </div>

            <div class="box-small">
              <p>Derrotas</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.derrotas)">−</button>
                <span>{{ jogo.timeA.derrotas.valor }}</span>
                <button @click="increment(jogo.timeA.derrotas)">+</button>
              </div>
            </div>
          </div>

          <button class="btn-save" @click="salvarPlacar">Salvar</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';

export default {
  name: "ControlePlacarView",
  components: {
    SideBar
  },
  data() {
    return {
      jogo: this.criarNovoJogo(),
      times: []
    };
  },
  mounted() {
    this.carregarTimes();
  },
  methods: {
    async carregarTimes() {
      try {
        const response = await fetch('http://localhost:3000/times');
        const data = await response.json();
        this.times = data.times;
      } catch (error) {
        Swal.fire('Erro', 'Erro ao carregar os times.', 'error');
      }
    },
    criarNovoJogo() {
      const criarStats = () => ({
        nome: "",
        gols: { valor: 0 },
        pts: { valor: 0 },
        empates: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 }
      });
      return {
        timeA: criarStats()
      };
    },
    increment(item) {
      item.valor++;
    },
    decrement(item) {
      if (item.valor > 0) item.valor--;
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    atributosTimeA(jogo) {
      return Object.fromEntries(
        Object.entries(jogo.timeA).filter(([key]) => key !== "gols" && key !== "nome")
      );
    },
    async salvarPlacar() {
      const nome = this.jogo.timeA.nome;

      if (!nome) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar.', 'warning');
        return;
      }

      const payload = {
        gols: this.jogo.timeA.gols.valor,
        pts: this.jogo.timeA.pts.valor,
        empates: this.jogo.timeA.empates.valor,
        vitorias: this.jogo.timeA.vitorias.valor,
        derrotas: this.jogo.timeA.derrotas.valor
      };

      try {
        const response = await fetch(`http://localhost:3000/placar/${encodeURIComponent(nome)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar placar');
        }

        Swal.fire('Sucesso', 'Placar atualizado com sucesso!', 'success');
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    atualizarPontos() {
      const { vitorias, empates, pts } = this.jogo.timeA;
      pts.valor = (vitorias.valor * 3) + (empates.valor * 1);
    }
  },
  watch: {
    'jogo.timeA.vitorias.valor': 'atualizarPontos',
    'jogo.timeA.empates.valor': 'atualizarPontos',
  }
};
</script>

<style scoped>
.container {
  display: flex;
  margin-top: 20px;
}

.layout {
  flex: 1;
  padding: 20px 30px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.line {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.box-small {
  flex: 1;
}

.title {
  color: #2563eb;
  font-size: 28px;
  margin-left: 20%;
}

.btn-add {
  background-color: #2563eb;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.game {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 30px;
}

.team {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-left: 20%;
}

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
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
  margin-top: 8px;
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

.btn-save {
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