<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">
          Registro Partida
        </h1>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="placarComponent" class="placares">
          <component
            :is="placarComponent"
            v-bind="placarPropsTimeA"
            @incrementar-placar="onIncrementarPlacarTimeA"
            @update="onUpdateTimeA"
          />
          <component
            :is="placarComponent"
            v-bind="placarPropsTimeB"
            @incrementar-placar="onIncrementarPlacarTimeB"
            @update="onUpdateTimeB"
          />
        </div>

        <div class="finalizar-container">
          <button
            class="botao-finalizar"
            :disabled="isFinalizada || isFinalizando || !partidaId"
            @click="finalizarPartida"
          >
            <span v-if="isFinalizando">Finalizando...</span>
            <span v-else-if="isFinalizada">Partida Finalizada</span>
            <span v-else>Finalizar Partida</span>
          </button>
        </div>
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

const MODALIDADES = {
  FUTEBOL: new Set([1, 2, 4]),
  VOLEI: new Set([3, 5, 6])
}

export default {
  name: 'RegistroPartidaView',

  components: {
    NavBarQuadras,
    SidebarCampeonato,
    PlacarTimeFutebol,
    PlacarTimeVolei
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
      isSalvandoParcial: false
    }
  },

  computed: {
    isFinalizada() {
      return this.partida?.status === 'FINALIZADA'
    },
    podeEditar() {
      return !this.isFinalizada
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
      if (MODALIDADES.FUTEBOL.has(id)) return 'FUTEBOL'
      if (MODALIDADES.VOLEI.has(id)) return 'VOLEI'
      return null
    },

    placarComponent() {
      if (this.modalidadeKey === 'FUTEBOL') return 'PlacarTimeFutebol'
      if (this.modalidadeKey === 'VOLEI') return 'PlacarTimeVolei'
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

      if (this.placarComponent === 'PlacarTimeVolei') {
        return {
          timeKey: 'A',
          timeNome: this.time1?.nome,
          timeData: this.time1,
          partidaId: this.partidaId,
          setsAdversario: this.time2?.setsVencidos,
          woAdversario: this.time2?.wo ? 1 : 0,
          partidaEncerradaGlobal: this.isFinalizada,
          podeEditar: this.podeEditar,
          placarId: this.placarIdTimeA
        }
      }
      return {
        timeNome: this.time1?.nome,
        timeData: this.time1,
        partidaId: this.partidaId,
        podeEditar: this.podeEditar,
        placarId: this.placarIdTimeA
      }
    },

    placarPropsTimeB() {
      if (!this.partidaId) return {}

      if (this.placarComponent === 'PlacarTimeVolei') {
        return {
          timeKey: 'B',
          timeNome: this.time2?.nome,
          timeData: this.time2,
          partidaId: this.partidaId,
          setsAdversario: this.time1?.setsVencidos,
          woAdversario: this.time1?.wo ? 1 : 0,
          partidaEncerradaGlobal: this.isFinalizada,
          podeEditar: this.podeEditar,
          placarId: this.placarIdTimeB
        }
      }

      return {
        timeNome: this.time2?.nome,
        timeData: this.time2,
        partidaId: this.partidaId,
        podeEditar: this.podeEditar,
        placarId: this.placarIdTimeB
      }
    }
  },

  methods: {
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

        placarId: lado === 'A' ? (partida.placarTimeAId ?? null) : (partida.placarTimeBId ?? null)
      }
    },

    mapTimeVolei(time, lado, partida) {
      const setsVencidos = lado === 'A' ? (partida.pontosTimeA ?? 0) : (partida.pontosTimeB ?? 0)
      const wo = lado === 'A' ? !!partida.woTimeA : !!partida.woTimeB

      let pontosSet = 0
      if (Array.isArray(partida.sets) && partida.sets.length) {
        const totalSets = (partida.pontosTimeA ?? 0) + (partida.pontosTimeB ?? 0)
        const setAtualNum = totalSets + 1
        const setAtual = partida.sets.find(s => s.numero === setAtualNum)
        if (setAtual) {
          pontosSet = lado === 'A' ? (setAtual.pontosTimeA ?? 0) : (setAtual.pontosTimeB ?? 0)
        }
      }

      const setsJogados = Array.isArray(partida.sets)
        ? partida.sets.map(s => ({
            numero: s.numero,
            pontos: lado === 'A' ? (s.pontosTimeA ?? 0) : (s.pontosTimeB ?? 0),
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
        placarId: lado === 'A' ? (partida.placarTimeAId ?? null) : (partida.placarTimeBId ?? null)
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
      } else {
        this.time1 = this.mapTimeFutebol(partida.timeA, 'A', partida)
        this.time2 = this.mapTimeFutebol(partida.timeB, 'B', partida)
      }
    },

    async atualizarParcial(payload) {
      if (!this.partidaId) return
      if (!this.podeEditar) return

      try {
        this.isSalvandoParcial = true
        await api.put(`/partida/${this.partidaId}/parcial`, payload)
      } catch (error) {
        console.error('[atualizarParcial] erro:', error)
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Não foi possível atualizar o parcial.'
        Swal.fire('Erro', msg, 'error')
      } finally {
        this.isSalvandoParcial = false
      }
    },

    agendarSalvarParcial() {
      if (this.parcialTimer) clearTimeout(this.parcialTimer)

      this.parcialTimer = setTimeout(async () => {
        const a = this.parcialTimeA
        const b = this.parcialTimeB
        if (!a || !b) return

        let payload = {}

        if (this.modalidadeKey === 'FUTEBOL') {
          payload = {
            pontosTimeA: a.golspro ?? 0,
            pontosTimeB: b.golspro ?? 0,

            faltasTimeA: a.faltas ?? 0,
            faltasTimeB: b.faltas ?? 0,

            substituicoesTimeA: a.substituicoes ?? 0,
            substituicoesTimeB: b.substituicoes ?? 0,

            cartoesAmarelosTimeA: a.cartaoamarelo ?? 0,
            cartoesAmarelosTimeB: b.cartaoamarelo ?? 0,

            cartoesVermelhosTimeA: a.cartaovermelho ?? 0,
            cartoesVermelhosTimeB: b.cartaovermelho ?? 0,

            woTimeA: !!a.wo,
            woTimeB: !!b.wo
          }
        }

        if (this.modalidadeKey === 'VOLEI') {
          payload = {
            pontosTimeA: a.setsVencidos ?? 0,
            pontosTimeB: b.setsVencidos ?? 0,

            woTimeA: (a.wo ?? 0) === 1,
            woTimeB: (b.wo ?? 0) === 1,
            sets: [
              ...(Array.isArray(a.setsJogados) ? a.setsJogados : []),
              ...(Array.isArray(b.setsJogados) ? b.setsJogados : [])
            ]
          }
        }

        await this.atualizarParcial(payload)
      }, 300) 
    },

    onUpdateTimeA(parcial) {
      this.parcialTimeA = parcial
      this.agendarSalvarParcial()
    },

    onUpdateTimeB(parcial) {
      this.parcialTimeB = parcial
      this.agendarSalvarParcial()
    },

    async incrementarPlacar(placarId, incremento) {
      if (!placarId) {
        console.warn('[incrementarPlacar] placarId não encontrado. Incremento:', incremento)
        return
      }

      if (!this.podeEditar) {
        return Swal.fire('Bloqueado', 'A partida já foi finalizada.', 'info')
      }

      try {
        const res = await api.put(`/placar/${placarId}/incrementar`, incremento)
        return res.data
      } catch (error) {
        console.error('[incrementarPlacar] erro:', error)
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Não foi possível atualizar o placar.'
        Swal.fire('Erro', msg, 'error')
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
      if (this.isFinalizada) return

      const confirm = await Swal.fire({
        title: 'Finalizar partida?',
        text: 'Depois de finalizada, a partida não deve mais ser editada.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      })

      if (!confirm.isConfirmed) return

      this.isFinalizando = true
      try {
        await api.put(`/partidas/${this.partidaId}/finalizar`)
        await Swal.fire('Sucesso', 'Partida finalizada!', 'success')
        await this.carregarPartida()
      } catch (error) {
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao finalizar partida.'
        Swal.fire('Erro', msg, 'error')
      } finally {
        this.isFinalizando = false
      }
    }
  },

  async mounted() {
    try {
      this.partidaId = this.$route.query.partidaId
      this.campeonato = await carregarCampeonato(this.$route)
      await this.carregarPartida()
    } catch (err) {
      console.error('Erro ao carregar:', err)
      this.campeonato = null
    } finally {
      this.isLoading = false
    }
  },

  beforeUnmount() {
    if (this.parcialTimer) clearTimeout(this.parcialTimer)
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

  .title {
    font-size: 22px;
    margin-top: 8px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
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
