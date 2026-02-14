<template>
  <div class="layout">
    <NavBarHome />

    <div class="conteudo">
      <h1 class="title">Campeonatos</h1>
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
            <select id="rodada-select" v-model="rodadaSelecionada" @change="filtrarPartidasPorRodada">
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
            <div class="placar-table" v-if="campeonatoAtivo">
              <div v-if="timesPlacar === null" class="loader-container-centralizado">
                <div class="loader"></div>
              </div>

              <div v-else-if="Array.isArray(timesPlacar) && timesPlacar.length === 0" class="sem-dados-centralizado">
                Nenhum placar encontrado para este campeonato.
              </div>

              <table v-else-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeNormalizada)"
                class="placar">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>PTS</th>
                    <th>J</th>
                    <th>GM</th>
                    <th>GS</th>
                    <th>SG</th>
                    <th>E</th>
                    <th>VIT</th>
                    <th>DER</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(time, index) in timesPlacar" :key="time.id">
                    <td class="time-info">
                      <span class="posicao">{{ index + 1 }}º</span>

                      <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />

                      <span class="nome-time">
                        {{ time.time?.nome }}
                      </span>
                    </td>

                    <td>{{ time.pontuacao }}</td>
                    <td>{{ time.jogos }}</td>
                    <td>{{ time.golsPro }}</td>
                    <td>{{ time.golsSofridos }}</td>
                    <td>{{ time.saldoDeGols }}</td>
                    <td>{{ time.empates }}</td>
                    <td>{{ time.vitorias }}</td>
                    <td>{{ time.derrotas }}</td>
                  </tr>
                </tbody>
              </table>

              <table v-else-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeNormalizada)"
                class="placar">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>PTS</th>
                    <th>J</th>
                    <th>VIT</th>
                    <th>DER</th>
                    <th>STV</th>
                    <th>3x0</th>
                    <th>3x2</th>
                    <th>2x3</th>
                    <th>0x3</th>
                    <th>W.O.</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(time, index) in timesPlacar" :key="time.id">
                    <td class="time-info">
                      <span class="posicao">{{ index + 1 }}º</span>

                      <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />

                      <span class="nome-time">
                        {{ time.time?.nome }}
                      </span>
                    </td>

                    <td>{{ time.pontuacao }}</td>
                    <td>{{ time.jogos }}</td>
                    <td>{{ time.vitorias }}</td>
                    <td>{{ time.derrotas }}</td>
                    <td>{{ time.setsVencidos }}</td>
                    <td>{{ time.vitoria3x0 }}</td>
                    <td>{{ time.vitoria3x2 }}</td>
                    <td>{{ time.derrota2x3 }}</td>
                    <td>{{ time.derrota0x3 }}</td>
                    <td>{{ time.derrotaWo }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- ===== GLOSSÁRIO FUTEBOL ===== -->
            <div v-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeNormalizada)"
              class="glossario-placar">
              <strong>Glossário</strong>
              <ul>
                <li><b>PTS</b>: Pontos</li>
                <li><b>J</b>: Jogos</li>
                <li><b>GM</b>: Gols Marcados</li>
                <li><b>GS</b>: Gols Sofridos</li>
                <li><b>SG</b>: Saldo de Gols</li>
                <li><b>E</b>: Empates</li>
                <li><b>VIT</b>: Vitórias</li>
                <li><b>DER</b>: Derrotas</li>
              </ul>
            </div>

            <!-- ===== GLOSSÁRIO VÔLEI ===== -->
            <div v-else-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeNormalizada)"
              class="glossario-placar">
              <strong>Glossário</strong>
              <ul>
                <li><b>PTS</b>: Pontos</li>
                <li><b>J</b>: Jogos</li>
                <li><b>VIT</b>: Vitórias</li>
                <li><b>DER</b>: Derrotas</li>
                <li><b>STV</b>: Sets Vencidos</li>
                <li><b>3x0</b>: Vitória por 3 sets a 0</li>
                <li><b>3x2</b>: Vitória por 3 sets a 2</li>
                <li><b>2x3</b>: Derrota por 2 sets a 3</li>
                <li><b>0x3</b>: Derrota por 0 sets a 3</li>
                <li><b>W.O.</b>: Vitória por W.O.</li>
              </ul>
            </div>

          </div>
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

                <div class="nome-quadra-visualizar">
                  {{ partida.quadra?.nome }}
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
                        partidaDetalhada.status === 'FINALIZADA'
                          ? 'Encerrada'
                          : partidaDetalhada.status === 'EM_ANDAMENTO'
                            ? 'Em andamento'
                            : partidaDetalhada.status === 'AGENDADA'
                              ? 'Não iniciada'
                              : partidaDetalhada.status === 'CANCELADA'
                                ? 'Cancelada'
                                : ''
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
        </div>

        <!--ARTILHARIA -->
        <div class="artilharia-wrapper" v-if="campeonatoAtivo">
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

      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import NavBarHome from '@/components/NavBarHome.vue';

export default {
  name: 'VisualizarPlacarHome',
  components: { NavBarHome },

  data() {
    return {
      campeonatos: [],
      campeonatoAtivo: null,
      fases: [],
      rodadaSelecionada: '',
      faseSelecionada: '',
      rodadas: [],
      partidas: [],
      timesPlacar: null,
      isLoading: false,
      mostrarModalPartida: false,
      loadingDetalhePartida: false,
      partidaDetalhada: null,
      artilharia: [],
      loadingArtilharia: false,
    }
  },

  computed: {
    campeonatoSelecionado() {
      return this.campeonatos.find(c => c.id === this.campeonatoAtivo) || null
    },

    modalidadeNormalizada() {
      if (!this.campeonatoSelecionado?.modalidade?.nome) return ''
      return this.campeonatoSelecionado.modalidade.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    },

    temScrollPartidas() {
      return this.partidas && this.partidas.length >= 10
    }
  },

  methods: {
    // ===== STATUS PARTIDA =====
    classeStatusPartida(partida) {
      switch (partida.status) {
        case 'FINALIZADA': return 'partida-finalizada'
        case 'EM_ANDAMENTO': return 'partida-andamento'
        case 'AGENDADA': return 'partida-agendada'
        case 'CANCELADA': return 'partida-cancelada'
        default: return ''
      }
    },

    classeStatusTexto(partida) {
      switch (partida.status) {
        case 'FINALIZADA': return 'status-finalizada'
        case 'EM_ANDAMENTO': return 'status-andamento'
        case 'AGENDADA': return 'status-agendada'
        case 'CANCELADA': return 'status-cancelada'
        default: return ''
      }
    },

    selecionarCampeonato(id) {
      this.campeonatoAtivo = id
      this.faseSelecionada = ''
      this.rodadaSelecionada = ''
      this.fases = []
      this.rodadas = []
      this.partidas = []
      this.timesPlacar = null

      this.carregarFases(id)
      this.carregarArtilharia(id)
    },

    async carregarCampeonatos() {
      this.isLoading = true
      try {
        const { data } = await api.get('/todos/campeonatos')
        this.campeonatos = data
        if (data.length) this.selecionarCampeonato(data[0].id)
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err)
      } finally {
        this.isLoading = false
      }
    },

    async carregarFases(campeonatoId) {
      try {
        const { data } = await api.get(`/partidas/${campeonatoId}/fases`)
        this.fases = data

        if (this.fases.length > 0) {
          this.faseSelecionada = this.fases[0].id
          const faseSelecionadaObj = this.fases.find(f => f.id === this.faseSelecionada)
          this.rodadas = faseSelecionadaObj?.rodadas || []
          this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : ''

          this.filtrarPartidasPorRodada()
          this.carregarPlacar(campeonatoId)
        }
      } catch (err) {
        console.error('Erro ao carregar fases:', err)
      }
    },

    onFaseChange() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada)
      this.rodadas = fase?.rodadas || []
      this.rodadaSelecionada = this.rodadas.length ? this.rodadas[0].id : ''

      this.filtrarPartidasPorRodada()
      this.carregarPlacar(this.campeonatoAtivo)
    },

    filtrarPartidasPorRodada() {
      const fase = this.fases.find(f => f.id === this.faseSelecionada)
      if (!fase) {
        this.partidas = []
        return
      }
      const rodada = fase.rodadas.find(r => r.id === this.rodadaSelecionada)
      this.partidas = rodada?.partidas || []
    },

    async carregarPlacar(campeonatoId) {
      if (!this.faseSelecionada) return

      this.timesPlacar = null

      try {
        const { data } = await api.get(`/placar/fase/${campeonatoId}`,
          {
            params: {
              faseId: this.faseSelecionada
            }
          }
        )
        const fase = data.find(f => f.faseId == this.faseSelecionada)
        this.timesPlacar = fase?.placares || []
      } catch (err) {
        console.error('Erro ao carregar placar da fase:', err)
        this.timesPlacar = []
      }
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

    async carregarArtilharia(campeonatoId) {
      this.loadingArtilharia = true
      this.artilharia = []

      try {
        const { data } = await api.get(`/${campeonatoId}/artilharia`)
        this.artilharia = data
      } catch (err) {
        console.error('Erro ao carregar artilharia:', err)
        this.artilharia = []
      } finally {
        this.loadingArtilharia = false
      }
    }
  },

  mounted() {
    this.carregarCampeonatos()
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 40px;
}

.navbar-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #152147;
  height: 70px;
  font-family: "Montserrat", sans-serif;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 100%;
  position: relative;
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

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 2px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.esquerda-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: -12%;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  white-space: nowrap;
  margin-left: 80px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
  align-items: center;
  margin-right: 80px;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links li a:hover {
  color: #3B82F6;
  text-decoration-color: #3B82F6;
}

.nav-links li a:focus,
.nav-links li a:active {
  color: #ffffff;
  text-decoration-color: #3B82F6;
}

.quadra-play {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 25px;
  border: 2px solid #3B82F6;
  border-radius: 15px;
  transition: background-color 0.3s, color 0.3s;
  overflow: visible;
}

.quadra-play svg {
  position: absolute;
  top: 90%;
  right: -12px;
  transform: translateY(-50%);
  width: 25px;
  height: 25px;
  background-color: #152147;
  border-radius: 50%;
  padding: 2px;
}

.quadra-play-mobile {
  display: none;
}

.login {
  background-color: #1E3A8A;
  padding: 6px 50px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  text-align: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: #fff;
  transition: 0.3s;
}

.nav-links.active {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 70px;
  right: 0;
  background-color: #152147;
  width: 100%;
  padding: 20px 0;
  gap: 20px;
}

.login-btn-mobile {
  display: none;
}

.conteudo {
  margin-top: 90px;
  padding: 20px 60px;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 25px;
}

.aba {
  text-align: center;
  padding: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f1f1f1;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
}

.aba:hover {
  background-color: #e0e0e0;
}

.aba.ativa {
  background-color: #3b82f6;
  color: white;
}

.foto-campeonato-container {
  width: 100%;
  height: 480px;
  margin: 10px 0 30px;
  overflow: hidden;
}

.foto-campeonato {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
}

.campeonatos-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card-campeonato {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-campeonato h3 {
  margin-bottom: 10px;
  color: #152147;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-finalizada {
  color: #dc2626;
  font-weight: bold;
  background: rgba(220, 38, 38, 0.12);
  padding: 2px 8px;
  border-radius: 12px;
}

.status-cancelada {
  color: #dc2626;
  font-weight: bold;
  background: rgba(220, 38, 38, 0.08);
  padding: 2px 8px;
  border-radius: 12px;
}

.sem-dados {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  margin-top: 40px;
}

.placar-table {
  margin-top: 30px;
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.placar {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

.placar thead th {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 14px 12px;
  font-size: 15px;
  text-align: left;
  white-space: nowrap;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s ease;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.placar tbody td {
  color: #374151;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.posicao {
  font-weight: bold;
  font-size: 14px;
  min-width: 20px;
  text-align: right;
  color: #3b82f6;
}

.time-image {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

.nome-time {
  font-weight: 500;
  color: #7E7E7E;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.sem-dados-centralizado {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #6b7280;
}

.btn-voltar-mobile {
  display: none;
}

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

.nome-quadra-visualizar {
  text-align: center;
  font-weight: 700;
  font-size: 15px;
  color: #3b82f6;
  margin: 8px 0 12px 0;
}

.placar-home {
  width: 90%;
  margin: 20px auto 40px;
  overflow-x: auto;
}

.placar {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.placar th {
  background-color: #3b82f6;
  color: white;
  padding: 12px;
  text-align: left;
}

.placar td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.posicao {
  color: #3b82f6;
  font-weight: bold;
  min-width: 24px;
  text-align: center;
}

.time-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.sem-dados {
  text-align: center;
  color: #777;
  font-size: 18px;
}

.titulo-secao {
  font-size: 20px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
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

.time.lado {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 17px;
}

.time.lado img {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.placar-centro {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 22px;
  font-weight: bold;
  color: #374151;
}

.placar-container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.placar-e-partidas {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.placar-wrapper {
  flex: 2;
  min-width: 400px;
}

.partidas-wrapper {
  flex: 1;
  min-width: 250px;
}

.glossario-placar {
  margin-top: 12px;
  padding: 10px 12px;
  background: #f5f6fa;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
}

.glossario-placar strong {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
}

.glossario-placar ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 4px 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.glossario-placar li b {
  color: #152147;
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

  /* ===== CONTEÚDO ===== */
  .conteudo {
    padding: 16px;
  }

  .title {
    font-size: 22px;
    margin-top: 10px;
  }

  .abas-container {
    flex-direction: column;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .aba {
    font-size: 14px;
    padding: 10px;
  }

  .placar {
    min-width: 0;
    /* remove scroll horizontal */
    width: 100%;
  }

  .placar thead th {
    font-size: 13px;
    padding: 8px 6px;
  }

  .placar tbody td {
    font-size: 12px;
    padding: 6px 8px;
  }

  .time-info {
    gap: 6px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .nome-time {
    font-size: 13px;
  }

  .posicao {
    font-size: 12px;
    min-width: 20px;
  }

  .placar-table {
    max-height: 50vh;
  }

  /* ===== MODAL ===== */
  .modal-partida {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 16px;
  }

  .placar-modal {
    flex-direction: column;
    gap: 12px;
  }

  .placar-e-partidas {
    flex-direction: column;
  }

  .partidas-wrapper {
    order: 1;
    width: 100%;
  }

  .placar-wrapper {
    order: 2;
    width: 100%;
  }

  /* ===== JOGADORES ===== */
  .jogadores-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .jogador-item {
    gap: 8px;
  }

  .foto-jogador {
    width: 40px;
    height: 40px;
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