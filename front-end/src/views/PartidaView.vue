<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <div class="header">
        <h1 class="title">Partidas ao Vivo</h1>
        <button v-if="!partidaIniciada" class="limparpartidas" @click="icons">
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
                <option v-for="m in modalidadesDisponiveis" :key="m.id" :value="m.id">
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
                  <option v-for="t in times" :key="t.id" :value="t.id" :disabled="timeSelecionado2 === t.id">
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
                  <option v-for="t in times" :key="t.id" :value="t.id" :disabled="timeSelecionado1 === t.id">
                    {{ t.nome }}
                  </option>
                </select>
                <span v-if="carregandoTimes" class="loader-pequeno-dropdown"></span>
              </div>
            </div>

            <div class="team">
              <button class="dropdown botao-iniciar" @click="togglePartida"
                :disabled="!timeSelecionado1 || !timeSelecionado2 || !modalidadeSelecionada">
                {{ !partidaIniciada ? 'Iniciar Partida' : (temporizadorAtivo ? 'Pausar Partida' : 'Retomar Partida') }}
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
          <!-- Time 1 -->
          <component
            :is="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionadaNome.toLowerCase()) ? 'PlacarTimeVolei' : 'PlacarTime'"
            :timeNome="times.find(t => t.id === timeSelecionado1)?.nome || ''" :timeData="time1"
            :setsAdversario="time2.setsVencidos || 0" :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo"
            @update="atualizarTime('time1', $event)" @remover="resetTime('time1')" />

          <!-- Time 2 -->
          <component
            :is="['volei', 'volei de areia', 'futevolei'].includes(modalidadeSelecionadaNome.toLowerCase()) ? 'PlacarTimeVolei' : 'PlacarTime'"
            :timeNome="times.find(t => t.id === timeSelecionado2)?.nome || ''" :timeData="time2"
            :setsAdversario="time1.setsVencidos || 0" :partida-id="partidaId" :temporizadorAtivo="temporizadorAtivo"
            @update="atualizarTime('time2', $event)" @remover="resetTime('time2')" />

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
import PlacarTimeVolei from '@/components/Partida/PlacarTimeVolei.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import { useWebSocketStore } from '@/webscoket'
import { mapState } from 'pinia'

export default {
  name: 'PartidaView',
  components: { SideBar, NavBarUse, PlacarTime, PlacarTimeVolei },

  data() {
    return {
      modalidadeSelecionada: "",
      modalidadesDisponiveis: [],
      timeSelecionado1: "",
      timeSelecionado2: "",
      times: [],
      partidaId: null,
      partidaIniciada: false,
      temporizadorAtivo: false,
      minutos: "00",
      segundos: "00",
      carregandoModalidades: false,
      carregandoTimes: false,
      finalizandoPartida: false,
      time1: { setsVencidos: 0, pontos: 0 },
      time2: { setsVencidos: 0, pontos: 0 },
      inicioPartida: null,
      tempoSegundos: 0,
      intervaloTemporizador: null
    }
  },

  computed: {
    ...mapState(useWebSocketStore, ["partidasAtivas"]),

    isVolei() {
      const nome = this.modalidadeSelecionadaNome;
      return nome
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes("volei");
    },

    modalidadeSelecionadaNome() {
      const mod = this.modalidadesDisponiveis.find(m => m.id === Number(this.modalidadeSelecionada))
      return mod ? mod.nome : ""
    }
  },

  mounted() {
    this.carregarModalidades()
    this.carregarPartidaAberta();
  },

  methods: {
    async togglePartida() {
      if (!this.partidaIniciada) {
        await this.iniciarPartida();
        this.inicioPartida = Date.now();
        this.temporizadorAtivo = true;
        this.iniciarTemporizador();
      } else {
        if (this.temporizadorAtivo && this.inicioPartida) {
          this.tempoSegundos = Math.floor((Date.now() - this.inicioPartida) / 1000);
        }

        this.temporizadorAtivo = !this.temporizadorAtivo;

        try {
          if (!this.temporizadorAtivo) {
            await api.put(`/partidas/${this.partidaId}/pausar`, {
              tempoSegundos: this.tempoSegundos
            });

            localStorage.setItem(`partidaTempo_${this.partidaId}`, this.tempoSegundos);
          } else {
            this.inicioPartida = Date.now() - this.tempoSegundos * 1000;
            await api.put(`/partidas/${this.partidaId}/retomar`);
          }
        } catch (err) {
          console.error("Erro ao alterar estado da partida:", err);
          Swal.fire("Erro", "Não foi possível alterar o estado da partida.", "error");
          this.temporizadorAtivo = !this.temporizadorAtivo;
        }
      }
    },

    iniciarTemporizador() {
      if (this.intervaloTemporizador) clearInterval(this.intervaloTemporizador);

      this.intervaloTemporizador = setInterval(() => {
        if (this.temporizadorAtivo && this.inicioPartida) {
          this.tempoSegundos = Math.floor((Date.now() - this.inicioPartida) / 1000);
          const mins = Math.floor(this.tempoSegundos / 60);
          const secs = this.tempoSegundos % 60;
          this.minutos = mins.toString().padStart(2, "0");
          this.segundos = secs.toString().padStart(2, "0");


          if (this.partidaId) localStorage.setItem(`partidaTempo_${this.partidaId}`, this.tempoSegundos);
        }
      }, 1000);
    },

    async iniciarPartida() {
      try {
        const body = {
          modalidadeId: Number(this.modalidadeSelecionada),
          timeAId: Number(this.timeSelecionado1),
          timeBId: Number(this.timeSelecionado2)
        };

        const res = await api.post("/partida", body);
        console.log("Partida criada:", res.data);

        this.partidaId = res.data.id;

        this.time1.placarId = res.data.timeA?.placar?.id;
        this.time2.placarId = res.data.timeB?.placar?.id;

        this.partidaIniciada = true;
      } catch (err) {
        console.error("Erro ao iniciar partida:", err);
        Swal.fire("Erro", "Não foi possível iniciar a partida.", "error");
      }
    },

    async carregarModalidades() {
      this.carregandoModalidades = true
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidadesDisponiveis = res.data || []
      } catch (error) {
        console.error(error)
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error')
      } finally {
        this.carregandoModalidades = false
      }
    },

    async handleModalidadeChange() {
      this.timeSelecionado1 = ""
      this.timeSelecionado2 = ""
      this.times = []
      await this.carregarTimes()
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) return
      this.carregandoTimes = true
      try {
        const res = await api.get(`/times/modalidade/${this.modalidadeSelecionada}?includePlacar=true`)
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

    async atualizarParcial() {
      if (!this.partidaId) return;

      try {
        const isVolei = this.isVolei;

        await api.put(`/partida/${this.partidaId}/parcial`, {
          pontosTimeA: isVolei ? this.time1.setsVencidos || 0 : this.time1.golspro || 0,
          pontosTimeB: isVolei ? this.time2.setsVencidos || 0 : this.time2.golspro || 0,
          faltasTimeA: this.time1.faltas || 0,
          faltasTimeB: this.time2.faltas || 0,
          substituicoesTimeA: this.time1.substituicoes || 0,
          substituicoesTimeB: this.time2.substituicoes || 0,
          cartoesAmarelosTimeA: this.time1.cartaoamarelo || 0,
          cartoesAmarelosTimeB: this.time2.cartaoamarelo || 0,
          cartoesVermelhosTimeA: this.time1.cartaovermelho || 0,
          cartoesVermelhosTimeB: this.time2.cartaovermelho || 0,
          tempoSegundos: this.tempoSegundos || 0,
          woTimeA: !!this.time1.wo,
          woTimeB: !!this.time2.wo,
          emIntervalo: false
        });

      } catch (err) {
        console.error("Erro ao atualizar parcial:", err);
        Swal.fire("Erro", "Não foi possível atualizar o placar parcial.", "error");
      }
    },

    atualizarTime(time, novoTime) {
      this[time] = { ...novoTime };
      this.atualizarParcial();
    },

    resetTime(timeKey) {
      this[timeKey] = {
        setsVencidos: 0,
        pontos: 0,
        golspro: 0,
        faltas: 0,
        substituicoes: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        wo: false
      };
      if (timeKey === 'time1') this.timeSelecionado1 = '';
      else if (timeKey === 'time2') this.timeSelecionado2 = '';
    },

    calcularIncrementosFutebol(timeA, timeB) {
      const incA = {
        jogos: 1,
        golsPro: timeA.golspro || 0,
        golsSofridos: timeB.golspro || 0,
        cartoesAmarelos: timeA.cartaoamarelo || 0,
        cartoesVermelhos: timeA.cartaovermelho || 0,
        saldoDeGols: (timeA.golspro || 0) - (timeB.golspro || 0),
        vitorias: 0, empates: 0, derrotas: 0, pontuacao: 0
      }
      const incB = {
        jogos: 1,
        golsPro: timeB.golspro || 0,
        golsSofridos: timeA.golspro || 0,
        cartoesAmarelos: timeB.cartaoamarelo || 0,
        cartoesVermelhos: timeB.cartaovermelho || 0,
        saldoDeGols: (timeB.golspro || 0) - (timeA.golspro || 0),
        vitorias: 0, empates: 0, derrotas: 0, pontuacao: 0
      }

      if ((timeA.golspro || 0) > (timeB.golspro || 0)) {
        incA.vitorias = 1; incA.pontuacao = 3; incB.derrotas = 1
      } else if ((timeA.golspro || 0) < (timeB.golspro || 0)) {
        incB.vitorias = 1; incB.pontuacao = 3; incA.derrotas = 1
      } else {
        incA.empates = 1; incB.empates = 1; incA.pontuacao = 1; incB.pontuacao = 1
      }
      return [incA, incB]
    },

    calcularIncrementosVolei(timeA, timeB) {
      const incA = {
        jogos: 1,
        setsVencidos: timeA.setsVencidos || 0,
        derrotaWo: !!timeA.wo,
        vitorias: 0, derrotas: 0,
        vitoria2x0: 0, vitoria2x1: 0,
        derrota2x1: 0, derrota2x0: 0,
        pontuacao: 0
      }
      const incB = {
        jogos: 1,
        setsVencidos: timeB.setsVencidos || 0,
        derrotaWo: !!timeB.wo,
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

    async carregarPartidaAberta() {
      const res = await api.get("/partida/aberta");
      const partida = res.data;

      if (partida) {
        this.partidaId = partida.id;
        this.modalidadeSelecionada = partida.modalidade.id;
        this.timeSelecionado1 = partida.timeA.id;
        this.timeSelecionado2 = partida.timeB.id;

        this.times = [partida.timeA, partida.timeB];

        this.partidaIniciada = true;

        const tempoSalvo = localStorage.getItem(`partidaTempo_${this.partidaId}`);
        this.tempoSegundos = tempoSalvo ? Number(tempoSalvo) : partida.tempoSegundos || 0;

        this.inicioPartida = Date.now() - (this.tempoSegundos * 1000);
        this.temporizadorAtivo = !partida.emIntervalo;
        this.iniciarTemporizador();

        this.time1 = {
          ...this.time1,
          golspro: partida.pontosTimeA || 0,
          setsVencidos: partida.setsVencidosTimeA || 0,
          faltas: partida.faltasTimeA || 0,
          substituicoes: partida.substituicoesTimeA || 0,
          cartaoamarelo: partida.cartoesAmarelosTimeA || 0,
          cartaovermelho: partida.cartoesVermelhosTimeA || 0,
          wo: partida.woTimeA || false,
          placarId: partida.timeA?.placar?.id
        };

        this.time2 = {
          ...this.time2,
          golspro: partida.pontosTimeB || 0,
          setsVencidos: partida.setsVencidosTimeB || 0,
          faltas: partida.faltasTimeB || 0,
          substituicoes: partida.substituicoesTimeB || 0,
          cartaoamarelo: partida.cartoesAmarelosTimeB || 0,
          cartaovermelho: partida.cartoesVermelhosTimeB || 0,
          wo: partida.woTimeB || false,
          placarId: partida.timeB?.placar?.id
        };
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
      });

      if (!confirmacao.isConfirmed) return;

      try {
        this.finalizandoPartida = true;
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        if (this.partidaId) {
          await api.put(`/partida/${this.partidaId}/encerrar`, {
            pontosTimeA: this.time1.golspro || this.time1.setsVencidos || 0,
            pontosTimeB: this.time2.golspro || this.time2.setsVencidos || 0,
            tempoSegundos: this.tempoSegundos,
            cartoesAmarelosTimeA: this.time1.cartaoamarelo || 0,
            cartoesAmarelosTimeB: this.time2.cartaoamarelo || 0,
            cartoesVermelhosTimeA: this.time1.cartaovermelho || 0,
            cartoesVermelhosTimeB: this.time2.cartaovermelho || 0,
            usuarioId: usuario?.id
          });
        }

        let incA, incB;
        if (this.isVolei) [incA, incB] = this.calcularIncrementosVolei(this.time1, this.time2);
        else[incA, incB] = this.calcularIncrementosFutebol(this.time1, this.time2);

        if (!this.time1.placarId || !this.time2.placarId) {
          throw new Error("IDs dos placares não estão definidos.");
        }

        await api.put(`/placar/${this.time1.placarId}/incrementar`, incA);
        await api.put(`/placar/${this.time2.placarId}/incrementar`, incB);

        Swal.fire('Partida Finalizada', 'A Partida Foi Finalizada!', 'success');
      } catch (e) {
        console.error('Erro ao finalizar partida:', e);
        Swal.fire('Erro', 'Falha ao finalizar a partida.', 'error');
      } finally {
        this.finalizandoPartida = false;
        this.resetTime('time1');
        this.resetTime('time2');
        this.modalidadeSelecionada = '';
        this.partidaIniciada = false;
        this.tempoSegundos = 0;
        this.temporizadorAtivo = false;
        clearInterval(this.intervaloTemporizador);
        this.intervaloTemporizador = null;
        this.partidaId = null;
        this.$forceUpdate();
      }
    },
    carregarPlacarTime(time) {
      if (time === "time1") this.time1 = { setsVencidos: 0, pontos: 0 }
      else if (time === "time2") this.time2 = { setsVencidos: 0, pontos: 0 }
    },
  }
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