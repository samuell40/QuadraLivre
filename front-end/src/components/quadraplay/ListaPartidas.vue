<template>
  <div v-if="loading" class="loader-container-centralizado">
    <div class="loader"></div>
  </div>

  <ul class="lista-partidas" :class="{ 'com-scroll': enableScroll || partidas.length > 5 }">
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
            <span class="gols_placar">{{ partida.pontosTimeA ?? 0 }}</span>
            <span class="divisor-x">×</span>
            <span class="gols_placar">{{ partida.pontosTimeB ?? 0 }}</span>
          </div>

          <div class="time lado">
            <img v-if="partida.timeB?.foto" :src="partida.timeB.foto" alt="Escudo Time B" />
            <span class="nome-time">{{ partida.timeB?.nome }}</span>
          </div>
        </div>

        <div class="match-divider"></div>

        <div class="nome-quadra">
          <span class="dot-quadra"></span> {{ partida.quadra?.nome }}
        </div>
      </div>
    </li>
  </ul>

  <!-- MODAL DETALHE PARTIDA -->
  <div v-if="mostrarModalPartida" class="modal-overlay" @click.self="fecharModalPartida">
    <div class="modal-partida">
      <div v-if="loadingDetalhePartida" class="loader"></div>
      <div v-else-if="partidaDetalhada">
        <h2>Detalhes da Partida (Campeonato {{ partidaDetalhada.campeonato?.nome }})</h2>

        <div class="infos">
          <p>
            <span class="status-badge" :class="statusClass(partidaDetalhada, 'text')">
              <span v-if="partidaDetalhada?.status === 'EM_ANDAMENTO'" class="status-live-dot"
                aria-hidden="true"></span>
              {{ statusLabel(partidaDetalhada.status) }}
            </span>
          </p>

          <p v-if="!['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(
            (partidaDetalhada?.modalidade?.nome || '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          )">
            <strong>Faltas:</strong>
            {{ partidaDetalhada.faltasTimeA }} x {{ partidaDetalhada.faltasTimeB }}
          </p>
        </div>

        <div class="placar-modal">
          <div class="time">
            <img v-if="partidaDetalhada.timeA?.foto" :src="partidaDetalhada.timeA.foto" />
            <strong>{{ partidaDetalhada.timeA?.nome }}</strong>
          </div>

          <span class="resultado">
            {{ partidaDetalhada.pontosTimeA }} x {{ partidaDetalhada.pontosTimeB }}
          </span>

          <div class="time">
            <img v-if="partidaDetalhada.timeB?.foto" :src="partidaDetalhada.timeB.foto" />
            <strong>{{ partidaDetalhada.timeB?.nome }}</strong>
          </div>
        </div>

        <div v-if="!isVolei" class="jogadores-container">
          <div class="time-mobile-title">
            {{ partidaDetalhada.timeA.nome }}
            <div class="jogadores-time">
              <div v-for="jp in partidaDetalhada.jogadoresPartida.filter(j => j.timeId === partidaDetalhada.timeA.id)"
                :key="jp.id" class="jogador-item">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" />
                <div class="dados-jogador">
                  <span class="nome">{{ jp.jogador?.nome }}</span>
                  <div class="estatisticas">
                    <span class="gols">⚽ {{ jp.gols }}</span>
                    <span class="cartao amarelo">🟨 {{ jp.cartoesAmarelos }}</span>
                    <span class="cartao vermelho">🟥 {{ jp.cartoesVermelhos }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="time-mobile-title">
            {{ partidaDetalhada.timeB.nome }}
            <div class="jogadores-time">
              <div v-for="jp in partidaDetalhada.jogadoresPartida.filter(j => j.timeId === partidaDetalhada.timeB.id)"
                :key="jp.id" class="jogador-item">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" />
                <div class="dados-jogador">
                  <span class="nome">{{ jp.jogador?.nome }}</span>
                  <div class="estatisticas">
                    <span class="gols">⚽ {{ jp.gols }}</span>
                    <span class="cartao amarelo">🟨 {{ jp.cartoesAmarelos }}</span>
                    <span class="cartao vermelho">🟥 {{ jp.cartoesVermelhos }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="btn-cancel-placar" @click="fecharModalPartida">Fechar</button>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import api from '@/axios'

const STATUS_CONFIG = {
  FINALIZADA: { label: 'ENCERRADA', card: 'partida-finalizada', text: 'status-finalizada' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', card: 'partida-andamento', text: 'status-andamento' },
  AGENDADA: { label: 'AGUARDANDO', card: 'partida-agendada', text: 'status-agendada' },
  CANCELADA: { label: 'CANCELADA', card: 'partida-cancelada', text: 'status-cancelada' }
}

export default {
  name: 'ListaPartidas',
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
      loadingDetalhePartida: false,
      partidaDetalhada: null
    }
  },
  computed: {
    modalidadeDetalheNormalizada() {
      return String(this.partidaDetalhada?.modalidade?.nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    },
    isDetalheVolei() {
      return ['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(this.modalidadeDetalheNormalizada)
    },
    jogadoresTimeA() {
      if (!this.partidaDetalhada) return []
      return (this.partidaDetalhada.jogadoresPartida || [])
        .filter(j => j.timeId === this.partidaDetalhada.timeA?.id)
    },
    jogadoresTimeB() {
      if (!this.partidaDetalhada) return []
      return (this.partidaDetalhada.jogadoresPartida || [])
        .filter(j => j.timeId === this.partidaDetalhada.timeB?.id)
    }
  },
  methods: {
    async abrirModalPartida(partidaId) {
      this.mostrarModalPartida = true
      this.loadingDetalhePartida = true
      this.partidaDetalhada = null

      try {
        const { data } = await api.get(`/detalhar/partida/${partidaId}`)
        this.partidaDetalhada = data
      } catch (err) {
        console.error('Erro ao detalhar partida:', err)
        Swal.fire('Erro', 'Nao foi possivel carregar os detalhes da partida.', 'error')
        this.fecharModalPartida()
      } finally {
        this.loadingDetalhePartida = false
      }
    },
    fecharModalPartida() {
      this.mostrarModalPartida = false
      this.partidaDetalhada = null
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
  padding-left: 0;
}

.lista-partidas li {
  list-style: none;
  display: block;
}

.lista-partidas li::marker {
  content: "";
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
  background:  #3b82f6;
  border-radius: 10px;
}

.lista-partidas.com-scroll::-webkit-scrollbar-thumb:hover {
  background:  #3b82f6;
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
  background: #22c55e;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: statusDotPulse 1s infinite;
}

.card-partida.partida-andamento {
  border-color: #16a34a;
}

.match-ribbon.status-andamento {
  background: #16a34a;
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
  margin-bottom: 0px;
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

.gols_placar {
  font-size: 30px;
  font-weight: bold;
  color:  rgba(0, 0, 0);
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-partida {
  background-color: #fff;
  border-radius: 12px;
  padding: 28px 36px;
  width: fit-content;
  min-width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.fechar {
  position: absolute;
  top: 16px;
  right: 18px;
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  color: #6b7280;
}

.fechar:hover {
  color: #1e3a8a;
}

.modal-partida h2 {
  font-size: 30px;
  color: #3b82f6;
  margin: 0;
}

.campeonato {
  color: #6b7280;
  font-size: 15px;
}

.placar-modal {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.time-mobile-title {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
}

.placar-modal .time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #374151;
}

.placar-modal img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.resultado {
  font-size: 60px;
  font-weight: bold;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.infos {
  padding-top: 14px;
}

.infos p {
  margin: 6px 0;
  color: #4b5563;
  font-size: 15px;
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

.coluna-time h3 {
  text-align: center;
  color: #3b82f6;
  font-size: 18px;
  border-bottom: 1px solid #3b82f6;
  padding-bottom: 6px;
  margin-bottom: 10px;
}

.nome-jogador {
  font-weight: 500;
  color: #7E7E7E;
}

.jogador-card {
  margin-bottom: 8px;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.foto-jogador {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.dados-jogador {
  display: flex;
  flex-direction: column;
}

.nome {
  font-weight: 600;
  font-size: 14px;
}

.dados-jogador small {
  color: #6b7280;
  font-size: 12px;
}

.jogadores-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 6px;
}

.jogadores-time {
  border: 1px solid #3b82f6;
  border-radius: 10px;
  padding: 12px;
  background: #f9fafb;
}

.jogador-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #e5e7eb;
}

.jogador-item:last-child {
  border-bottom: none;
}

.estatisticas {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.gols {
  font-size: 18px;
  font-weight: bold;
  color: #1e3a8a;
  padding: 2px 8px;
  border-radius: 12px;
}

.cartao {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.cartao.amarelo {
  color: #ca8a04;
}

.cartao.vermelho {
  color: #dc2626;
}

.btn-cancel-placar {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  font-size: 15px;
}

.btn-cancel-placar:hover {
  background-color: #2563eb;
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

.gols-destaque {
  font-weight: bold;
  font-size: 18px;
  color: #7E7E7E;
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
}

.filtro-titulo {
  font-size: 20px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

/* Badge de status no modal (detalhar partida) */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
}

/* cores por status */
.status-badge.status-andamento {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.35);
}

.status-badge.status-finalizada {
  color: #bd1c1c;
  background: rgba(189, 28, 28, 0.12);
  border: 1px solid rgba(189, 28, 28, 0.35);
}

.status-badge.status-agendada {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.10);
  border: 1px solid rgba(37, 99, 235, 0.35);
}

.status-badge.status-cancelada {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.10);
  border: 1px solid rgba(220, 38, 38, 0.35);
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }

  .logo {
    margin-left: 0;
    font-size: 16px;
  }

  .esquerda-section {
    margin-left: 0;
  }

  .desktop-only {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
  }

  .nav-links.active {
    display: flex;
  }

  .conteudo {
    padding: 16px;
  }

  .title {
    font-size: 40px;
    margin-top: 10px;
  }

  .abas-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .aba {
    font-size: 14px;
    padding: 10px;
  }

  .placar {
    min-width: 600px;
    width: 100%;
  }

  .placar-table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .placar thead th {
    font-size: 12px;
    padding: 8px 6px;
    white-space: nowrap;
  }

  .placar tbody td {
    font-size: 12px;
    padding: 6px 8px;
    white-space: nowrap;
  }

  .time-info {
    gap: 6px;
  }

  .time-image {
    width: 26px;
    height: 26px;
  }

  .nome-time {
    font-size: 13px;
  }

  .posicao {
    font-size: 12px;
    min-width: 18px;
  }

  .placar-table {
    max-height: 50vh;
  }

  .placar-e-partidas {
    flex-direction: column;
    gap: 20px;
  }

  .partidas-wrapper {
    order: 1;
    width: 100%;
  }

  .placar-wrapper {
    order: 2;
    width: 100%;
    min-width: 0;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 10px;
  }

  .modal-partida {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    padding: 16px;
    border-radius: 16px 16px;
  }

  .modal-partida h2 {
    text-align: left;
  }

  .placar-modal {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .placar-modal .time {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 13px;
  }

  .placar-modal img {
    width: 38px;
    height: 38px;
  }

  .resultado {
    font-size: 26px;
    font-weight: bold;
  }

  .jogadores-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: none;
    overflow: visible;
  }

  .jogador-item {
    gap: 8px;
    align-items: flex-start;
  }

  .foto-jogador {
    width: 38px;
    height: 38px;
  }

  .dados-jogador .nome {
    font-size: 13px;
  }

  .estatisticas {
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn-voltar-mobile {
    display: inline-block;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: white;
    font-weight: 500;
    text-decoration: none;
    background: #1E3A8A;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
  }
}
</style>