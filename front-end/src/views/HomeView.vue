<template>
  <div class="home">
    <nav class="navbar-custom">
      <div class="navbar-container">
        <div class="esquerda-section">
          <div class="hamburger" @click="toggleMenu">
            <span :class="{ open: isMenuOpen }"></span>
            <span :class="{ open: isMenuOpen }"></span>
            <span :class="{ open: isMenuOpen }"></span>
          </div>
          <div class="logo">Quadra Livre</div>
        </div>

        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li><a href="/quadra">Quadras</a></li>
          <li><a href="/horarios">Horários</a></li>
          <li><a href="/placar">Placar</a></li>
          <li class="login-item"><a href="/login" class="login">Login</a></li>
        </ul>

        <a href="/login" class="login-btn-mobile">Login</a>
      </div>
    </nav>

    <section class="texto-centro">
      <div class="conteudo-centralizado">
        <h1 class="texto">
          <div>
            <span class="primeira-linha">Com a Quadra Livre, <span class="destaque sublinhado">agendar</span></span>
          </div>
          <div>
            <span class="segunda-linha destaque">ficou ainda mais fácil.</span>
          </div>
        </h1>
        <p>Com poucos cliques, encontre e reserve a quadra ideal para o seu jogo.</p>
      </div>
    </section>

  </div>
</template>


<script>
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
  gap: 20px;
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

.login {
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

.login-btn-mobile {
  display: none;
}

.texto {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.3;
  text-align: left;
  display: inline-block;
}

.primeira-linha,
.segunda-linha {
  display: block;
}

.segunda-linha {
  padding-left: 0;
}

.texto-centro {
  background-color: #050B2C;
  color: white;
  padding: 6rem 2rem 4rem;
  margin-top: 70px;
  display: flex;
  justify-content: center;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

p {
  color: #ccc;
  font-size: 1.1rem;
}

.destaque {
  color: #3B82F6;
}

.sublinhado {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .logo {
    margin-left: 0;
  }

  .nav-links {
    display: none;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-right: 0;
    /* Remove margin no mobile */
    padding: 0;
    /* Remove padding se houver */
  }

  .nav-links.active {
    display: flex;
    position: absolute;
    top: 70px;
    right: 0;
    width: 100vw;
    /* Usa a largura total da viewport */
    background-color: #152147;
    padding: 20px 0;
    gap: 20px;
    box-sizing: border-box;
    /* garante que padding não ultrapasse a largura */
  }

  .hamburger {
    display: flex;
  }

  .login-item {
    display: none;
  }

  .login-btn-mobile {
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
