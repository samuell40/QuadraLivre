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
          <li><a href="/controleplacar">Placar</a></li>
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

    <!-- Placar Futebol -->
    <h3 class="tit_horario">Placar Virtual</h3>
    <h4 class="tit_campeonato">Campeonato Futebol</h4>
    <div class="placar">
      <template v-if="isLoadingPlacarFutebol">
        <div class="loader"></div>
      </template>
      <template v-else>
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>Pontos</th>
              <th>Vitórias</th>
              <th>Empates</th>
              <th>Derrotas</th>
              <th>Gols</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time) in timesFutebolComPosicao" :key="time.time">
              <td>{{ time.posicao }}</td>
              <td class="time-info">
                <img :src="time.foto" alt="Foto do time" class="time-image" />
                <span>{{ time.time }}</span>
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.empates }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.golsMarcados }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <!-- Placar Vôlei -->
    <h4 class="tit_campeonato"> Campeonato Vôlei</h4>
    <div class="placar">
      <template v-if="isLoadingPlacarVolei">
        <div class="loader"></div>
      </template>
      <template v-else>
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>Pontos</th>
              <th>Vitórias</th>
              <th>Derrotas</th>
              <th>Sets Vencidos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time) in timesVoleiComPosicao" :key="time.time">
              <td>{{ time.posicao }}</td>
              <td class="time-info">
                <img :src="time.foto" alt="Foto do time" class="time-image" />
                <span>{{ time.time }}</span>
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.setsVencidos || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

  </div>
</template>

<script>
import { Carousel, Slide } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: {
    Carousel,
    Slide
  },
  data() {
    return {
      isMenuOpen: false,
      quadras: [],
      times: [],            
      timesVolei: [],      
      isLoadingQuadras: true,
      isLoadingPlacarFutebol: true,
      isLoadingPlacarVolei: true
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
  },
  methods: {
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
      console.log('Quadra selecionada para agendamento:', quadra);
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

.tit_campeonato{
  font-size: 20px;
  color: #7E7E7E;
  font-weight: bold;
  margin-left: 8%;
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

.descricao,
.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #fff
}

.placar {
  padding: 30px;
  margin: 0 auto;
  max-width: 1340px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.placar table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  width: 100%;
}

.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 14px 12px;
  font-size: 16px;
  text-align: left;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}


.placar tbody tr:hover {
  background-color: #f3f4f6;
}


.placar tbody td {
  color: #4b5563;
  padding: 12px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
}


.placar tbody tr:last-child td {
  border-bottom: none;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
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