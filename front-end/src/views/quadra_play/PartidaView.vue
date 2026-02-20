<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">Controles da Partida</h1>

        <span v-if="isEmAndamento" class="badge-status badge-ao-vivo">
          <span class="live-dot" aria-hidden="true"></span>
          Ao Vivo
        </span>

        <span v-else-if="isFinalizada" class="badge-status badge-finalizada">
          Finalizada
        </span>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="placarComponent" class="placares">
          <component :is="placarComponent" v-bind="placarPropsTimeA" @parcial-delta="onParcialDelta"
            @refresh="carregarPartida" />

          <component :is="placarComponent" v-bind="placarPropsTimeB" @parcial-delta="onParcialDelta"
            @refresh="carregarPartida" />
        </div>

        <button class="botao-finalizar" :disabled="botaoDesabilitado" @click="finalizarPartida">
          <span v-if="isFinalizando">Salvando...</span>

          <template v-else>
            <span v-if="isFinalizada">
              {{ temAlteracao ? 'Salvar alterações' : 'Partida Finalizada' }}
            </span>
            <span v-else>Finalizar Partida</span>
          </template>
        </button>

      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue'
import { carregarCampeonato } from '@/utils/persistirCampeonato'
import PlacarTimeFutebol from '@/components/Partida/PlacarTimeFutebol.vue'
import PlacarTimeVolei from '@/components/Partida/PlacarTimeVolei.vue'
import PlacarTimeBeachTenis from '@/components/Partida/PlacarTimeBeachTenis.vue'

export default {
  name: 'RegistroPartidaView',

  components: {
    NavBarQuadras,
    SidebarCampeonato,
    PlacarTimeFutebol,
    PlacarTimeVolei,
    PlacarTimeBeachTenis
  },

  data() {
    return {
      sidebarCollapsed: false,
      campeonato: null,
      isLoading: true,
      partidaId: null,
      time1: null,
      time2: null,
      partida: null,
      isFinalizando: false,
      parcialTimeA: null,
      parcialTimeB: null,
      parcialTimer: null,
      isSalvandoParcial: false,
      snapshotInicial: null,
      temAlteracao: false,
      acabouDeSalvar: false,
      modalidadesById: {}
    }
  },

  computed: {
    isFinalizada() {
      return this.partida?.status === 'FINALIZADA'
    },

    podeEditar() {
      return !this.isFinalizando && !!this.partidaId
    },


    modalidadeId() {
      return (
        this.partida?.modalidadeId ??
        this.campeonato?.modalidade?.id ??
        this.campeonato?.modalidadeId ??
        null
      )
    },

    modalidadeKey() {
      const id = Number(this.modalidadeId)
      if (!id) return null
      const key = this.modalidadesById[id]
      if (key) return key
      const nome =
        this.partida?.modalidade?.nome ??
        this.campeonato?.modalidade?.nome ??
        ''

      return this.keyDaModalidadePeloNome(nome)
    },
    isGrupoFutebol() {
      return this.modalidadeKey === 'FUTEBOL' || this.modalidadeKey === 'FUTSAL'
    },
    isGrupoVolei() {
      return this.modalidadeKey === 'VOLEI'
    },

    placarComponent() {
      if (this.isGrupoFutebol) return 'PlacarTimeFutebol'
      if (this.isGrupoVolei) return 'PlacarTimeVolei'
      if (this.modalidadeKey === 'BEACH_TENIS') return 'PlacarTimeBeachTenis'
      return null
    },

    placarIdTimeA() {
      return this.partida?.placarTimeAId ?? this.partida?.placarAId ?? this.time1?.placarId ?? null
    },

    placarIdTimeB() {
      return this.partida?.placarTimeBId ?? this.partida?.placarBId ?? this.time2?.placarId ?? null
    },

    placarPropsTimeA() {
      if (!this.partidaId) return {}
      return {
        lado: 'A',
        timeNome: this.time1?.nome,
        timeData: this.time1,
        partidaId: this.partidaId,
        podeEditar: this.podeEditar,
        placarId: this.placarIdTimeA
      }
    },

    placarPropsTimeB() {
      if (!this.partidaId) return {}
      return {
        lado: 'B',
        timeNome: this.time2?.nome,
        timeData: this.time2,
        partidaId: this.partidaId,
        podeEditar: this.podeEditar,
        placarId: this.placarIdTimeB
      }
    },

    isEmAndamento() {
      return this.partida?.status === 'EM_ANDAMENTO'
    },

    botaoDesabilitado() {
      if (this.isFinalizando || !this.partidaId) return true
      if (this.isFinalizada) return !this.temAlteracao
      return false
    }
  },

  methods: {
    normalizarNomeModalidade(nome) {
      return String(nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    },

    keyDaModalidadePeloNome(nome) {
      const n = this.normalizarNomeModalidade(nome)
      if (n.includes('beach') && (n.includes('tenis') || n.includes('tennis'))) return 'BEACH_TENIS'
      if (n.includes('futsal')) return 'FUTSAL'
      if (n.includes('beach soccer') || (n.includes('futebol') && n.includes('areia'))) return 'FUTEBOL'
      if (n.includes('futebol')) return 'FUTEBOL'
      if (
        n.includes('futevolei') ||
        ((n.includes('volei') || n.includes('voleibol')) && n.includes('areia')) ||
        n.includes('volei') ||
        n.includes('voleibol')
      ) return 'VOLEI'

      return null
    },

    async carregarModalidades() {
      const { data } = await api.get('/listar/modalidade')
      const map = {}
      for (const m of (data || [])) {
        const key = this.keyDaModalidadePeloNome(m.nome)
        if (key) map[Number(m.id)] = key
      }

      this.modalidadesById = map
    },

    mapTimeFutebol(time, lado, partida) {
      return {
        id: time?.id,
        nome: time?.nome,
        foto: time?.foto,
        golspro: lado === 'A' ? (partida.pontosTimeA ?? 0) : (partida.pontosTimeB ?? 0),
        faltas: lado === 'A' ? (partida.faltasTimeA ?? 0) : (partida.faltasTimeB ?? 0),
        substituicoes: lado === 'A' ? (partida.substituicoesTimeA ?? 0) : (partida.substituicoesTimeB ?? 0),
        cartaoamarelo: lado === 'A' ? (partida.cartoesAmarelosTimeA ?? 0) : (partida.cartoesAmarelosTimeB ?? 0),
        cartaovermelho: lado === 'A' ? (partida.cartoesVermelhosTimeA ?? 0) : (partida.cartoesVermelhosTimeB ?? 0),
        wo: lado === 'A' ? !!partida.woTimeA : !!partida.woTimeB,
        placarId: lado === 'A' ? (partida.placarTimeAId) : (partida.placarTimeBId)
      }
    },
    mapTimeVolei(time, lado, partida) {
      const setsVencidos = lado === 'A' ? (partida.pontosTimeA ?? 0) : (partida.pontosTimeB ?? 0)
      const wo = lado === 'A' ? !!partida.woTimeA : !!partida.woTimeB

      let pontosSet = 0

      if (Array.isArray(partida.sets) && partida.sets.length) {
        const totalSets = (partida.pontosTimeA ?? 0) + (partida.pontosTimeB ?? 0)
        const setAtualNum = totalSets + 1
        const setAtual = partida.sets.find(s => Number(s.numero) === Number(setAtualNum))
        if (setAtual) {
          pontosSet = lado === 'A' ? (setAtual.pontosA ?? 0) : (setAtual.pontosB ?? 0)
        }
      }

      const setsJogados = Array.isArray(partida.sets)
        ? partida.sets.map(s => ({
          numero: s.numero,
          pontos: lado === 'A' ? (s.pontosA ?? 0) : (s.pontosB ?? 0),
          time: lado
        }))
        : []

      return {
        id: time?.id,
        nome: time?.nome,
        foto: time?.foto,
        setsVencidos,
        pontosSet,
        wo,
        setsJogados,
        placarId: lado === 'A' ? partida.placarTimeAId : partida.placarTimeBId
      }
    },

    mapTimeBeachTenis(time, lado, partida) {
      const setsVencidos = lado === 'A' ? (partida.pontosTimeA ?? 0) : (partida.pontosTimeB ?? 0)
      const wo = lado === 'A' ? !!partida.woTimeA : !!partida.woTimeB

      // Set atual = soma dos sets vencidos + 1
      const totalSets = (partida.pontosTimeA ?? 0) + (partida.pontosTimeB ?? 0)
      const setAtualNum = totalSets + 1

      let pontosTieBreak = 0
      if (Array.isArray(partida.sets) && partida.sets.length) {
        const setAtual = partida.sets.find(s => Number(s.numero) === Number(setAtualNum))
        if (setAtual) {
          pontosTieBreak = lado === 'A' ? (setAtual.pontosA ?? 0) : (setAtual.pontosB ?? 0)
        }
      }

      return {
        id: time?.id,
        nome: time?.nome,
        foto: time?.foto,
        setsVencidos,
        pontosTieBreak,
        wo,
        placarId: lado === 'A' ? partida.placarTimeAId : partida.placarTimeBId
      }
    },

    async carregarPartida() {
      if (!this.partidaId) return
      const res = await api.get(`/partidas/${this.partidaId}/retornar`)
      const partida = res.data

      this.partida = partida
      if (this.modalidadeKey === 'VOLEI') {
        this.time1 = this.mapTimeVolei(partida.timeA, 'A', partida)
        this.time2 = this.mapTimeVolei(partida.timeB, 'B', partida)
      } else if (this.modalidadeKey === 'BEACH_TENIS') {
        this.time1 = this.mapTimeBeachTenis(partida.timeA, 'A', partida)
        this.time2 = this.mapTimeBeachTenis(partida.timeB, 'B', partida)
      } else {
        this.time1 = this.mapTimeFutebol(partida.timeA, 'A', partida)
        this.time2 = this.mapTimeFutebol(partida.timeB, 'B', partida)
      }

      if (this.isFinalizada) {
        if (!this.snapshotInicial || this.acabouDeSalvar) {
          this.setSnapshotInicial()
          this.acabouDeSalvar = false
        } else {
          this.atualizarFlagAlteracao()
        }
      } else {
        this.snapshotInicial = null
        this.temAlteracao = false
        this.acabouDeSalvar = false
      }
    },

    async atualizarParcial(payload) {
      if (!this.partidaId) return

      try {
        this.isSalvandoParcial = true
        console.log('payload enviado:', JSON.stringify(payload))
        await api.put(`/partida/${this.partidaId}/parcial`, payload)
        this.atualizarFlagAlteracao()
      } catch (error) {
        console.error('[atualizarParcial] erro:', error)
        Swal.fire('Erro', 'error')
      } finally {
        this.isSalvandoParcial = false
      }
    },

    async onParcialDelta({ lado, campo, delta }) {
      if (!this.partidaId) return
      if (!this.partida) return

      if (this.isGrupoFutebol) {
        await this.aplicarDeltaFutebol(lado, campo, delta)
        return
      }

      if (this.isGrupoVolei) {
        await this.aplicarDeltaVolei(lado, campo, delta)
        return
      }

      if (this.modalidadeKey === 'BEACH_TENIS') {
        await this.aplicarDeltaBeachTenis(lado, campo, delta)
        return
      }
    },

    async aplicarDeltaFutebol(lado, campo, delta) {
      const p = this.partida
      if (!p) return

      const d = Number(delta || 0)
      if (!Number.isFinite(d) || d === 0) return

      const isA = lado === 'A'
      const clamp0 = (n) => Math.max(0, Number(n || 0))

      const payload = {
        pontosTimeA: clamp0(p.pontosTimeA),
        pontosTimeB: clamp0(p.pontosTimeB),
        faltasTimeA: clamp0(p.faltasTimeA),
        faltasTimeB: clamp0(p.faltasTimeB),
        substituicoesTimeA: clamp0(p.substituicoesTimeA),
        substituicoesTimeB: clamp0(p.substituicoesTimeB),
        cartoesAmarelosTimeA: clamp0(p.cartoesAmarelosTimeA),
        cartoesAmarelosTimeB: clamp0(p.cartoesAmarelosTimeB),
        cartoesVermelhosTimeA: clamp0(p.cartoesVermelhosTimeA),
        cartoesVermelhosTimeB: clamp0(p.cartoesVermelhosTimeB),
        woTimeA: !!p.woTimeA,
        woTimeB: !!p.woTimeB
      }

      const inc = (key) => { payload[key] = clamp0(payload[key] + d) }

      if (campo === 'golspro') inc(isA ? 'pontosTimeA' : 'pontosTimeB')
      else if (campo === 'faltas') inc(isA ? 'faltasTimeA' : 'faltasTimeB')
      else if (campo === 'substituicoes') inc(isA ? 'substituicoesTimeA' : 'substituicoesTimeB')
      else if (campo === 'cartaoamarelo') inc(isA ? 'cartoesAmarelosTimeA' : 'cartoesAmarelosTimeB')
      else if (campo === 'cartaovermelho') inc(isA ? 'cartoesVermelhosTimeA' : 'cartoesVermelhosTimeB')
      else {
        console.warn('[aplicarDeltaFutebol] campo desconhecido:', campo)
        return
      }

      Object.assign(this.partida, payload)
      this.atualizarFlagAlteracao()
      await this.atualizarParcial(payload)
      await this.carregarPartida()
    },

    async aplicarDeltaVolei(lado, campo, delta) {
      const p = this.partida
      if (!p) return

      const d = Number(delta || 0)
      if (!Number.isFinite(d) || d === 0) return

      const isA = lado === 'A'
      const clamp0 = (n) => Math.max(0, Number(n || 0))

      const payload = {
        pontosTimeA: clamp0(p.pontosTimeA),
        pontosTimeB: clamp0(p.pontosTimeB),
        woTimeA: !!p.woTimeA,
        woTimeB: !!p.woTimeB,

        sets: Array.isArray(p.sets)
          ? p.sets.map(s => ({
            numero: Number(s.numero),
            pontosA: clamp0(s.pontosA ?? s.pontosTimeA ?? 0),
            pontosB: clamp0(s.pontosB ?? s.pontosTimeB ?? 0)
          }))
          : []
      }

      const totalSets = payload.pontosTimeA + payload.pontosTimeB
      const setAtualNum = totalSets + 1

      const getOrCreateSetAtual = () => {
        let s = payload.sets.find(x => Number(x.numero) === Number(setAtualNum))
        if (!s) {
          s = { numero: setAtualNum, pontosA: 0, pontosB: 0 }
          payload.sets.push(s)
        }
        s.pontosA = clamp0(s.pontosA)
        s.pontosB = clamp0(s.pontosB)
        return s
      }

      if (campo === 'setsVencidos') {
        if (isA) payload.pontosTimeA = clamp0(payload.pontosTimeA + d)
        else payload.pontosTimeB = clamp0(payload.pontosTimeB + d)
      } else if (campo === 'pontosSet') {
        const setAtual = getOrCreateSetAtual()
        if (isA) setAtual.pontosA = clamp0(setAtual.pontosA + d)
        else setAtual.pontosB = clamp0(setAtual.pontosB + d)
      } else if (campo === 'wo') {
        if (isA) payload.woTimeA = d > 0
        else payload.woTimeB = d > 0

        if (payload.woTimeA || payload.woTimeB) {
          payload.pontosTimeA = 0
          payload.pontosTimeB = 0
          payload.sets = []
        }
      } else {
        console.warn('[aplicarDeltaVolei] campo desconhecido:', campo)
        return
      }

      Object.assign(this.partida, payload)

      this.atualizarFlagAlteracao()
      await this.atualizarParcial(payload)
      await this.carregarPartida()
    },

    async aplicarDeltaBeachTenis(lado, campo, delta) {
      const p = this.partida
      if (!p) return

      const d = Number(delta || 0)
      if (!Number.isFinite(d) || d === 0) return

      const isA = lado === 'A'
      const clamp0 = (n) => Math.max(0, Number(n || 0))

      const payload = {
        pontosTimeA: clamp0(p.pontosTimeA),
        pontosTimeB: clamp0(p.pontosTimeB),
        woTimeA: !!p.woTimeA,
        woTimeB: !!p.woTimeB,

        sets: Array.isArray(p.sets)
          ? p.sets.map(s => ({
            numero: Number(s.numero),
            pontosA: clamp0(s.pontosA ?? 0),
            pontosB: clamp0(s.pontosB ?? 0)
          }))
          : []
      }

      const totalSets = payload.pontosTimeA + payload.pontosTimeB
      const setAtualNum = totalSets + 1

      const getOrCreateSetAtual = () => {
        let s = payload.sets.find(x => Number(x.numero) === Number(setAtualNum))
        if (!s) {
          s = { numero: setAtualNum, pontosA: 0, pontosB: 0 }
          payload.sets.push(s)
        }
        s.pontosA = clamp0(s.pontosA)
        s.pontosB = clamp0(s.pontosB)
        return s
      }

      if (campo === 'setsVencidos') {
        if (isA) payload.pontosTimeA = clamp0(payload.pontosTimeA + d)
        else payload.pontosTimeB = clamp0(payload.pontosTimeB + d)

        getOrCreateSetAtual()

      } else if (campo === 'pontosTieBreak') {
        const setAtual = getOrCreateSetAtual()
        if (isA) setAtual.pontosA = clamp0(setAtual.pontosA + d)
        else setAtual.pontosB = clamp0(setAtual.pontosB + d)
      } else if (campo === 'wo') {
        if (isA) payload.woTimeA = d > 0
        else payload.woTimeB = d > 0

        if (payload.woTimeA || payload.woTimeB) {
          payload.pontosTimeA = 0
          payload.pontosTimeB = 0
          payload.sets = []
        }

      } else {
        console.warn('[aplicarDeltaBeachTenis] campo desconhecido:', campo)
        return
      }

      Object.assign(this.partida, payload)
      this.atualizarFlagAlteracao()

      await this.atualizarParcial(payload)
      await this.carregarPartida()
    },

    async incrementarPlacar(placarId, incremento) {
      if (!placarId) {
        console.warn('[incrementarPlacar] placarId não encontrado. Incremento:', incremento)
        return
      }

      try {
        const res = await api.put(`/placar/${placarId}/incrementar`, incremento)
        await this.carregarPartida()
        this.atualizarFlagAlteracao()
        return res.data
      } catch (error) {
        console.error('[incrementarPlacar] erro:', error)
        Swal.fire('Erro', 'error')
      }
    },

    async onIncrementarPlacarTimeA(incremento) {
      await this.incrementarPlacar(this.placarIdTimeA, incremento)
    },

    async onIncrementarPlacarTimeB(incremento) {
      await this.incrementarPlacar(this.placarIdTimeB, incremento)
    },

    async finalizarPartida() {
      if (!this.partidaId) return

      const jaFinalizada = this.isFinalizada
      if (jaFinalizada && !this.temAlteracao) return
      const isGrupoVolei = this.modalidadeKey === 'VOLEI'

      const confirm = await Swal.fire({
        title: jaFinalizada ? 'Salvar alterações?' : 'Finalizar partida?',
        text: jaFinalizada
          ? 'A partida já está finalizada. Vou salvar apenas os dados (sem alterar o status).'
          : 'Depois de finalizada, a partida não deve mais ser editada.',
        icon: jaFinalizada ? 'question' : 'warning',
        showCancelButton: true,
        confirmButtonText: jaFinalizada ? 'Sim, salvar' : 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      })

      if (!confirm.isConfirmed) return

      this.isFinalizando = true
      try {
        if (jaFinalizada) {
          const p = this.partida || {}
          const payload = isGrupoVolei
            ? {
              pontosTimeA: p.pontosTimeA ?? 0,
              pontosTimeB: p.pontosTimeB ?? 0,
              woTimeA: !!p.woTimeA,
              woTimeB: !!p.woTimeB,
              sets: Array.isArray(p.sets) ? p.sets : []
            }
            : {
              pontosTimeA: p.pontosTimeA ?? 0,
              pontosTimeB: p.pontosTimeB ?? 0,
              faltasTimeA: p.faltasTimeA ?? 0,
              faltasTimeB: p.faltasTimeB ?? 0,
              substituicoesTimeA: p.substituicoesTimeA ?? 0,
              substituicoesTimeB: p.substituicoesTimeB ?? 0,
              cartoesAmarelosTimeA: p.cartoesAmarelosTimeA ?? 0,
              cartoesAmarelosTimeB: p.cartoesAmarelosTimeB ?? 0,
              cartoesVermelhosTimeA: p.cartoesVermelhosTimeA ?? 0,
              cartoesVermelhosTimeB: p.cartoesVermelhosTimeB ?? 0,
              woTimeA: !!p.woTimeA,
              woTimeB: !!p.woTimeB
            }

          await api.put(`/partida/${this.partidaId}/parcial`, payload)
          this.acabouDeSalvar = true

          await Swal.fire('Sucesso', 'Alterações salvas!', 'success')
          await this.carregarPartida()
          this.setSnapshotInicial()
          this.$router.push({ name: 'gerenciar_partida', query: { id: this.campeonato?.id } })
          return
        }

        await api.put(`/partidas/${this.partidaId}/finalizar`)
        await Swal.fire('Sucesso', 'Partida finalizada!', 'success')
        await this.carregarPartida()
        this.$router.push({ name: 'gerenciar_partida', query: { id: this.campeonato?.id } })
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao salvar/finalizar.'
        Swal.fire('Erro', msg, 'error')
      } finally {
        this.isFinalizando = false
      }
    },

    criarSnapshotAtual() {
      const p = this.partida
      const isGrupoVolei = this.modalidadeKey === 'VOLEI'

      if (isGrupoVolei) {
        return JSON.stringify({
          pontosTimeA: p.pontosTimeA ?? 0,
          pontosTimeB: p.pontosTimeB ?? 0,
          woTimeA: !!p.woTimeA,
          woTimeB: !!p.woTimeB,
          sets: Array.isArray(p.sets) ? p.sets : []
        })
      }

      return JSON.stringify({
        pontosTimeA: p.pontosTimeA ?? 0,
        pontosTimeB: p.pontosTimeB ?? 0,
        faltasTimeA: p.faltasTimeA ?? 0,
        faltasTimeB: p.faltasTimeB ?? 0,
        substituicoesTimeA: p.substituicoesTimeA ?? 0,
        substituicoesTimeB: p.substituicoesTimeB ?? 0,
        cartoesAmarelosTimeA: p.cartoesAmarelosTimeA ?? 0,
        cartoesAmarelosTimeB: p.cartoesAmarelosTimeB ?? 0,
        cartoesVermelhosTimeA: p.cartoesVermelhosTimeA ?? 0,
        cartoesVermelhosTimeB: p.cartoesVermelhosTimeB ?? 0,
        woTimeA: !!p.woTimeA,
        woTimeB: !!p.woTimeB
      })
    },

    atualizarFlagAlteracao() {
      if (!this.isFinalizada) return
      if (!this.snapshotInicial) return
      this.temAlteracao = this.criarSnapshotAtual() !== this.snapshotInicial
    },

    setSnapshotInicial() {
      this.snapshotInicial = this.criarSnapshotAtual()
      this.temAlteracao = false
    }
  },

  async mounted() {
    try {
      this.partidaId = this.$route.query.partidaId
      this.campeonato = await carregarCampeonato(this.$route)

      await this.carregarModalidades()
      await this.carregarPartida()
    } catch (err) {
      console.error('Erro ao carregar:', err)
      this.campeonato = null
    } finally {
      this.isLoading = false
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  padding-top: 102px;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

.badge-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 5px 14px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 20px;
}

.badge-ao-vivo {
  color: #3b82f6;
  border: 2px solid #3b82f6;
  animation: livePulse 1.2s infinite ease-in-out;
}

.badge-finalizada {
  border: 2px solid #3b82f6;
  color: #3b82f6;
  animation: livePulse 1.2s infinite ease-in-out;
}

.live-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: dotPulse 1s infinite;
}

@keyframes dotPulse {
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

@keyframes livePulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.06);
    opacity: 0.85;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.finalizar-container {
  padding-top: 30px;
  margin: 0;
  width: 100%;
}

.botao-finalizar {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 18px;
}

.placares {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  justify-content: center;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 5px;
  flex-wrap: wrap;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 16px;
    padding-top: 90px;
  }

  .conteudo.collapsed {
    margin-left: 0;
  }

  .header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: nowrap;
  }

  .title {
    font-size: 22px;
    margin-top: 8px;
    margin-right: 10px;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .badge-status {
    flex-shrink: 0;
    font-size: 14px;
    padding: 4px 10px;
    gap: 8px;
    margin-top: 5px;
  }

  .live-dot {
    width: 8px;
    height: 8px;
  }

  .placares {
    gap: 14px;
    margin-top: 18px;
    padding: 10px;
    justify-content: stretch;
  }

  .botao-finalizar {
    font-size: 16px;
    padding: 14px;
  }
}
</style>
