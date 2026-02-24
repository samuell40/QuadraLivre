<template>
  <div class="layout">
    <NavBarHome />

    <div class="conteudo">
      <h1 class="title">
        <span v-if="campeonatoSelecionado" class="titulo-campeonato-selecionado">
          {{ campeonatoSelecionado.nome }}
        </span>
      </h1>
      <div v-if="isLoading" class="loader"></div>
      <div v-else>
        <div class="abas-container">
          <div class="aba" v-for="c in campeonatos" :key="c.id" :class="{ ativa: campeonatoAtivo === c.id }"
            @click="selecionarCampeonato(c.id)">
            {{ c.nome }}
          </div>
        </div>
        <!-- FOTO DO CAMPEONATO -->
        <div v-if="campeonatoSelecionado?.foto" class="foto-campeonato-container">
          <img :src="campeonatoSelecionado.foto" alt="Foto do campeonato" class="foto-campeonato" />
        </div>

        <div class="filtros-topo">
          <div class="filtro-item">
            <label for="fase-select" class="filtro-titulo">Fase</label>
            <select id="fase-select" v-model="faseSelecionada" @change="onFaseChange">
              <option disabled value="">Selecione a Fase</option>
              <option v-for="fase in fases" :key="fase.id" :value="fase.id">
                {{ fase.nome }}
              </option>
            </select>
          </div>

          <div class="filtro-item">
            <label for="rodada-select" class="filtro-titulo">Rodada</label>
            <select id="rodada-select" v-model="rodadaSelecionada" @change="onRodadaChange">
              <option disabled value="">Selecione a Rodada</option>
              <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
                {{ rodada.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="placar-e-partidas">
          <!-- PLACAR -->
          <div class="placar-wrapper">
            <h3 class="titulo-secao">Tabela de Classificação</h3>
            <TabelaClassificacao v-if="campeonatoAtivo" :times="Array.isArray(timesPlacar) ? timesPlacar : []"
              :loading="timesPlacar === null" :modalidade="modalidadeNormalizada"
              empty-text="Nenhum placar encontrado para este campeonato." @time-click="abrirModalPartidasTime" />
            <div v-else class="sem-dados-centralizado">
              Nenhuma tabela de classificação disponível no momento.
            </div>

          </div>
          <div class="partidas-wrapper">
            <h3 class="titulo-secao">Resultados</h3>

            <ListaPartidas :partidas="partidas" empty-title="Nenhuma partida cadastrada ainda"
              empty-subtitle="Assim que as partidas forem criadas ou iniciadas, elas aparecerão aqui."
              :enable-scroll="temScrollPartidas" quadra-class="nome-quadra-visualizar"
              @time-click="abrirModalPartidasTime" />

          </div>
        </div>

        <!--ARTILHARIA -->
        <div class="artilharia-wrapper" v-if="campeonatoAtivo && !isVolei">
          <h3 class="titulo-secao">Artilharia</h3>

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
                  <span class="posicao">{{ index + 1 }}º</span>

                  <img v-if="jogador.foto" :src="jogador.foto" class="foto-jogador" />

                  <span class="nome-jogador">{{ jogador.nome }}</span>
                </td>
                <td class="gols-destaque">{{ jogador.gols }}</td>
              </tr>
            </tbody>
          </table>
        </div>

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
      } catch (err) {
        console.error('Erro ao carregar placar da fase:', err)
        this.timesPlacar = []
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
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  width: 92%;
  margin: 84px auto 24px;
}

.title {
  margin: 0 0 10px;
}

.titulo-campeonato-selecionado {
  color: #3b82f6;
  font-size: 40px;
  line-height: 1.05;
  letter-spacing: -0.5px
}

.loader {
  border: 6px solid #f3f4f6;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

.abas-container {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.aba {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
  background: #fff;
}

.aba.ativa {
  border-color: #3b82f6;
  color: #1d4ed8;
}

.foto-campeonato-container {
  position: relative;
  margin-bottom: 16px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.10);
}

.foto-campeonato-container::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0,0,0,0.02), rgba(0,0,0,0.20));
}

.foto-campeonato {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  display: block;
  transform: scale(1.03);
  transition: transform 220ms ease;
}

.foto-campeonato-container:hover .foto-campeonato {
  transform: scale(1.06);
}

.foto-campeonato-container::before {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 45%;
  z-index: 3;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  background: rgba(0,0,0,0.04);
  pointer-events: none;
}

.filtros-topo {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.filtro-item {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
}

.filtro-titulo {
  color: #3b82f6;
  font-weight: 600;
  margin-bottom: 6px;
}

.filtro-item select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
}

.placar-e-partidas {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 22px;
  align-items: start;
}

.titulo-secao {
  margin: 4px 0 12px;
  color: #3b82f6;
  font-size: 18px;
  font-weight: 700;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 140px;
}

.sem-dados-centralizado {
  text-align: center;
  color: #6b7280;
  padding: 24px 0;
}

.artilharia-wrapper {
  margin-top: 40px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.artilharia-table {
  width: 100%;
  border-collapse: collapse;
}

.artilharia-table th {
  background-color: #3b82f6;
  color: white;
  padding: 12px;
  text-align: left;
}

.artilharia-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.posicao {
  color: #3b82f6;
  min-width: 24px;
  text-align: center;
  font-weight: 700;
}

.foto-jogador {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.nome-jogador {
  color: #334155;
  font-weight: 600;
}

.gols-destaque {
  font-weight: 700;
  color: #3b82f6;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .conteudo {
    width: 94%;
    margin-top: 76px;
  }

  .titulo-campeonato-selecionado {
    font-size: 32px;
  }

  .placar-e-partidas {
    grid-template-columns: 1fr;
  }

  .foto-campeonato {
    max-height: 160px;
  }

  .titulo-secao {
    font-size: 20px;
  }
}
</style>
