<template>
  <div class="layout">
    <NavBarQuadras />

    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">Campeonato {{ campeonato?.nome }}</h1>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else-if="campeonato" class="card-quadra">
        <img :src="campeonato.foto" alt="Foto do campeonato" class="imagem-quadra">
      </div>

      <div v-else>
        <p>Nenhum campeonato encontrado.</p>
      </div>
    </div>
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue'
import { carregarCampeonato } from '@/utils/persistirCampeonato'

export default {
  name: 'GerenciarCampeonatosView',

  components: { SidebarCampeonato, NavBarQuadras },

  data() {
    return {
      sidebarCollapsed: false,
      campeonato: null,
      isLoading: true
    }
  },

  async mounted() {
    try {
      this.campeonato = await carregarCampeonato(this.$route)
    } catch (err) {
      console.error('Erro ao carregar campeonato:', err)
      this.campeonato = null
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-top: 70px;
  margin-left: 250px;
  transition: margin-left 0.3s ease, padding 0.3s ease;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.title {
  color: #3b82f6;
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.1;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 16px;
}

.campeonato-nome {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  margin-top: 140px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .conteudo,
  .conteudo.collapsed {
    margin-left: 0;     
    padding: 16px;
  }

  .title {
    font-size: 35px;
    margin-bottom: 14px;
  }

  .card-quadra {
    height: 220px;
    border-radius: 12px;
  }

  .overlay {
    padding: 12px;
  }

  .campeonato-nome {
    font-size: 18px;
  }

  .loader-container-centralizado {
    margin-top: 90px;
  }

  .loader {
    width: 64px;
    height: 64px;
    border-width: 5px;
  }
}
</style>