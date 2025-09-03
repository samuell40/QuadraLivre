<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <div class="header">
        <h1 class="title">Partidas ao Vivo</h1>
        <button v-if="!partidaIniciada" class="limparpartidas" @click="abrirModalLimpar = true">
          Limpar Partidas
        </button>

        <div v-else class="temporizador-topo">
          <p class="temporizador">{{ minutos }}:{{ segundos }}</p>
        </div>
      </div>

      <div v-if="carregandoModalidades" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="dropdowns">
          <div class="dropdown-row modalidade">
            <div class="team">
              <label>Modalidade:</label>
              <select v-model="modalidadeSelecionada" @change="handleModalidadeChange" class="dropdown"
                :disabled="partidaIniciada">
                <option disabled value="">Selecione a modalidade</option>
                <option v-for="m in modalidadesDisponiveis" :key="m.id" :value="m.nome">
                  {{ m.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="dropdown-row">
            <div class="team">
              <label>Time 1:</label>
              <div class="dropdown-container">
                <select v-model="timeSelecionado1" @change="carregarPlacarTime('time1')" class="dropdown"
                  :disabled="partidaIniciada || carregandoTimes || times.length === 0">
                  <option disabled value="">Selecione o time</option>
                  <option v-for="t in times" :key="t.id" :value="t" :disabled="timeSelecionado2?.id === t.id">
                    {{ t.nome }}
                  </option>
                </select>
                <span v-if="carregandoTimes" class="loader-pequeno-dropdown"></span>
              </div>
            </div>

            <div class="team">
              <label>Time 2:</label>
              <div class="dropdown-container">
                <select v-model="timeSelecionado2" @change="carregarPlacarTime('time2')" class="dropdown"
                  :disabled="partidaIniciada || carregandoTimes || times.length === 0">
                  <option disabled value="">Selecione o time</option>
                  <option v-for="t in times" :key="t.id" :value="t" :disabled="timeSelecionado1?.id === t.id">
                    {{ t.nome }}
                  </option>
                </select>
                <span v-if="carregandoTimes" class="loader-pequeno-dropdown"></span>
              </div>
            </div>

            <div class="team">
              <button class="dropdown botao-iniciar" @click="togglePartida"
                :disabled="!timeSelecionado1 || !timeSelecionado2 || (!modalidadeSelecionada && !partidaIniciada)">
                {{
                  !partidaIniciada
                    ? 'Iniciar Partida'
                    : (temporizadorAtivo ? 'Pausar Partida' : 'Retomar Partida')
                }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="!partidaIniciada" class="mensagem-inicial">
          <p>
            Para iniciar uma partida, selecione uma modalidade, escolha os times e clique em "Iniciar Partida".
          </p>
        </div>

        <div class="placares" v-if="partidaIniciada">
          <component
            :is="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionada.toLowerCase()) ? 'PlacarTimeVolei' : 'PlacarTime'"
            :timeNome="timeSelecionado1?.nome || ''" :timeData="time1" :setsAdversario="time2.setsVencidos"
            :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo" @update="time1 = $event"
            @remover="resetTime('time1')" />

          <component
            :is="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionada.toLowerCase()) ? 'PlacarTimeVolei' : 'PlacarTime'"
            :timeNome="timeSelecionado2?.nome || ''" :timeData="time2" :setsAdversario="time1.setsVencidos"
            :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo" @update="time2 = $event"
            @remover="resetTime('time2')" />
        </div>

        <div v-if="partidaIniciada" class="finalizar-container">
          <button class="botao-finalizar" @click="finalizarPartida" :disabled="finalizandoPartida">
            <span v-if="finalizandoPartida" class="loader-pequeno"></span>
            <span v-else>Finalizar Partida</span>
          </button>
        </div>
        <LimparPartidas :aberto="abrirModalLimpar" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="abrirModalLimpar = false" @confirmado="carregarPartidas" />

      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import PlacarTime from '@/components/Partida/PlacarTimeFutebol.vue'
import PlacarTimeVolei from '@/components/Partida/PlacarTimeVolei.vue'
import LimparPartidas from '@/components/Partida/LimparPartidas.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import { useWebSocketStore } from '@/webscoket'
import { mapState } from 'pinia'

export default {
  name: 'PartidaView',
  components: { SideBar, NavBarUse, PlacarTime, PlacarTimeVolei, LimparPartidas },

  data() {
    return {
      modalidadesDisponiveis: [],
      modalidadeSelecionada: '',
      times: [],
      timeSelecionado1: '',
      timeSelecionado2: '',
      partidaIniciada: false,
      partidaId: null,
      partida: null,
      time1: {},
      time2: {},
      carregandoModalidades: true,
      carregandoTimes: false,
      tempoSegundos: 0,
      temporizadorAtivo: false,
      intervaloTemporizador: null,
      finalizandoPartida: false,
      inicioPartida: null,
      abrirModalLimpar: false,
    }
  },

  computed: {
    ...mapState(useWebSocketStore, ['connected', 'partidasAtivas', 'partidasEncerradas', 'placares']),

    isVolei() {
      if (!this.modalidadeSelecionada) return false
      const nome = this.modalidadeSelecionada
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
      return nome.includes("volei")
    },
    minutos() {
      return String(Math.floor(this.tempoSegundos / 60)).padStart(2, '0')
    },
    segundos() {
      return String(this.tempoSegundos % 60).padStart(2, '0')
    }
  },

  watch: {
    time1: { deep: true, handler() { this.salvarEstado() } },
    time2: { deep: true, handler() { this.salvarEstado() } },
    timeSelecionado1() { this.salvarEstado() },
    timeSelecionado2() { this.salvarEstado() },
    modalidadeSelecionada() { this.salvarEstado() }
  },

  mounted() {
    const wsStore = useWebSocketStore()
    wsStore.iniciar()
    this.carregarModalidades()
  },

  methods: {
    criarTime(tipo) {
      const modelos = {
        futebol: { nome: '', golspro: 0, golsofridos: 0, cartaoamarelo: 0, cartaovermelho: 0, faltas: 0 },
        volei: { nome: '', setsVencidos: 0, setsSofridos: 0, wo: 0 }
      }
      return JSON.parse(JSON.stringify(modelos[tipo] || {}))
    },

    checaMesmoTipoTime(time) {
      if (!this.timeSelecionado1 && !this.timeSelecionado2) return true
      const timeNome = time.nome.toLowerCase()
      return this.isVolei === timeNome.includes('volei')
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidadesDisponiveis = res.data || []
        await this.carregarEstadoSalvo()
      } catch (error) {
        console.error(error)
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error')
      } finally {
        this.carregandoModalidades = false
      }
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) return
      this.carregandoTimes = true
      try {
        const modalidade = this.modalidadesDisponiveis.find(m => m.nome === this.modalidadeSelecionada)
        if (!modalidade) return
        const res = await api.get(`/times/modalidade/${modalidade.id}?includePlacar=true`)
        this.times = Array.isArray(res.data) ? res.data : []

        if (this.times.length === 0) {
          Swal.fire('Aviso', 'Não há nenhum time cadastrado para esta modalidade.', 'info')
        }
      } catch (error) {
        console.error(error)
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error')
      } finally {
        this.carregandoTimes = false
      }
    },

    async carregarPartidas() {
      await this.carregarModalidades()
      await this.carregarTimes()
    },

    carregarPlacarTime(timeKey, nomeTime = null) {
      const tipo = this.isVolei ? 'volei' : 'futebol'
      this[timeKey] = this.criarTime(tipo)
      const nomeSelecionado = nomeTime || this[timeKey === 'time1' ? 'timeSelecionado1' : 'timeSelecionado2'] || ''
      this[timeKey].nome = nomeSelecionado

      if (this.partidaIniciada) {
        const timeObj = this.times.find(t => t.nome === nomeSelecionado)
        if (timeObj?.placar) Object.assign(this[timeKey], timeObj.placar)
      }
    },

    async togglePartida() {
      if (!this.partidaIniciada) {
        localStorage.removeItem('partidaEstado')

        const modalidade = this.modalidadesDisponiveis.find(
          m => m.nome === this.modalidadeSelecionada
        )

        const res = await api.post('/partida', {
          modalidadeId: modalidade.id,
          timeAId: this.timeSelecionado1.id,
          timeBId: this.timeSelecionado2.id
        })

        this.partidaId = res.data.id
        this.partida = res.data

        this.time1 = this.times.find(t => t.id === this.timeSelecionado1.id)
        this.time2 = this.times.find(t => t.id === this.timeSelecionado2.id)

        this.partidaIniciada = true
        this.temporizadorAtivo = true
        this.inicioPartida = Date.now()
        this.iniciarTemporizador()

        this.salvarEstado()
        Swal.fire('Sucesso', 'Partida iniciada!', 'success')
      } else {
        this.temporizadorAtivo = !this.temporizadorAtivo

        if (this.temporizadorAtivo) {
          this.inicioPartida = Date.now() - this.tempoSegundos * 1000
          if (this.partidaId) {
            const res = await api.put(`/retomar/${this.partidaId}`)
            this.partida = res.data
          }
        } else {
          if (this.partidaId) {
            const res = await api.put(`/pausar/${this.partidaId}`)
            this.partida = res.data
          }
        }
        this.salvarEstado()
      }
    },

    iniciarTemporizador() {
      if (this.intervaloTemporizador) clearInterval(this.intervaloTemporizador)

      this.intervaloTemporizador = setInterval(() => {
        if (this.temporizadorAtivo && this.inicioPartida) {
          this.tempoSegundos = Math.floor((Date.now() - this.inicioPartida) / 1000)
          this.salvarEstado()
        }
      }, 1000)
    },

    async handleModalidadeChange() {
      this.timeSelecionado1 = ''
      this.timeSelecionado2 = ''
      this.times = []
      await this.carregarTimes()
      this.salvarEstado()
    },

    calcularIncrementosFutebol(timeA, timeB) {
      const incA = {
        jogos: 1,
        golsPro: timeA.golspro,
        golsSofridos: timeB.golspro,
        cartoesAmarelos: timeA.cartaoamarelo,
        cartoesVermelhos: timeA.cartaovermelho,
        saldoDeGols: timeA.golspro - timeB.golspro,
        vitorias: 0, empates: 0, derrotas: 0, pontuacao: 0
      }
      const incB = {
        jogos: 1,
        golsPro: timeB.golspro,
        golsSofridos: timeA.golspro,
        cartoesAmarelos: timeB.cartaoamarelo,
        cartoesVermelhos: timeB.cartaovermelho,
        saldoDeGols: timeB.golspro - timeA.golspro,
        vitorias: 0, empates: 0, derrotas: 0, pontuacao: 0
      }

      if (timeA.golspro > timeB.golspro) {
        incA.vitorias = 1; incA.pontuacao = 3; incB.derrotas = 1
      } else if (timeA.golspro < timeB.golspro) {
        incB.vitorias = 1; incB.pontuacao = 3; incA.derrotas = 1
      } else {
        incA.empates = 1; incB.empates = 1; incA.pontuacao = 1; incB.pontuacao = 1
      }
      return [incA, incB]
    },

    calcularIncrementosVolei(timeA, timeB) {
      const incA = {
        jogos: 1,
        setsVencidos: timeA.setsVencidos,
        derrotaWo: timeA.wo,
        vitorias: 0, derrotas: 0,
        vitoria2x0: 0, vitoria2x1: 0,
        derrota2x1: 0, derrota2x0: 0,
        pontuacao: 0
      }
      const incB = {
        jogos: 1,
        setsVencidos: timeB.setsVencidos,
        derrotaWo: timeB.wo,
        vitorias: 0, derrotas: 0,
        vitoria2x0: 0, vitoria2x1: 0,
        derrota2x1: 0, derrota2x0: 0,
        pontuacao: 0
      }

      if (timeA.wo && !timeB.wo) {
        incA.pontuacao = -2
        incA.derrotas = 1
        incB.pontuacao = 3
        incB.vitorias = 1
        return [incA, incB]
      }

      if (timeB.wo && !timeA.wo) {
        incB.pontuacao = -2
        incB.derrotas = 1
        incA.pontuacao = 3
        incA.vitorias = 1
        return [incA, incB]
      }

      if (timeA.setsVencidos > timeB.setsVencidos) {
        incA.vitorias = 1; incB.derrotas = 1
        if (timeA.setsVencidos === 3 && timeB.setsVencidos <= 1) {
          incA.pontuacao = 3
          if (timeB.setsVencidos === 0) incA.vitoria2x0 = 1
          else incA.vitoria2x1 = 1
        } else if (timeA.setsVencidos === 3 && timeB.setsVencidos === 2) {
          incA.pontuacao = 2; incB.pontuacao = 1
          incA.vitoria2x1 = 1; incB.derrota2x1 = 1
        }
      } else if (timeB.setsVencidos > timeA.setsVencidos) {
        incB.vitorias = 1; incA.derrotas = 1
        if (timeB.setsVencidos === 3 && timeA.setsVencidos <= 1) {
          incB.pontuacao = 3
          if (timeA.setsVencidos === 0) incB.vitoria2x0 = 1
          else incB.vitoria2x1 = 1
        } else if (timeB.setsVencidos === 3 && timeA.setsVencidos === 2) {
          incB.pontuacao = 2; incA.pontuacao = 1
          incB.vitoria2x1 = 1; incA.derrota2x1 = 1
        }
      }

      return [incA, incB]
    },

    async atualizarPlacar(timeObj, incremento) {
      try {
        const timeEncontrado = this.times.find(t => t.id === timeObj.id)
        if (!timeEncontrado) return

        if (!timeEncontrado.placar) {
          const res = await api.post('/placar', { timeId: timeEncontrado.id })
          timeEncontrado.placar = res.data
        }

        const placarId = timeEncontrado.placar.id
        await api.put(`/placar/incrementar/${placarId}`, incremento)
      } catch (error) {
        console.error(error)
        Swal.fire('Erro', 'Falha ao salvar placar no banco.', 'error')
      }
    },

    salvarEstado() {
      const estado = {
        partidaIniciada: this.partidaIniciada,
        tempoSegundos: this.tempoSegundos,
        timeSelecionado1: this.timeSelecionado1,
        timeSelecionado2: this.timeSelecionado2,
        modalidadeSelecionada: this.modalidadeSelecionada,
        time1: this.time1,
        time2: this.time2,
        inicioPartida: this.inicioPartida || null,
        temporizadorAtivo: this.temporizadorAtivo,
        partidaId: this.partidaId
      }
      localStorage.setItem('partidaEstado', JSON.stringify(estado))
    },

    async carregarEstadoSalvo() {
      const estado = JSON.parse(localStorage.getItem('partidaEstado'))
      if (estado) {
        this.modalidadeSelecionada = estado.modalidadeSelecionada || ''
        await this.carregarTimes()
        this.timeSelecionado1 = estado.timeSelecionado1 || ''
        this.timeSelecionado2 = estado.timeSelecionado2 || ''
        this.time1 = estado.time1 || this.criarTime(this.isVolei ? 'volei' : 'futebol')
        this.time2 = estado.time2 || this.criarTime(this.isVolei ? 'volei' : 'futebol')

        this.inicioPartida = estado.inicioPartida
        this.partidaId = estado.partidaId || null

        if (this.inicioPartida && estado.temporizadorAtivo) {
          this.tempoSegundos = Math.floor((Date.now() - this.inicioPartida) / 1000)
        } else {
          this.tempoSegundos = estado.tempoSegundos || 0
        }

        this.partidaIniciada = estado.partidaIniciada || false
        this.temporizadorAtivo = estado.temporizadorAtivo || false

        if (this.partidaIniciada && this.temporizadorAtivo) {
          this.iniciarTemporizador()
        }
      }
    },

    async finalizarPartida() {
      const confirmacao = await Swal.fire({
        title: 'Deseja mesmo finalizar a partida?',
        text: "Você não poderá desfazer essa ação.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#7E7E7E',
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      })

      if (!confirmacao.isConfirmed) return

      try {
        this.finalizandoPartida = true

        if (this.partidaId) {
          await api.put(`/finalizar/${this.partidaId}`, {
            pontosTimeA: this.time1.golspro || this.time1.setsVencidos || 0,
            pontosTimeB: this.time2.golspro || this.time2.setsVencidos || 0,
            tempoSegundos: this.tempoSegundos
          })
        }

        let incA, incB
        if (this.isVolei) {
          [incA, incB] = this.calcularIncrementosVolei(this.time1, this.time2)
        } else {
          [incA, incB] = this.calcularIncrementosFutebol(this.time1, this.time2)
        }

        await this.atualizarPlacar(this.time1, incA)
        await this.atualizarPlacar(this.time2, incB)

        Swal.fire('Partida Finalizada', 'A Partida Foi Finalizada!', 'success')
      } catch (e) {
        console.error(e)
        Swal.fire('Erro', 'Falha ao finalizar a partida.', 'error')
      } finally {
        this.finalizandoPartida = false
        this.resetTime('time1')
        this.resetTime('time2')
        this.modalidadeSelecionada = ''
        this.partidaIniciada = false
        this.tempoSegundos = 0
        this.temporizadorAtivo = false
        clearInterval(this.intervaloTemporizador)
        this.intervaloTemporizador = null
        this.partidaId = null
        localStorage.removeItem('partidaEstado')
        this.$forceUpdate()
      }
    },

    resetTime(timeKey) {
      this[timeKey] = {}
      if (timeKey === 'time1') this.timeSelecionado1 = ''
      else this.timeSelecionado2 = ''
    },
  },
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
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

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
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
  width: 10%;
  height: 50px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  z-index: 10;
  padding: 0;
}

.temporizador {
  font-size: 35px;
  font-weight: bold;
  color: #3b82f6;
  margin: 0;
}

.botao-pausar {
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 6px;
  border: none;
  background-color: #3b82f6;
  color: #fff;
  cursor: pointer;
}

.botao-pausar:hover {
  background-color: #2563eb;
}

.placares {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  justify-content: center;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
}

.dropdown-row {
  display: flex;
  gap: 30px;
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
  width: 380px;
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
  margin: 30px auto;
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

.mensagem-inicial {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 18px;
  font-weight: 500;
  color: #3b82f6;
  text-align: center;
  margin: 35px auto;
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