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
            <span class="primeira-linha">Com a Quadra Livre, <span class="destaque_sublinhado">agendar</span></span>
          </div>
          <div>
            <span class="segunda-linha destaque">ficou ainda mais fácil.</span>
          </div>
        </h1>
        <p>Com poucos cliques, encontre e reserve a quadra ideal para o seu jogo.</p>
      </div>
    </section>
    <h3 class="tit_horario"> Quadras Disponiveis</h3>
    <section class="agendamento">
      <button class="btn-prev" @click="prev">&lt;</button>
      <Carousel ref="carousel" :itemsToShow="1" :wrapAround="true" :mouseDrag="true" :breakpoints="{
        768: {
          itemsToShow: 3
        }
      }" class="carousel">
        <Slide v-for="(imagem, index) in images" :key="index">
          <div class="card">
            <img :src="imagem.src" :alt="imagem.alt" class="imagem" />
            <div class="info">
              <h3>{{ imagem.alt }}</h3>
              <button class="btn-agendar">Agendar</button>
            </div>
          </div>
        </Slide>
      </Carousel>
      <button class="btn-next" @click="next">&gt;</button>
    </section>
  </div>
</template>

<script>
import { Carousel, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: { Carousel, Slide },
  data() {
    return {
      isMenuOpen: false,
      images: [
        { src: require('@/assets/metodao.png'), alt: 'Ginásio de Esportes O Metodão' },
        { src: require('@/assets/futibinha.png'), alt: 'Quadra de Areia Juarez Valdivino' },
        { src: require('@/assets/areninha.jpg'), alt: 'Quadra de Areia Juarez Valdivino' },
      ],
      carousel: null,
    }
  },
  mounted() {
    this.carousel = this.$refs.carousel
    window.addEventListener('resize', this.updateSlideWidth)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateSlideWidth)
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    updateSlideWidth() {
    },
    prev() {
      this.carousel?.prev()
    },
    next() {
      this.carousel?.next()
    },
  }
}
</script>

<style scoped>
/* Geral */
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

.texto-centro {
  background-color: #050B2C;
  color: white;
  padding: 40px 60px 40px;
  margin-top: 70px;
  display: flex;
  justify-content: center;
}

.texto {
  font-size: 40px;
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
  color: #3B82F6;
}

h1 {
  font-size: 80px;
  font-family: "Montserrat";
  margin-bottom: 16px;
}

h3 {
  font-size: 22px;
  font-family: "Montserrat";
  font-weight: bold;
  margin-bottom: 16px;
}

p {
  color: #ccc;
  font-size: 18px;
}

.tit_horario {
  font-size: 30px;
  color: #7E7E7E;
  margin-top: 40px;
  text-align: center;
  font-weight: bold; 
}

.destaque_sublinhado {
  text-decoration: underline;
  color: #3B82F6;
}

/* Carrossel */
.agendamento {
  position: relative;
  width: 100%;
  margin: 30px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.carousel {
  width: 90%;
  overflow: hidden;
}

.carousel .carousel__slide {
  padding: 0 20px;
  box-sizing: border-box;
}

.btn-prev {
  margin-right: 10px;
}

.btn-next {
  margin-left: 10px;
}

.btn-prev,
.btn-next {
  background-color: #D9D9D9;
  color: #7E7E7E;
  border: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
}

.card {
  position: relative; 
  border-radius: 12px;
  overflow: hidden;
  height: 300px; 
}

.imagem {
  width: 100%;
  height: 100%;       
  object-fit: cover;
  display: block;
}

.info {
   position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 6px;
}

.btn-agendar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 6px;
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

  .tit_horario {
    font-size: 30px;
    margin-top: 40px;
    text-align: center;
    font-weight: bold;
  }

  .imagem {
    height: 400px;
    width: 100%;
  }

  .btn-prev,
  .btn-next {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .btn-prev {
    margin-right: -11px;
  }

  .btn-next {
    margin-left: -11px;
  }
}

</style>
