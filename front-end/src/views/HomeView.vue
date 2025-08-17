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
          <li class="login-item">
            <a href="#" class="login" @click.prevent="loginComGoogle">Login</a>
          </li>
        </ul>

        <a href="#" class="login-btn-mobile" @click.prevent="loginComGoogle">Login</a>
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
        <Carousel ref="carousel" :itemsToShow="1" :wrapAround="true" :mouseDrag="true"
          :breakpoints="{ 768: { itemsToShow: 3 } }" class="carousel">
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

    <!-- Placares -->
    <h3 v-if="exibirPlacar.futebol || exibirPlacar.volei" id="placar-virtual" class="tit_horario">Placar Virtual</h3>
    <div v-if="loadingPlacar.futebol || loadingPlacar.volei" class="loader"></div>

    <div v-if="exibirPlacar.futebol">
      <PlacarFutebolHome v-show="!loadingPlacar.futebol" :times="timesFutebolComPosicao" />
    </div>
    <div v-if="exibirPlacar['futebol de areia']">
      <PlacarFutebolAreiaHome :times="timesFutebolAreiaComPosicao" :isLoading="loadingPlacar['futebol de areia']" />
    </div>
    <div v-if="exibirPlacar.futsal">
      <PlacarFutsalHome :times="timesFutsalComPosicao" :isLoading="loadingPlacar.futsal" />
    </div>
    <div v-if="exibirPlacar.volei">
      <PlacarVoleihome v-show="!loadingPlacar.volei" :times="timesVoleiComPosicao" />
    </div>
    <div v-if="exibirPlacar.voleibol">
      <PlacarVoleibolHome v-show="!loadingPlacar.voleibol" :times="timesVoleibolComPosicao"
        :isLoading="loadingPlacar.voleibol" />
    </div>
    <div v-if="exibirPlacar['volei de areia']">
      <PlacarVoleiAreiaHome v-show="!loadingPlacar['volei de areia']" :times="timesVoleiAreiaComPosicao"
        :isLoading="loadingPlacar['volei de areia']" />
    </div>
    <div v-if="exibirPlacar.futevolei">
      <PlacarFutevoleiHome v-show="!loadingPlacar.futevolei" :times="timesFutevoleiComPosicao"
        :isLoading="loadingPlacar.futevolei" />
    </div>

    <VerificarLogin v-if="mostrarModalLogin" @fechar="mostrarModalLogin = false" @irParaLogin="irParaLogin"
      @loginComGoogle="loginComGoogle" />

  </div>
</template>

<script>
import router from '@/router'
import { Carousel, Slide } from 'vue3-carousel'
import Swal from 'sweetalert2'
import PlacarFutebolHome from '@/components/PlacarHome/PlacarFutebolHome.vue'
import PlacarFutebolAreiaHome from '@/components/PlacarHome/PlacarFutebolAreiaHome.vue'
import PlacarFutsalHome from '@/components/PlacarHome/PlacarFutsalHome.vue'
import PlacarVoleihome from '@/components/PlacarHome/PlacarVoleiHome.vue'
import PlacarVoleibolHome from '@/components/PlacarHome/PlacarVoleibolHome.vue'
import PlacarVoleiAreiaHome from '@/components/PlacarHome/PlacarVoleiAreiaHome.vue'
import PlacarFutevoleiHome from '@/components/PlacarHome/PlacarFutevoleiHome.vue'
import VerificarLogin from '@/components/modals/Alertas/verificarLogin.vue'
import api from '@/axios'
import 'vue3-carousel/dist/carousel.css'

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
      placares: {
        futebol: [],
        "futebol de areia": [],
        futsal: [],
        volei: [],
        voleibol: [],
        "volei de areia": [],
        futevolei: []
      },
      loadingPlacar: {
        futebol: true,
        "futebol de areia": true,
        futsal: true,
        volei: true,
        voleibol: true,
        "volei de areia": true,
        futevolei: true
      },
      exibirPlacar: {
        futebol: true,
        "futebol de areia": true,
        futsal: true,
        volei: true,
        voleibol: true,
        "volei de areia": true,
        futevolei: true
      },
      isLoadingQuadras: true,
      mostrarModalLogin: false
    }
  },
  computed: {
    timesFutebolComPosicao() { return this.addPosicao(this.placares.futebol) },
    timesFutebolAreiaComPosicao() { return this.addPosicao(this.placares["futebol de areia"]) },
    timesFutsalComPosicao() { return this.addPosicao(this.placares.futsal) },
    timesVoleiComPosicao() { return this.addPosicao(this.placares.volei) },
    timesVoleibolComPosicao() { return this.addPosicao(this.placares.voleibol) },
    timesVoleiAreiaComPosicao() { return this.addPosicao(this.placares["volei de areia"]) },
    timesFutevoleiComPosicao() { return this.addPosicao(this.placares.futevolei) }
  },
  mounted() {
    this.carregarQuadras();
    Object.keys(this.placares).forEach(tipo => this.carregarPlacar(tipo));
    this.atualizarVisibilidadePlacar();
    window.addEventListener("storage", this.atualizarVisibilidadePlacar);
  },
  beforeUnmount() {
    window.removeEventListener("storage", this.atualizarVisibilidadePlacar);
  },
  methods: {
    addPosicao(times) {
      return [...times].sort((a, b) => b.pontuacao - a.pontuacao).map((t, i) => ({ ...t, posicao: i + 1 }));
    },
    atualizarVisibilidadePlacar() {
      Object.keys(this.exibirPlacar).forEach(chave => {
        this.exibirPlacar[chave] = JSON.parse(localStorage.getItem(`exibirPlacar_${chave}`) ?? "true");
      });
    },
    toggleMenu() { this.isMenuOpen = !this.isMenuOpen },
    next() { if (this.$refs.carousel) this.$refs.carousel.next() },
    prev() { if (this.$refs.carousel) this.$refs.carousel.prev() },
    async carregarQuadras() {
      this.isLoadingQuadras = true;
      try { const res = await api.get('/quadra'); this.quadras = res.data }
      catch (err) { console.error('Erro ao carregar quadras:', err) }
      finally { this.isLoadingQuadras = false }
    },
    async carregarPlacar(tipo) {
      this.loadingPlacar[tipo] = true;
      try {
        const res = await api.get(`/placar/${tipo}`);
        this.placares[tipo] = res.data;
      } catch (err) {
        console.error(`Erro ao carregar placar ${tipo}:`, err);
      } finally {
        this.loadingPlacar[tipo] = false;
      }
    },
    verificarLogin(quadra) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      if (usuario?.token) {
        router.push({ name: 'agendar_quadra', query: { quadraId: quadra.id } });
      } else {
        this.mostrarModalLogin = true;
      }
    },
    loginComGoogle() {
      const width = 500, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;
      const popup = window.open(
        'http://localhost:3000/auth/google',
        'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      const listener = (event) => {
        if (event.origin !== 'http://localhost:8080') return;
        const { token, erro, email } = event.data;
        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
          }).then(() => window.location.href = `/cadastro?email=${encodeURIComponent(email)}`);
        }
        if (token) {
          localStorage.setItem('token', token);
          router.push('/agendarquadra');
        }
        window.removeEventListener('message', listener);
        if (popup) popup.close();
      };
      window.addEventListener('message', listener, false);
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