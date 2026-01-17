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

        <li>
          <router-link to="/meusagendamentos" exact-active-class="active-link">
            Meus Agendamentos
          </router-link>
        </li>

        <li>
          <router-link to="/meusavisos" exact-active-class="active-link">
            Meus Avisos
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
import router from '@/router';

export default {
  name: 'HomeView',
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    logout() {
      localStorage.removeItem('token');

      router.push('/');
    },
  },
};
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
  gap: 16px;
}

.logo-container {
  display: flex;
  align-items: center;
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
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links li a:hover {
  color: #3B82F6;
}

:deep(.active-link) {
  text-decoration: underline !important;
  text-decoration-color: #3B82F6 !important;
  text-underline-offset: 6px !important;
}


.sair {
  background-color: #1E3A8A;
  padding: 6px 16px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
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
  right: 0;
  background-color: #152147;
  width: 100%;
  padding: 20px 0;
  gap: 20px;
}

.sair-btn-mobile {
  display: none;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 0;
  }

  .nav-links.active {
    display: flex;
    position: absolute;
    top: 70px;
    right: 0;
    width: 100vw;
    background-color: #152147;
    padding: 20px 0;
    gap: 20px;
    box-sizing: border-box;
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

  .logo-img {
    height: 34px;
  }
}
</style>