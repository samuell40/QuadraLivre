<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Usuários</h1>
        <input type="text" placeholder="Digite o nome do usuário..." v-model="busca" class="input-busca"
          :disabled="isLoading" />
      </div>

      <template v-if="isLoading">
        <div class="loader"></div>
      </template>
      <template v-else>
        <div class="usuarios" v-if="usuariosFiltrados.length > 0">
          <div class="card" v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <div class="foto">
              <img :src="usuario.foto" alt="Foto do usuário" />
            </div>
            <div class="info">
              <h2>{{ usuario.nome }}</h2>
              <p>{{ usuario.funcao }}</p>
              <p>{{ usuario.email }}</p>
              <p>
                Total de Agendamentos:
                <b>{{ usuario.totalAgendamentos }}</b>
              </p>
            </div>
          </div>
        </div>
        <p v-else class="sem-resultados">Nenhum usuário encontrado.</p>
      </template>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import axios from 'axios';

export default {
  name: 'UsuariosView',
  components: {
    SideBar,
  },
  data() {
    return {
      usuarios: [],
      busca: '',
      isLoading: true,
    };
  },
  computed: {
    usuariosFiltrados() {
      return this.usuarios.filter((u) =>
        u.nome.toLowerCase().includes(this.busca.toLowerCase())
      );
    },
  },
  mounted() {
    this.carregarUsuarios();
  },
  methods: {
    async carregarUsuarios() {
      this.isLoading = true;
      try {
        const response = await axios.get('http://localhost:3000/usuarios');
        this.usuarios = response.data;
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
}

.layout {
  flex: 1;
  padding: 20px;    
  min-height: 100vh;
  margin-left: 180px;   
  margin-right: -70px;   
}

.header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  margin-top: 17px;
}

.input-busca {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
}

.title {
  font-size: 28px;
  color: #276ef1;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.usuarios {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.sem-resultados {
  color: #999;
  font-style: italic;
  text-align: center;
  margin-top: 30px;
}

.card {
  display: flex;
  flex-direction: row;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  gap: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.foto {
  flex: 0 0 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.foto img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #276ef1;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.info b {
  color: #333;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .layout {
    margin-left: 0;
    padding: 15px 10px;
  }

  .usuarios {
    grid-template-columns: 1fr;
  }

  .card {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
  }

  .foto {
    flex: 0 0 auto;
    margin-bottom: 15px;
  }
}
</style>
