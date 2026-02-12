 <template>
 <div class="partidas-wrapper">
            <h3 class="titulo-secao">Placar</h3>

            <div v-if="!partidas || partidas.length === 0" class="sem-partidas">
              <strong>Nenhuma partida cadastrada ainda</strong>
              <p>Assim que as partidas forem criadas ou iniciadas, elas aparecerão aqui.</p>
            </div>

            <ul class="lista-partidas" :class="{ 'com-scroll': temScrollPartidas }">
              <li v-for="partida in partidas" :key="partida.id" class="card-partida"
                :class="classeStatusPartida(partida)" @click="abrirModalPartida(partida.id)">

                <div class="status-topo" :class="classeStatusTexto(partida)">
                  {{
                    partida.status === 'FINALIZADA'
                      ? 'ENCERRADA'
                      : partida.status === 'EM_ANDAMENTO'
                        ? 'EM ANDAMENTO'
                        : partida.status === 'AGENDADA'
                          ? 'AGUARDANDO'
                          : partida.status === 'CANCELADA'
                  ? 'CANCELADA'
                  : ''
                  }}
                </div>

                <div class="conteudo-partida">
                  <div class="time lado">
                    <img v-if="partida.timeA?.foto" :src="partida.timeA.foto" />
                    <span>{{ partida.timeA?.nome }}</span>
                  </div>

                  <div class="placar-centro">
                    <strong>{{ partida.pontosTimeA ?? 0 }}</strong>
                    <span>x</span>
                    <strong>{{ partida.pontosTimeB ?? 0 }}</strong>
                  </div>

                  <div class="time lado">
                    <img v-if="partida.timeB?.foto" :src="partida.timeB.foto" />
                    <span>{{ partida.timeB?.nome }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- MODAL DETALHE PARTIDA -->
          <div v-if="mostrarModalPartida" class="modal-overlay" @click.self="fecharModalPartida">
            <div class="modal-partida">
              <div v-if="loadingDetalhePartida" class="loader"></div>
              <div v-else-if="partidaDetalhada">
                <h2>Detalhes da Partida (Campeonato {{ partidaDetalhada.campeonato?.nome }})</h2>

                <div class="infos">
                  <p>
                    <strong>Status:</strong>
                    <span :class="classeStatusTexto(partidaDetalhada)">
                      {{
                        partidaDetalhada.finalizada
                          ? 'Encerrada'
                          : partidaDetalhada.partidaIniciada
                            ? 'Em andamento'
                            : 'Não iniciada'
                      }}
                    </span>
                  </p>
                  <p><strong>Faltas:</strong>
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

                <!-- JOGADORES DA PARTIDA -->
                <div class="jogadores-container">
                  <!-- TIME A -->
                  <div class="time-mobile-title">{{ partidaDetalhada.timeA.nome }}
                    <div class="jogadores-time">
                      <div
                        v-for="jp in partidaDetalhada.jogadoresPartida.filter(j => j.timeId === partidaDetalhada.timeA.id)"
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

                  <!-- TIME B -->
                  <div class="time-mobile-title">{{ partidaDetalhada.timeB.nome }}
                    <div class="jogadores-time">
                      <div
                        v-for="jp in partidaDetalhada.jogadoresPartida.filter(j => j.timeId === partidaDetalhada.timeB.id)"
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
              <button class="btn-cancel-placar" @click="fecharModalPartida">
                Fechar
              </button>
            </div>
          </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'VisualizarPlacarHome',

data() {
    return {
      partidas: [],
      isLoading: false,
      mostrarModalPartida: false,
      loadingDetalhePartida: false,
      partidaDetalhada: null
    }
  },
  methods: {
    classeStatusPartida(partida) {
      switch (partida.status) {
        case 'FINALIZADA':
          return 'partida-finalizada'
        case 'EM_ANDAMENTO':
          return 'partida-andamento'
        case 'AGENDADA':
          return 'partida-agendada'
        case 'CANCELADA':
          return 'partida-cancelada'
        default:
          return ''
      }
    },

    classeStatusTexto(partida) {
      switch (partida.status) {
        case 'FINALIZADA':
          return 'status-finalizada'
        case 'EM_ANDAMENTO':
          return 'status-andamento'
        case 'AGENDADA':
          return 'status-agendada'
        case 'CANCELADA':
          return 'status-cancelada'
        default:
          return ''
      }
    },
    async carregarPartidas(campeonatoId) {
      if (!this.campeonatoSelecionado) return

      const modalidadeId = this.campeonatoSelecionado.modalidade.id

      try {
        const ativas = await api.get(`/partidas/ativas/${modalidadeId}/${campeonatoId}`)
        const encerradas = await api.get(`/partidas/encerradas/${modalidadeId}/${campeonatoId}`)

        this.partidas = []

        for (let i = 0; i < ativas.data.length; i++) {
          this.partidas.push(ativas.data[i])
        }

        for (let i = 0; i < encerradas.data.length; i++) {
          this.partidas.push(encerradas.data[i])
        }

      } catch (err) {
        console.error('Erro ao carregar partidas:', err)
        this.partidas = []
      }
    },

    formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR')
    },
    async abrirModalPartida(partidaId) {
      this.mostrarModalPartida = true
      this.loadingDetalhePartida = true
      this.partidaDetalhada = null

      try {
        const { data } = await api.get(`/detalhar/partida/${partidaId}`)
        this.partidaDetalhada = data
      } catch (err) {
        console.error('Erro ao detalhar partida:', err)
        this.mostrarModalPartida = false
      } finally {
        this.loadingDetalhePartida = false
      }
    },
  fecharModalPartida() {
      this.mostrarModalPartida = false
      this.partidaDetalhada = null
    },
  }
}
</script>

<style>
.lista-partidas {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lista-partidas.com-scroll {
  max-height: 520px;
  overflow-y: auto;
  padding-right: 6px;
}

.lista-partidas.com-scroll::-webkit-scrollbar {
  width: 6px;
}

.lista-partidas.com-scroll::-webkit-scrollbar-thumb {
  background-color: #3b82f6;
  border-radius: 10px;
}

.lista-partidas.com-scroll::-webkit-scrollbar-track {
  background: #e5e7eb;
}


.card-partida {
  border: 1.5px solid #3b82f6;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 14px;
  background: #fff;
}

.status-topo {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 6px;
}

.status-topo.encerrada {
  color: #dc2626;
}

.conteudo-partida {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
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
  background: #e0e7ff;
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

.card-partida.partida-andamento {
  border: 1px solid #16a34a;
}

.card-partida.partida-pausada {
  border: 1px solid #facc15;
}

.card-partida.partida-finalizada {
  border: 1px solid #dc2626;
}

.status-andamento {
  color: #16a34a;
  font-weight: bold;
}

.status-pausada {
  color: #facc15;
  font-weight: bold;
}

.status-finalizada {
  color: #dc2626;
  font-weight: bold;
}

.infos span[class^="status-"] {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 14px;
}

.status-andamento {
  background: rgba(22, 163, 74, 0.1);
}

.status-pausada {
  background: rgba(250, 204, 21, 0.15);
}

.status-finalizada {
  background: rgba(220, 38, 38, 0.12);
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

</style>