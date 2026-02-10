<template>
  <div class="layout">
    <NavBarHome />

    <section class="texto-centro">
      <div class="conteudo-centralizado">
        <h1 class="texto">
          <div>
            <span class="primeira-linha">Com o Quadra Livre, <span class="destaque_sublinhado">agendar</span></span>
          </div>
          <div>
            <span class="segunda-linha destaque">sua quadra ficou ainda mais fácil.</span>
          </div>
        </h1>
        <p>Com poucos cliques, encontre e reserve a quadra ideal para o seu jogo.</p>
      </div>
    </section>

    <h3 id="quadras-disponiveis" class="tit_horario">Quadras Disponíveis</h3>
    <section class="agendamento">
      <template v-if="isLoadingQuadras">
        <div class="loader"></div>
      </template>
      <template v-else>
        <button class="btn-prev" @click="prev">&lt;</button>
        <Carousel ref="carousel" :itemsToShow="1" :wrapAround="true" :mouseDrag="true" :autoplay="3000"
          :pauseAutoplayOnHover="true" :transition="600" :breakpoints="{ 768: { itemsToShow: 3 } }" class="carousel">
          <Slide v-for="(quadra, index) in quadras" :key="index">
            <div class="card" :class="{ 'is-interditada': quadra.interditada }">

              <div v-if="quadra.interditada" class="badge-interditada-overlay">
                INDISPONÍVEL
              </div>

              <img :src="quadra.foto" :alt="quadra.nome" class="imagem" />

              <div class="info">
                <h3>{{ quadra.nome }}</h3>
                <p class="endereco">{{ quadra.endereco }}</p>

                <button class="btn-agendar" :disabled="quadra.interditada"
                  @click="!quadra.interditada && verificarLogin(quadra)">
                  {{ quadra.interditada ? 'Indisponível' : 'Agendar' }}
                </button>
              </div>
            </div>
          </Slide>
        </Carousel>
        <button class="btn-next" @click="next">&gt;</button>
      </template>
    </section>

    <section class="placar-home">
      <div class="placar-container">
        <div class="placar-wrapper">
          <h3 class="titulo-secao">
            <span>Classificação do {{ nomeCampeonato }}</span>
          </h3>

          <div v-if="isLoadingPlacar" class="loader"></div>

          <div v-else-if="placar.length === 0" class="sem-dados">
            Nenhum placar disponível no momento.
          </div>

          <table v-else class="placar">
            <thead>
              <tr>
                <th>Time</th>
                <th>PTS</th>
                <th>J</th>
                <th>GM</th>
                <th>GS</th>
                <th>SG</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(time, index) in placar" :key="time.id">
                <td class="time-info">
                  <span class="posicao">{{ index + 1 }}º</span>
                  <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />
                  {{ time.time?.nome }}
                </td>
                <td>{{ time.pontuacao }}</td>
                <td>{{ time.jogos }}</td>
                <td>{{ time.golsPro }}</td>
                <td>{{ time.golsSofridos }}</td>
                <td>{{ time.saldoDeGols }}</td>
              </tr>
            </tbody>
          </table>
          <div class="glossario-placar">
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
        </div>

        <!-- PARTIDAS -->
        <div class="partidas-wrapper">
          <h3 class="titulo-secao">Placar</h3>

          <ul class="lista-partidas">
            <li v-for="partida in partidas" :key="partida.id" class="card-partida" :class="classeStatusPartida(partida)"
              @click="abrirModalPartida(partida.id)">

              <div class="status-topo" :class="{ encerrada: partida.finalizada }">
                {{
                  partida.finalizada
                    ? 'ENCERRADA'
                    : partida.partidaIniciada
                      ? '0 MIN'
                      : 'AGUARDANDO'
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
      </div>
    </section>

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

            <!-- TIME B -->
            <div class="time-mobile-title">{{ partidaDetalhada.timeB.nome }}
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
        <button class="btn-cancel-placar" @click="fecharModalPartida">
          Fechar
        </button>
      </div>
    </div>
    <VerificarLogin v-if="mostrarModalLogin" @fechar="mostrarModalLogin = false" @irParaLogin="irParaLogin"
      @loginComGoogle="loginComGoogle" />

    <Footer />

  </div>
</template>

<script>
import NavBarHome from '@/components/NavBarHome.vue';
import Footer from '@/components/Footer.vue';
import router from '@/router'
import { Carousel, Slide } from 'vue3-carousel'
import Swal from 'sweetalert2'
import VerificarLogin from '@/components/modals/Alertas/verificarLogin.vue'
import api from '@/axios'
import 'vue3-carousel/dist/carousel.css'

export default {
  name: 'HomeView',
  components: { NavBarHome, Footer, Carousel, Slide, VerificarLogin },

  data() {
    return {
      quadras: [],
      mostrarModalLogin: false,
      isLoadingQuadras: true,
      placar: [],
      isLoadingPlacar: true,
      nomeCampeonato: '',
      partidas: [],
      isLoadingPartidas: true,
      mostrarModalPartida: false,
      partidaDetalhada: null,
      loadingDetalhePartida: false
    }
  },
  computed: {
    jogadoresTimeA() {
      if (!this.partidaDetalhada) return []
      return this.partidaDetalhada.jogadoresPartida
        .filter(j => j.timeId === this.partidaDetalhada.timeA.id)
    },

    jogadoresTimeB() {
      if (!this.partidaDetalhada) return []
      return this.partidaDetalhada.jogadoresPartida
        .filter(j => j.timeId === this.partidaDetalhada.timeB.id)
    }
  },

  async mounted() {
    await this.carregarQuadras()
    await this.carregarPlacarFutebol()
  },

  methods: {
    next() { if (this.$refs.carousel) this.$refs.carousel.next() },
    prev() { if (this.$refs.carousel) this.$refs.carousel.prev() },
    classeStatusPartida(partida) {
      if (partida.finalizada) {
        return 'partida-finalizada'
      }

      if (partida.partidaIniciada) {
        return 'partida-andamento'
      }

      return 'partida-pausada'
    },
    classeStatusTexto(partida) {
      if (partida.finalizada) {
        return 'status-finalizada'
      }

      if (partida.partidaIniciada) {
        return 'status-andamento'
      }

      return 'status-pausada'
    },

    async carregarQuadras() {
      this.isLoadingQuadras = true
      try {
        const res = await api.get('/quadra')
        this.quadras = res.data
      } catch (err) {
        console.error('Erro ao carregar quadras:', err)
      } finally {
        this.isLoadingQuadras = false
      }
    },

    async carregarPartidasFutebol(campeonatoId) {
      this.isLoadingPartidas = true
      try {
        const { data: ativas } = await api.get(`/partidas/ativas/1/${campeonatoId}`)
        const { data: pausadas } = await api.get(`/partidas/pausadas/1/${campeonatoId}`)
        const { data: encerradas } = await api.get(`/partidas/encerradas/1/${campeonatoId}`)

        const todas = [...ativas, ...pausadas, ...encerradas]
        todas.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        this.partidas = todas.slice(0, 5)

      } catch (err) {
        console.error('Erro ao carregar partidas:', err)
        this.partidas = []
      } finally {
        this.isLoadingPartidas = false
      }
    },

    async carregarPlacarFutebol() {
      this.isLoadingPlacar = true
      try {
        const { data: campeonatos } = await api.get('/listar/1')
        if (!campeonatos?.length) {
          this.placar = []
          this.nomeCampeonato = ''
          return
        }

        const campeonatoRecente = campeonatos[campeonatos.length - 1]
        this.nomeCampeonato = campeonatoRecente.nome

        const { data } = await api.get(`/placar/campeonato/${campeonatoRecente.id}`)
        this.placar = Array.isArray(data.placares) ? data.placares : []

        await this.carregarPartidasFutebol(campeonatoRecente.id)
      } catch (err) {
        console.error('Erro ao carregar placar:', err)
        this.placar = []
        this.nomeCampeonato = ''
      } finally {
        this.isLoadingPlacar = false
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
        Swal.fire('Erro', 'Não foi possível carregar os detalhes da partida', 'error')
        this.mostrarModalPartida = false
      } finally {
        this.loadingDetalhePartida = false
      }
    },

    fecharModalPartida() {
      this.mostrarModalPartida = false
      this.partidaDetalhada = null
    },

    verificarLogin(quadra) {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      if (usuario?.token) {
        router.push({ name: 'agendar_quadra', query: { quadraId: quadra.id } })
      } else {
        localStorage.setItem("quadraSelecionada", JSON.stringify(quadra))
        this.mostrarModalLogin = true
      }
    },

    irParaLogin() { this.mostrarModalLogin = true },
    loginComGoogle() {
      const width = 500, height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2.5

      const popup = window.open(
        'http://localhost:3000/auth/google',
        'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      const listener = event => {
        if (event.origin !== 'https://quadra-livre.vercel.app') return

        const { token, erro, email, usuario } = event.data

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
          }).then(() => {
            window.location.href = `/cadastro?email=${encodeURIComponent(email)}`
          })
          return
        }

        if (token && usuario) {
          localStorage.setItem('token', token)
          localStorage.setItem('usuario', JSON.stringify(usuario))

          const quadraSelecionada = JSON.parse(
            localStorage.getItem('quadraSelecionada')
          )

          // Desenvolvedor e Administrador
          if ([1, 2].includes(usuario.permissaoId)) {
            router.push({ name: 'Dashboard' })

            // Mesário
          } else if (usuario.permissaoId === 4) {
            router.push({ name: 'gerenciar_partida' })

            // Usuário comum
          } else if (usuario.permissaoId === 3) {
            if (quadraSelecionada) {
              router.push({
                name: 'agendar_quadra',
                query: { quadraId: quadraSelecionada.id }
              })
              localStorage.removeItem('quadraSelecionada')
            } else {
              router.push({ name: 'agendar_quadra' })
            }
          } else {
            router.push({ name: 'Home' })
          }
        }

        window.removeEventListener('message', listener)
        if (popup) popup.close()
      }

      window.addEventListener('message', listener, false)
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.texto-centro {
  background-color: #050B2C;
  color: white;
  padding: 16px 60px;
  margin-top: 70px;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.texto {
  font-size: 40px;
  font-weight: bold;
  line-height: 1.3;
  text-align: left;
  display: inline-block;
}

.primeira-linha,
.segunda-linha {
  display: block;
}

.segunda-linha {
  padding-left: 0;
  color: #3B82F6;
}

h1 {
  font-size: 80px;
  font-family: "Montserrat";
  margin-bottom: 16px;
}

h3 {
  font-size: 22px;
  font-family: "Montserrat";
  font-weight: bold;
  margin-bottom: 16px;
  color: #ffff;
}

p {
  color: #888;
  font-size: 18px;
}

.tit_horario {
  font-size: 28px;
  color: #7E7E7E;
  margin-top: 50px;
  margin-bottom: 5px;
  text-align: center;
  font-weight: bold;
}

.destaque_sublinhado {
  text-decoration: underline;
  color: #3B82F6;
}

.agendamento {
  position: relative;
  width: 100%;
  margin: 20px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.carousel {
  width: 90%;
  overflow: hidden;
}

.carousel .carousel__slide {
  padding: 0 20px;
  box-sizing: border-box;
}

.btn-prev {
  margin-right: 10px;
}

.btn-next {
  margin-left: 10px;
}

.btn-prev,
.btn-next {
  background-color: #D9D9D9;
  color: #7E7E7E;
  border: none;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  font-size: 28px;
  cursor: pointer;
}

.btn-prev:hover,
.btn-next:hover {
  background-color: #eee;
}

.card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.card.is-interditada .imagem {
  filter: grayscale(100%) brightness(1.1) opacity(0.6);
  transition: filter 0.3s ease;
}

.badge-interditada-overlay {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 28px;
  letter-spacing: 3px;
  text-transform: uppercase;
  pointer-events: none;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);
  width: 100%;
  text-align: center;
}

.btn-agendar:disabled {
  background-color: #D9D9D9;
  color: #7E7E7E;
  cursor: not-allowed;
  opacity: 0.9;
}

.imagem {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 6px;
}

.info h3 {
  font-size: 18px;
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.btn-agendar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 6px;
}

.btn-agendar:hover {
  background-color: #60a5fa;
}

.descricao,
.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #fff;
}

.placar-container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.placar-wrapper {
  flex: 2;
  min-width: 400px;
}

.partidas-wrapper {
  flex: 1;
  min-width: 250px;
  overflow-x: hidden;
}

.lista-partidas {
  list-style: none;
  padding: 0;
}

.lista-partidas li {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.card-partida:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 10;
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
  font-size: 14px;
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
  font-size: 18px;
  font-weight: bold;
  color: #374151;
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

.placar tbody tr {
  background-color: #ffffff;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.placar tbody tr:hover {
  background-color: #f3f4f6; 
  cursor: pointer;
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

.time-mobile-title {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .tit_horario {
    font-size: 26px;
    margin-top: 20px;
    margin-bottom: 5px;
    text-align: center;
    font-weight: bold;
  }

  .imagem {
    height: 400px;
    width: 100%;
  }

  .btn-prev,
  .btn-next {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }

  .btn-prev {
    margin-right: -11px;
  }

  .btn-next {
    margin-left: -11px;
  }

  .placar-home {
    width: 90%;
    margin: 20px auto 40px;
  }

  .placar-wrapper {
    flex: 2;
    min-width: 400px;
    overflow-x: auto;
  }

  .placar {
    width: 100%;
    min-width: 700px;
    border-collapse: collapse;
  }

  .placar table {
    font-size: 12px;
    min-width: unset;
  }

  .placar th,
  .placar td {
    padding: 6px;
    font-size: 12px;
  }

  .modal-partida {
    padding: 16px;
    min-width: 90vw;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .placar-modal {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
    flex-wrap: nowrap;
  }

  .placar-modal .time {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    font-size: 14px;
  }

  .placar-modal .time img {
    width: 40px;
    height: 40px;
  }

  .resultado {
    font-size: 36px;
    font-weight: bold;
    color: #3b82f6;
  }

  .jogadores-container {
    grid-template-columns: 1fr;
    gap: 12px;
    max-height: 300px;
  }

  .jogadores-time {
    padding: 8px;
  }

  .foto-jogador {
    width: 32px;
    height: 32px;
  }

  .estatisticas {
    gap: 4px;
  }

  .gols {
    font-size: 14px;
  }

  .cartao {
    font-size: 11px;
  }

  .btn-cancel-placar {
    font-size: 14px;
    padding: 8px 12px;
  }

  .modal-partida h2 {
    font-size: 22px;
    text-align: center;
  }

  .infos p {
    font-size: 14px;
  }

  .time-mobile-title {
    font-size: 20px;
    font-weight: bold;
    color: #3b82f6;
  }
}
</style>