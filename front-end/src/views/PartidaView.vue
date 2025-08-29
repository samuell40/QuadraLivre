<template>
  <div class="layout">
    <SideBar />
    <NavBarUse v-if="!partidaIniciada" />

    <div class="conteudo">
      <h1 class="title">Partida ao Vivo</h1>

      <div v-if="partidaIniciada" class="temporizador-topo">
        <p class="temporizador">{{ minutos }}:{{ segundos }}</p>
      </div>

      <div v-if="carregandoModalidades" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="dropdowns">
          <div class="dropdown-row modalidade">
            <div class="team">
              <label>Modalidade:</label>
              <select
                v-model="modalidadeSelecionada"
                @change="handleModalidadeChange"
                class="dropdown"
                :disabled="partidaIniciada"
              >
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
                <select
                  v-model="timeSelecionado1"
                  @change="carregarPlacarTime('time1')"
                  class="dropdown"
                  :disabled="partidaIniciada || carregandoTimes || times.length === 0"
                >
                  <option disabled value="">Selecione o time</option>
                  <option
                    v-for="t in times"
                    :key="t.id"
                    :value="t.nome"
                    :disabled="t.nome === timeSelecionado2 || !checaMesmoTipoTime(t)"
                  >
                    {{ t.nome }}
                  </option>
                </select>
                <span v-if="carregandoTimes" class="loader-pequeno-dropdown"></span>
              </div>
            </div>

            <div class="team">
              <label>Time 2:</label>
              <div class="dropdown-container">
                <select
                  v-model="timeSelecionado2"
                  @change="carregarPlacarTime('time2')"
                  class="dropdown"
                  :disabled="partidaIniciada || carregandoTimes || times.length === 0"
                >
                  <option disabled value="">Selecione o time</option>
                  <option
                    v-for="t in times"
                    :key="t.id"
                    :value="t.nome"
                    :disabled="t.nome === timeSelecionado1 || !checaMesmoTipoTime(t)"
                  >
                    {{ t.nome }}
                  </option>
                </select>
                <span v-if="carregandoTimes" class="loader-pequeno-dropdown"></span>
              </div>
            </div>

            <div class="team">
              <button
                class="dropdown botao-iniciar"
                @click="togglePartida"
                :disabled="!timeSelecionado1 || !timeSelecionado2 || (!modalidadeSelecionada && !partidaIniciada)"
              >
                {{ !partidaIniciada ? 'Iniciar Partida' : (temporizadorAtivo ? 'Pausar Partida' : 'Retomar Partida') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="!partidaIniciada" class="mensagem-inicial">
          <p>Para iniciar uma partida, selecione uma modalidade, escolha os times e clique em "Iniciar Partida".</p>
        </div>

        <div class="placares" v-if="partidaIniciada">
          <!-- Time 1 -->
          <PlacarTimeVolei
            v-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionada.toLowerCase())"
            :timeNome="timeSelecionado1"
            :timeData="time1"
            :setsAdversario="time2.setsVencidos"
            @update="time1 = $event"
            @remover="resetTime('time1')"
          />
          <PlacarTime
            v-else-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeSelecionada.toLowerCase())"
            :timeNome="timeSelecionado1"
            :timeData="time1"
            @update="time1 = $event"
            @remover="resetTime('time1')"
          />

          <!-- Time 2 -->
          <PlacarTimeVolei
            v-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionada.toLowerCase())"
            :timeNome="timeSelecionado2"
            :timeData="time2"
            :setsAdversario="time1.setsVencidos"
            @update="time2 = $event"
            @remover="resetTime('time2')"
          />
          <PlacarTime
            v-else-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeSelecionada.toLowerCase())"
            :timeNome="timeSelecionado2"
            :timeData="time2"
            @update="time2 = $event"
            @remover="resetTime('time2')"
          />
        </div>

        <div v-if="partidaIniciada" class="finalizar-container">
          <button class="botao-finalizar" @click="finalizarPartida" :disabled="finalizandoPartida">
            <span v-if="finalizandoPartida" class="loader-pequeno"></span>
            <span v-else>Finalizar Partida</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import PlacarTime from '@/components/Partida/PlacarTimeFutebol.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import PlacarTimeVolei from '@/components/Partida/PlacarTimeVolei.vue'
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'PartidaView',
  components: { SideBar, NavBarUse, PlacarTime, PlacarTimeVolei },

  data() {
    return {
      modalidadesDisponiveis: [],
      modalidadeSelecionada: '',
      times: [],
      timeSelecionado1: '',
      timeSelecionado2: '',
      partidaIniciada: false,
      time1: {},
      time2: {},
      carregandoModalidades: true,
      carregandoTimes: false,
      tempoSegundos: 0,
      temporizadorAtivo: false,
      intervaloTemporizador: null,
      finalizandoPartida: false
    }
  },

  computed: {
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

  methods: {
    criarTime(tipo) {
      const modelos = {
        futebol: { nome: '', golspro: 0, golsofridos: 0, cartaoamarelo: 0, cartaovermelho: 0, faltas: 0 },
        volei: { nome: '', setsVencidos: 0, setsSofridos: 0, wo: 0 }
      }
      return JSON.parse(JSON.stringify(modelos[tipo] || {}))
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

    checaMesmoTipoTime(time) {
      if (!this.timeSelecionado1 && !this.timeSelecionado2) return true
      const timeNome = time.nome.toLowerCase()
      return this.isVolei === timeNome.includes('volei')
    },

    carregarPlacarTime(timeKey, nomeTime = null) {
      const tipo = this.isVolei ? 'volei' : 'futebol'
      this[timeKey] = this.criarTime(tipo)
      if (nomeTime) this[timeKey].nome = nomeTime
      else this[timeKey].nome = this[timeKey === 'time1' ? 'timeSelecionado1' : 'timeSelecionado2'] || ''
    },

    togglePartida() {
      if (!this.partidaIniciada) this.iniciarPartida()
      else this.temporizadorAtivo = !this.temporizadorAtivo
    },

    iniciarPartida() {
      if (!this.timeSelecionado1 || !this.timeSelecionado2 || !this.modalidadeSelecionada) return
      if (!this.time1.nome) this.carregarPlacarTime('time1', this.timeSelecionado1)
      if (!this.time2.nome) this.carregarPlacarTime('time2', this.timeSelecionado2)
      this.partidaIniciada = true
      this.temporizadorAtivo = true
      this.iniciarTemporizador()
      Swal.fire('Sucesso', 'Partida iniciada!', 'success')
    },

    iniciarTemporizador() {
      if (this.intervaloTemporizador) clearInterval(this.intervaloTemporizador)
      this.intervaloTemporizador = setInterval(() => {
        if (this.temporizadorAtivo) this.tempoSegundos++
      }, 1000)
    },

    async handleModalidadeChange() {
      this.timeSelecionado1 = ''
      this.timeSelecionado2 = ''
      this.times = []
      await this.carregarTimes()
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

      if (timeA.wo) { incA.pontuacao = -2 }
      if (timeB.wo) { incB.pontuacao = -2 }

      if (timeA.setsVencidos > timeB.setsVencidos) {
        incA.vitorias = 1; incB.derrotas = 1
        if (timeA.setsVencidos === 3 && timeB.setsVencidos <= 1) {
          incA.pontuacao = 3
          if (timeB.setsVencidos === 0) incA.vitoria2x0 = 1
          else incA.vitoria2x1 = 1
        } else if (timeA.setsVencidos === 3 && timeB.setsVencidos === 2) {
          incA.pontuacao = 2; incB.pontuacao = 1; incA.vitoria2x1 = 1; incB.derrota2x1 = 1
        }
      } else if (timeB.setsVencidos > timeA.setsVencidos) {
        incB.vitorias = 1; incA.derrotas = 1
        if (timeB.setsVencidos === 3 && timeA.setsVencidos <= 1) {
          incB.pontuacao = 3
          if (timeA.setsVencidos === 0) incB.vitoria2x0 = 1
          else incB.vitoria2x1 = 1
        } else if (timeB.setsVencidos === 3 && timeA.setsVencidos === 2) {
          incB.pontuacao = 2; incA.pontuacao = 1; incB.vitoria2x1 = 1; incA.derrota2x1 = 1
        }
      }
      return [incA, incB]
    },

    async atualizarPlacar(timeSelecionado, incremento) {
      try {
        const timeEncontrado = this.times.find(t => t.nome === timeSelecionado)
        if (!timeEncontrado || !timeEncontrado.placar) return
        const placarId = timeEncontrado.placar.id
        await api.put(`/placar/incrementar/${placarId}`, incremento)
      } catch (error) {
        console.error(error)
        Swal.fire('Erro', 'Falha ao salvar placar no banco.', 'error')
      }
    },

    async finalizarPartida() {
      const confirmacao = await Swal.fire({
        title: 'Deseja mesmo finalizar a partida?',
        text: "Você não poderá desfazer essa ação.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, finalizar',
        cancelButtonText: 'Cancelar'
      })

      if (!confirmacao.isConfirmed) return

      try {
        this.finalizandoPartida = true

        let incs
        if (this.isVolei) incs = this.calcularIncrementosVolei(this.time1, this.time2)
        else incs = this.calcularIncrementosFutebol(this.time1, this.time2)

        await this.atualizarPlacar(this.timeSelecionado1, incs[0])
        await this.atualizarPlacar(this.timeSelecionado2, incs[1])

        Swal.fire('Partida Finalizada', 'A Partida Foi Finalizada!', 'success')
      } catch (e) {
        console.error(e)
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
        localStorage.removeItem('partidaEstado')
      }
    },

    resetTime(timeKey) {
      this[timeKey] = {}
      if (timeKey === 'time1') this.timeSelecionado1 = ''
      else this.timeSelecionado2 = ''
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
        inicioPartida: this.partidaIniciada ? Date.now() - this.tempoSegundos * 1000 : null
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
        this.tempoSegundos = estado.inicioPartida ? Math.floor((Date.now() - estado.inicioPartida) / 1000) : 0
        this.partidaIniciada = estado.partidaIniciada || false
        if (this.partidaIniciada) {
          this.temporizadorAtivo = true
          this.iniciarTemporizador()
        }
      }
    }
  },

  mounted() {
    this.carregarModalidades()
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
  padding: 20px;
  overflow-x: hidden;
  position: relative;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
  margin-left: 18%;
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
  margin-top: 0;
}

.botao-pausar:hover {
  background-color: #2563eb;
}

.placares {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  margin-left: 18%;
}

.dropdowns {
  display: flex;
  flex-direction: column;
  margin-left: 18%;
  width: 100%;
}

.dropdown-row {
  display: flex;
  gap: 30px;
  margin-bottom: 15px;
  justify-content: flex-start;
  width: 100%;
}

.dropdown-row.modalidade .team {
  width: 80%;
  display: flex;
  flex-direction: column;
}

.dropdown-row .team {
  width: 375px;
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
  margin: 30px 18%;
  width: 80%;
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
  margin: 35px 18%;
  margin-left: 35%;
}

.loader-container-centralizado {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  margin-left: 5%;
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
</style>