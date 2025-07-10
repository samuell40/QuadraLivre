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
          <li><a href="">Horários</a></li>
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

    <h3 class="tit_horario">Quadras Disponíveis</h3>
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
                <button class="btn-agendar" @click="clicarAgendar(quadra)">Agendar</button>
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

    <!-- Placar Vôlei -->
    <div v-if="exibirPlacarVolei">
      <PlacarVoleihome v-show="!isLoadingPlacarVolei" :times="timesVoleiComPosicao" />
    </div>

    <AgendamentoFutebolModal v-if="mostrarModal" :quadra="quadraSelecionada" @fechar="fecharModal"
      @confirmar="confirmarAgendamento" />

    <AgendamentoVoleiModal v-if="mostrarModalVolei" :quadra="quadraSelecionada" @fechar="fecharModal"
      @confirmar="confirmarAgendamento" />

  </div>
</template>

<script>
import { Carousel, Slide } from 'vue3-carousel'
import PlacarFutebolHome from '@/components/PlacarHome/PlacarFutebolHome.vue'
import PlacarVoleihome from '@/components/PlacarHome/PlacarVoleiHome.vue'
import AgendamentoFutebolModal from '@/components/modals/Agendamentos/AgendModalFut.vue'
import AgendamentoVoleiModal from '@/components/modals/Agendamentos/AgendModalVol.vue'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: {
    Carousel,
    Slide,
    PlacarFutebolHome,
    PlacarVoleihome,
    AgendamentoFutebolModal,
    AgendamentoVoleiModal
  },
  data() {
    return {
      isMenuOpen: false,
      quadras: [],
      times: [],
      timesVolei: [],
      isLoadingQuadras: true,
      isLoadingPlacarFutebol: true,
      isLoadingPlacarVolei: true,
      mostrarModal: false,
      quadraSelecionada: null,
      exibirPlacarFutebol: true,
      exibirPlacarVolei: true,
    }
  },
  computed: {
    timesFutebol() {
      return this.times;
    },
    timesFutebolComPosicao() {
      const sorted = [...this.timesFutebol].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    },
    timesVoleiComPosicao() {
      const sorted = [...this.timesVolei].sort((a, b) => b.pontuacao - a.pontuacao);
      return sorted.map((time, idx) => ({ ...time, posicao: idx + 1 }));
    }
  },
  mounted() {
    this.carregarQuadras();
    this.carregarPlacarFutebol();
    this.carregarPlacarVolei();
    this.atualizarVisibilidadePlacar();
    window.addEventListener("storage", this.atualizarVisibilidadePlacar);
  },
  methods: {
    atualizarVisibilidadePlacar() {
      this.exibirPlacarFutebol = JSON.parse(localStorage.getItem("exibirPlacar_futebol") ?? "true");
      this.exibirPlacarVolei = JSON.parse(localStorage.getItem("exibirPlacar_volei") ?? "true");
    },
    beforeUnmount() {
      window.removeEventListener("storage", this.atualizarVisibilidadePlacar);
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
        const res = await fetch('http://localhost:3000/quadra');
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
        const res = await fetch(`http://localhost:3000/placar/futebol`);
        if (!res.ok) throw new Error('Erro na resposta do servidor');
        const data = await res.json();
        this.times = data;
      } catch (err) {
        console.error('Erro ao carregar placar futebol:', err);
      } finally {
        this.isLoadingPlacarFutebol = false;
      }
    },
    async carregarPlacarVolei() {
      this.isLoadingPlacarVolei = true;
      try {
        const res = await fetch(`http://localhost:3000/placar/volei`);
        if (!res.ok) throw new Error('Erro na resposta do servidor');
        const data = await res.json();
        this.timesVolei = data;
      } catch (err) {
        console.error('Erro ao carregar placar vôlei:', err);
      } finally {
        this.isLoadingPlacarVolei = false;
      }
    },
    clicarAgendar(quadra) {
      this.quadraSelecionada = quadra
      this.mostrarModal = true
    },
    fecharModal() {
      this.mostrarModal = false
      this.quadraSelecionada = null
    },
    confirmarAgendamento(payload) {
      const { quadra, data, hora } = payload
      console.log('Agendamento confirmado:')
      console.log('Quadra:', quadra)
      console.log('Data:', data)
      console.log('Hora:', hora)

      this.fecharModal
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