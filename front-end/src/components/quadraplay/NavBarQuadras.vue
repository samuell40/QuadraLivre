<template>
  <nav :class="['navbar-custom', statusThemeClass]">
    <div class="navbar-container">
      <div class="esquerda-section">
        <button
          v-if="isMobile"
          type="button"
          class="hamburger"
          :class="[statusThemeClass, { active: isMenuOpen }]"
          aria-label="Abrir menu lateral"
          @click="toggleSidebar"
        >
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </button>

        <div class="logo-container">
          <div class="logo-badge">
            <img src="../../assets/Cópia de xxxxx (2).png" alt="QuadraPlay" class="logo-img" />
          </div>
          <div class="logo-copy">
            <span class="logo-text">QuadraPlay</span>
          </div>
        </div>
      </div>

      <div class="direita-nav">
        <a href="#" :class="['login', statusThemeClass]" @click.prevent="sair">
          Sair
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
const SIDEBAR_TOGGLE_EVENT = 'quadraplay:toggle-sidebar'
const SIDEBAR_STATE_EVENT = 'quadraplay:sidebar-state'

export default {
  name: 'NavbarQuadra',
  props: {
    partidaStatus: { type: String, default: '' }
  },

  data() {
    return {
      isMenuOpen: false,
      isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
      mostrarModalLogin: false,
      usuario: null
    }
  },
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    window.addEventListener('resize', this.handleResize)
    window.addEventListener(SIDEBAR_STATE_EVENT, this.syncSidebarState)
    this.handleResize()
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener(SIDEBAR_STATE_EVENT, this.syncSidebarState)
  },

  computed: {
    statusThemeClass() {
      if (this.partidaStatus === 'EM_ANDAMENTO') return 'status-andamento'
      if (this.partidaStatus === 'FINALIZADA') return 'status-finalizada'
      return ''
    }
  },

  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.isMenuOpen = false
      }
    },
    syncSidebarState(event) {
      this.isMenuOpen = Boolean(event?.detail?.open) && this.isMobile
    },
    toggleSidebar() {
      if (!this.isMobile) return
      window.dispatchEvent(new CustomEvent(SIDEBAR_TOGGLE_EVENT))
    },

    irParaLogin() {
      this.mostrarModalLogin = true
    },
    sair() {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('quadraSelecionada')
      localStorage.removeItem('quadraPlayLoginAtivo')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.navbar-custom {
  --navbar-bg-start: #152147;
  --navbar-bg-end: #0d1736;
  --navbar-accent: #60a5fa;
  --navbar-surface: rgba(255, 255, 255, 0.05);
  --navbar-surface-strong: rgba(255, 255, 255, 0.1);
  --navbar-border: rgba(148, 163, 184, 0.22);
  --navbar-text: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 70px;
  font-family: "Montserrat", sans-serif;
  z-index: 1000;
  background:
    radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 34%),
    linear-gradient(135deg, var(--navbar-bg-start), var(--navbar-bg-end));
  border-bottom: 1px solid var(--navbar-border);
  box-shadow: 0 14px 30px rgba(2, 6, 23, 0.24);
}

.navbar-custom::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--navbar-accent), transparent);
  opacity: 0.9;
}

.navbar-custom.status-andamento {
  --navbar-bg-start: #14532d;
  --navbar-bg-end: #0c2e1d;
  --navbar-accent: #4ade80;
}

.navbar-custom.status-finalizada {
  --navbar-bg-start: #7f1d1d;
  --navbar-bg-end: #450a0a;
  --navbar-accent: #f87171;
}

.navbar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 22px 0 18px;
}

.esquerda-section {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.direita-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 5px 11px 5px 6px;
  border-radius: 999px;
  background: var(--navbar-surface);
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.logo-badge {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.logo-img {
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 12px;
}

.logo-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.logo-eyebrow {
  color: rgba(191, 219, 254, 0.92);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.logo-text {
  color: var(--navbar-text);
  font-size: 29px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  white-space: nowrap;
}

.hamburger {
  display: none;
  width: 40px;
  height: 40px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.hamburger:hover {
  background: rgba(255, 255, 255, 0.12);
}

.hamburger span {
  width: 18px;
  height: 2px;
  background-color: #fff;
  border-radius: 999px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.status-andamento {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.22);
}

.hamburger.status-finalizada {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.22);
}

.hamburger.active {
  background: rgba(255, 255, 255, 0.14);
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

.login {
  min-height: 40px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.login:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.12);
}

.login.status-andamento {
  border-color: rgba(74, 222, 128, 0.22);
}

.login.status-finalizada {
  border-color: rgba(248, 113, 113, 0.24);
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 12px 0 10px;
  }

  .esquerda-section {
    gap: 8px;
  }

  .logo-container {
    gap: 10px;
    padding: 4px 10px 4px 5px;
  }

  .logo-badge {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    border-radius: 13px;
  }

  .logo-img {
    width: 33px;
    height: 33px;
  }

  .logo-eyebrow {
    display: none;
  }

  .logo-text {
    font-size: 22px;
  }

  .hamburger {
    display: inline-flex;
    flex: 0 0 auto;
  }

  .login {
    min-height: 38px;
    padding: 0 16px;
    font-size: 13px;
  }
}
</style>
