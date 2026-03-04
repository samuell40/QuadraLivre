<template>
  <nav class="navbar-custom">
    <div class="navbar-container">
      <div class="left-actions">
        <button
          type="button"
          class="hamburger"
          :class="{ active: isMenuOpen }"
          aria-label="Abrir menu"
          :aria-expanded="String(isMenuOpen)"
          @click="toggleMenu"
        >
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </button>

        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Quadra Play" class="logo-img" />
        </div>
      </div>

      <div class="nav-links">
        <button
          type="button"
          class="nav-link"
          :class="{ active: isActive('/agendarquadra') }"
          @click="navegar('/agendarquadra')"
        >
          Agendar Quadra
        </button>

        <button
          type="button"
          class="nav-link"
          :class="{ active: isActive('/meusagendamentos') }"
          @click="navegar('/meusagendamentos')"
        >
          Meus Agendamentos
        </button>

        <button
          type="button"
          class="nav-link nav-link-badge"
          :class="{ active: isActive('/meusavisos') }"
          @click="navegar('/meusavisos')"
        >
          <span>Meus Avisos</span>
          <span v-if="totalNotificacoes > 0" class="badge-avisos">
            {{ totalNotificacoes }}
          </span>
        </button>
      </div>

      <div class="nav-actions">
        <button type="button" class="desktop-logout" @click="logout">
          Sair
        </button>

        <button type="button" class="mobile-avisos" @click="navegar('/meusavisos')">
          <span>Avisos</span>
          <strong v-if="totalNotificacoes > 0">{{ totalNotificacoes }}</strong>
        </button>
      </div>
    </div>

    <transition name="drawer-fade">
      <div v-if="isMenuOpen && isMobile" class="mobile-menu-overlay" @click="closeMenu"></div>
    </transition>

    <aside class="mobile-drawer" :class="{ open: isMenuOpen }" @click.stop>
      <div class="drawer-header">
        <div class="drawer-brand">
          <div class="drawer-brand-top">
            <div class="drawer-logo">
              <img src="@/assets/logo.png" alt="Quadra Play" class="drawer-logo-img" />
            </div>

            <div class="drawer-brand-copy">
              <span class="drawer-kicker">Area do usuario</span>
              <strong class="drawer-title">{{ usuarioLogado.nome || 'Minha conta' }}</strong>
            </div>
          </div>

          <span class="drawer-subtitle">Acesse seus agendamentos, avisos e atalhos principais.</span>
        </div>

        <button type="button" class="drawer-close" aria-label="Fechar menu" @click="closeMenu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div class="drawer-links">
        <button
          type="button"
          class="drawer-link"
          :class="{ active: isActive('/agendarquadra') }"
          @click="navegar('/agendarquadra')"
        >
          <span class="drawer-link-title">Agendar Quadra</span>
          <span class="drawer-link-subtitle">Escolha a quadra e faca uma nova reserva.</span>
        </button>

        <button
          type="button"
          class="drawer-link"
          :class="{ active: isActive('/meusagendamentos') }"
          @click="navegar('/meusagendamentos')"
        >
          <span class="drawer-link-title">Meus Agendamentos</span>
          <span class="drawer-link-subtitle">Consulte reservas atuais e historico.</span>
        </button>

        <button
          type="button"
          class="drawer-link drawer-link-badge"
          :class="{ active: isActive('/meusavisos') }"
          @click="navegar('/meusavisos')"
        >
          <span class="drawer-link-main">
            <span class="drawer-link-title">Meus Avisos</span>
            <span class="drawer-link-subtitle">Acompanhe mensagens e atualizacoes.</span>
          </span>

          <span v-if="totalNotificacoes > 0" class="badge-avisos large">
            {{ totalNotificacoes }}
          </span>
        </button>
      </div>

      <div class="drawer-footer">
        <div class="drawer-user-card">
          <div class="drawer-user-avatar">
            <img
              v-if="usuarioLogado?.foto"
              :src="usuarioLogado.foto"
              :alt="`Foto de ${usuarioLogado?.nome || 'usuario'}`"
            />
            <span v-else>{{ userInitial }}</span>
          </div>

          <div class="drawer-user-copy">
            <strong>{{ usuarioLogado?.nome || 'Usuario' }}</strong>
            <span>{{ userResumo }}</span>
          </div>
        </div>

        <button type="button" class="drawer-logout" @click="logout">
          Sair
        </button>
      </div>
    </aside>
  </nav>
</template>

<script>
import router from '@/router'
import api from '@/axios'

export default {
  name: 'NavbarUser',

  data() {
    return {
      isMenuOpen: false,
      isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
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
    },

    userInitial() {
      return String(this.usuarioLogado?.nome || 'U')
        .trim()
        .charAt(0)
        .toUpperCase()
    },

    userResumo() {
      if (this.totalNotificacoes > 0) {
        return `${this.totalNotificacoes} aviso(s) pendente(s)`
      }
      return 'Area do usuario'
    }
  },

  mounted() {
    this.carregarUsuario()
    this.carregarAvisos()
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('avisos-atualizados', this.carregarAvisos)
    this.handleResize()
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('avisos-atualizados', this.carregarAvisos)
    this.syncBodyScroll(false)
  },

  watch: {
    '$route.fullPath'() {
      this.closeMenu()
    }
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

    handleResize() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.closeMenu()
      }
    },

    syncBodyScroll(shouldLock) {
      if (typeof document === 'undefined') return
      document.body.style.overflow = shouldLock ? 'hidden' : ''
    },

    isActive(path) {
      return this.$route.path === path
    },

    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
      this.syncBodyScroll(this.isMenuOpen && this.isMobile)
    },

    closeMenu() {
      this.isMenuOpen = false
      this.syncBodyScroll(false)
    },

    navegar(path) {
      this.closeMenu()
      if (this.$route.path !== path) {
        router.push(path)
      }
    },

    logout() {
      this.closeMenu()
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('quadraPlayLoginAtivo')
      router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar-custom {
  --nav-bg-start: #152147;
  --nav-bg-end: #0d1736;
  --nav-border: rgba(148, 163, 184, 0.2);
  position: fixed;
  inset: 0 0 auto;
  height: 70px;
  z-index: 1200;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 34%),
    linear-gradient(135deg, var(--nav-bg-start), var(--nav-bg-end));
  border-bottom: 1px solid var(--nav-border);
  box-shadow: 0 16px 34px rgba(2, 6, 23, 0.24);
}

.navbar-container {
  height: 100%;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
}

.logo-container {
  display: inline-flex;
  align-items: center;
}

.logo-img {
  height: 56px;
  width: auto;
  display: block;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
}

.nav-link {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: rgba(226, 232, 240, 0.9);
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.nav-link.active {
  background: rgba(59, 130, 246, 0.16);
  border-color: rgba(96, 165, 250, 0.18);
  color: #ffffff;
}

.nav-link-badge {
  position: relative;
}

.badge-avisos {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #60a5fa;
  color: #0f172a;
  font-size: 11px;
  font-weight: 800;
}

.badge-avisos.large {
  min-width: 28px;
  height: 28px;
  font-size: 12px;
}

.nav-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex: 0 0 auto;
}

.desktop-logout,
.mobile-avisos {
  min-height: 42px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.desktop-logout {
  border: 1px solid rgba(96, 165, 250, 0.18);
  background: rgba(37, 99, 235, 0.88);
  color: #ffffff;
}

.mobile-avisos {
  display: none;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.mobile-avisos strong {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #60a5fa;
  color: #0f172a;
  font-size: 11px;
}

.hamburger {
  display: none;
  width: 42px;
  height: 42px;
  padding: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.hamburger span {
  width: 18px;
  height: 2px;
  background: #ffffff;
  border-radius: 999px;
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.mobile-menu-overlay {
  position: fixed;
  inset: 70px 0 0;
  z-index: 1210;
  background: rgba(7, 13, 32, 0.54);
  backdrop-filter: blur(6px);
}

.mobile-drawer {
  position: fixed;
  top: 82px;
  left: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 1220;
  width: min(86vw, 360px);
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.12), transparent 38%),
    linear-gradient(180deg, #162452 0%, #0f1d47 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  box-shadow: 0 26px 44px rgba(2, 6, 23, 0.4);
  overflow: hidden;
  transform: translateX(-112%);
  transition: transform 0.26s ease;
}

.mobile-drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-brand {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.drawer-brand-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-logo {
  width: 50px;
  height: 50px;
  flex: 0 0 50px;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
}

.drawer-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer-brand-copy {
  display: grid;
  gap: 2px;
}

.drawer-kicker {
  color: rgba(191, 219, 254, 0.76);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.drawer-title {
  color: #ffffff;
  font-size: 22px;
  line-height: 1.05;
}

.drawer-subtitle {
  color: rgba(191, 219, 254, 0.72);
  font-size: 13px;
  line-height: 1.5;
}

.drawer-close {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  cursor: pointer;
}

.drawer-close svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.drawer-links {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  gap: 10px;
  padding: 16px 14px;
}

.drawer-link {
  width: 100%;
  display: grid;
  gap: 4px;
  padding: 16px 16px;
  border: 1px solid transparent;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.drawer-link:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.06);
}

.drawer-link.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(96, 165, 250, 0.14));
  border-color: rgba(96, 165, 250, 0.28);
  box-shadow: inset 3px 0 0 #60a5fa;
}

.drawer-link-badge {
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}

.drawer-link-main {
  display: grid;
  gap: 4px;
}

.drawer-link-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.drawer-link-subtitle {
  color: rgba(191, 219, 254, 0.72);
  font-size: 13px;
  line-height: 1.45;
}

.drawer-footer {
  display: grid;
  gap: 12px;
  padding: 16px 14px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-user-avatar {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 16px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 17px;
  font-weight: 800;
}

.drawer-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drawer-user-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.drawer-user-copy strong {
  color: #ffffff;
  font-size: 15px;
}

.drawer-user-copy span {
  color: rgba(191, 219, 254, 0.72);
  font-size: 12px;
  line-height: 1.4;
}

.drawer-logout {
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid rgba(248, 113, 113, 0.24);
  border-radius: 18px;
  background: rgba(248, 113, 113, 0.1);
  color: #ffffff;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.drawer-logout:hover {
  transform: translateY(-1px);
  background: rgba(248, 113, 113, 0.16);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.22s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 14px;
    gap: 12px;
  }

  .nav-links,
  .desktop-logout {
    display: none;
  }

  .hamburger,
  .mobile-avisos {
    display: inline-flex;
  }

  .logo-img {
    height: 48px;
  }
}

@media (min-width: 769px) {
  .mobile-menu-overlay,
  .mobile-drawer {
    display: none;
  }
}
</style>
