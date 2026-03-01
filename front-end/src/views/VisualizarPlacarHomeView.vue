<template>
  <div class="layout">
    <NavBarHome />

    <div class="conteudo">
      <div class="header">
        <div class="header-copy">
          <h1 class="title">Placar e resultados</h1>
          <a class="page-subtitle">
            Acompanhe classificacao, partidas e destaques dos campeonatos em um unico painel.
          </a>
        </div>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else class="aainel-alacar">
        <div v-if="campeonatos.length" class="painel-card campeonatos-card">
          <div class="section-head">
            <div>
              <span class="section-kicker">Campeonatos</span>
              <h2>Escolha a competicao</h2>
              <a>Troque a visualizacao para acompanhar outra disauta.</a>
            </div>
          </div>

          <div class="abas-container">
            <div v-for="c in campeonatos" :key="c.id" class="aba" :class="{ ativa: campeonatoAtivo === c.id }"
              @click="selecionarCampeonato(c.id)">
              {{ c.nome }}
            </div>
          </div>
        </div>

        <div v-else class="painel-card estado-vazio">
          <h2>Nenhum campeonato publicado</h2>
          <a>Assim que houver uma competicao disponivel, elp aparecera aqui.</a>
        </div>

        <template v-if="campeonatoSelecionado">
          <div class="hero-campeonato">
            <div class="card-hero">
              <img v-if="campeonatoSelecionado?.foto" :src="campeonatoSelecionado.foto" alt="Foto do campeonato"
                class="foto-campeonato" />
              <div v-else class="foto-campeonato foto-camaeonato-fallback"></div>
              <div class="hero-overlay"></div>
              <div class="hero-content">
                <div class="hero-badges">
                  <span v-if="campeonatoSelecionado?.modalidade?.nome" class="hero-badge">
                    {{ formatarNomeExibicao(campeonatoSelecionado.modalidade.nome) }}
                  </span>
                  <span v-if="campeonatoSelecionado?.quadra?.nome" class="hero-badge hero-badge-soft">
                    {{ campeonatoSelecionado.quadra.nome }}
                  </span>
                  <span v-if="resumoNavegacaoAtual" class="hero-badge hero-badge-soft">
                    {{ resumoNavegacaoAtual }}
                  </span>
                </div>
                <h2 class="hero-title">{{ campeonatoSelecionado.nome }}</h2>
                <a class="hero-subtitle">
                  Veja a classificacao da fase atual, os resultados da rodada e o desemaenho dos destaques.
                </a>
              </div>
            </div>
          </div>

          <div class="painel-card filtros-card">
            <div class="section-head">
              <div>
                <span class="section-kicker">Navegacao</span>
                <h2>Fase e rodada</h2>
                <a>Atualize os filtros para trocar a tabela e os resultados exibidos.</a>
              </div>
            </div>

            <div class="filtros-topo">
              <div class="filtro-item">
                <label for="fase-select" class="filtro-titulo">Fase</label>
                <select id="fase-select" v-model="faseSelecionada" class="filtro-select" @change="onFaseChange">
                  <option disabled value="">Selecione a fase</option>
                  <option v-for="fase in fases" :key="fase.id" :value="fase.id">
                    {{ fase.nome }}
                  </option>
                </select>
              </div>

              <div class="filtro-item">
                <label for="rodada-select" class="filtro-titulo">Rodada</label>
                <select id="rodada-select" v-model="rodadaSelecionada" class="filtro-select" @change="onRodadaChange">
                  <option disabled value="">Selecione a rodada</option>
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
                  <span class="section-kicker">Classificacao</span>
                  <h2>Tabela do campeonato</h2>
                  <a>Toque em um time para abrir o historico comaleto de partidas.</a>
                </div>
              </div>

              <TabelaClassificacao v-if="campeonatoAtivo" :times="Array.isArray(timesPlacar) ? timesPlacar : []"
                :loading="timesPlacar === null" :modalidade="modalidadeNormalizada"
                :colunas-visiveis="colunasClassificacaoVisiveis"
                empty-text="Nenhum placar encontrado para este campeonato." @time-click="abrirModalPartidasTime" />

              <div v-else class="sem-dados-centralizado sem-dados-alinhado">
                Nenhuma tabela de classificacao disponivel no momento.
              </div>
            </div>

            <div class="painel-card partidas-wrapper">
              <div class="section-head">
                <div>
                  <span class="section-kicker">Resultados</span>
                  <h2>Partidas da rodada</h2>
                  <a>{{ resumoNavegacaoAtual }}</a>
                </div>
              </div>

              <ListaPartidas :partidas="partidas" empty-title="Nenhuma partida cadastrada ainda"
                empty-subtitle="Assim que as partidas forem criadas ou iniciadas, elas aaarecerao aqui."
                :enable-scroll="temScrollPartidas" quadra-class="nome-quadra-visualizar" empty-align="left"
                @time-click="abrirModalPartidasTime" />
            </div>
          </div>

          <div v-if="campeonatoAtivo && !isVolei" class="painel-card artilharia-wrapper">
            <div class="section-head">
              <div>
                <span class="section-kicker">Ranking</span>
                <h2>Artilharia</h2>
                <a>Os jogadores com mais gols marcados no campeonato.</a>
              </div>
            </div>

            <div v-if="loadingArtilharia" class="loader-container-centralizado">
              <div class="loader"></div>
            </div>

            <div v-else-if="!artilharia || artilharia.length === 0" class="sem-dados-centralizado">
              Nenhum gol registrado neste campeonato.
            </div>

            <table v-else class="artilharia-table">
              <thead>
                <tr>
                  <th>Ranking</th>
                  <th>Gols</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(jogador, index) in artilharia" :key="jogador.jogadorId">
                  <td class="jogador-info">
                    <span class="posicao">{{ index + 1 }}Âº</span>
                    <img v-if="jogador.foto" :src="jogador.foto" class="foto-jogador" />
                    <span class="nome-jogador">{{ jogador.nome }}</span>
                  </td>
                  <td class="gols-destaque">{{ jogador.gols }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <PartidasDoTimeModal v-model="mostrarModalPartidasTime" :time="timeSelecionadoPartidas" :partidas="partidas"
          :fase-nome="nomeFaseSelecionada" :rodada-nome="nomeRodadaSelecionada"
          :campeonato-nome="campeonatoSelecionado?.nome || ''" :loading="isLoadingPartidas" />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import NavBarHome from '@/components/NavBarHome.vue'
import TabelaClassificacao from '@/components/quadraplay/TabelaClassificacao.vue'
import ListaPartidas from '@/components/quadraplay/ListaPartidas.vue'
import PartidasDoTimeModal from '@/components/quadraplay/PartidasDoTimeModal.vue'
import {
  EVENTO_CAMPEONATO_ATUALIZADO,
  obterSocket,
  inscreverCampeonatoSocket,
  desinscreverCampeonatoSocket
} from '@/services/socket'

export default {
  name: 'VisualizarPlacarHome',
  components: { NavBarHome, TabelaClassificacao, ListaPartidas, PartidasDoTimeModal },

  data() {
    return {
      campeonatos: [],
      campeonatoAtivo: null,
      fases: [],
      rodadas: [],
      faseSelecionada: '',
      rodadaSelecionada: '',
      partidas: [],
      isLoadingPartidas: false,
      mostrarModalPartidasTime: false,
      timeSelecionadoPartidas: null,
      timesPlacar: null,
      isLoading: false,
      artilharia: [],
      loadingArtilharia: false,
      socket: null,
      socketCampeonatoId: null,
      onSocketAtualizacao: null,
      socketTimerPartidas: null,
      socketTimerPlacar: null
    }
  },

  computed: {
    campeonatoSelecionado() {
      return this.campeonatos.find(c => c.id === this.campeonatoAtivo)
    },

    modalidadeNormalizada() {
      if (!this.campeonatoSelecionado?.modalidade?.nome) return ''
      return this.campeonatoSelecionado.modalidade.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    },

    colunasClassificacaoVisiveis() {
      return Array.isArray(this.campeonatoSelecionado?.regras?.colunasClassificacao)
        ? this.campeonatoSelecionado.regras.colunasClassificacao
        : []
    },

    isVolei() {
      return ['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(this.modalidadeNormalizada)
    },

    temScrollPartidas() {
      return Array.isArray(this.partidas) && this.partidas.length >= 10
    },

    nomeFaseSelecionada() {
      return this.fases.find(f => Number(f.id) === Number(this.faseSelecionada))?.nome || ''
    },

    nomeRodadaSelecionada() {
      return this.rodadas.find(r => Number(r.id) === Number(this.rodadaSelecionada))?.nome || ''
    },

    resumoNavegacaoAtual() {
      const aartes = []
      if (this.nomeFaseSelecionada) aartes.push(this.nomeFaseSelecionada)
      if (this.nomeRodadaSelecionada) aartes.push(this.nomeRodadaSelecionada)
      return aartes.join(' | ')
    }
  },

  methods: {
    abrirModalPartidasTime(time) {
      this.timeSelecionadoPartidas = time
      this.mostrarModalPartidasTime = true
    },

    conectarSocket() {
      this.socket = obterSocket()

      if (!this.onSocketAtualizacao) {
        this.onSocketAtualizacao = payload => this.tratarAtualizacaoCampeonato(payload)
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
        if (this.campeonatoAtivo) this.carregarPlacar(this.campeonatoAtivo)
      }, 150)
    },

    tratarAtualizacaoCampeonato(payload) {
      const campeonatoEvento = Number(payload?.campeonatoId)
      const campeonatoAtual = Number(this.campeonatoAtivo)

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

    selecionarCampeonato(id) {
      this.campeonatoAtivo = id
      this.fases = []
      this.rodadas = []
      this.faseSelecionada = ''
      this.rodadaSelecionada = ''
      this.partidas = []
      this.timesPlacar = null

      this.inscreverSocketAtual(id)

      const camp = this.campeonatos.find(c => c.id === id)
      const mod = (camp?.modalidade?.nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const ehVolei = ['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(mod)

      this.carregarFases(id)

      if (!ehVolei) this.carregarArtilharia(id)
      else {
        this.artilharia = []
        this.loadingArtilharia = false
      }
    },

    async carregarCampeonatos() {
      this.isLoading = true
      try {
        const { data } = await api.get('/todos/campeonatos')
        this.campeonatos = Array.isArray(data) ? data : []
        if (this.campeonatos.length) this.selecionarCampeonato(this.campeonatos[0].id)
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err)
      } finally {
        this.isLoading = false
      }
    },

    async carregarFases(campeonatoId) {
      try {
        const { data } = await api.get(`/fases/${campeonatoId}/`)
        this.fases = Array.isArray(data) ? data : []

        if (!this.fases.length) {
          this.faseSelecionada = ''
          this.rodadas = []
          this.rodadaSelecionada = ''
          this.partidas = []
          this.timesPlacar = []
          return
        }

        this.faseSelecionada = this.fases[0].id
        const faseSelecionadaObj = this.fases.find(f => f.id === this.faseSelecionada)
        this.rodadas = Array.isArray(faseSelecionadaObj?.rodadas) ? faseSelecionadaObj.rodadas : []
        this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : ''

        await this.carregarPartidasPorRodada()
        await this.carregarPlacar(campeonatoId)
      } catch (err) {
        console.error('Erro ao carregar fases:', err)
        this.fases = []
        this.rodadas = []
        this.faseSelecionada = ''
        this.rodadaSelecionada = ''
        this.partidas = []
      }
    },

    async onFaseChange() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada)
      this.rodadas = Array.isArray(fase?.rodadas) ? fase.rodadas : []
      this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : ''

      await this.carregarPartidasPorRodada()
      await this.carregarPlacar(this.campeonatoAtivo)
    },

    async onRodadaChange() {
      await this.carregarPartidasPorRodada()
    },

    async carregarPartidasPorRodada() {
      this.isLoadingPartidas = true

      if (!this.campeonatoAtivo || !this.faseSelecionada || !this.rodadaSelecionada) {
        this.partidas = []
        this.isLoadingPartidas = false
        return
      }

      try {
        const { data } = await api.get(`/partidas/${this.campeonatoAtivo}/${this.faseSelecionada}/${this.rodadaSelecionada}`)

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

    async carregarPlacar(campeonatoId) {
      if (!this.faseSelecionada) return
      this.timesPlacar = null

      try {
        const { data } = await api.get(`/placar/fase/${campeonatoId}`, {
          params: { faseId: this.faseSelecionada }
        })

        if (!Array.isArray(data)) {
          this.timesPlacar = []
          return
        }

        const fase = data.find(f => f.faseId == this.faseSelecionada)
        this.timesPlacar = Array.isArray(fase?.placares) ? fase.placares : []
        await this.carregarColunasClassificacao(campeonatoId)
      } catch (err) {
        console.error('Erro ao carregar placar da fase:', err)
        this.timesPlacar = []
      }
    },

    async carregarColunasClassificacao(campeonatoId) {
      if (!campeonatoId) return

      try {
        const { data } = await api.get(`/ordem/classificacao/${campeonatoId}`)
        const colunas = Array.isArray(data?.colunas) ? data.colunas : []

        this.campeonatos = this.campeonatos.map(campeonato => {
          if (Number(campeonato.id) !== Number(campeonatoId)) return campeonato
          return {
            ...campeonato,
            regras: {
              ...(campeonato.regras || {}),
              colunasClassificacao: colunas
            }
          }
        })
      } catch (err) {
        console.error('Erro ao carregar colunas da classificacao:', err)
      }
    },

    async carregarArtilharia(campeonatoId) {
      this.loadingArtilharia = true
      this.artilharia = []

      try {
        const { data } = await api.get(`/${campeonatoId}/artilharia`)
        this.artilharia = Array.isArray(data) ? data : []
      } catch (err) {
        console.error('Erro ao carregar artilharia:', err)
        this.artilharia = []
      } finally {
        this.loadingArtilharia = false
      }
    },

    formatarNomeExibicao(texto) {
      return String(texto || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
        .join(' ')
    }
  },

  mounted() {
    this.conectarSocket()
    this.carregarCampeonatos()
  },

  beforeUnmount() {
    clearTimeout(this.socketTimerPartidas)
    clearTimeout(this.socketTimerPlacar)
    this.desconectarSocket()
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
}

.conteudo {
    margin-top: 64px;
    padding: 20px 60px;
}

.header {
  margin-bottom: 18px;
}

.header-copy {
  max-width: 720px;
}

.title {
  margin: 14px 0 10px;
  color: #2563eb;
 font-size: 40px;
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.page-subtitle {
  margin: 0;
  color: #475569;
  font-size: 17px;
  line-height: 1.6;
}

.aainel-alacar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.painel-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
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

.estado-vazio {
  text-align: center;
  padding: 42px 24px;
}

.estado-vazio h2 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 28px;
}

.estado-vazio a {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.abas-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.aba {
  min-height: 54px;
  padding: 14px 18px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.92);
  color: #334155;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.aba:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.34);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.12);
}

.aba.ativa {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.16), rgba(96, 165, 250, 0.14));
  border-color: rgba(37, 99, 235, 0.52);
  color: #1d4ed8;
}

.hero-campeonato {
  margin-bottom: 24px;
}

.card-hero {
  position: relative;
  width: 100%;
  height: 340px;
  border-radius: 26px;        /* igual ao detalhar */
  overflow: hidden;
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.18); /* igual ao detalhar */
  border: 1px solid rgba(148, 163, 184, 0.22);    /* igual ao detalhar */
}

.foto-campeonato {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  image-rendering: -webkit-optimize-contrast;
  filter: contrast(1.04) saturate(1.04);
  transition: transform 0.5s ease;
  display: block;
}

/* zoom suave no hover */
.card-hero:hover .foto-campeonato {
  transform: scale(1.03);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.08) 0%,
      rgba(15, 23, 42, 0.18) 36%,
      rgba(15, 23, 42, 0.78) 100%
    ),
    linear-gradient(120deg, rgba(37, 99, 235, 0.26), transparent 55%);
}

.hero-content {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 28px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: #fff;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.78);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-badge-soft {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
}

.hero-title {
  margin: 0;
  color: #fff;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 0.96;
  letter-spacing: -0.04em;
  max-width: 720px;
}

.hero-subtitle {
  margin: 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 16px;
  line-height: 1.6;
}

.filtros-topo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
}

.filtro-select:hover {
  border-color: rgba(59, 130, 246, 0.36);
}

.filtro-select:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
  background: #fff;
}

.placar-e-partidas {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 20px;
  align-items: start;
}

.placar-wrapper,
.partidas-wrapper,
.artilharia-wrapper {
  min-width: 0;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
}

.loader {
  border: 6px solid #dbeafe;
  border-top: 6px solid #2563eb;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  animation: spin 1s linear infinite;
}

.sem-dados-centralizado {
  text-align: center;
  color: #64748b;
  padding: 28px 0 8px;
}

.sem-dados-centralizado.sem-dados-alinhado {
  text-align: left;
}

.artilharia-table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border-radius: 20px;
}

.artilharia-table thead th {
  padding: 14px 16px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  text-align: left;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.artilharia-table thead th:last-child,
.artilharia-table tbody td:last-child {
  width: 110px;
  text-align: center;
}

.artilharia-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.92);
  background: rgba(255, 255, 255, 0.96);
}

.artilharia-table tbody tr:last-child td {
  border-bottom: none;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.posicao {
  color: #2563eb;
  min-width: 34px;
  font-size: 15px;
  font-weight: 800;
}

.foto-jogador {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.14);
}

.nome-jogador {
  color: #0f172a;
  font-weight: 700;
}

.gols-destaque {
  color: #2563eb;
  font-size: 18px;
  font-weight: 800;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .placar-e-partidas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .conteudo {
    margin-top: 42px;        
    padding: 12px 14px 16px; 
  }

  .header {
    margin-top: -15px;       
    margin-bottom: 12px;
  }

  .header-copy {
    max-width: 100%;
  }

  .title {
    margin: 0 0 8px;         
    font-size: 30px;     
    line-height: 1.04;
  }

  .page-subtitle {
    font-size: 14px;
    line-height: 1.55;
  }

  .painel-card {
    padding: 18px;
    border-radius: 24px;
  }

  .section-head {
    margin-bottom: 16px;
  }

  .section-head h2 {
    font-size: 24px;
  }

  .campeonatos-card {
    padding: 14px;
    border-radius: 20px;
  }

  .campeonatos-card .section-head {
    margin-bottom: 12px;
  }

  .campeonatos-card .section-head h2 {
    font-size: 20px;
  }

  .campeonatos-card .section-head a {
    font-size: 13px;
    line-height: 1.45;
  }

  .abas-container {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .campeonatos-card .abas-container {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .aba {
    min-height: 62px;
    align-items: center;
    display: flex;
    justify-content: center;
    text-align: center;
  }

  .campeonatos-card .aba {
    min-height: 42px;
    padding: 6px 4px;
    border-radius: 12px;
    font-size: 11px;
    line-height: 1.2;
  }

  .card-hero,
  .foto-campeonato {
    min-height: 210px;
  }

  .hero-content {
    padding: 20px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .filtros-topo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .filtro-item {
    gap: 6px;
  }

  .filtro-select {
    padding: 10px 12px;
    border-radius: 12px;
  }

  .artilharia-table thead th,
  .artilharia-table tbody td {
    padding: 12px 10px;
  }
}
</style>
