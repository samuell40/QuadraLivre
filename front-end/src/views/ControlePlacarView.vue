<template>
  <div class="container"> 
    <SideBar />
    <div class="layout"> 
      <div class="header">
        <h1 class="title">Placar</h1>
        <button class="btn-add" @click="addGame">Adicionar Time</button>
      </div>

      <div class="game" v-for="(jogo, index) in jogos" :key="index">
        <div class="team">
          <h2>Time</h2>
          <div class="box">
            <p>Gols Marcados</p>
            <div class="controls">
              <button @click="decrement(jogo.timeA.gols)">−</button>
              <span>{{ jogo.timeA.gols.valor }}</span>
              <button @click="increment(jogo.timeA.gols)">+</button>
            </div>
          </div>
          <div
            class="box-small"
            v-for="(item, key) in atributosTimeA(jogo)"
            :key="key"
          >
            <p>{{ capitalize(key) }}</p>
            <div class="controls">
              <button @click="decrement(item)">−</button>
              <span>{{ item.valor }}</span>
              <button @click="increment(item)">+</button>
            </div>
          </div>
          <button class="btn-remove" @click="removerJogo(index)">Remover</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import SideBar from '@/components/SideBar.vue';

export default {
  name: "ControlePlacarView",
  components: {
    SideBar
  },
  data() {
    return {
      jogos: [this.criarNovoJogo()]
    };
  },
  methods: {
    criarNovoJogo() {
      const criarStats = () => ({
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
    addGame() {
      this.jogos.push(this.criarNovoJogo());
    },
    removerJogo(index) {
      this.jogos.splice(index, 1);
    },
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    atributosTimeA(jogo) {
      return Object.fromEntries(
        Object.entries(jogo.timeA).filter(([key]) => key !== "gols")
      );
    },
    }
  }
</script>

<style scoped>
.conteiner {
  display: flex;
  height: 100vh; 
  background: #f9fafb;
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-left: 20%;
}

.team h2 {
  text-align: center;
  margin-bottom: 15px;
  background: #f3f3f3;
  padding: 10px;
  border-radius: 6px;
}

.box, .box-small {
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

.controls button:last-child {
  background-color: #3b82f6;
}

.btn-remove {
  width: 100%;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px;
  margin-top: 15px;
  border-radius: 6px;
  cursor: pointer;
}

</style>