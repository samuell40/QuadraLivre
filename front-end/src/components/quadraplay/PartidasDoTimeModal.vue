<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">
          Partidas do {{ timeSelecionado?.nome || '-' }}
          <span v-if="campeonatoNome"> ({{ campeonatoNome }})</span>
        </h2>

        <button type="button" class="btn-close" @click="fechar">x</button>
      </div>

      <p v-if="faseNome || rodadaNome" class="contexto-filtro">
        <span v-if="faseNome">Fase {{ faseNome }}</span>

        <span v-if="rodadaNome">
          <span v-if="faseNome"> | </span>
          Rodada {{ rodadaNome }}
        </span>
      </p>

      <div v-if="loading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else-if="partidasDoTime.length === 0" class="sem-dados">
        Nenhuma partida desse time na fase/rodada selecionada.
      </div>

      <ul v-else class="lista-partidas">
        <li v-for="partida in partidasDoTime" :key="partida.id" class="card-partida"
          :class="statusClassCard(partida.status)" @click="abrirDetalharPartida(partida.id)">
          <div class="match-ribbon" :class="statusClassRibbon(partida.status)">
            <span v-if="partida.status === 'EM_ANDAMENTO'" class="status-live-dot" aria-hidden="true"></span>
            {{ statusLabel(partida.status) }}
          </div>

          <div class="placar-linha">
            <div class="time-lado time-a">
              <img v-if="partida.timeA?.foto" :src="partida.timeA.foto" class="escudo" alt="Escudo time A" />
              <span class="nome">{{ partida.timeA?.nome }}</span>
            </div>

            <div class="placar-centro">
              <strong>{{ partida.pontosTimeA ?? 0 }}</strong>
              <span>x</span>
              <strong>{{ partida.pontosTimeB ?? 0 }}</strong>
            </div>

            <div class="time-lado time-b">
              <img v-if="partida.timeB?.foto" :src="partida.timeB.foto" class="escudo" alt="Escudo time B" />
              <span class="nome">{{ partida.timeB?.nome }}</span>
            </div>
          </div>

          <div class="match-divider"></div>

          <div class="quadra-linha">
            {{ partida.quadra?.nome}}
          </div>
        </li>
      </ul>

      <button type="button" class="btn-fechar" @click="fechar">Fechar</button>
    </div>
  </div>

  <DetalharPartidaModal v-model="mostrarDetalharPartida" :partida-id="partidaSelecionadaId" />
</template>

<script>
import DetalharPartidaModal from '@/components/quadraplay/DetalharPartidaModal.vue'

const STATUS_CONFIG = {
  FINALIZADA: { label: 'ENCERRADA', cls: 'status-finalizada' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', cls: 'status-andamento' },
  AGENDADA: { label: 'AGUARDANDO', cls: 'status-agendada' },
  CANCELADA: { label: 'CANCELADA', cls: 'status-cancelada' }
}

export default {
  name: 'PartidasDoTimeModal',
  components: {
    DetalharPartidaModal
  },
  props: {
    modelValue: { type: Boolean, default: false },
    time: { type: Object, default: null },
    partidas: { type: Array, default: () => [] },
    faseNome: { type: String, default: '' },
    rodadaNome: { type: String, default: '' },
    campeonatoNome: { type: String, default: '' },
    loading: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      mostrarDetalharPartida: false,
      partidaSelecionadaId: null
    }
  },
  computed: {
    timeSelecionado() {
      if (!this.time) return null
      return {
        id: Number(this.time.id ?? this.time.timeId ?? this.time.time?.id),
        nome: this.time.nome ?? this.time.time?.nome ?? '',
        foto: this.time.foto ?? this.time.time?.foto ?? ''
      }
    },
    partidasDoTime() {
      const timeId = Number(this.timeSelecionado?.id)
      if (!Number.isFinite(timeId) || timeId <= 0) return []

      return (Array.isArray(this.partidas) ? this.partidas : [])
        .filter((p) => Number(p?.timeAId) === timeId || Number(p?.timeBId) === timeId)
        .sort((a, b) => {
          const da = new Date(a?.data || a?.createdAt || 0).getTime()
          const db = new Date(b?.data || b?.createdAt || 0).getTime()
          return db - da
        })
    }
  },
  watch: {
    modelValue(value) {
      if (!value) {
        this.mostrarDetalharPartida = false
        this.partidaSelecionadaId = null
      }
    }
  },
  methods: {
    fechar() {
      this.$emit('update:modelValue', false)
    },
    abrirDetalharPartida(partidaId) {
      const id = Number(partidaId)
      if (!Number.isFinite(id) || id <= 0) return
      this.partidaSelecionadaId = id
      this.mostrarDetalharPartida = true
    },
    statusLabel(status) {
      return STATUS_CONFIG[status]?.label || status || '-'
    },
    statusClassRibbon(status) {
      return STATUS_CONFIG[status]?.cls || 'status-agendada'
    },
    statusClassCard(status) {
      if (status === 'EM_ANDAMENTO') return 'partida-andamento'
      if (status === 'FINALIZADA') return 'partida-finalizada'
      if (status === 'CANCELADA') return 'partida-cancelada'
      return 'partida-agendada'
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2500;
}

.modal-content {
  width: min(900px, 95vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  border: 2px solid #3b82f6;
}

.modal-content>* {
  min-width: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-title {
  color: #3b82f6;
  margin: 0;
  font-size: 28px;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid #3b82f6;
  background: #fff;
  color: #3b82f6;
  cursor: pointer;
}

.contexto-filtro {
  color: #64748b;
  margin: 0 0 12px;
}

.lista-partidas {
  list-style: none;
  margin: 0;
  padding: 10px;
  overflow-y: auto;
  overflow-x: visible;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  align-items: start;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  background: #fff;
}

.lista-partidas>.card-partida:only-child {
  grid-column: 1 / -1;
}

.card-partida {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px 8px;
  background: #fff;
  overflow: visible;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card-partida:hover {
  transform: translateY(-2px);
}

.card-partida.partida-andamento {
  border-color: #16a34a;
}

.card-partida.partida-finalizada {
  border-color: #e11d48;
}

.card-partida.partida-cancelada {
  border-color: #dc2626;
}

.card-partida.partida-agendada {
  border-color: #2563eb;
}


.match-ribbon {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: #ffffff;
  padding: 3px 14px;
  /* ✅ menor */
  border-radius: 0 0 14px 14px;
  font-weight: 800;
  font-size: 10px;
  /* ✅ menor */
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 2;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* ✅ menor */
}

.status-live-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  border: 2px solid #fff;
  /* ✅ borda branca na bolinha */
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: statusDotPulse 1s infinite;
}

.match-ribbon.status-andamento {
  background: #16a34a;
}

.match-ribbon.status-finalizada {
  background: #bd1c1c;
}

.match-ribbon.status-cancelada {
  background: #dc2626;
}

.match-ribbon.status-agendada {
  background: #2563eb;
}

.match-divider {
  height: 1px;
  background-color: #f2f2f2;
  margin: 6px 8px 3px;
  /* ✅ menor */
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

/* ✅ menos altura: margin-top menor + tamanhos menores */
.placar-linha {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  /* ✅ antes 20px */
}

.time-lado {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.time-a {
  justify-content: flex-start;
}

.time-b {
  justify-content: flex-end;
  text-align: right;
}

.time-b .escudo {
  order: 2;
}

.time-b .nome {
  order: 1;
}

/* ✅ escudo menor */
.escudo {
  width: 24px;
  /* ✅ antes 30px */
  height: 24px;
  /* ✅ antes 30px */
  border-radius: 50%;
  object-fit: cover;
  flex: 0 0 auto;
}

/* ✅ nome menor */
.nome {
  color: #1f2937;
  font-weight: 800;
  font-size: 16px;
  /* ✅ antes 20px */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
  /* ✅ antes 240px */
}

.placar-centro {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  /* ✅ menor */
  padding: 4px 8px;
  /* ✅ menor */
  border-radius: 999px;
  min-width: 78px;
  /* ✅ menor */
}

.placar-centro strong {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.placar-centro span {
  font-size: 14px;
  font-weight: 900;
  color: #334155;
  line-height: 1;
}

.quadra-linha {
  margin-top: 5px;
  color: #3b82f6;
  font-size: 12px;
  text-align: center;
}

.btn-fechar {
  margin-top: 14px;
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 10px 12px;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.loader-container-centralizado,
.sem-dados {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  color: #64748b;
}

.loader {
  width: 34px;
  height: 34px;
  border: 4px solid #dbeafe;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 100vw;
    max-height: 100dvh;
    border-radius: 0;
    padding: 14px;
  }

  .modal-title {
    font-size: 22px;
  }

  .lista-partidas {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px;
  }

  .card-partida {
    padding: 12px 10px 8px;
  }

  .nome {
    font-size: 15px;
    max-width: 140px;
  }

  .placar-centro strong {
    font-size: 18px;
  }

  .placar-centro span {
    font-size: 14px;
  }

  .placar-centro {
    min-width: 74px;
    padding: 4px 8px;
  }

  .escudo {
    width: 22px;
    height: 22px;
  }

  .btn-fechar {
    display: block;
  }
}
</style>
