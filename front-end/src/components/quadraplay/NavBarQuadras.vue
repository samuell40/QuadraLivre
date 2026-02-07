<template>
  <nav class="navbar-custom">
    <div class="navbar-container">
      <div class="esquerda-section">

        <div class="logo-container">
          <img src="../../assets/Cópia de xxxxx (2).png" alt="QuadraPlay" class="logo-img" />
          <span class="logo-text">QuadraPlay</span>
        </div>

        <!-- HAMBURGER -->
        <div class="hamburger" @click="toggleMenu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </div>
      </div>
      <div class="direita-nav">
        <a href="#" class="login" @click.prevent="sair">
          Sair
        </a>
      </div>
    </div>
  </nav>
</template>

<script>

export default {
  name: 'NavbarQuadra',

  data() {
    return {
      isMenuOpen: false,
      mostrarModalLogin: false,
      usuario: null
    }
  },
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
  },

  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    irParaLogin() {
      this.mostrarModalLogin = true
    },
    sair() {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      localStorage.removeItem('quadraSelecionada')
      this.$router.push('/')
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
  border-bottom: 3px solid #3b82f6;
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
}

.logo {
  color: #ffffff;
  font-size: 25px;
  white-space: nowrap;
  margin-left: 80px;
}

.logo-img {
  height: 60px;
  width: auto;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  color: #ffffff;
  font-size: 25px;
  font-weight: 700;
  font-family: "Montserrat", sans-serif;
  white-space: nowrap;
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

.nav-links.active {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 70px;
  left: -1px;
  background-color: #152147;
  width: 80%;
  max-width: 250px;
  padding: 20px;
  gap: 20px;
}

.direita-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  margin-right: 20px;
  gap: 6px;
}

.user-photo {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 50%;
}

.user-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.user-name {
  font-size: 17px;
  color: #3b82f6;
  font-weight: bold;
}

.user-role {
  font-size: 14px;
  margin-top: -4px;
  color: #cbd5e1;
}

.login {
  background-color: #1E3A8A;
  padding: 6px 50px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
}

/* RESPONSIVO */
@media (max-width: 768px) {
  .user-info {
    margin-right: 0;
    gap: 5px;
  }

  .user-photo {
    width: 50px;
    height: 50px;
  }

  .user-name {
    font-size: 14px;
  }

  .user-role {
    font-size: 10px;
    text-align: center;
  }
}
</style>