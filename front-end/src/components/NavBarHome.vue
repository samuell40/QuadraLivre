<template>
  <nav class="navbar-custom">
    <div class="navbar-container">
      <div class="esquerda-section">
        <div class="hamburger" @click="toggleMenu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </div>

        <div class="logo"></div>
        <a href="#" class="login-btn-mobile" @click.prevent="loginComGoogle">
          Login
        </a>

        <a href="#" class="quadra-play desktop-only" @click.prevent="loginQuadraPlayComGoogle">
          QuadraPlay
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-arrow-left-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
              d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
          </svg>
        </a>
      </div>

      <ul class="nav-links">
        <li v-if="$route.path !== '/times'">
          <a href="/times">
            Times
          </a>
        </li>

        <li v-if="$route.path !== '/visualizarplacarhome'">
          <a href="/visualizarplacarhome">
            Tabelas de Classificação
          </a>
        </li>

        <li v-if="$route.path !== '/'">
          <a href="/">
            Tela Inicial
          </a>
        </li>

        <li class="login-item">
          <a href="#" class="login" @click.prevent="loginComGoogle">
            Login
          </a>
        </li>

        <li class="quadra-play-mobile">
          <a href="#" class="quadra-play" @click.prevent="loginQuadraPlayComGoogle">
            QuadraPlay
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-arrow-left-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
            </svg>
          </a>
        </li>
      </ul>

      <div v-if="isMenuOpen" class="mobile-menu-overlay" @click="closeMenu"></div>
      <aside class="mobile-drawer" :class="{ open: isMenuOpen }" @click.stop>
        <div class="drawer-header">
          <div class="drawer-brand"></div>
          <button type="button" class="drawer-close" @click="closeMenu">x</button>
        </div>

        <div class="drawer-links">
          <button type="button" class="drawer-link" :class="{ active: $route.path === '/times' }" @click="navegar('/times')">
            Times
          </button>
          <button
            type="button"
            class="drawer-link"
            :class="{ active: $route.path === '/visualizarplacarhome' }"
            @click="navegar('/visualizarplacarhome')"
          >
            Tabelas de Classificacao
          </button>
          <button type="button" class="drawer-link" :class="{ active: $route.path === '/' }" @click="navegar('/')">
            Tela Inicial
          </button>
        </div>

        <div class="drawer-footer">
          <a href="#" class="quadra-play" @click.prevent="loginQuadraPlayComGoogle">
            QuadraPlay
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-arrow-left-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
            </svg>
          </a>
        </div>
      </aside>
    </div>
  </nav>
</template>

<script>
import router from '@/router'
import Swal from 'sweetalert2'

const QUADRA_PLAY_LOGIN_KEY = 'quadraPlayLoginAtivo'

export default {
  name: 'NavbarQuadra',

  data() {
    return {
      isMenuOpen: false,
      mostrarModalLogin: false
    }
  },

  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    },
    navegar(path) {
      this.closeMenu()
      if (this.$route.path !== path) {
        router.push(path)
      }
    },

    irParaLogin() {
      this.mostrarModalLogin = true
    },

    loginComGoogle() {
      this.closeMenu()
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2.5

      const popup = window.open(
        'http://localhost:3000/auth/google',
        'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const listener = event => {
        if (event.origin !== 'https://quadra-livre.vercel.app') return

        const { token, erro, email, usuario } = event.data

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
          }).then(() => {
            window.location.href = `/cadastro?email=${encodeURIComponent(email)}`
          })
          return
        }

        if (token && usuario) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))
          localStorage.removeItem(QUADRA_PLAY_LOGIN_KEY)

          const quadraSelecionada = JSON.parse(
            localStorage.getItem('quadraSelecionada')
          )

          if ([1, 2].includes(usuario.permissaoId)) {
            router.push({ name: 'Dashboard' })
          } else if (usuario.permissaoId === 4) {
            router.push({ name: 'gerenciar_partida' })
          } else if (usuario.permissaoId === 3) {
            if (quadraSelecionada) {
              router.push({
                name: 'agendar_quadra',
                query: { quadraId: quadraSelecionada.id }
              })
              localStorage.removeItem('quadraSelecionada')
            } else {
              router.push({ name: 'agendar_quadra' })
            }
          } else {
            router.push({ name: 'Home' })
          }
        }

        window.removeEventListener('message', listener)
        if (popup) popup.close()
      }

      window.addEventListener('message', listener, false)
    },
    loginQuadraPlayComGoogle() {
      this.closeMenu()
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2.5

      const popup = window.open(
        'http://localhost:3000/auth/google',
        'Login QuadraPlay',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const listener = event => {
        if (event.origin !== 'https://quadra-livre.vercel.app') return

        const { token, erro, email, usuario } = event.data

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            showConfirmButton: false
          }).then(() => {
            window.location.href = `/cadastro?email=${encodeURIComponent(email)}`
          })
          return
        }

        if (token && usuario) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))

          if ([1, 2].includes(usuario.permissaoId)) {
            localStorage.setItem(QUADRA_PLAY_LOGIN_KEY, '1')
            router.push({ name: 'TelaInicial' })
          } else if (usuario.permissaoId === 4) {
            localStorage.setItem(QUADRA_PLAY_LOGIN_KEY, '1')
            router.push({ name: 'gerenciar_partida' })
          } else if (usuario.permissaoId === 3) {
            localStorage.removeItem(QUADRA_PLAY_LOGIN_KEY)
            Swal.fire({
              icon: 'warning',
              title: 'Acesso negado',
              text: 'Você não tem permissão para acessar o QuadraPlay.'
            })
          } else {
            localStorage.removeItem(QUADRA_PLAY_LOGIN_KEY)
            Swal.fire({
              icon: 'info',
              title: 'Acesso não permitido',
              text: 'Seu perfil não possui acesso ao QuadraPlay.'
            })
          }
        }

        window.removeEventListener('message', listener)
        if (popup) popup.close()
      }

      window.addEventListener('message', listener, false)
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 40px;
}

.navbar-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #152147;
  height: 70px;
  font-family: "Montserrat", sans-serif;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 100%;
  position: relative;
}

.esquerda-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: -12%;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  white-space: nowrap;
  margin-left: 80px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
  align-items: center;
  margin-right: 80px;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links li a:hover {
  color: #3B82F6;
  text-decoration-color: #3B82F6;
}

.nav-links li a:focus,
.nav-links li a:active {
  color: #ffffff;
  text-decoration-color: #3B82F6;
}

.quadra-play {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 25px;
  border: 2px solid #3B82F6;
  border-radius: 15px;
  transition: background-color 0.3s, color 0.3s;
  overflow: visible;
}

.quadra-play svg {
  position: absolute;
  top: 90%;
  right: -12px;
  transform: translateY(-50%);
  width: 25px;
  height: 25px;
  background-color: #152147;
  border-radius: 50%;
  padding: 2px;
}

.quadra-play-mobile {
  display: none;
}

.login {
  background-color: #1E3A8A;
  padding: 6px 50px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  text-align: center;
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

.mobile-menu-overlay {
  position: fixed;
  top: 70px;
  left: 0;
  width: 100%;
  height: calc(100vh - 70px);
  background: rgba(7, 13, 32, 0.48);
  backdrop-filter: blur(3px);
  z-index: 1200;
}

.mobile-drawer {
  position: fixed;
  top: 70px;
  left: 0;
  width: min(86vw, 340px);
  height: calc(100vh - 70px);
  background: #152147;
  border-right: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 12px 0 24px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  transform: translateX(-105%);
  transition: transform 0.22s ease;
  z-index: 1300;
}

.mobile-drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.drawer-brand {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.drawer-close {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
}

.drawer-link {
  border: none;
  background: transparent;
  color: #fff;
  text-align: left;
  font-size: 22px;
  padding: 14px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.drawer-link.active {
  background: rgba(59, 130, 246, 0.16);
  color: #60a5fa;
}

.drawer-footer {
  margin-top: auto;
  padding: 14px 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-footer .quadra-play {
  justify-content: center;
}

.drawer-login {
  display: block;
  text-align: center;
}


.login-btn-mobile {
  display: none;
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }

  .logo {
    margin-left: 0;
    font-size: 16px;
  }

  .esquerda-section {
    margin-left: 0;
  }

  .desktop-only {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
  }

  .login-item {
    display: none;
  }

  .quadra-play-mobile {
    display: block;
  }

  .login-btn-mobile {
    display: inline-block;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: #1E3A8A;
    color: white;
    padding: 6px 20px;
    border-radius: 20px;
    font-size: 14px;
    text-decoration: none;
    z-index: 2000;
  }
}

@media (min-width: 769px) {
  .mobile-menu-overlay,
  .mobile-drawer {
    display: none;
  }
}
</style>
