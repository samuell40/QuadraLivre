<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato />

    <div class="conteudo">
      <NavBarUser v-if="!partidaIniciada" />
      <div class="header">
        <h1 class="title">
          {{ partidaIniciada ? 'Partida ao Vivo' : 'Criar Partida' }}
          <span v-if="nomeModalidade">
            {{ nomeModalidade }}
          </span>
        </h1>
      </div>

      <p v-if="!partidaIniciada" class="texto-instrucao">
        Para iniciar uma partida, selecione o time A e o time B, clinque em
        <strong>“Continuar”</strong> para abrir o modal de seleção dos jogadores da partida.
      </p>

      <div class="dropdowns" v-if="!partidaIniciada">
        <div class="dropdown-row">
          <div class="team">
            <label>Time 1:</label>
            <select v-model="timeSelecionado1" class="dropdown" @change="carregarJogadoresPorTime('time1')"
              :disabled="!campeonatoSelecionado || partidaIniciada">
              <option disabled value="">Selecione um time</option>
              <option v-for="t in timesDisponiveisTime1" :key="t.id" :value="t.id">
                {{ t.nome }}
              </option>
            </select>
          </div>

          <div class="team">
            <label>Time 2:</label>
            <select v-model="timeSelecionado2" class="dropdown" @change="carregarJogadoresPorTime('time2')"
              :disabled="!campeonatoSelecionado || partidaIniciada">
              <option disabled value="">Selecione um time</option>
              <option v-for="t in timesDisponiveisTime2" :key="t.id" :value="t.id">
                {{ t.nome }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="!partidaIniciada" class="continuar-container">
          <button class="botao-continuar" :disabled="!podeContinuar" @click="abrirModalJogadores">
            Continuar
          </button>
        </div>

      </div>

      <div class="placares" v-if="partidaIniciada">
        <!-- TIME A -->
        <component :is="isVolei ? 'PlacarTimeVolei' : 'PlacarTime'" :timeKey="isVolei ? 'A' : null"
          :timeNome="times.find(t => t.id === timeSelecionado1)?.nome || ''" :timeData="{
            ...times.find(t => t.id === timeSelecionado1),
            ...time1
          }" :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo" :isFutsal="isFutsal"
          :setsAdversario="isVolei ? time2.setsVencidos : 0" :pontosSetAdversario="isVolei ? time2.pontosSet : 0"
          :woAdversario="isVolei && time2.wo ? 1 : 0" :partidaEncerradaGlobal="isVolei && partidaEncerradaVolei"
          @update="atualizarTime('time1', $event)" />

        <!-- TIME B -->
        <component :is="isVolei ? 'PlacarTimeVolei' : 'PlacarTime'" :timeKey="isVolei ? 'B' : null"
          :timeNome="times.find(t => t.id === timeSelecionado2)?.nome || ''" :timeData="{
            ...times.find(t => t.id === timeSelecionado2),
            ...time2
          }" :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo" :isFutsal="isFutsal"
          :setsAdversario="isVolei ? time1.setsVencidos : 0" :pontosSetAdversario="isVolei ? time1.pontosSet : 0"
          :woAdversario="isVolei && time1.wo ? 1 : 0" :partidaEncerradaGlobal="isVolei && partidaEncerradaVolei"
          @update="atualizarTime('time2', $event)" />
      </div>

      <div v-if="partidaIniciada" class="finalizar-container">
        <button class="botao-finalizar" @click="finalizarPartida" :disabled="finalizandoPartida">
          <span v-if="finalizandoPartida" class="loader-pequeno"></span>
          <span v-else>Finalizar Partida</span>
        </button>
      </div>
      <SelecionarJogadores v-if="mostrarModalJogadores && regraModalidade.porTime > 0" :aberto="mostrarModalJogadores"
        :jogadoresTime1="jogadoresTime1" :jogadoresTime2="jogadoresTime2" :time1Nome="nomeTime1" :time2Nome="nomeTime2"
        :regra="regraModalidade" @confirmar="confirmarJogadores" @fechar="mostrarModalJogadores = false" />

    </div>
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue'
import NavBarUser from '@/components/NavBarUser.vue'
import { useAuthStore } from '@/store'
import SelecionarJogadores from '@/components/Partida/SelecionarJogadores.vue'
import PlacarTime from '@/components/Partida/PlacarTimeFutebol.vue'
import PlacarTimeVolei from '@/components/Partida/PlacarTimeVolei.vue'
import PlacarTimeFutsal from '@/components/Partida/PlacarTimeFutsal.vue'
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  components: {
    NavBarQuadras,
    SidebarCampeonato,
    NavBarUser,
    SelecionarJogadores,
    PlacarTime,
    PlacarTimeFutsal,
    PlacarTimeVolei
  },

  data() {
    return {
      campeonatoSelecionado: '',
      quadraSelecionada: '',
      modalidadeSelecionada: '',
      timeSelecionado1: '',
      timeSelecionado2: '',

      campeonatosDisponiveis: [],
      quadrasDisponiveis: [],
      modalidadesDisponiveis: [],
      times: [],
      time1: {
        golspro: 0,
        faltas: 0,
        substituicoes: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        wo: false,
        setsVencidos: 0,
        pontosSet: 0,
        setsJogados: []
      },
      time2: {
        golspro: 0,
        faltas: 0,
        substituicoes: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        wo: false,
        setsVencidos: 0,
        pontosSet: 0,
        setsJogados: []
      },
      jogadoresTime1: [],
      jogadoresTime2: [],
      mostrarModalJogadores: false,
      partidaIniciada: false,
      temporizadorAtivo: false,
      tempoSegundos: 0,
      intervaloTimer: null,
      mostrarPlacar: false,
      partidaId: null
    }
  },

  computed: {
    authStore() {
      return useAuthStore()
    },

    usuarioLogadoId() {
      return this.authStore.usuario?.id || null
    },
    minutos() {
      const min = Math.floor(this.tempoSegundos / 60)
      return String(min).padStart(2, '0')
    },

    segundos() {
      const seg = this.tempoSegundos % 60
      return String(seg).padStart(2, '0')
    },

    timesDisponiveisTime1() {
      return this.times.filter(
        t => t.id !== Number(this.timeSelecionado2)
      )
    },

    timesDisponiveisTime2() {
      return this.times.filter(
        t => t.id !== Number(this.timeSelecionado1)
      )
    },
    isVolei() {
      const modalidade = this.modalidadesDisponiveis.find(
        m => m.id === this.modalidadeSelecionada
      )
      return modalidade?.nome?.toLowerCase().includes('vôlei')
    },
    isFutsal() {
      const modalidade = this.modalidadesDisponiveis.find(
        m => m.id === this.modalidadeSelecionada
      )

      return modalidade?.nome?.toLowerCase().includes('futsal')
    },

    nomeTime1() {
      return this.times.find(
        t => t.id === this.timeSelecionado1)?.nome
    },

    nomeTime2() {
      return this.times.find(
        t => t.id === this.timeSelecionado2)?.nome
    },
    podeContinuar() {
      return (
        this.quadraSelecionada &&
        this.modalidadeSelecionada &&
        this.campeonatoSelecionado &&
        this.timeSelecionado1 &&
        this.timeSelecionado2
      )
    },
    regraModalidade() {
      const regras = {
        futebol: { porTime: 11, total: 22 },
        futsal: { porTime: 5, total: 10 },
        'futebol de areia': { porTime: 5, total: 10 },
        volei: { porTime: 6, total: 12 },
        'vôlei': { porTime: 6, total: 12 },
        'volei de areia': { porTime: 2, total: 4 },
        futevolei: { porTime: 2, total: 4 }
      }

      const modalidade = this.modalidadesDisponiveis.find(
        m => m.id === this.modalidadeSelecionada
      )

      if (!modalidade || !modalidade.nome) {
        return { porTime: 0, total: 0 }
      }

      const nome = modalidade.nome.toLowerCase()

      const regraEncontrada = Object.entries(regras).find(
        ([key]) => nome.includes(key)
      )

      return regraEncontrada
        ? regraEncontrada[1]
        : { porTime: 0, total: 0 }
    },
    partidaEncerradaVolei() {
      return (
        this.time1.setsVencidos >= 3 ||
        this.time2.setsVencidos >= 3 ||
        this.time1.wo ||
        this.time2.wo
      )
    },
    nomeModalidade() {
      const modalidade = this.modalidadesDisponiveis.find(
        m => m.id === this.modalidadeSelecionada
      )

      if (!modalidade?.nome) return ''

      return modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1)
    }
  },

  mounted() {
    const partidaId = this.$route.query.partidaId

    if (partidaId) {
      this.carregarPartidaEmAndamento(partidaId)
    } else {
      this.buscarQuadras()
      this.limparDados()
    }
  },

  methods: {
    async buscarQuadras() {
      try {
        const { data } = await api.get('/quadra')
        this.quadrasDisponiveis = data
      } catch (error) {
        console.error(error)
      }
    },

    async buscarModalidades() {
      if (!this.quadraSelecionada) return

      try {
        const { data } = await api.get(`/quadra/${this.quadraSelecionada}/modalidades`)
        this.modalidadesDisponiveis = data
      } catch (error) {
        console.error(error)
      }
    },

    async buscarCampeonatos() {
      try {
        const { data } = await api.get(`/listar/${this.modalidadeSelecionada}`)
        this.campeonatosDisponiveis = data
      } catch (error) {
        console.error(error)
      }
    },

    async aoSelecionarCampeonato() {
      this.timeSelecionado1 = ''
      this.timeSelecionado2 = ''
      this.times = []

      await this.buscarTimes()
    },

    async buscarTimes() {
      if (!this.campeonatoSelecionado) return

      try {
        const { data } = await api.get(`/${this.campeonatoSelecionado}/times`)

        this.times = data
      } catch (error) {
        console.error('Erro ao buscar times do campeonato:', error)
        this.times = []
      }
    },

    async carregarJogadoresPorTime(tipo) {
      try {
        if (tipo === 'time1') {
          const { data } = await api.get(`/time/${this.timeSelecionado1}`)
          this.jogadoresTime1 = data
        }

        if (tipo === 'time2') {
          const { data } = await api.get(`/time/${this.timeSelecionado2}`)
          this.jogadoresTime2 = data
        }
      } catch (error) {
        console.error(error)
      }
    },

    async confirmarJogadores({ time1, time2 }) {
      try {
        const jogadores = []

        time1.forEach(id => {
          jogadores.push({
            jogadorId: id,
            timeId: Number(this.timeSelecionado1)
          })
        })

        time2.forEach(id => {
          jogadores.push({
            jogadorId: id,
            timeId: Number(this.timeSelecionado2)
          })
        })

        const payload = {
          usuarioId: Number(this.usuarioLogadoId),
          quadraId: Number(this.quadraSelecionada),
          campeonatoId: Number(this.campeonatoSelecionado),
          modalidadeId: Number(this.modalidadeSelecionada),
          timeAId: Number(this.timeSelecionado1),
          timeBId: Number(this.timeSelecionado2),
          jogadores
        }

        const resposta = await api.post('/partida', payload)

        this.partidaId = resposta.data.id
        this.mostrarModalJogadores = false
        this.partidaIniciada = true
        this.temporizadorAtivo = true
        this.iniciarTemporizador()
      } catch (error) {
        console.error('Erro ao criar partida:', error)
      }
    },

    componentePlacar() {
      const modalidade = this.modalidadesDisponiveis.find(
        m => m.id === this.modalidadeSelecionada)

      if (!modalidade) return null

      if (modalidade.nome.toLowerCase().includes('vôlei')) {
        return 'PlacarTimeVolei'
      }

      return 'PlacarTime'
    },

    async atualizarSelecao(tipo) {
      if (tipo === 'quadra') {
        this.modalidadeSelecionada = ''
        this.campeonatoSelecionado = ''
        this.timeSelecionado1 = ''
        this.timeSelecionado2 = ''
        this.times = []
        this.modalidadesDisponiveis = []
        this.campeonatosDisponiveis = []
        await this.buscarModalidades()
      }

      if (tipo === 'modalidade') {
        this.campeonatoSelecionado = ''
        this.timeSelecionado1 = ''
        this.timeSelecionado2 = ''
        this.times = []

        await this.buscarCampeonatos()
      }

    },
    atualizarTime(time, novoTime) {
      for (const chave in novoTime) {
        this[time][chave] = novoTime[chave];
      }

      // 🔥 REGRA DE W.O NO VÔLEI
      if (this.isVolei) {
        // Time 1 deu W.O
        if (this.time1.wo && !this.time2.wo) {
          this.time1.setsVencidos = 0
          this.time2.setsVencidos = 3
          this.time1.setsJogados = []
          this.time2.setsJogados = []
        }

        // Time 2 deu W.O
        if (this.time2.wo && !this.time1.wo) {
          this.time2.setsVencidos = 0
          this.time1.setsVencidos = 3
          this.time1.setsJogados = []
          this.time2.setsJogados = []
        }
      }

      this.atualizarParcial();
    },

    iniciarTemporizador() {
      if (this.intervaloTimer) return

      const inicio = Date.now() - this.tempoSegundos * 1000

      this.intervaloTimer = setInterval(() => {
        if (this.temporizadorAtivo) {
          this.tempoSegundos = Math.floor((Date.now() - inicio) / 1000)
        }
      }, 500)
    },

    iniciarPausarOuRetomarPartida() {
      if (!this.partidaIniciada) {
        this.mostrarModalJogadores = true;
        return;
      }

      if (this.temporizadorAtivo) {
        this.pausarTemporizador();
      } else {
        this.retomarTemporizador();
      }
    },

    async pausarTemporizador() {
      if (!this.partidaId) return;

      try {
        await api.put(`/partidas/${this.partidaId}/pausar`);
        this.temporizadorAtivo = false;
        Swal.fire("Sucesso", "Partida pausada com sucesso!", "success");
      } catch (err) {
        console.error("Erro ao pausar partida:", err);
        Swal.fire("Erro", "Não foi possível pausar a partida.", "error");
      }
    },

    async retomarTemporizador() {
      if (!this.partidaId) return;

      try {
        await api.put(`/partidas/${this.partidaId}/retomar`);
        this.temporizadorAtivo = true;
        Swal.fire("Sucesso", "Partida retomada com sucesso!", "success");
      } catch (err) {
        console.error("Erro ao retomar partida:", err);
        Swal.fire("Erro", "Não foi possível retomar a partida.", "error");
      }
    },

    async finalizarPartida() {
      try {
        if (!this.partidaId) {
          throw new Error('Partida não encontrada');
        }

        this.temporizadorAtivo = false;
        if (this.intervaloTimer) {
          clearInterval(this.intervaloTimer);
          this.intervaloTimer = null;
        }

        await api.put(`/partida/${this.partidaId}/encerrar`, {
          usuarioId: this.usuarioLogadoId
        });

        Swal.fire("Sucesso", "Partida finalizada e placar atualizado!", "success");

        this.partidaIniciada = false;
        this.mostrarPlacar = false;
        this.tempoSegundos = 0;
        this.partidaId = null;
        this.limparDados();

      } catch (error) {
        console.error('Erro ao finalizar partida:', error);
        Swal.fire("Erro", "Não foi possível finalizar a partida.", "error");
      }
    },

    async carregarPartidaEmAndamento(partidaId) {
      try {
        const { data } = await api.get(`/partidas/${partidaId}/retornar`);

        await this.buscarQuadras();

        this.partidaId = data.id;
        this.partidaIniciada = true;
        this.temporizadorAtivo = true;
        this.tempoSegundos = data.tempoSegundos;
        this.quadraSelecionada = data.quadraId;
        this.modalidadeSelecionada = data.modalidadeId;
        this.campeonatoSelecionado = data.campeonatoId;
        this.timeSelecionado1 = data.timeAId;
        this.timeSelecionado2 = data.timeBId;

        const nomeModalidade = data.modalidade?.nome?.toLowerCase() || '';
        const isVolei = nomeModalidade.includes('vôlei');
        const isFutsal = nomeModalidade.includes('futsal');

        if (isVolei) {
          // 🏐 VÔLEI
          this.time1.setsVencidos = data.pontosTimeA;
          this.time2.setsVencidos = data.pontosTimeB;

          this.time1.setsJogados = [];
          this.time2.setsJogados = [];

          if (Array.isArray(data.sets)) {
            for (const set of data.sets) {
              if (set.pontosA > 0) {
                this.time1.setsJogados.push({
                  numero: set.numero,
                  pontos: set.pontosA
                });
              }

              if (set.pontosB > 0) {
                this.time2.setsJogados.push({
                  numero: set.numero,
                  pontos: set.pontosB
                });
              }
            }
          }

          this.time1.pontosSet = 0;
          this.time2.pontosSet = 0;

          this.time1.wo = !!data.woTimeA;
          this.time2.wo = !!data.woTimeB;

        } else {
          // ⚽ FUTEBOL / FUTSAL (base comum)
          this.time1.golspro = data.pontosTimeA;
          this.time2.golspro = data.pontosTimeB;

          this.time1.faltas = data.faltasTimeA;
          this.time2.faltas = data.faltasTimeB;

          this.time1.cartaoamarelo = data.cartoesAmarelosTimeA;
          this.time1.cartaovermelho = data.cartoesVermelhosTimeA;
          this.time2.cartaoamarelo = data.cartoesAmarelosTimeB;
          this.time2.cartaovermelho = data.cartoesVermelhosTimeB;

          // 🚫 Substituição só no FUTEBOL
          if (!isFutsal) {
            this.time1.substituicoes = data.substituicoesTimeA;
            this.time2.substituicoes = data.substituicoesTimeB;
          } else {
            // opcional: garante estado limpo no futsal
            this.time1.substituicoes = 0;
            this.time2.substituicoes = 0;
          }
        }

        await this.buscarModalidades();
        await this.buscarCampeonatos();
        await this.buscarTimes();

        this.iniciarTemporizador();

      } catch (error) {
        Swal.fire(
          'Erro',
          'Partida não está mais disponível.',
          'error'
        );

        this.$router.push('/gerenciar-partidas');
      }
    },

    async atualizarParcial() {
      if (!this.partidaId) return;

      try {
        const isVolei = this.isVolei;
        const isFutsal = this.isFutsal;

        const payload = {
          tempoSegundos: this.tempoSegundos,
          woTimeA: !!this.time1.wo,
          woTimeB: !!this.time2.wo,
          emIntervalo: false
        };

        if (isVolei) {
          // 🏐 VÔLEI
          const setsTimeA = this.time1.setsJogados || [];
          const setsTimeB = this.time2.setsJogados || [];
          const setsUnificados = [];

          // Time A
          for (const setA of setsTimeA) {
            setsUnificados.push({
              numero: setA.numero,
              pontosA: setA.pontos,
              pontosB: 0
            });
          }

          // Time B
          for (const setB of setsTimeB) {
            const existente = setsUnificados.find(s => s.numero === setB.numero);

            if (existente) {
              existente.pontosB = setB.pontos;
            } else {
              setsUnificados.push({
                numero: setB.numero,
                pontosA: 0,
                pontosB: setB.pontos
              });
            }
          }

          setsUnificados.sort((a, b) => a.numero - b.numero);

          payload.pontosTimeA = this.time1.setsVencidos;
          payload.pontosTimeB = this.time2.setsVencidos;
          payload.sets = setsUnificados;

        } else {
          // ⚽ FUTEBOL / FUTSAL (base comum)
          payload.pontosTimeA = this.time1.golspro;
          payload.pontosTimeB = this.time2.golspro;
          payload.faltasTimeA = this.time1.faltas;
          payload.faltasTimeB = this.time2.faltas;

          // 🚫 Substituição só no FUTEBOL
          if (!isFutsal) {
            payload.substituicoesTimeA = this.time1.substituicoes;
            payload.substituicoesTimeB = this.time2.substituicoes;
          }
        }

        await api.put(`/partida/${this.partidaId}/parcial`, payload);

      } catch (err) {
        console.error('Erro ao atualizar parcial:', err);
        Swal.fire(
          'Erro',
          'Não foi possível atualizar o placar parcial.',
          'error'
        );
      }
    },

    abrirModalJogadores() {
      this.mostrarModalJogadores = true
    },

    limparDados() {
      this.quadraSelecionada = ''
      this.campeonatoSelecionado = ''
      this.modalidadeSelecionada = ''
      this.timeSelecionado1 = ''
      this.timeSelecionado2 = ''
      this.times = []
      this.modalidadesDisponiveis = []
      this.campeonatosDisponiveis = []
      this.jogadoresTime1 = []
      this.jogadoresTime2 = []
      this.time1 = {
        golspro: 0,
        faltas: 0,
        substituicoes: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        wo: false,
        setsVencidos: 0,
        pontosSet: 0,
        setsJogados: []
      };

      this.time2 = {
        golspro: 0,
        faltas: 0,
        substituicoes: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        wo: false,
        setsVencidos: 0,
        pontosSet: 0,
        setsJogados: []
      };
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

.sidebar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  z-index: 200;
  transition: transform 0.3s ease;
}

.sidebar.closed {
  transform: translateX(-100%);
}

.sidebar.open {
  transform: translateX(0);
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

.limparpartidas {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.temporizador-topo {
  position: absolute;
  top: 30px;
  right: 45px;
  height: 50px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  z-index: 10;
  background: #fff;
}


.temporizador {
  font-size: 35px;
  font-weight: bold;
  color: #3b82f6;
  margin: 0;
}

.controle-tempo {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 25px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;

}

.controle-tempo:hover {
  color: #2563eb;
}

.controle-tempo svg {
  flex-shrink: 0;
}

.icon-add {
  width: 40px;
  height: 40px;
  cursor: pointer;
  margin-left: -460%;
  margin-top: -15%;
}

.controle-tempo.pausado {
  color: #facc15;
}

.controle-tempo.pausado:hover {
  color: #eab308;
}

.placares {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  justify-content: center;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 5px;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.dropdown-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
  justify-content: flex-start;
  width: 100%;
}

.dropdown-row.modalidade .team {
  width: 99%;
  display: flex;
  flex-direction: column;
}

.dropdown-row .team {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.dropdown {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.botao-iniciar {
  margin-top: 21px;
}

.finalizar-container {
  padding-top: 30px;
  margin: 0;
  width: 100%;
}

.continuar-container {
  width: 100%;
  margin-top: 24px;
}

.botao-continuar {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.botao-continuar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.loader-container-centralizado {
  position: fixed;
  top: 50%;
  left: 55%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
}

h2 {
  color: #3b82f6;
  font-weight: bold;
  font-size: 18px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loader-pequeno {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
}

.dropdown-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.loader-pequeno-dropdown {
  position: absolute;
  right: 10px;
  top: 35%;
  transform: translateY(-50%);
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

.menu-toggle {
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  background: #3b82f6;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 300;
}

.lista-jogadores {
  margin-top: 10px;
  padding-left: 15px;
  font-size: 14px;
  color: #333;
}

.lista-jogadores li {
  list-style: disc;
  margin-bottom: 4px;
}

.texto-instrucao {
  margin-top: 24px;
  margin-bottom: 32px;
  padding: 20px;
  background-color: #f1f5f9;
  border-radius: 6px;
  border: 2px solid #3b82f6;
  font-size: 15px;

}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 16px;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .menu-toggle {
    display: block;
  }

  .title {
    font-size: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .placares {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .dropdowns {
    width: 100%;
  }

  .dropdown-row {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .dropdown-row .team,
  .dropdown-row.modalidade .team {
    width: 100% !important;
  }

  .botao-iniciar {
    margin-top: 15px;
    width: 100%;
  }

  .finalizar-container {
    margin: 20px 0;
    width: 100%;
  }

  .mensagem-inicial {
    margin: 20px auto;
    height: auto;
  }

  .temporizador-topo {
    position: static;
    width: auto;
    height: 40px;
    margin-left: auto;
    padding: 4px 8px;
  }

  .temporizador {
    font-size: 22px;
  }
}
</style>