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
          <li><a href="#quadras-disponiveis">Quadras</a></li>
          <li><a href="#placar-virtual">Placar</a></li>
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

    <h3 id="quadras-disponiveis" class="tit_horario">Quadras Disponíveis</h3>
    <section class="agendamento">
      <template v-if="isLoadingQuadras">
        <div class="loader"></div>
      </template>
      <template v-else>
        <button class="btn-prev" @click="prev">&lt;</button>
        <Carousel ref="carousel" :itemsToShow="1" :wrapAround="true" :mouseDrag="true" :breakpoints="{
          768: { itemsToShow: 3 }
        }" class="carousel">
          <Slide v-for="(quadra, index) in quadras" :key="index">
            <div class="card">
              <img :src="quadra.foto" :alt="quadra.nome" class="imagem" />
              <div class="info">
                <h3>{{ quadra.nome }}</h3>
                <p class="endereco">{{ quadra.endereco }}</p>
                <button class="btn-agendar" @click="verificarLogin(quadra)">Agendar</button>
              </div>
            </div>
          </Slide>
        </Carousel>
        <button class="btn-next" @click="next">&gt;</button>
      </template>
    </section>

    <!-- Placares-->
    <h3 v-if="exibirPlacarFutebol || exibirPlacarVolei" id="placar-virtual" class="tit_horario"> Placar Virtual</h3>
    <div v-if="isLoadingPlacarFutebol || isLoadingPlacarVolei" class="loader"></div>

    <!-- Placar Futebol -->
    <div v-if="exibirPlacarFutebol">
      <PlacarFutebolHome v-show="!isLoadingPlacarFutebol" :times="timesFutebolComPosicao" />
    </div>

    <!-- Placar Futebol de areia-->
    <div v-if="exibirPlacarFutebolAreia">
      <PlacarFutebolAreiaHome :times="timesFutebolAreiaComPosicao" :isLoading="isLoadingPlacarFutebolAreia" />
    </div>

    <!-- Placar Futsal-->
    <div v-if="exibirPlacarFutsal">
      <PlacarFutsalHome :times="timesFutsalComPosicao" :isLoading="isLoadingPlacarFutsal" />
    </div>

    <!-- Placar Vôlei -->
    <div v-if="exibirPlacarVolei">
      <PlacarVoleihome v-show="!isLoadingPlacarVolei" :times="timesVoleiComPosicao" />
    </div>

    <!-- Placar Voleibol -->
    <div v-if="exibirPlacarVoleibol">
      <PlacarVoleibolHome v-show="!isLoadingPlacarVoleibol" :times="timesVoleibolComPosicao"
        :isLoading="isLoadingPlacarVoleibol" />
    </div>

      <!-- Placar Volei de areia -->
    <div v-if="exibirPlacarVoleiAreia">
      <PlacarVoleiAreiaHome v-show="!isLoadingPlacarVoleiAreia" :times="timesVoleiAreiaComPosicao"
        :isLoading="isLoadingPlacarVoleiAreia" />
    </div>

      <!-- Placar de futevolei-->
    <div v-if="exibirPlacarFutevolei">
      <PlacarFutevoleiHome v-show="!isLoadingPlacarFutevolei" :times="timesFutevoleiComPosicao"
        :isLoading="isLoadingPlacarFutevolei" />
    </div>
  </div>

  <VerificarLogin v-if="mostrarModalLogin" @fechar="mostrarModalLogin = false" @irParaLogin="irParaLogin" />

</template>

<script>
import router from '@/router'
import { Carousel, Slide } from 'vue3-carousel'
import PlacarFutebolHome from '@/components/PlacarHome/PlacarFutebolHome.vue'
import PlacarFutebolAreiaHome from '@/components/PlacarHome/PlacarFutebolAreiaHome.vue'
import PlacarFutsalHome from '@/components/PlacarHome/PlacarFutsalHome.vue'
import PlacarVoleihome from '@/components/PlacarHome/PlacarVoleiHome.vue'
import PlacarVoleibolHome from '@/components/PlacarHome/PlacarVoleibolHome.vue'
import PlacarVoleiAreiaHome from '@/components/PlacarHome/PlacarVoleiAreiaHome.vue'
import PlacarFutevoleiHome from '@/components/PlacarHome/PlacarFutevoleiHome.vue'
import 'vue3-carousel/dist/carousel.css'
import VerificarLogin from '@/components/modals/Alertas/verificarLogin.vue'

export default {
  name: 'HomeView',
  components: {
    Carousel,
    Slide,
    PlacarFutebolHome,
    PlacarFutebolAreiaHome,
    PlacarFutsalHome,
    PlacarVoleihome,
    PlacarVoleibolHome,
    PlacarVoleiAreiaHome,
    PlacarFutevoleiHome,
    VerificarLogin
  },
  data() {
    return {
      isMenuOpen: false,
      quadras: [],
      times: [],
      timesFutebolAreia: [],
      timesFutsal: [],
      timesVolei: [],
      timesVoleibol: [],
      timesVoleiAreia: [],
      timesFutevolei: [],
      isLoadingQuadras: true,
      isLoadingPlacarFutebol: true,
      isLoadingPlacarFutebolAreia: true,
      isLoadingPlacarFutsal: true,
      isLoadingPlacarVolei: true,
      isLoadingPlacarVoleibol: true,
      isLoadingPlacarVoleiAreia: true,
      isLoadingPlacarFutevolei: true,
      exibirPlacarFutebol: true,
      exibirPlacarFutebolAreia: true,
      exibirPlacarFutsal: true,
      exibirPlacarVolei: true,
      exibirPlacarVoleibol: true,
      exibirPlacarVoleiAreia: true,
      exibirPlacarFutevolei: true,
      mostrarModalLogin: false
    }
  },
  computed: {
    timesFutebolComPosicao() {
      const sorted = [...this.times].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
    timesFutebolAreiaComPosicao() {
      const sorted = [...this.timesFutebolAreia].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
    timesFutsalComPosicao() {
      const sorted = [...this.timesFutsal].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
    timesVoleiComPosicao() {
      const sorted = [...this.timesVolei].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
    timesVoleibolComPosicao() {
      const sorted = [...this.timesVoleibol].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
     timesVoleiAreiaComPosicao() {
      const sorted = [...this.timesVoleiAreia].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
     timesFutevoleiComPosicao() {
      const sorted = [...this.timesFutevolei].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    }
  },
  mounted() {
    this.carregarQuadras();
    this.carregarPlacarFutebol();
    this.carregarPlacarFutebolAreia();
    this.carregarPlacarFutsal();
    this.carregarPlacarVolei();
    this.carregarPlacarVoleibol();
    this.carregarPlacarVoleiAreia();
    this.carregarPlacarFutevolei();
    this.atualizarVisibilidadePlacar();
    window.addEventListener("storage", this.atualizarVisibilidadePlacar);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.atualizarVisibilidadePlacar);
  },
  methods: {
    atualizarVisibilidadePlacar() {
      this.exibirPlacarFutebol = JSON.parse(localStorage.getItem("exibirPlacar_futebol") ?? "true");
      this.exibirPlacarFutebolAreia = JSON.parse(localStorage.getItem("exibirPlacar_futebol de areia") ?? "true");
      this.exibirPlacarFutsal = JSON.parse(localStorage.getItem("exibirPlacar_futsal") ?? "true");
      this.exibirPlacarVolei = JSON.parse(localStorage.getItem("exibirPlacar_volei") ?? "true");
      this.exibirPlacarVoleibol = JSON.parse(localStorage.getItem("exibirPlacar_voleibol") ?? "true");
      this.exibirPlacarVoleiAreia = JSON.parse(localStorage.getItem("exibirPlacar_volei de areia") ?? "true");
      this.exibirPlacarFutevolei = JSON.parse(localStorage.getItem("exibirPlacar_futevolei") ?? "true");
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    next() {
      if (this.$refs.carousel) {
        this.$refs.carousel.next();
      }
    },
    prev() {
      if (this.$refs.carousel) {
        this.$refs.carousel.prev();
      }
    },
    async carregarQuadras() {
      this.isLoadingQuadras = true;
      try {
        const res = await fetch('https://quadra-livre-backend.onrender.com/quadra');
        const data = await res.json();
        this.quadras = data;
      } catch (err) {
        console.error('Erro ao carregar quadras:', err);
      } finally {
        this.isLoadingQuadras = false;
      }
    },
    async carregarPlacarFutebol() {
      this.isLoadingPlacarFutebol = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/futebol`);
        const data = await res.json();
        this.times = data;
      } catch (err) {
        console.error('Erro ao carregar placar futebol:', err);
      } finally {
        this.isLoadingPlacarFutebol = false;
      }
    },
    async carregarPlacarFutebolAreia() {
      this.isLoadingPlacarFutebolAreia = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/futebol de areia`);
        const data = await res.json();
        this.timesFutebolAreia = data;
      } catch (err) {
        console.error('Erro ao carregar placar futebol de areia:', err);
      } finally {
        this.isLoadingPlacarFutebolAreia = false;
      }
    },
    async carregarPlacarFutsal() {
      this.isLoadingPlacarFutsal = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/futsal`);
        const data = await res.json();
        this.timesFutsal = data;
      } catch (err) {
        console.error('Erro ao carregar placar de futsal:', err);
      } finally {
        this.isLoadingPlacarFutsal = false;
      }
    },
    async carregarPlacarVolei() {
      this.isLoadingPlacarVolei = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/volei`);
        const data = await res.json();
        this.timesVolei = data;
      } catch (err) {
        console.error('Erro ao carregar placar vôlei:', err);
      } finally {
        this.isLoadingPlacarVolei = false;
      }
    },
    async carregarPlacarVoleibol() {
      this.isLoadingPlacarVoleibol = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/voleibol`);
        const data = await res.json();
        this.timesVoleibol = data;
      } catch (err) {
        console.error('Erro ao carregar placar vôlei:', err);
      } finally {
        this.isLoadingPlacarVoleibol = false;
      }
    },
     async carregarPlacarVoleiAreia() {
      this.isLoadingPlacarVoleiAreia = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/volei de areia`);
        const data = await res.json();
        this.timesVoleiAreia = data;
      } catch (err) {
        console.error('Erro ao carregar placar vôlei:', err);
      } finally {
        this.isLoadingPlacarVoleiAreia = false;
      }
    },
       async carregarPlacarFutevolei() {
      this.isLoadingPlacarFutevolei = true;
      try {
        const res = await fetch(`https://quadra-livre-backend.onrender.com/placar/futevolei`);
        const data = await res.json();
        this.timesFutevolei = data;
      } catch (err) {
        console.error('Erro ao carregar placar vôlei:', err);
      } finally {
        this.isLoadingPlacarFutevolei = false;
      }
    },
    verificarLogin(quadra) {
      const usuarioLogado = localStorage.getItem('usuario');
      try {
        const usuario = JSON.parse(usuarioLogado);
        if (usuario && usuario.token) {
          router.push({ name: 'agendar_quadra', query: { quadraId: quadra.id } });
        } else {
          this.mostrarModalLogin = true;
        }
      } catch (erro) {
        this.mostrarModalLogin = true;
      }
    },
    irParaLogin() {
      this.mostrarModalLogin = false;
      router.push('/login');
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
}


.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 100%;
  position: relative;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 16px;


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
  color: #ffff;
}


p {
  color: #888;
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

.btn-prev:hover,
.btn-next:hover {
  background-color: #eee;
}

.card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
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

.info h3 {
  font-size: 18px;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
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

.btn-agendar:hover {
  background-color: #60a5fa;
}

.descricao,
.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #fff
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

  .placar table {
    font-size: 12px;
    min-width: unset;
  }

  .placar th,
  .placar td {
    padding: 6px;
    font-size: 12px;
  }
}
</style>