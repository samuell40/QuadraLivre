<template>
  <div v-if="loading" class="loader-container-centralizado">
    <div class="loader"></div>
  </div>

  <div v-else-if="!partidas.length" class="sem-dados-centralizado">
    <div>
      <p class="empty-title">{{ emptyTitle }}</p>
      <p v-if="emptySubtitle" class="empty-subtitle">{{ emptySubtitle }}</p>
    </div>
  </div>

  <ul v-else class="lista-partidas" :class="{ 'com-scroll': enableScroll || partidas.length > 5 }">
    <li v-for="partida in partidas" :key="partida.id" class="card-partida" :class="statusClass(partida, 'card')"
      @click="abrirModalPartida(partida.id)">
      <div class="match-ribbon" :class="statusClass(partida, 'text')">
        <span v-if="partida.status === 'EM_ANDAMENTO'" class="status-live-dot"></span>
        {{ statusLabel(partida.status) }}
      </div>

      <div class="conteudo-card-interno">
        <div class="conteudo-partida">
          <div class="time lado">
            <img v-if="partida.timeA?.foto" :src="partida.timeA.foto" alt="Escudo Time A" />
            <span class="nome-time">{{ partida.timeA?.nome }}</span>
          </div>

          <div class="placar-centro">
            <span class="gols-placar">{{ partida.pontosTimeA ?? 0 }}</span>
            <span class="divisor-x">x</span>
            <span class="gols-placar">{{ partida.pontosTimeB ?? 0 }}</span>
          </div>

          <div class="time lado">
            <img v-if="partida.timeB?.foto" :src="partida.timeB.foto" alt="Escudo Time B" />
            <span class="nome-time">{{ partida.timeB?.nome }}</span>
          </div>
        </div>

        <div class="match-divider"></div>

        <div class="nome-quadra" :class="quadraClass">
          <span class="dot-quadra"></span> {{ partida.quadra?.nome }}
        </div>
      </div>
    </li>
  </ul>

  <DetalharPartidaModal v-model="mostrarModalPartida" :partida-id="partidaSelecionadaId" />
</template>

<script>
import DetalharPartidaModal from '@/components/quadraplay/DetalharPartidaModal.vue'

const STATUS_CONFIG = {
  FINALIZADA: { label: 'ENCERRADA', card: 'partida-finalizada', text: 'status-finalizada' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', card: 'partida-andamento', text: 'status-andamento' },
  AGENDADA: { label: 'AGUARDANDO', card: 'partida-agendada', text: 'status-agendada' },
  CANCELADA: { label: 'CANCELADA', card: 'partida-cancelada', text: 'status-cancelada' }
}

export default {
  name: 'ListaPartidas',
  components: {
    DetalharPartidaModal
  },
  props: {
    partidas: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    emptyTitle: { type: String, default: 'Nenhuma partida cadastrada ainda' },
    emptySubtitle: { type: String, default: '' },
    enableScroll: { type: Boolean, default: false },
    quadraClass: { type: String, default: '' }
  },
  data() {
    return {
      mostrarModalPartida: false,
      partidaSelecionadaId: null
    }
  },
  methods: {
    abrirModalPartida(partidaId) {
      const id = Number(partidaId)
      if (!Number.isFinite(id) || id <= 0) return
      this.partidaSelecionadaId = id
      this.mostrarModalPartida = true
    },
    statusClass(partida, tipo) {
      const status = partida?.status
      return STATUS_CONFIG[status]?.[tipo] || ''
    },
    statusLabel(status) {
      return STATUS_CONFIG[status]?.label || ''
    }
  }
}
</script>

<style scoped>
.lista-partidas {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lista-partidas li {
  list-style: none;
  display: block;
}

.lista-partidas li::marker {
  content: '';
}

.lista-partidas.com-scroll {
  max-height: 650px;
  overflow-y: auto;
  padding-right: 8px;
}

.lista-partidas.com-scroll::-webkit-scrollbar {
  width: 8px;
}

.lista-partidas.com-scroll::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 10px;
}

.lista-partidas.com-scroll::-webkit-scrollbar-thumb:hover {
  background: #3b82f6;
}

.card-partida {
  position: relative;
  background-color: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 20px;
  max-width: 450px;
  margin: 25px auto 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.card-partida:hover {
  transform: translateY(-2px);
}

.match-ribbon {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #111827;
  color: #ffffff;
  padding: 4px 25px;
  border-radius: 8px 8px 20px 20px;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  z-index: 2;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-live-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #16a34a;
  border: 2px solid #fff;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: statusDotPulse 1s infinite;
}

.card-partida.partida-andamento {
  border-color: #16a34a;
}

.match-ribbon.status-andamento {
  background: #22c55e;
}

.card-partida.partida-finalizada {
  border-color: #e11d48;
}

.match-ribbon.status-finalizada {
  background: #bd1c1c;
}

.card-partida.partida-cancelada {
  border-color: #dc2626;
}

.match-ribbon.status-cancelada {
  background: #dc2626;
}

.card-partida.partida-agendada {
  border-color: #2563eb;
}

.match-ribbon.status-agendada {
  background: #2563eb;
}

.conteudo-card-interno {
  padding: 5px 15px 10px;
}

.conteudo-partida {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
}

.time.lado {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  text-align: left;
  min-width: 0;
}

.time.lado img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex: 0 0 auto;
  margin-top: 10%;
}

.nome-time {
  font-size: 14px;
  font-weight: 600;
  color: #777;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 10%;
}

.placar-centro {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 40px;
  font-weight: 900;
  color: #777;
  line-height: 1;
  margin-top: 14px;
}

.gols-placar {
  font-size: 30px;
  font-weight: bold;
  color: #000;
  padding: 2px 8px;
  border-radius: 12px;
}

.divisor-x {
  color: #777;
  font-size: 18px;
  font-weight: 400;
}

.match-divider {
  height: 1px;
  background-color: #f2f2f2;
  margin-bottom: 3%;
}

.nome-quadra {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5c93e6;
  font-weight: 600;
  font-size: 13px;
  margin-top: -10px;
}

.loader-container-centralizado,
.sem-dados-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 16px;
  color: #555;
  text-align: center;
}

.empty-title {
  margin: 0;
  font-weight: 700;
}

.empty-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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

@media (max-width: 768px) {
  .card-partida {
    margin: 18px auto 12px;
    max-width: 100%;
  }

  .match-ribbon {
    font-size: 10px;
    padding: 4px 12px;
  }

  .placar-centro {
    margin-top: 10px;
  }

  .gols-placar {
    font-size: 24px;
  }

  .nome-time {
    font-size: 13px;
    max-width: 90px;
  }
}
</style>