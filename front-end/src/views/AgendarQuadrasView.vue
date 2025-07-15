<template>
  <div class="container">
    <NavBar />

    <div class="titulo">
      <h1>Agendar Quadra</h1>
    </div>

    <div v-if="isLoadingQuadras" class="loader"></div>

    <div v-else class="quadras-grid">
      <div class="card-quadra" v-for="quadra in quadras" :key="quadra.id">
        <img
          :src="quadra.foto || require('@/assets/futibinha.png')"
          :alt="quadra.nome"
          class="imagem-quadra"
        />
        <div class="overlay">
          <h3 class="nome-quadra">{{ quadra.nome }}</h3>
          <button class="btn-agendar">Agendar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';

export default {
  name: 'AgendarQuadras',
  components: {
    NavBar,
  },
  data() {
    return {
      quadras: [],
      isLoadingQuadras: true,
    };
  },
  mounted() {
    this.carregarQuadras();
  },
  methods: {
    async carregarQuadras() {
      this.isLoadingQuadras = true;
      try {
        const res = await fetch('https://quadra-livre-backend.onrender.com/quadra');
        const data = await res.json();
        this.quadras = data;
      } catch (err) {
        console.error('Erro ao carregar quadras:', err);
      } finally {
        this.isLoadingQuadras = false;
      }
    }
  }
};
</script>

<style scoped>
body {
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.container {
  font-family: "Montserrat", sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
  width: 100%;
  max-width: none;
  padding: 24px 80px;
}

.titulo {
  margin-top: 80px;
  margin-bottom: 32px;
}

.titulo h1 {
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.card-quadra {
  position: relative;
  max-width: 100%;
  width: 420px;
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.imagem-quadra {
  width: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nome-quadra {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.btn-agendar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;

  width: 80px;
  height: 36  px;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  transition: background-color 0.2s;
}

.btn-agendar:hover {
  background-color: #2563eb;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>