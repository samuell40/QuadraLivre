<template>
  <div class="layout">
    <NavBarHome />

    <section class="texto-centro">
      <div class="conteudo-centralizado">
        <h1 class="texto">
          <div>
            <span class="primeira-linha">Com o Quadra Livre, <span class="destaque_sublinhado">agendar</span></span>
          </div>
          <div>
            <span class="segunda-linha destaque">sua quadra ficou ainda mais fácil.</span>
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
        <Carousel ref="carousel" :itemsToShow="1" :wrapAround="true" :mouseDrag="true" :autoplay="3000"
          :pauseAutoplayOnHover="true" :transition="600" :breakpoints="{ 768: { itemsToShow: 3 } }" class="carousel">
          <Slide v-for="(quadra, index) in quadras" :key="index">
            <div class="card" :class="{ 'is-interditada': quadra.interditada }">

              <div v-if="quadra.interditada" class="badge-interditada-overlay">
                INDISPONÍVEL
              </div>

              <img :src="quadra.foto" :alt="quadra.nome" class="imagem" />

              <div class="sombra-inferior"></div>

              <div class="info">
                <h3>{{ quadra.nome }}</h3>
                <p class="endereco">{{ quadra.endereco }}</p>

                <button class="btn-agendar" :disabled="quadra.interditada"
                  @click="!quadra.interditada && verificarLogin(quadra)">
                  {{ quadra.interditada ? 'Indisponível' : 'Agendar' }}
                </button>
              </div>
            </div>
          </Slide>
        </Carousel>
        <button class="btn-next" @click="next">&gt;</button>
      </template>
    </section>

    <section class="placar-home">
      <div class="filtros-topo">
        <div class="filtro-item">
          <label class="filtro-titulo">Fase</label>
          <select v-model="faseSelecionada" @change="onFaseChange">
            <option disabled value="">Selecione a Fase</option>
            <option v-for="fase in fases" :key="fase.id" :value="fase.id">
              {{ fase.nome }}
            </option>
          </select>
        </div>

        <!-- Rodada só desktop -->
        <div v-if="!isMobile" class="filtro-item filtro-rodada">
          <label class="filtro-titulo">Rodada</label>
          <select v-model="rodadaSelecionada" :disabled="!rodadas.length" @change="carregarPartidasPorRodada">
            <option disabled value="">Selecione a Rodada</option>
            <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
              {{ rodada.nome }}
            </option>
          </select>
        </div>
      </div>

      <div class="placar-container">
        <div class="placar-wrapper">
          <h3 class="titulo-secao">
            <span>Classificação do {{ nomeCampeonato }}</span>
          </h3>

          <TabelaClassificacao :times="placar" :loading="isLoadingPlacar" :modalidade="modalidadeNormalizada"
            empty-text="Nenhum placar disponível no momento." />
        </div>
        <!-- PARTIDAS -->
        <div class="partidas-wrapper">
          <div v-if="isMobile" class="filtro-item filtro-rodada-mobile">
            <label class="filtro-titulo">Rodada</label>
            <select v-model="rodadaSelecionada" :disabled="!rodadas.length" @change="carregarPartidasPorRodada">
              <option disabled value="">Selecione a Rodada</option>
              <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                {{ rodada.nome }}
              </option>
            </select>
          </div>
          <h3 class="titulo-secao">Placar</h3>

          <ListaPartidas :partidas="partidas" :loading="isLoadingPartidas"
            empty-title="Nenhuma partida disponível no momento." quadra-class="nome-quadra-home" />
        </div>
      </div>
    </section>

    <VerificarLogin v-if="mostrarModalLogin" @fechar="mostrarModalLogin = false" @irParaLogin="irParaLogin"
      @loginComGoogle="loginComGoogle" />
    <button v-if="mostrarBotaoTopo" type="button" class="btn-topo" @click="subirPagina">
      ↑
    </button>
    <Footer />
  </div>
</template>

<script>
import NavBarHome from '@/components/NavBarHome.vue'
import Footer from '@/components/Footer.vue'
import router from '@/router'
import { Carousel, Slide } from 'vue3-carousel'
import Swal from 'sweetalert2'
import VerificarLogin from '@/components/modals/Alertas/verificarLogin.vue'
import api from '@/axios'
import TabelaClassificacao from '@/components/quadraplay/TabelaClassificacao.vue'
import ListaPartidas from '@/components/quadraplay/ListaPartidas.vue'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: { NavBarHome, Footer, Carousel, Slide, VerificarLogin, TabelaClassificacao, ListaPartidas },

  data() {
    return {
      quadras: [],
      isLoadingQuadras: true,
      campeonatoAtual: null,
      campeonatoId: null,
      fases: [],
      rodadas: [],
      faseSelecionada: '',
      rodadaSelecionada: '',
      placar: [],
      isLoadingPlacar: true,
      partidas: [],
      isLoadingPartidas: true,
      mostrarModalLogin: false,
      mostrarBotaoTopo: false,
      isMobile: window.innerWidth <= 768,
    }
  },

  computed: {
    nomeCampeonato() {
      return this.campeonatoAtual?.nome
    },
    modalidadeNormalizada() {
      return String(this.campeonatoAtual?.modalidade?.nome || 'futebol')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    }
  },

  async mounted() {
    const onResize = () => {
      this.isMobile = window.innerWidth <= 768
    }
    window.addEventListener('resize', onResize)
    this._onResize = onResize
    window.addEventListener('scroll', this.atualizarVisibilidadeBotaoTopo, { passive: true })
    await this.carregarQuadras()
    await this.carregarCampeonatoMaisRecente()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.atualizarVisibilidadeBotaoTopo)
    window.removeEventListener('resize', this._onResize)
  },

  methods: {
    atualizarVisibilidadeBotaoTopo() {
      this.mostrarBotaoTopo = window.scrollY > 300
    },
    subirPagina() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    next() { if (this.$refs.carousel) this.$refs.carousel.next() },
    prev() { if (this.$refs.carousel) this.$refs.carousel.prev() },

    async carregarCampeonatoMaisRecente() {
      try {
        const { data } = await api.get('/listar/1')
        this.campeonatoAtual = data?.[0]
        this.campeonatoId = this.campeonatoAtual?.id
        if (!this.campeonatoId) return
        await this.carregarFases(this.campeonatoId)
      } catch (err) {
        console.error('Erro ao carregar campeonato mais recente:', err)
      }
    },

    async carregarQuadras() {
      this.isLoadingQuadras = true
      try {
        const res = await api.get('/quadra')
        this.quadras = Array.isArray(res.data) ? res.data : []
      } catch (err) {
        console.error('Erro ao carregar quadras:', err)
        this.quadras = []
      } finally {
        this.isLoadingQuadras = false
      }
    },

    async carregarFases(campeonatoId) {
      try {
        const { data } = await api.get(`/fases/${campeonatoId}/`)

        if (!Array.isArray(data)) {
          this.fases = []
          this.rodadas = []
          this.faseSelecionada = ''
          this.rodadaSelecionada = ''
          this.partidas = []
          return
        }

        this.fases = data

        if (!this.fases.length) {
          this.faseSelecionada = ''
          this.rodadas = []
          this.rodadaSelecionada = ''
          this.partidas = []
          return
        }

        this.faseSelecionada = this.fases[0].id

        const faseSelecionadaObj = this.fases.find(f => f.id === this.faseSelecionada)
        const rodadas = Array.isArray(faseSelecionadaObj?.rodadas) ? faseSelecionadaObj.rodadas : []

        this.rodadas = rodadas
        this.rodadaSelecionada = rodadas.length ? rodadas[0].id : ''

        await this.carregarPlacarPorFase(campeonatoId)
        await this.carregarPartidasPorRodada()
      } catch (err) {
        console.error('Erro ao carregar fases:', err)
        this.fases = []
        this.rodadas = []
        this.faseSelecionada = ''
        this.rodadaSelecionada = ''
        this.partidas = []
      }
    },

    onFaseChange() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada)

      if (!fase) {
        this.rodadas = []
        this.rodadaSelecionada = ''
        this.partidas = []
        return
      }

      const rodadas = Array.isArray(fase.rodadas) ? fase.rodadas : []
      this.rodadas = rodadas
      this.rodadaSelecionada = rodadas.length ? rodadas[0].id : ''

      this.carregarPlacarPorFase(this.campeonatoId)
      this.carregarPartidasPorRodada()
    },

    async carregarPlacarPorFase(campeonatoId) {
      if (!this.faseSelecionada) return
      this.isLoadingPlacar = true

      try {
        const res = await api.get(`/placar/fase/${campeonatoId}`, {
          params: { faseId: this.faseSelecionada }
        })

        if (!Array.isArray(res.data)) {
          this.placar = []
          return
        }

        const fase = res.data.find(f => f.faseId == this.faseSelecionada)
        this.placar = Array.isArray(fase?.placares) ? fase.placares : []
      } catch (err) {
        console.error('Erro ao carregar placar:', err)
        this.placar = []
      } finally {
        this.isLoadingPlacar = false
      }
    },

    async carregarPartidasPorRodada() {
      this.isLoadingPartidas = true

      try {
        if (!this.campeonatoId || !this.faseSelecionada || !this.rodadaSelecionada) {
          this.partidas = []
          return
        }

        const { data } = await api.get(`/partidas/${this.campeonatoId}/${this.faseSelecionada}/${this.rodadaSelecionada}`)

        const lista = Array.isArray(data) ? data : []

        this.partidas = lista.sort((a, b) => {
          const da = new Date(a?.data || a?.createdAt || 0).getTime()
          const db = new Date(b?.data || b?.createdAt || 0).getTime()
          return db - da
        })
      } catch (err) {
        console.error('Erro ao carregar partidas por rodada:', err)
        this.partidas = []
      } finally {
        this.isLoadingPartidas = false
      }
    },

    verificarLogin(quadra) {
      const usuario = JSON.parse(localStorage.getItem('usuario'))

      if (usuario?.token) {
        router.push({ name: 'agendar_quadra', query: { quadraId: quadra.id } })
      } else {
        localStorage.setItem('quadraSelecionada', JSON.stringify(quadra))
        this.loginComGoogle()
      }
    },

    irParaLogin() {
      this.mostrarModalLogin = true
    },

    loginComGoogle() {
      const width = 500, height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2.5

      const popup = window.open(
        'http://localhost:3000/auth/google',
        'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const listener = event => {
        const origensPermitidas = ['https://quadra-livre.vercel.app', 'http://localhost:8080']
        if (!origensPermitidas.includes(event.origin) && event.origin !== window.location.origin) return

        const { token, erro, email, usuario } = event.data

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
          }).then(() => {
            window.location.href = `/cadastro?email=${encodeURIComponent(email)}`
          })
          return
        }

        if (token && usuario) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))

          const quadraStorage = localStorage.getItem('quadraSelecionada')
          const quadraSelecionada = quadraStorage ? JSON.parse(quadraStorage) : null

          if ([1, 2].includes(usuario.permissaoId)) {
            router.push({ name: 'Dashboard' })
          } else if (usuario.permissaoId === 4) {
            router.push({ name: 'gerenciar_partida' })
          } else if (usuario.permissaoId === 3) {
            if (quadraSelecionada?.id) {
              router.push({ name: 'agendar_quadra', query: { quadraId: quadraSelecionada.id } })
              localStorage.removeItem('quadraSelecionada')
            } else {
              router.push({ name: 'agendar_quadra' })
            }
          } else {
            router.push({ name: 'Home' })
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
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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

.btn-topo {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: #3b82f6;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
  z-index: 1100;
}

.btn-topo:hover {
  background: #2563eb;
}

.card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  height: 350px;
  background-color: #f3f4f6;
}

.card.is-interditada .imagem {
  filter: grayscale(100%) brightness(1.1) opacity(0.6);
  transition: filter 0.3s ease;
}

.sombra-inferior {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 75%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.badge-interditada-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #dc2626;
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 4px;
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
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
  width: 100%;
  padding: 20px;
  z-index: 2;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info h3 {
  color: #ffffff;
  font-weight: 800;
  font-size: 22px;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.info .endereco {
  color: #d1d5db;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.btn-agendar {
  width: fit-content;
  align-self: flex-start;

  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  background-color: #3B82F6;
  color: white;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-agendar:hover {
  background-color: #60a5fa;

}

.btn-agendar:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-agendar:disabled {
  background-color: #4b5563;
  color: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

.descricao,
.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #fff;
}

.filtros-topo {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filtro-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.filtro-titulo {
  font-size: 20px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 6px;
}

.filtro-item select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  background-color: white;
  color: #333;
  appearance: none;
  cursor: pointer;
}

.filtro-item select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.placar-container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.placar-wrapper {
  flex: 2;
  min-width: 400px;
}

.partidas-wrapper {
  flex: 1;
  min-width: 250px;
  overflow-x: hidden;
}

.placar-home {
  width: 90%;
  margin: 20px auto 40px;
  overflow-x: auto;
}

.time-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.sem-dados {
  color: #777;
  font-size: 18px;
}

.titulo-secao {
  font-size: 20px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

@keyframes statusDotPulse {
  0% {
    transform: scale(0.9);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }

  70% {
    transform: scale(1.2);
    opacity: 0.7;
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }

  100% {
    transform: scale(0.9);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.loader-container-centralizado,
.sem-dados-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 16px;
  color: #555;
}

@media (max-width: 768px) {
  .btn-topo {
    right: 14px;
    bottom: 14px;
    width: 40px;
    height: 40px;
    font-size: 20px;
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

  .placar-home {
    width: 90%;
    margin: 20px auto 40px;
  }

  .placar-wrapper {
    flex: 2;
    min-width: 400px;
    overflow-x: auto;
  }

  .filtros-topo {
    flex-direction: column;
    gap: 12px;
  }

  .filtro-item {
    width: 100%;
    min-width: 0;
  }

  .filtro-item select {
    width: 100%;
  }

  .filtro-rodada-mobile {
    margin-bottom: 12px;
  }

  .partidas-wrapper {
    display: flex;
    flex-direction: column;
  }
}
</style>