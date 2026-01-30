<template>
  <nav class="navbar-custom">
    <div class="navbar-container">
      <div class="esquerda-section">
        <div class="hamburger" @click="toggleMenu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </div>

        <div class="logo-container">
          <img src="@/assets/Cópia de xxxxx (2).png" alt="Quadra Livre" class="logo-img" />
        </div>
      </div>

      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li>
          <router-link to="/agendarquadra" exact-active-class="active-link">
            Agendar Quadra
          </router-link>
        </li>

        <li class="sair-item">
          <a href="#" @click.prevent="logout" class="sair">Sair</a>
        </li>
      </ul>

      <a href="#" @click.prevent="logout" class="sair-btn-mobile">Sair</a>
    </div>
  </nav>
</template>

<script>
import router from '@/router'
import api from '@/axios'

export default {
  name: 'NavbarQuadra',

  data() {
    return {
      isMenuOpen: false,
      usuarioLogado: {},
      todosAvisos: []
    }
  },

  computed: {
    totalNotificacoes() {
      if (!this.usuarioLogado.id) return 0

      return this.todosAvisos.filter(aviso => {
        if (!aviso.leituras || aviso.leituras.length === 0) return true

        return !aviso.leituras.some(
          l => Number(l.usuarioId) === Number(this.usuarioLogado.id)
        )
      }).length
    }
  },

  mounted() {
    this.carregarUsuario()
    this.carregarAvisos()

    window.addEventListener('avisos-atualizados', this.carregarAvisos)
  },

  beforeUnmount() {
    window.removeEventListener('avisos-atualizados', this.carregarAvisos)
  },

  methods: {
    carregarUsuario() {
      try {
        this.usuarioLogado = JSON.parse(localStorage.getItem('usuario')) || {}
      } catch {
        this.usuarioLogado = {}
      }
    },

    async carregarAvisos() {
      if (!this.usuarioLogado.id) return

      try {
        const { data } = await api.get('/avisos')
        this.todosAvisos = Array.isArray(data) ? data : []
      } catch (err) {
        console.error('Erro ao buscar avisos:', err)
        this.todosAvisos = []
      }
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #152147;
  height: 70px;
  font-family: "Montserrat", sans-serif;
  z-index: 1000;
  box-sizing: border-box;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 100%;
  width: 100%;
  position: relative;
  box-sizing: border-box;
}

.esquerda-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.logo-img {
  height: 60px;
  width: auto;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
  align-items: center;
  margin-left: auto;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  font-size: 16px;
}

.nav-links li a:hover {
  color: #3B82F6;
}

:deep(.active-link) {
  text-decoration: underline !important;
  text-decoration-color: #3B82F6 !important;
  text-underline-offset: 6px !important;
}

.link-com-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none !important;
}

.ativo-customizado .texto-link {
  text-decoration: underline !important;
  text-decoration-color: #3B82F6 !important;
  text-underline-offset: 6px !important;
  color: #3B82F6;
}

.badge-avisos {
  background-color: #3b82f6;
  color: #152147;
  font-size: 11px;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  text-decoration: none !important;
}

.sair {
  background-color: #1E3A8A;
  padding: 8px 24px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: #fff;
  transition: 0.3s;
}

.sair-btn-mobile {
  display: none;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .nav-links.active {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 70px;
    right: 0;
    width: 100vw;
    background-color: #152147;
    padding: 20px 0;
    gap: 20px;
    margin-left: 0;
  }

  .hamburger {
    display: flex;
  }

  .sair-item {
    display: none;
  }

  .sair-btn-mobile {
    display: block;
    position: absolute;
    right: 30px;
    top: 18px;
    background-color: #1E3A8A;
    padding: 6px 16px;
    border-radius: 30px;
    color: white;
    font-weight: 500;
    text-decoration: none;
  }
}
</style>