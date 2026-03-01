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
              <span class="segunda-linha destaque">seu treino ficou ainda mais fácil.</span>
            </div>
          </h1>
          <p class="hero-subtitle">Com poucos cliques, encontre e reserve a quadra ideal para o seu treino.</p>
        </div>
      </section>

      <section id="quadras-disponiveis" class="quadras-section">
        <div class="quadras-shell">
          <div class="quadras-head">
            <div>
              <span class="section-kicker">Agendamento</span>
              <h2 class="tit_horario">Quadras Disponíveis</h2>
              <a class="quadras-subtitle">Escolha a melhor opção para o seu próximo treino!</a>
            </div>
          </div>

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
                      INDISPONVEL
                    </div>

                    <img :src="quadra.foto" :alt="quadra.nome" class="imagem" />

                    <div class="sombra-inferior"></div>

                    <div class="info">
                      <h3>{{ quadra.nome }}</h3>
                      <a class="endereco">{{ quadra.endereco }}</a>

                      <button class="btn-agendar" :disabled="quadra.interditada"
                        @click="!quadra.interditada && verificarLogin(quadra)">
                        {{ quadra.interditada ? 'Indisaonvel' : 'Agendar' }}
                      </button>
                    </div>
                  </div>
                </Slide>
              </Carousel>
              <button class="btn-next" @click="next">&gt;</button>
            </template>
          </section>
        </div>
      </section>

      <section class="painel-home">
        <div class="painel-card filtros-card">
          <div class="section-head">
            <div>
              <span class="section-kicker">Navegação</span>
              <h2>Fase e rodadas</h2>
              <a>Atualize os filtros para trocar a tabela e os resultados exibidos.</a>
            </div>
          </div>

          <div class="filtros-topo">
            <div class="filtro-item">
              <label class="filtro-titulo">Fase</label>
              <select v-model="faseSelecionada" class="filtro-select" @change="onFaseChange">
                <option disabled value="">Selecione a Fase</option>
                <option v-for="fase in fases" :key="fase.id" :value="fase.id">
                  {{ fase.nome }}
                </option>
              </select>
            </div>

            <!-- Rodada desktop -->
            <div v-if="!isMobile" class="filtro-item">
              <label class="filtro-titulo">Rodada</label>
              <select v-model="rodadaSelecionada" class="filtro-select" :disabled="!rodadas.length"
                @change="carregarPartidasPorRodada">
                <option disabled value="">Selecione a Rodada</option>
                <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                  {{ rodada.nome }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="placar-e-partidas">
          <div class="painel-card placar-wrapper">
            <div class="section-head">
              <div>
                <span class="section-kicker">Classificação</span>
                <h2>Tabela do {{ nomeCampeonato }}</h2>
                <a>Toque em um time para abrir o histórico completo de partidas.</a>
              </div>
            </div>

            <TabelaClassificacao v-if="isLoadingPlacar || (Array.isArray(placar) && placar.length > 0)" :times="placar"
              :loading="isLoadingPlacar" :modalidade="modalidadeNormalizada"
              :colunas-visiveis="colunasClassificacaoVisiveis" @time-click="abrirModalPartidasTime" />

            <div v-else class="sem-dados-centralizado sem-dados-alinhado">
              Nenhuma tabela de classificação disponível no momento.
            </div>
          </div>

          <div class="painel-card partidas-wrapper">
            <div class="section-head">
              <div>
                <span class="section-kicker">Resultados</span>
                <h2>Partidas da rodada</h2>
                <a>
                  {{ nomeFaseSelecionada ? `Fase: ${nomeFaseSelecionada}` : '' }}
                  {{ nomeRodadaSelecionada ? `  Rodada: ${nomeRodadaSelecionada}` : '' }}
                </a>
              </div>
            </div>

            <!-- Rodada mobile -->
            <div v-if="isMobile" class="filtro-item filtro-rodada-mobile">
              <label class="filtro-titulo">Rodada</label>
              <select v-model="rodadaSelecionada" class="filtro-select" :disabled="!rodadas.length"
                @change="carregarPartidasPorRodada">
                <option disabled value="">Selecione a Rodada</option>
                <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                  {{ rodada.nome }}
                </option>
              </select>
            </div>

            <ListaPartidas :partidas="partidas" :loading="isLoadingPartidas"
              empty-title="Nenhuma partida disponível no momento." quadra-class="nome-quadra-home" empty-align="left"
              @time-click="abrirModalPartidasTime" />
          </div>
        </div>
      </section>

      <PartidasDoTimeModal v-model="mostrarModalPartidasTime" :time="timeSelecionadoPartidas" :partidas="partidas"
        :fase-nome="nomeFaseSelecionada" :rodada-nome="nomeRodadaSelecionada" :campeonato-nome="nomeCampeonato"
        :loading="isLoadingPartidas" />
      <button v-if="mostrarBotaoTopo" type="button" class="btn-topo" @click="subirPagina">
        ?
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
import api from '@/axios'
import TabelaClassificacao from '@/components/quadraplay/TabelaClassificacao.vue'
import ListaPartidas from '@/components/quadraplay/ListaPartidas.vue'
import PartidasDoTimeModal from '@/components/quadraplay/PartidasDoTimeModal.vue'
import {
  EVENTO_CAMPEONATO_ATUALIZADO,
  obterSocket,
  inscreverCampeonatoSocket,
  desinscreverCampeonatoSocket
} from '@/services/socket'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: { NavBarHome, Footer, Carousel, Slide, TabelaClassificacao, ListaPartidas, PartidasDoTimeModal },

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
      mostrarModalPartidasTime: false,
      timeSelecionadoPartidas: null,
      mostrarBotaoTopo: false,
      isMobile: window.innerWidth <= 768,
      socket: null,
      socketCampeonatoId: null,
      onSocketAtualizacao: null,
      socketTimerPartidas: null,
      socketTimerPlacar: null
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
    },
    colunasClassificacaoVisiveis() {
      return Array.isArray(this.campeonatoAtual?.regras?.colunasClassificacao)
        ? this.campeonatoAtual.regras.colunasClassificacao
        : []
    },
    nomeFaseSelecionada() {
      return this.fases.find(f => Number(f.id) === Number(this.faseSelecionada))?.nome || ''
    },
    nomeRodadaSelecionada() {
      return this.rodadas.find(r => Number(r.id) === Number(this.rodadaSelecionada))?.nome || ''
    }
  },

  async mounted() {
    this.conectarSocket()

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
    clearTimeout(this.socketTimerPartidas)
    clearTimeout(this.socketTimerPlacar)
    this.desconectarSocket()
  },

  methods: {
    abrirModalPartidasTime(time) {
      this.timeSelecionadoPartidas = time
      this.mostrarModalPartidasTime = true
    },
    conectarSocket() {
      this.socket = obterSocket()

      if (!this.onSocketAtualizacao) {
        this.onSocketAtualizacao = (payload) => this.tratarAtualizacaoCampeonato(payload)
      }

      this.socket.off(EVENTO_CAMPEONATO_ATUALIZADO, this.onSocketAtualizacao)
      this.socket.on(EVENTO_CAMPEONATO_ATUALIZADO, this.onSocketAtualizacao)
    },

    desconectarSocket() {
      if (this.socket && this.onSocketAtualizacao) {
        this.socket.off(EVENTO_CAMPEONATO_ATUALIZADO, this.onSocketAtualizacao)
      }

      if (this.socketCampeonatoId) {
        desinscreverCampeonatoSocket(this.socketCampeonatoId)
      }

      this.socketCampeonatoId = null
      this.onSocketAtualizacao = null
    },

    inscreverSocketAtual(campeonatoId) {
      const id = Number(campeonatoId)
      if (!id) return

      if (this.socketCampeonatoId && this.socketCampeonatoId !== id) {
        desinscreverCampeonatoSocket(this.socketCampeonatoId)
      }

      inscreverCampeonatoSocket(id)
      this.socketCampeonatoId = id
    },

    agendarAtualizacaoPartidasSocket() {
      clearTimeout(this.socketTimerPartidas)
      this.socketTimerPartidas = setTimeout(() => {
        this.carregarPartidasPorRodada()
      }, 150)
    },

    agendarAtualizacaoPlacarSocket() {
      clearTimeout(this.socketTimerPlacar)
      this.socketTimerPlacar = setTimeout(() => {
        if (this.campeonatoId) this.carregarPlacarPorFase(this.campeonatoId)
      }, 150)
    },

    tratarAtualizacaoCampeonato(payload) {
      const campeonatoEvento = Number(payload?.campeonatoId)
      const campeonatoAtual = Number(this.campeonatoId)

      if (!campeonatoEvento || !campeonatoAtual || campeonatoEvento !== campeonatoAtual) {
        return
      }

      const tipo = String(payload?.tipo || '')
      const faseEvento = Number(payload?.faseId)
      const rodadaEvento = Number(payload?.rodadaId)

      const mesmaFase = !faseEvento || Number(this.faseSelecionada) === faseEvento
      const mesmaRodada = !rodadaEvento || Number(this.rodadaSelecionada) === rodadaEvento

      if (tipo === 'GOL_PARTIDA') {
        if (mesmaFase && mesmaRodada) {
          this.agendarAtualizacaoPartidasSocket()
        }
        return
      }

      if (['PARTIDA_CRIADA', 'PARTIDA_FINALIZADA', 'CLASSIFICACAO_ATUALIZADA', 'STATUS_PARTIDA_ATUALIZADO'].includes(tipo)) {
        if (mesmaFase && mesmaRodada) {
          this.agendarAtualizacaoPartidasSocket()
        }

        if (tipo !== 'PARTIDA_CRIADA' && mesmaFase) {
          this.agendarAtualizacaoPlacarSocket()
        }
      }
    },

    atualizarVisibilidadeBotaoTopo() {
      this.mostrarBotaoTopo = window.scrollY > 300
    },

    subirPagina() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    next() {
      if (this.$refs.carousel) this.$refs.carousel.next()
    },

    prev() {
      if (this.$refs.carousel) this.$refs.carousel.prev()
    },

    async carregarCampeonatoMaisRecente() {
      try {
        const { data } = await api.get('/todos/campeonatos')
        const campeonatos = Array.isArray(data) ? data : []
        const maisRecente = campeonatos
          .slice()
          .sort((a, b) => {
            const dataA = new Date(a?.dataInicio || a?.createdAt || 0).getTime()
            const dataB = new Date(b?.dataInicio || b?.createdAt || 0).getTime()
            return dataB - dataA
          })[0]

        this.campeonatoAtual = maisRecente || null
        this.campeonatoId = this.campeonatoAtual?.id

        if (!this.campeonatoId) {
          this.fases = []
          this.rodadas = []
          this.faseSelecionada = ''
          this.rodadaSelecionada = ''
          this.placar = []
          this.partidas = []
          this.isLoadingPlacar = false
          this.isLoadingPartidas = false
          return
        }

        this.inscreverSocketAtual(this.campeonatoId)
        await this.carregarFases(this.campeonatoId)
      } catch (err) {
        console.error('Erro ao carregar campeonato mais recente:', err)
        this.placar = []
        this.partidas = []
        this.isLoadingPlacar = false
        this.isLoadingPartidas = false
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
      this.isLoadingPlacar = true
      this.isLoadingPartidas = true

      try {
        const { data } = await api.get(`/fases/${campeonatoId}/`)

        if (!Array.isArray(data)) {
          this.fases = []
          this.rodadas = []
          this.faseSelecionada = ''
          this.rodadaSelecionada = ''
          this.placar = []
          this.partidas = []
          this.isLoadingPlacar = false
          this.isLoadingPartidas = false
          return
        }

        this.fases = data

        if (!this.fases.length) {
          this.faseSelecionada = ''
          this.rodadas = []
          this.rodadaSelecionada = ''
          this.placar = []
          this.partidas = []
          this.isLoadingPlacar = false
          this.isLoadingPartidas = false
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
        this.placar = []
        this.partidas = []
        this.isLoadingPlacar = false
        this.isLoadingPartidas = false
      }
    },

    onFaseChange() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada)

      if (!fase) {
        this.rodadas = []
        this.rodadaSelecionada = ''
        this.placar = []
        this.partidas = []
        this.isLoadingPlacar = false
        this.isLoadingPartidas = false
        return
      }

      const rodadas = Array.isArray(fase.rodadas) ? fase.rodadas : []
      this.rodadas = rodadas
      this.rodadaSelecionada = rodadas.length ? rodadas[0].id : ''

      this.carregarPlacarPorFase(this.campeonatoId)
      this.carregarPartidasPorRodada()
    },

    async carregarPlacarPorFase(campeonatoId) {
      if (!campeonatoId || !this.faseSelecionada) {
        this.placar = []
        this.isLoadingPlacar = false
        return
      }
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
        await this.carregarColunasClassificacao(campeonatoId)
      } catch (err) {
        console.error('Erro ao carregar placar:', err)
        this.placar = []
      } finally {
        this.isLoadingPlacar = false
      }
    },

    async carregarColunasClassificacao(campeonatoId) {
      if (!campeonatoId) return

      try {
        const { data } = await api.get(`/ordem/classificacao/${campeonatoId}`)
        const colunas = Array.isArray(data?.colunas) ? data.colunas : []

        this.campeonatoAtual = {
          ...(this.campeonatoAtual || {}),
          regras: {
            ...(this.campeonatoAtual?.regras || {}),
            colunasClassificacao: colunas
          }
        }
      } catch (err) {
        console.error('Erro ao carregar colunas da classificação:', err)
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

    loginComGoogle() {
      const width = 500
      const height = 600
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
          const queryCadastro = new URLSearchParams({
            email: String(email || ''),
            origem: 'login_google'
          })

          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
          }).then(() => {
            window.location.href = `/cadastro?${queryCadastro.toString()}`
          })
          return
        }

        if (token && usuario) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))
          localStorage.removeItem('quadraPlayLoginAtivo')

          const quadraStorage = localStorage.getItem('quadraSelecionada')
          const quadraSelecionada = quadraStorage ? JSON.parse(quadraStorage) : null

          if ([1, 2].includes(usuario.permissaoId)) {
            router.push({ name: 'Dashboard' })
          } else if (usuario.permissaoId === 4) {
            router.push({ name: 'gerenciar_partida' })
          } else if ([3, 5].includes(usuario.permissaoId)) {
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
a {
  text-decoration: none;
  color: inherit;
}

.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f8fafc;
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

.texto-centro {
  color: white;
  padding: 42px 60px;
  margin-top: 70px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 14% 18%, rgba(96, 165, 250, 0.24), transparent 28%),
    radial-gradient(circle at 86% 22%, rgba(59, 130, 246, 0.18), transparent 32%),
    linear-gradient(180deg, #050b2c 0%, #08153d 58%, #08153d 100%);
  position: relative;
}

.conteudo-centralizado {
  width: min(1100px, 100%);
  margin: 0 auto;
  box-sizing: border-box;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(380px, 1fr);
  gap: 22px;
  align-items: start;
}

.hero-coay {
  padding-top: 0;
  max-width: 560px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  margin-bottom: 10px;
  color: #93c5fd;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.texto {
  font-family: "Montserrat";
  font-size: 52px;
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.6px;
  text-align: left;
  display: inline-block;
  margin: 0;
}

.primeira-linha,
.segunda-linha {
  display: block;
}

.segunda-linha {
  padding-left: 0;
  color: #3B82F6;
}

.hero-subtitle {
  margin: 12px 0 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 16px;
  line-height: 1.5;
  max-width: none;
  white-space: nowrap;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 14px;
  transition: 0.18s ease;
}

.btn-hero-arimary {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.24);
}

.btn-hero-arimary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.hero-inline-note {
  color: rgba(255, 255, 255, 0.68);
  font-size: 13px;
  line-height: 1.5;
}

.hero-highlight {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.2);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.hero-card-kicker {
  display: inline-flex;
  margin-bottom: 8px;
  color: #bfdbfe;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-highlight h2 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.hero-highlight a {
  margin: 10px 0 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 14px;
  line-height: 1.55;
  max-width: none;
}

.hero-aoints {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.hero-aoint {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(191, 219, 254, 0.12);
}

.hero-aoint strong {
  display: block;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

.hero-aoint span {
  display: block;
  margin-top: 4px;
  color: rgba(226, 232, 240, 0.7);
  font-size: 12px;
  line-height: 1.45;
}

h1 {
  font-family: "Montserrat";
  margin: 0 0 16px;
  font-size: inherit;
}

h3 {
  font-size: 22px;
  font-family: "Montserrat";
  font-weight: bold;
  margin-bottom: 16px;
  color: #fff;
}

a {
  margin-top: 14px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 20px;
  line-height: 1.6;
  max-width: 62ch;
}

.destaque_sublinhado {
  text-decoration: none;
  color: #60a5fa;
  border-bottom: 3px solid rgba(96, 165, 250, 0.55);
  padding-bottom: 2px;
}

.quadras-section {
  margin-top: 10px;
  padding: 0 0 8px;
}

.quadras-shell {
  width: calc(100% - 120px);
  margin: 0 auto;
  padding: 22px 22px 20px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.quadras-head {
  margin-bottom: 14px;
}

.tit_horario {
  margin: 6px 0 8px;
  text-align: left;
  font-size: 28px;
  color: #0f172a;
  font-weight: 900;
  letter-spacing: -0.6px;
}

.quadras-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.55;
  max-width: 60ch;
}

.agendamento {
  position: relative;
  width: auto;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 0;
}

.carousel {
  flex: 1;
  width: auto;
  overflow: hidden;
}

.carousel .carousel__slide {
  padding: 0 10px;
  box-sizing: border-box;
}

.btn-prev,
.btn-next {
  background: #f8fafc;
  color: #334155;
  border: 1px solid rgba(148, 163, 184, 0.26);
  width: 48px;
  height: 48px;
  border-radius: 999px;
  font-size: 20px;
  cursor: pointer;
  transition: 0.18s ease;
  flex: 0 0 auto;
}

.btn-prev:hover,
.btn-next:hover {
  background: #eff6ff;
  border-color: rgba(59, 130, 246, 0.35);
  color: #1d4ed8;
  transform: translateY(-1px);
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

.btn-topo:hover { background: #2563eb; }

.card {
  position: relative;
  overflow: hidden;
  height: 360px;
  background-color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 24px;
  box-shadow: 0 16px 24px -20px rgba(15, 23, 42, 0.5);
  transition: 0.18s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 28px -20px rgba(15, 23, 42, 0.58);
  border-color: rgba(59, 130, 246, 0.55);
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
  height: 72%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.48) 52%,
    transparent 100%
  );
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
  border-radius: 8px;
  z-index: 3;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
  letter-spacing: 0.6px;
}

.imagem {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.card:hover .imagem {
  transform: scale(1.04);
}

.info {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 22px;
  z-index: 2;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info h3 {
  color: #ffffff;
  font-weight: 900;
  font-size: 24px;
  margin: 0;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
  text-transform: none;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.info .endereco {
  color: #d1d5db;
  font-size: 15px;
  margin: 0;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.btn-agendar {
  width: fit-content;
  align-self: flex-start;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  background: #3B82F6;
  color: white;
  transition: 0.15s ease;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25);
}

.btn-agendar:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-agendar:active:not(:disabled) {
  transform: translateY(0px) scale(0.99);
}

.btn-agendar:disabled {
  background-color: #4b5563;
  color: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
  border-color: transparent;
}

.painel-home {
  width: calc(100% - 120px);
  margin: 24px auto 46px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.painel-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  padding: 24px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.section-head h2 {
  margin: 6px 0 8px;
  color: #0f172a;
  font-size: 28px;
  line-height: 1.05;
}

.section-head a {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.55;
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.filtros-card {
  padding: 18px 20px;
}

.filtros-card .section-head {
  margin-bottom: 14px;
}

.filtros-card .section-head h2 {
  margin: 4px 0 6px;
  font-size: 24px;
}

.filtros-card .section-head a {
  font-size: 13px;
  line-height: 1.45;
}

/* filtros */
.filtros-topo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filtros-card .filtro-item {
  gap: 6px;
}

.filtro-titulo {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.filtro-select {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: #f8fafc;
  color: #0f172a;
  font: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  appearance: none;
  cursor: pointer;
}

.filtros-card .filtro-select {
  padding: 11px 14px;
  border-radius: 14px;
}

.filtro-select:hover { border-color: rgba(59, 130, 246, 0.36); }

.filtro-select:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
  background: #fff;
}

.filtro-select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* grid tabela + partidas */
.placar-e-partidas {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.placar-wrapper,
.partidas-wrapper { min-width: 0; }

/* vazio */
.sem-dados-centralizado {
  text-align: center;
  color: #64748b;
  padding: 28px 0 8px;
}

.sem-dados-centralizado.sem-dados-alinhado { text-align: left; }

.filtro-rodada-mobile { margin-bottom: 12px; }

.time-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.titulo-secao {
  font-size: 20px;
  color: #3b82f6;
  font-weight: 800;
  margin-top: 12px;
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

.sem-dados-centralizado.sem-dados-alinhado {
  justify-content: flex-start;
  align-items: flex-start;
  height: auto;
  min-height: 0;
  padding: 24px 0;
  color: #6b7280;
  text-align: left;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .placar-e-partidas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .texto-centro {
    padding: 30px 14px;
  }

  .texto {
    font-size: 38px;
    line-height: 1.15;
  }

  .conteudo-centralizado {
    width: 100%;
    padding-left: 0;
  }

  .hero-kicker {
    margin-bottom: 10px;
  }

  .hero-subtitle {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.45;
    max-width: 100%;
    white-space: normal;
  }

  .hero-actions {
    gap: 10px;
    margin-top: 14px;
  }

  .btn-hero {
    min-height: 38px;
    padding: 0 14px;
    font-size: 13px;
  }

  .hero-inline-note {
    font-size: 13px;
  }

  .hero-highlight {
    padding: 14px 14px;
    border-radius: 18px;
  }

  .hero-highlight h2 {
    font-size: 18px;
  }

  .hero-highlight a {
    font-size: 13px;
  }

  .hero-aoint {
    padding: 10px 12px;
    border-radius: 14px;
  }

  a {
    font-size: 17px;
  }

  .btn-topo {
    right: 14px;
    bottom: 14px;
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .quadras-section {
    margin-top: 8px;
    padding-bottom: 2px;
  }

  .quadras-shell {
    width: calc(100% - 28px);
    padding: 16px 12px 14px;
    border-radius: 20px;
  }

  .tit_horario {
    font-size: 22px;
    margin: 6px 0 8px;
  }

  .quadras-subtitle {
    font-size: 14px;
  }

  .agendamento {
    gap: 8px;
  }

  .carousel .carousel__slide {
    padding: 0 6px;
  }

  .btn-prev,
  .btn-next {
    position: static;
    top: auto;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: none;
    z-index: 1;
    flex: 0 0 36px;
    font-size: 18px;
    background: rgba(248, 250, 252, 0.96);
    box-shadow: 0 8px 14px rgba(15, 23, 42, 0.12);
  }

  .btn-prev {
    margin-right: 2px;
  }

  .btn-next {
    margin-left: 2px;
  }

  .card {
    height: 320px;
    border-radius: 20px;
  }

  .info {
    padding: 18px 16px;
    gap: 10px;
  }

  .info h3 {
    font-size: 20px;
  }

  .info .endereco {
    font-size: 14px;
  }

  .painel-home {
    width: calc(100% - 28px);
    margin: 18px auto 36px;
  }

  .painel-card {
    padding: 18px 16px;
    border-radius: 22px;
  }

  .filtros-card {
    padding: 14px 14px 16px;
  }

  .section-head {
    margin-bottom: 16px;
  }

  .section-head h2 {
    font-size: 24px;
  }

  .filtros-card .section-head {
    margin-bottom: 12px;
  }

  .filtros-card .section-head h2 {
    font-size: 20px;
  }

  .filtros-card .section-head a {
    font-size: 12px;
  }

  .filtros-topo {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .filtros-card .filtros-topo {
    gap: 10px;
  }

  .filtros-card .filtro-select {
    padding: 10px 12px;
    border-radius: 12px;
  }

  .placar-wrapper {
    min-width: 0;
    overflow-x: auto;
  }

  .partidas-wrapper {
    display: flex;
    flex-direction: column;
  }
}
</style>








