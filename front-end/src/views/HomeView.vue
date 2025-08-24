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


    <section id="placar-virtual" class="placares-container">
      <h3 class="tit_horario">Placar dos Campeonatos</h3>

      <div v-if="modalidadesDisponiveis.length === 0">
        <div class="placar-wrapper" v-for="n in 2" :key="n">
          <div class="loader"></div>
        </div>
      </div>

      <p v-else-if="todosPlacaresOcultos" class="sem-placar-unico" style="text-align:center; margin-top:1rem;">
        Nenhum placar disponível no momento.
      </p>

      <div v-else v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" class="placar-wrapper">
        <div v-if="loadingPlacar[modalidade.nome]" class="loader"></div>
        <PlacarGeral v-else-if="getTimesComPosicao(modalidade.nome).length > 0"
          :times="getTimesComPosicao(modalidade.nome)" :isLoading="loadingPlacar[modalidade.nome]"
          :modalidade="modalidade.nome" />
      </div>
    </section>

    <VerificarLogin v-if="mostrarModalLogin" @fechar="mostrarModalLogin = false" @irParaLogin="irParaLogin"
      @loginComGoogle="loginComGoogle" />
  </div>
</template>

<script>
import router from '@/router'
import { Carousel, Slide } from 'vue3-carousel'
import Swal from 'sweetalert2'
import PlacarGeral from '@/components/PlacarHome/PlacarGeral.vue'
import VerificarLogin from '@/components/modals/Alertas/verificarLogin.vue'
import api from '@/axios'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: { Carousel, Slide, PlacarGeral, VerificarLogin },
  data() {
    return {
      isMenuOpen: false,
      quadras: [],
      placares: {},
      loadingPlacar: {},
      mostrarModalLogin: false,
      modalidadesDisponiveis: [],
      isLoadingQuadras: true,
      ws: null
    }
  },
  computed: {
    algumPlacarVisivel() {
      return this.modalidadesDisponiveis.some(mod =>
        (this.placares[mod.nome] || []).some(t => t.visivel)
      )
    },

    todosPlacaresOcultos() {
      return this.modalidadesDisponiveis.length > 0 &&
        this.modalidadesDisponiveis.every(mod =>
          !(this.placares[mod.nome] || []).some(t => t.visivel)
        )
    }
  },
  mounted() {
    this.carregarQuadras()
    this.carregarModalidades()
  },
  beforeUnmount() {
    if (this.ws) this.ws.close()
  },
  methods: {
    toggleMenu() { this.isMenuOpen = !this.isMenuOpen },
    next() { if (this.$refs.carousel) this.$refs.carousel.next() },
    prev() { if (this.$refs.carousel) this.$refs.carousel.prev() },

    async carregarQuadras() {
      this.isLoadingQuadras = true
      try {
        const res = await api.get('/quadra')
        this.quadras = res.data
      } catch (err) {
        console.error('Erro ao carregar quadras:', err)
      } finally {
        this.isLoadingQuadras = false
      }
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidadesDisponiveis = res.data

        this.modalidadesDisponiveis.forEach(mod => {
          this.placares[mod.nome] = []
          this.loadingPlacar[mod.nome] = true
          this.carregarPlacarModalidade(mod)
        })

        this.iniciarWebSocket()
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error)
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error')
      }
    },

    async carregarPlacarModalidade(modalidade) {
      if (!modalidade) return
      this.loadingPlacar[modalidade.nome] = true
      try {
        const res = await api.get(`/placar/modalidade/${modalidade.id}`)
        this.placares[modalidade.nome] = Array.isArray(res.data.placares) ? res.data.placares : []
      } catch (err) {
        console.error(`Erro ao carregar placar ${modalidade.nome}:`, err)
      } finally {
        this.loadingPlacar[modalidade.nome] = false
      }
    },

    addPosicao(times) {
      return [...times]
        .filter(t => t.visivel)
        .sort((a, b) => b.pontuacao - a.pontuacao)
        .map((t, i) => ({ ...t, posicao: i + 1 }))
    },

    getTimesComPosicao(modalidade) {
      return this.addPosicao(this.placares[modalidade] || [])
    },

    iniciarWebSocket() {
      try {
        this.ws = new WebSocket('ws://localhost:3000/placares');
        this.ws.onopen = () => console.log('WebSocket conectado!');
        this.ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            if (data.tipo === "visibilidadeAtualizada") {
              this.modalidadesDisponiveis.forEach(mod => {
                this.placares[mod.nome] = data.placares?.filter(p => p.time.modalidadeId === mod.id) || [];
              });
            }
          } catch (err) { console.error('Erro ao processar mensagem WebSocket:', err); }
        };
        this.ws.onclose = () => setTimeout(this.iniciarWebSocket, 5000)
        this.ws.onerror = () => this.ws.close()
      } catch (err) { console.error('Falha ao iniciar WebSocket:', err); }
    },

    verificarLogin(quadra) {
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
      if (usuario?.token) {
        router.push({ name: 'agendar_quadra', query: { quadraId: quadra.id } })
      } else {
        localStorage.setItem("quadraSelecionada", JSON.stringify(quadra))
        this.mostrarModalLogin = true
      }
    },

    irParaLogin() { this.mostrarModalLogin = true },

    loginComGoogle() {
      const width = 500, height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2.5
      const popup = window.open('http://localhost:3000/auth/google', 'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`)

      const listener = event => {
        if (event.origin !== 'http://localhost:8080') return
        const { token, erro, email, usuario } = event.data

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({ icon: 'error', title: 'Conta não encontrada!', text: 'Redirecionando para cadastro...', timer: 3000, timerProgressBar: true, showConfirmButton: false, didOpen: () => Swal.showLoading() })
            .then(() => window.location.href = `/cadastro?email=${encodeURIComponent(email)}`)
        }

        if (token) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))
          const quadraSelecionada = JSON.parse(localStorage.getItem("quadraSelecionada") || "null")

          if ([1, 2].includes(usuario.permissaoId)) {
            router.push({ name: "Agendamentos" })
          } else if (usuario.permissaoId === 3) {
            if (quadraSelecionada) {
              router.push({ name: "agendar_quadra", query: { quadraId: quadraSelecionada.id } })
              localStorage.removeItem("quadraSelecionada")
            } else {
              router.push({ name: "agendar_quadra" })
            }
          } else {
            router.push({ name: "Home" })
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
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  padding: 16px 60px;
  margin-top: 70px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
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
  font-size: 28px;
  color: #7E7E7E;
  margin-top: 50px;  
  margin-bottom: 5px; 
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
  margin: 20px auto;
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
  color: #fff;
}

.placares-container {
  margin-top: 30px; 
  padding: 0 20px;
}

.placar-wrapper {
  margin-top: 0px;   
  margin-bottom: 10px; 
  display: flex;
  justify-content: center;
  position: relative;
}

.placar-wrapper:last-child {
  margin-bottom: 0;
}

.placar-wrapper .loader {
  margin: 20px auto;
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
    font-size: 26px;
    margin-top: 20px;
    margin-bottom: 5px;
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