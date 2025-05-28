<template>
  <div>
    <nav class="navbar-custom">
      <div class="navbar-container">
        <div class="logo">Quadra Livre</div>

        <div class="hamburger" @click="toggleMenu">
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
          <span :class="{ open: isMenuOpen }"></span>
        </div>

        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li><a href="/quadra">Quadras</a></li>
          <li><a href="/horarios">Horários</a></li>
          <li><a href="/placar">Placar</a></li>
          <li><a href="/login" class="login">Login</a></li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
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
}

.logo {
  color: #ffffff;
  font-size: 20px;
  white-space: nowrap;
}

/* Links */
.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links .login {
  background-color: #1E3A8A;
  padding: 6px 16px;
  border-radius: 30px;
}

/* Hamburger */
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

/* Menu mobile ativo */
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

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
</style>
