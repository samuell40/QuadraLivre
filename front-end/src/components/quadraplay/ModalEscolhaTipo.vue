<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content">
      <h2>Escolha a ação</h2>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo" @click="abrirModalPartida">
          Adicionar Partida
        </button>
        <button class="btn-tipo" @click="abrirModalRodada">
          Adicionar Rodada
        </button>
      </div>

      <div class="botoes">
        <button type="button" class="btn-cancel" @click="fechar">
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL DE CRIAR PARTIDA -->
  <div v-if="mostrarModalPartida" class="modal-overlay" @click.self="mostrarModalPartida = false">
    <div class="modal-content modal-times">
      <h2>Criar Partida</h2>

      <div class="filtros-linha">
        <div class="filtros-topo">
          <label>Selecione a fase:</label>
          <select v-model="partida.faseId" @change="listarRodadas">
            <option disabled value="">Escolha uma fase</option>
            <option v-for="fase in fases" :key="fase.id" :value="fase.id">
              {{ fase.nome }}
            </option>
          </select>
        </div>

        <div class="filtros-topo">
          <label>Selecione a rodada:</label>
          <select v-model="partida.rodadaId" :disabled="!rodadas.length">
            <option disabled value="">Escolha uma rodada</option>
            <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
              {{ rodada.nome }}
            </option>
          </select>
        </div>
      </div>

      <!-- TIME A -->
      <div class="filtros-topo">
        <label>Time 1:</label>

        <div class="dropdown-custom">
          <div class="dropdown-selected" @click="abrirDropdownTimeA = !abrirDropdownTimeA">
            <img v-if="timeASelecionadoObj?.foto" :src="timeASelecionadoObj.foto" class="avatar" />
            <span>
              {{ timeASelecionadoObj?.nome || 'Selecione o time' }}
            </span>
          </div>

          <div v-if="abrirDropdownTimeA" class="dropdown-list">
            <input type="text" v-model="buscaTimeA" placeholder="Buscar time..." class="input-busca-jogador"
              @click.stop />

            <ul>
              <li v-for="time in timesFiltradosA" :key="time.id" @click.stop="selecionarTimeA(time)">
                <img v-if="time.foto" :src="time.foto" class="avatar" />
                <span>{{ time.nome }}</span>
              </li>

              <li v-if="timesFiltradosA.length === 0" class="sem-jogador">
                Nenhum time encontrado
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- TIME B -->
      <div class="filtros-topo">
        <label>Time 2:</label>

        <div class="dropdown-custom">
          <div class="dropdown-selected" @click="abrirDropdownTimeB = !abrirDropdownTimeB">
            <img v-if="timeBSelecionadoObj?.foto" :src="timeBSelecionadoObj.foto" class="avatar" />
            <span>
              {{ timeBSelecionadoObj?.nome || 'Selecione o time' }}
            </span>
          </div>

          <div v-if="abrirDropdownTimeB" class="dropdown-list">
            <input type="text" v-model="buscaTimeB" placeholder="Buscar time..." class="input-busca-jogador"
              @click.stop />

            <ul>
              <li v-for="time in timesFiltradosB" :key="time.id" @click.stop="selecionarTimeB(time)">
                <img v-if="time.foto" :src="time.foto" class="avatar" />
                <span>{{ time.nome }}</span>
              </li>

              <li v-if="timesFiltradosB.length === 0" class="sem-jogador">
                Nenhum time encontrado
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" :disabled="!podeContinuar || criandoPartida" @click="continuarSelecionarJogadores">
          <span v-if="criandoPartida">Aguarde...</span>
          <span v-else>Continuar (selecionar jogadores)</span>
        </button>
      </div>
    </div>
  </div>

  <SelecionarJogadores :aberto="mostrarModalJogadores" :jogadoresTime1="jogadoresTime1" :jogadoresTime2="jogadoresTime2"
    :time1Nome="timeASelecionadoObj?.nome || 'Time 1'" :time2Nome="timeBSelecionadoObj?.nome || 'Time 2'"
    :regra="regraJogadores" @fechar="mostrarModalJogadores = false" @confirmar="onConfirmarJogadores" />

  <div v-if="mostrarModalRodada" class="modal-overlay" @click.self="mostrarModalRodada = false">
    <div class="modal-content modal-times">
      <h2>Criar Nova Rodada</h2>
      <div class="filtros-topo">
        <label for="faseSelect">Selecione a fase:</label>
        <select id="faseSelect" v-model="faseIdSelecionada">
          <option value="" disabled>Escolha uma fase</option>
          <option v-for="fase in fases" :key="fase.id" :value="fase.id">
            {{ fase.nome }}
          </option>
        </select>
      </div>

      <div class="filtros-topo">
        <label for="nomeRodada">Digite o nome da rodada:</label>
        <input id="nomeRodada" v-model="nomeRodada" type="text" placeholder="Ex: Rodada 1" />
      </div>

      <div class="botoes">
        <button class="btn-save" @click="criarRodada">Criar Rodada</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'
import SelecionarJogadores from '../Partida/SelecionarJogadores.vue';

export default {
  name: 'ModalEscolherTipo',
  components: { SelecionarJogadores },

  props: {
    modelValue: { type: Boolean, required: true },
    campeonatoId: { type: String, required: true }
  },

  data() {
    return {
      usuario: null,
      mostrarModalPartida: false,
      mostrarModalRodada: false,
      nomeRodada: '',
      fases: [],
      faseIdSelecionada: null,
      modalidadeId: null,
      quadraId: null,
      rodadas: [],
      times: [],
      partida: {
        faseId: '',
        rodadaId: '',
        timeAId: '',
        timeBId: ''
      },
      abrirDropdownTimeA: false,
      abrirDropdownTimeB: false,
      buscaTimeA: '',
      buscaTimeB: '',
      mostrarModalJogadores: false,
      jogadoresTime1: [],
      jogadoresTime2: [],
      criandoPartida: false
    }
  },

  emits: ['update:modelValue', 'selecionar', 'rodadaCriada', 'partidaCriada'],

  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
  },

  computed: {
    timeASelecionadoObj() {
      return this.times.find(t => t.id === this.partida.timeAId)
    },

    timeBSelecionadoObj() {
      return this.times.find(t => t.id === this.partida.timeBId)
    },

    timesFiltradosA() {
      return this.times
        .filter(t => t.id !== this.partida.timeBId)
        .filter(t => t.nome.toLowerCase().includes(this.buscaTimeA.toLowerCase()))
    },

    timesFiltradosB() {
      return this.times
        .filter(t => t.id !== this.partida.timeAId)
        .filter(t => t.nome.toLowerCase().includes(this.buscaTimeB.toLowerCase()))
    },

    podeContinuar() {
      const { faseId, rodadaId, timeAId, timeBId } = this.partida
      return !!faseId && !!rodadaId && !!timeAId && !!timeBId && timeAId !== timeBId
    },

    regraJogadores() {
      const id = Number(this.modalidadeId)
      const FUTEBOL = new Set([1, 2, 4])
      const VOLEI = new Set([3, 5, 6])

      if (FUTEBOL.has(id)) return { porTime: 11, total: 22 }
      if (VOLEI.has(id)) return { porTime: 6, total: 12 }
      return { porTime: 11, total: 22 }
    }
  },

  methods: {
    fechar() {
      this.$emit('update:modelValue', false)
    },

    selecionar(tipo) {
      this.$emit('selecionar', tipo)
      this.fechar()
    },

    selecionarTimeA(time) {
      this.partida.timeAId = time.id
      this.abrirDropdownTimeA = false
      this.buscaTimeA = ''
    },

    selecionarTimeB(time) {
      this.partida.timeBId = time.id
      this.abrirDropdownTimeB = false
      this.buscaTimeB = ''
    },

    async abrirModalPartida() {
      await this.carregarModalidadeCampeonato()
      await this.listarFases()
      await this.listarTimes()
      this.rodadas = []
      this.partida = { faseId: '', rodadaId: '', timeAId: '', timeBId: '' }
      this.mostrarModalPartida = true
      this.mostrarModalJogadores = false
      this.jogadoresTime1 = []
      this.jogadoresTime2 = []
    },

    async abrirModalRodada() {
      await this.listarFases()
      this.faseIdSelecionada = ''
      this.mostrarModalRodada = true
    },

    async listarFases() {
      try {
        const { data } = await api.get(`/fases/${this.campeonatoId}/`)
        this.fases = data || []
      } catch (err) {
        console.error('Erro ao listar fases:', err)
        Swal.fire('Erro', 'Não foi possível carregar as fases.', 'error')
      }
    },

    async listarTimes() {
      try {
        const { data } = await api.get(`/${this.campeonatoId}/times`)
        this.times = data || []
      } catch (err) {
        console.error('Erro ao listar times:', err)
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error')
      }
    },

    listarRodadas() {
      const faseSelecionada = this.fases.find(f => f.id === Number(this.partida.faseId))
      this.rodadas = faseSelecionada?.rodadas
      this.partida.rodadaId = ''
    },

    async criarRodada() {
      if (!this.nomeRodada) {
        Swal.fire('Erro', 'Informe o nome da rodada.', 'error')
        return
      }
      if (!this.faseIdSelecionada) {
        Swal.fire('Erro', 'Selecione uma fase.', 'error')
        return
      }

      try {
        const { data } = await api.post(`/rodada/${this.campeonatoId}/${this.faseIdSelecionada}`, {
          nome: this.nomeRodada
        })
        Swal.fire('Sucesso', 'Rodada criada com sucesso!', 'success')
        this.nomeRodada = ''
        this.faseIdSelecionada = null
        this.mostrarModalRodada = false
        this.$emit('rodadaCriada', data.rodada)
      } catch (err) {
        console.error('Erro ao criar rodada:', err)
        Swal.fire('Erro', 'Não foi possível criar a rodada.', 'error')
      }
    },

    async carregarModalidadeCampeonato() {
      try {
        const { data } = await api.get(`/campeonato/${this.campeonatoId}`)
        this.modalidadeId = data.modalidadeId
        this.quadraId = data.quadraId
      } catch (err) {
        console.error('Erro ao carregar campeonato:', err)
      }
    },

    async continuarSelecionarJogadores() {
      const { faseId, rodadaId, timeAId, timeBId } = this.partida

      if (!faseId || !rodadaId || !timeAId || !timeBId) {
        Swal.fire('Erro', 'Preencha todos os campos.', 'error')
        return
      }

      if (timeAId === timeBId) {
        Swal.fire('Erro', 'Os times não podem ser iguais.', 'error')
        return
      }

      try {
        const [resA, resB] = await Promise.all([
          api.get(`/time/${timeAId}`),
          api.get(`/time/${timeBId}`)
        ])

        this.jogadoresTime1 = resA.data
        this.jogadoresTime2 = resB.data

        this.mostrarModalJogadores = true
      } catch (err) {
        console.error('Erro ao carregar jogadores:', err)
        Swal.fire('Erro', 'Não foi possível carregar os jogadores dos times.', 'error')
      }
    },

    async onConfirmarJogadores(selecao) {
      const { faseId, rodadaId, timeAId, timeBId } = this.partida
      this.criandoPartida = true
      try {
        const payload = {
          campeonatoId: Number(this.campeonatoId),
          modalidadeId: Number(this.modalidadeId),
          faseId: Number(faseId),
          rodadaId: Number(rodadaId),
          timeAId: Number(timeAId),
          timeBId: Number(timeBId),
          quadraId: Number(this.quadraId)
        }

        const { data } = await api.post('/partida', payload)
        const partidaCriada = data
        const partidaId = data?.id

        if (!partidaId) throw new Error('Partida criada sem ID.')

        const idsTimeA = selecao?.time1 || []
        const idsTimeB = selecao?.time2 || []

        const reqsTimeA = idsTimeA.map((jogadorId) =>
          api.post(`/${partidaId}/jogador/${jogadorId}`, {
            timeId: Number(timeAId)
          })
        )

        const reqsTimeB = idsTimeB.map((jogadorId) =>
          api.post(`/${partidaId}/jogador/${jogadorId}`, {
            timeId: Number(timeBId)
          })
        )

        await Promise.all(reqsTimeA.concat(reqsTimeB))

        const jogadoresPayload = []

        idsTimeA.forEach((jogadorId) => {
          jogadoresPayload.push({
            jogadorId: Number(jogadorId),
            timeId: Number(timeAId)
          })
        })

        idsTimeB.forEach((jogadorId) => {
          jogadoresPayload.push({
            jogadorId: Number(jogadorId),
            timeId: Number(timeBId)
          })
        })

        await api.put(`/partidas/${partidaId}/iniciar`, {
          jogadores: jogadoresPayload
        })

        Swal.fire('Sucesso', 'Partida criada e iniciada!', 'success')

        this.mostrarModalJogadores = false
        this.mostrarModalPartida = false

        this.$emit('partidaCriada', partidaCriada)
      } catch (err) {
        console.error('Erro no fluxo de criar/iniciar:', err)
        Swal.fire(
          'Erro',
          err.response?.data?.message,
          'error'
        )
      } finally {
        this.criandoPartida = false
      }
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
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 900px;
  max-width: 95%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
  font-weight: bold;
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-tipo {
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
  background-color: #fff;
  cursor: pointer;
  transition: 0.3s;
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
}

.btn-tipo:hover {
  background-color: #3b82f6;
  color: white;
}

.btn-tipo i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #3b82f6;
}

.modal-times .lista-times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
  background-color: #fff;
}

.modal-times label {
  font-size: 17px;
  margin-bottom: 6px;
}

/* CARD DO TIME */
.time-card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: 0.2s;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-card.selecionado {
  background: #3b82f6;
  color: white;
  border-color: #1e40af;
}

.time-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-foto {
  width: 50px;
  height: 50px;
}

.time-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #3b82f6;
}

.time-nome {
  font-size: 16px;
  font-weight: bold;
}

.time-jogadores {
  font-size: 14px;
  color: #555;
}

.filtros-topo select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.filtros-topo select:hover {
  border-color: #3b82f6;
}

.filtros-topo select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filtros-topo select option[disabled] {
  color: #9ca3af;
}

.filtros-topo input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  outline: none;
}

.filtros-linha {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.filtros-linha .filtros-topo {
  flex: 1;
  min-width: 150px;
}

.filtros-topo {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.filtros-topo label {
  display: block;
  font-size: 17px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.dropdown-custom {
  position: relative;
  cursor: pointer;
  margin-top: 5px;
}

.dropdown-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  font-size: 15px;
  color: #333;
  min-height: 38px;
}

.dropdown-list {
  position: absolute;
  width: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-list ul {
  padding: 0;
  margin: 0;
  list-style: none;
  max-height: 180px;
  overflow-y: auto;
}

.dropdown-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-list li:hover {
  background-color: #f1f1f1;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.input-busca-jogador {
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid #ddd;
  outline: none;
  font-size: 14px;
  margin-bottom: 5px;
}

.sem-jogador {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

@media (max-width: 768px) {
  .filtros-linha {
    flex-direction: column;
    gap: 12px;
  }
}
</style>