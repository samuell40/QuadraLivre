<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fecharModalPartida">
    <div class="modal-partida">
      <div v-if="loadingDetalhePartida" class="modal-loader-shell">
        <LoadingState
          size="compact"
          title="Carregando detalhes da partida"
          description="Buscando placar, escalação e estatísticas do confronto selecionado."
        />
      </div>

      <div v-else-if="partidaDetalhada">
        <h2>Detalhes da Partida (Campeonato {{ partidaDetalhada.campeonato?.nome }})</h2>

        <div class="infos">
          <p>
            <span class="status-badge" :class="statusClass(partidaDetalhada, 'text')">
              <span v-if="partidaDetalhada?.status === 'EM_ANDAMENTO'" class="status-live-dot"
                aria-hidden="true"></span>
              {{ statusLabel(partidaDetalhada) }}
            </span>
          </p>
          <p v-if="!isPartidaEmAndamento">
            <strong v-if="!isPartidaFinalizada">Data Prevista: </strong>
            {{ formatarDataPartida(partidaDetalhada?.data || partidaDetalhada?.createdAt) }}
          </p>

          <p v-if="!isDetalheVolei && !isPartidaAgendada">
            <strong>Faltas:</strong>
            {{ partidaDetalhada.faltasTimeA ?? 0 }} x {{ partidaDetalhada.faltasTimeB ?? 0 }}
          </p>
        </div>

        <div class="placar-modal">
          <div class="time">
            <img v-if="partidaDetalhada.timeA?.foto" :src="partidaDetalhada.timeA.foto" alt="Escudo time A" />
            <strong>{{ partidaDetalhada.timeA?.nome }}</strong>
            <p v-if="!isDetalheVolei && nomesGoleadoresTimeA" class="goleadores-linha" :title="nomesGoleadoresTimeA">
              {{ nomesGoleadoresTimeA }}
            </p>
          </div>

          <span v-if="isPartidaAgendada" class="resultado">
            x
          </span>

          <span v-else class="resultado">
            {{ partidaDetalhada.pontosTimeA ?? 0 }} x {{ partidaDetalhada.pontosTimeB ?? 0 }}
          </span>

          <div class="time">
            <img v-if="partidaDetalhada.timeB?.foto" :src="partidaDetalhada.timeB.foto" alt="Escudo time B" />
            <strong>{{ partidaDetalhada.timeB?.nome }}</strong>
            <p v-if="!isDetalheVolei && nomesGoleadoresTimeB" class="goleadores-linha" :title="nomesGoleadoresTimeB">
              {{ nomesGoleadoresTimeB }}
            </p>
          </div>
        </div>

        <div v-if="!isDetalheVolei" class="jogadores-container">
          <div class="time-mobile-title">
            {{ partidaDetalhada.timeA?.nome }}
            <div class="jogadores-time">
              <p v-if="semEscalacaoTimeA" class="sem-escalacao">Escalacão não Definida</p>
              <div v-else v-for="jp in jogadoresTimeA" :key="jp.id" class="jogador-item"
                :class="{ 'jogador-suspenso': jogadorSuspenso(jp) }">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" alt="Foto do jogador" />
                <div class="dados-jogador">
                  <span v-if="temNumeroJogador(jp.jogador?.numero)" class="numero-jogador">#{{ jp.jogador?.numero }}</span>
                  <span class="nome" :class="{ 'nome-suspenso': jogadorSuspenso(jp) }">{{ jp.jogador?.nome }}</span>
                  <span v-if="jogadorSuspenso(jp)" class="status-suspenso" :title="jp.motivoSuspensao || 'Jogador suspenso'">
                    Suspenso
                  </span>
                  <div v-if="temEstatisticas(jp)" class="estatisticas">
                    <span v-if="temGols(jp)" class="estat-item gols" title="Bola">
                      ⚽
                      <span class="estat-valor">{{ valorPositivo(jp.gols) }}</span>
                    </span>
                    <span v-if="temCartaoAmarelo(jp)" class="estat-item cartao amarelo" title="Cartao amarelo">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesAmarelos) }}</span>
                    </span>
                    <span v-if="temCartaoVermelho(jp)" class="estat-item cartao vermelho" title="Cartao vermelho">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesVermelhos) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="time-mobile-title">
            {{ partidaDetalhada.timeB?.nome }}
            <div class="jogadores-time">
              <p v-if="semEscalacaoTimeB" class="sem-escalacao">Escalação não Definida</p>
              <div v-else v-for="jp in jogadoresTimeB" :key="jp.id" class="jogador-item"
                :class="{ 'jogador-suspenso': jogadorSuspenso(jp) }">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" alt="Foto do jogador" />
                <div class="dados-jogador">
                  <span v-if="temNumeroJogador(jp.jogador?.numero)" class="numero-jogador">#{{ jp.jogador?.numero }}</span>
                  <span class="nome" :class="{ 'nome-suspenso': jogadorSuspenso(jp) }">{{ jp.jogador?.nome }}</span>
                  <span v-if="jogadorSuspenso(jp)" class="status-suspenso" :title="jp.motivoSuspensao || 'Jogador suspenso'">
                    Suspenso
                  </span>
                  <div v-if="temEstatisticas(jp)" class="estatisticas">
                    <span v-if="temGols(jp)" class="estat-item gols" title="Bola">
                      ⚽
                      <span class="estat-valor">{{ valorPositivo(jp.gols) }}</span>
                    </span>
                    <span v-if="temCartaoAmarelo(jp)" class="estat-item cartao amarelo" title="Cartao amarelo">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesAmarelos) }}</span>
                    </span>
                    <span v-if="temCartaoVermelho(jp)" class="estat-item cartao vermelho" title="Cartao vermelho">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesVermelhos) }}</span>
                    </span>
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
import LoadingState from '@/components/loading/LoadingState.vue'
import {
  isStatusPartidaPendente,
  obterRotuloStatusPartida,
  obterStatusExibicaoPartida
} from '@/utils/partidaStatus'

const STATUS_CONFIG = {
  FINALIZADA: { label: 'ENCERRADA', card: 'partida-finalizada', text: 'status-finalizada' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', card: 'partida-andamento', text: 'status-andamento' },
  AGENDADA: { label: 'AGENDADA', card: 'partida-agendada', text: 'status-agendada' },
  AGENDADA_HOJE: { label: 'AGENDADA PARA HOJE', card: 'partida-agendada', text: 'status-agendada' },
  ADIADA: { label: 'ADIADA', card: 'partida-agendada', text: 'status-agendada' },
  CANCELADA: { label: 'CANCELADA', card: 'partida-cancelada', text: 'status-cancelada' }
}

export default {
  name: 'DetalharPartidaModal',
  components: { LoadingState },
  props: {
    modelValue: { type: Boolean, default: false },
    partidaId: { type: [Number, String], default: null }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loadingDetalhePartida: false,
      partidaDetalhada: null
    }
  },
  computed: {
    partidaIdNormalizado() {
      const id = Number(this.partidaId)
      return Number.isFinite(id) && id > 0 ? id : null
    },
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
    isPartidaAgendada() {
      return isStatusPartidaPendente(this.partidaDetalhada)
    },
    isPartidaEmAndamento() {
      return String(this.partidaDetalhada?.status || '') === 'EM_ANDAMENTO'
    },
    isPartidaFinalizada() {
      return String(this.partidaDetalhada?.status || '') === 'FINALIZADA'
    },
    semEscalacaoTimeA() {
      return this.isPartidaAgendada || this.jogadoresTimeA.length === 0
    },
    semEscalacaoTimeB() {
      return this.isPartidaAgendada || this.jogadoresTimeB.length === 0
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
    },
    nomesGoleadoresTimeA() {
      return this.listarNomesGoleadores(this.jogadoresTimeA)
    },
    nomesGoleadoresTimeB() {
      return this.listarNomesGoleadores(this.jogadoresTimeB)
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.carregarDetalhePartida()
        } else {
          this.partidaDetalhada = null
          this.loadingDetalhePartida = false
        }
      }
    },
    partidaId() {
      if (this.modelValue) {
        this.carregarDetalhePartida()
      }
    }
  },
  methods: {
    async carregarDetalhePartida() {
      if (!this.partidaIdNormalizado) {
        this.partidaDetalhada = null
        return
      }

      this.loadingDetalhePartida = true
      this.partidaDetalhada = null

      try {
        const { data } = await api.get(`/detalhar/partida/${this.partidaIdNormalizado}`)
        this.partidaDetalhada = data
      } catch (err) {
        console.error('Erro ao detalhar partida:', err)
        Swal.fire('Erro', 'Não foi possível carregar os detalhes da partida.', 'error')
        this.fecharModalPartida()
      } finally {
        this.loadingDetalhePartida = false
      }
    },
    fecharModalPartida() {
      this.$emit('update:modelValue', false)
      this.partidaDetalhada = null
      this.loadingDetalhePartida = false
    },
    statusClass(partida, tipo) {
      const statusExibicao = obterStatusExibicaoPartida(partida)
      return STATUS_CONFIG[statusExibicao]?.[tipo] || ''
    },
    statusLabel(partida) {
      return obterRotuloStatusPartida(partida)
    },
    formatarDataPartida(data) {
      const dt = new Date(data)
      if (Number.isNaN(dt.getTime())) return '-'

      const diaSemana = dt.toLocaleDateString('pt-BR', { weekday: 'long' })
      const dataFormatada = dt.toLocaleDateString('pt-BR')
      const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)

      return `${diaCapitalizado} - ${dataFormatada}`
    },
    listarNomesGoleadores(jogadoresPartida) {
      const nomes = [...new Set((Array.isArray(jogadoresPartida) ? jogadoresPartida : [])
        .filter(j => this.temGols(j))
        .map(j => String(j?.jogador?.nome || '').trim())
        .filter(Boolean))]
      return nomes.join(' • ')
    },
    valorPositivo(valor) {
      const numero = Number(valor)
      return Number.isFinite(numero) && numero > 0 ? numero : 0
    },
    temGols(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.gols) > 0
    },
    temCartaoAmarelo(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.cartoesAmarelos) > 0
    },
    temCartaoVermelho(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.cartoesVermelhos) > 0
    },
    temNumeroJogador(numero) {
      const numeroNormalizado = Number(numero)
      return Number.isInteger(numeroNormalizado) && numeroNormalizado > 0
    },
    jogadorSuspenso(jogadorPartida) {
      return !!jogadorPartida?.suspenso
    },
    temEstatisticas(jogadorPartida) {
      return this.temGols(jogadorPartida) ||
        this.temCartaoAmarelo(jogadorPartida) ||
        this.temCartaoVermelho(jogadorPartida)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
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

.modal-partida h2 {
  font-size: 30px;
  color: #3b82f6;
  margin: 0;
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
  min-width: 0;
}

.goleadores-linha {
  margin: 0;
  width: 100%;
  color: #7e7e7e;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;   
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
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

.sem-escalacao {
  margin: 4px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.jogador-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px;
  box-sizing: border-box;
}

.jogador-item.jogador-suspenso {
  background: #fff1f2;
}

.jogador-item:last-child {
  border-bottom: none;
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
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.nome {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.numero-jogador {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.nome.nome-suspenso {
  color: #b91c1c;
}

.status-suspenso {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 700;
}

.estatisticas {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  flex-shrink: 0;
}

.estat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  font-weight: 700;
}

.estat-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.estat-valor {
  font-size: 13px;
}

.gols {
  color: #1e3a8a;
}

.cartao {
  color: #64748b;
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
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.35);
}

.status-badge.status-cancelada {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.35);
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
  .modal-overlay {
    align-items: center;
    padding: 10px;
    overflow-y: auto;
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
    font-size: 24px;
  }

  .placar-modal {
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    text-align: center;
  }

  .placar-modal .time {
    font-size: 13px;
  }

  .goleadores-linha {
    font-size: 11px;
    max-width: 120px;
  }

  .placar-modal img {
    width: 38px;
    height: 38px;
  }

  .resultado {
    font-size: 26px;
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
    align-items: center;
  }

  .foto-jogador {
    width: 38px;
    height: 38px;
  }

  .dados-jogador .nome {
    font-size: 13px;
    max-width: 130px;
  }

  .estatisticas {
    flex-wrap: nowrap;
    gap: 6px;
  }
}
</style>
