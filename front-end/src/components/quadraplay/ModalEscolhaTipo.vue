<template>
  <div v-if="modelValue && !mostrarModalPartida && !mostrarModalRodada && !mostrarModalJogadores" class="modal-overlay"
    @click.self="fechar">
    <div class="modal-content modal-escolha">
      <div class="modal-header">
        <span class="title">Escolha a Ação</span>
        <button type="button" class="btn-close-x" @click="fechar">x</button>
      </div>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo btn-tipo-card" @click="abrirModalPartida('ADICIONAR')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-lg"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
            </svg>
            <span class="titulo-acao-modal">Adicionar Partida</span>
          </span>
          <small class="btn-tipo-sub">Cria uma partida para iniciar agora</small>
        </button>

        <button class="btn-tipo btn-tipo-card" @click="abrirModalPartida('AGENDAR')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar3"
              viewBox="0 0 16 16">
              <path
                d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857z" />
              <path
                d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
            </svg>
            <span class="titulo-acao-modal">Agendar Partida</span>
          </span>
          <small class="btn-tipo-sub">Define data e horário para jogar depois</small>
        </button>

        <button v-if="!isMesario" class="btn-tipo btn-tipo-card" @click="abrirModalRodada">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat"
              viewBox="0 0 16 16">
              <path
                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
              <path fill-rule="evenodd"
                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
            </svg>
            <span class="titulo-acao-modal">Adicionar Rodada</span>
          </span>
          <small class="btn-tipo-sub">Cria uma nova rodada na fase atual</small>
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
      <div class="modal-header">
        <span class="title">{{ modoCriacaoPartida === 'AGENDAR' ? 'Agendar Partida' : 'Adicionar Partida' }}</span>
        <button type="button" class="btn-close-x" @click="mostrarModalPartida = false">x</button>
      </div>

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

      <div v-if="modoCriacaoPartida === 'AGENDAR'" class="filtros-topo">
        <label>Data e hora da partida:</label>
        <input v-model="partida.data" type="datetime-local" />
      </div>

      <div class="botoes" v-if="modoCriacaoPartida === 'AGENDAR'">
        <button class="btn-save" :disabled="!podeContinuar || criandoPartida" @click="salvarPartidaAgendada">
          <span v-if="criandoPartida">Aguarde...</span>
          <span v-else>Salvar partida</span>
        </button>
      </div>

      <div class="botoes" v-else>
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
      <div class="modal-header">
        <span class="title">Criar Nova Rodada</span>
        <button type="button" class="btn-close-x" @click="mostrarModalRodada = false">x</button>
      </div>
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
import SelecionarJogadores from './Partida/SelecionarJogadores.vue'

export default {
  name: 'ModalEscolherTipo',
  components: { SelecionarJogadores },

  props: {
    modelValue: { type: Boolean, required: true },
    campeonatoId: { type: [String, Number], required: true }
  },

  data() {
    return {
      usuario: null,
      mostrarModalPartida: false,
      mostrarModalRodada: false,
      modoCriacaoPartida: 'ADICIONAR',
      nomeRodada: '',
      fases: [],
      faseIdSelecionada: null,
      modalidadeId: null,
      modalidadeNome: '',
      quadraId: null,
      rodadas: [],
      times: [],
      partida: {
        faseId: '',
        rodadaId: '',
        timeAId: '',
        timeBId: '',
        data: ''
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

  emits: ['update:modelValue', 'selecionar', 'faseCriada', 'rodadaCriada', 'partidaCriada'],

  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
  },

  computed: {
    isMesario() {
      return Number(this.usuario?.permissaoId) === 4
    },

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
      const { faseId, rodadaId, timeAId, timeBId, data } = this.partida
      const baseOk = !!faseId && !!rodadaId && !!timeAId && !!timeBId && timeAId !== timeBId
      if (this.modoCriacaoPartida === 'AGENDAR') return baseOk && !!data
      return baseOk
    },

    regraJogadores() {
      return this.obterRegraJogadores()
    }
  },

  methods: {
    normalizarNomeModalidade(nome) {
      return String(nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    },

    obterRegraJogadores() {
      const id = Number(this.modalidadeId)
      const nomeNormalizado = this.normalizarNomeModalidade(this.modalidadeNome)

      if (nomeNormalizado.includes('futsal') || (nomeNormalizado.includes('futebol') && nomeNormalizado.includes('areia'))) {
        return { livre: true, minPorTime: 1 }
      }

      const FUTEBOL_11 = new Set([1])
      const FUTSAL_E_AREIA = new Set([2, 7])
      const VOLEI = new Set([3, 5, 6])
      const BEACH_TENIS = new Set([4])

      if (FUTSAL_E_AREIA.has(id)) return { livre: true, minPorTime: 1 }
      if (VOLEI.has(id) || BEACH_TENIS.has(id)) return { livre: true, minPorTime: 1 }
      if (FUTEBOL_11.has(id)) return { porTime: 11, total: 22 }

      return { porTime: 11, total: 22 }
    },

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

    async abrirModalPartida(modo = 'ADICIONAR') {
      await this.carregarModalidadeCampeonato()
      await this.listarFases()
      await this.listarTimes()
      this.modoCriacaoPartida = modo
      this.rodadas = []
      this.partida = { faseId: '', rodadaId: '', timeAId: '', timeBId: '', data: '' }
      this.mostrarModalPartida = true
      this.mostrarModalJogadores = false
      this.jogadoresTime1 = []
      this.jogadoresTime2 = []
    },

    async abrirModalRodada() {
      if (this.isMesario) return
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
        Swal.fire('Erro', 'Nao foi possivel carregar as fases.', 'error')
      }
    },

    async listarTimes() {
      try {
        const { data } = await api.get(`/${this.campeonatoId}/times`)
        this.times = data || []
      } catch (err) {
        console.error('Erro ao listar times:', err)
        Swal.fire('Erro', 'Nao foi possivel carregar os times.', 'error')
      }
    },

    listarRodadas() {
      const faseSelecionada = this.fases.find(f => f.id === Number(this.partida.faseId))
      this.rodadas = faseSelecionada?.rodadas
      this.partida.rodadaId = ''
    },

    async criarRodada() {
      if (this.isMesario) {
        Swal.fire('Atencao', 'Mesario nao pode criar rodada.', 'info')
        return
      }

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
        Swal.fire('Erro', 'Nao foi possivel criar a rodada.', 'error')
      }
    },

    async carregarModalidadeCampeonato() {
      try {
        const { data } = await api.get(`/campeonato/${this.campeonatoId}`)
        this.modalidadeId = data.modalidadeId
        this.modalidadeNome = data?.modalidade?.nome || ''
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
        Swal.fire('Erro', 'Os times nao podem ser iguais.', 'error')
        return
      }

      try {
        const [resA, resB] = await Promise.all([
          api.get('/partidas/escalacao/jogadores', {
            params: {
              campeonatoId: this.campeonatoId,
              faseId,
              timeId: timeAId
            }
          }),
          api.get('/partidas/escalacao/jogadores', {
            params: {
              campeonatoId: this.campeonatoId,
              faseId,
              timeId: timeBId
            }
          })
        ])

        this.jogadoresTime1 = Array.isArray(resA.data) ? resA.data : []
        this.jogadoresTime2 = Array.isArray(resB.data) ? resB.data : []
        this.mostrarModalJogadores = true
      } catch (err) {
        console.error('Erro ao carregar jogadores:', err)
        Swal.fire('Erro', 'Nao foi possivel carregar os jogadores dos times.', 'error')
      }
    },

    async onConfirmarJogadores(selecao) {
      const { faseId, rodadaId, timeAId, timeBId } = this.partida
      this.criandoPartida = true

      try {
        const modalidadeIdNum = Number(this.modalidadeId)
        const regra = this.obterRegraJogadores()

        const idsTimeA = selecao?.time1 || []
        const idsTimeB = selecao?.time2 || []

        if (regra.livre) {
          const min = Number(regra.minPorTime || 1)
          if (idsTimeA.length < min || idsTimeB.length < min) {
            Swal.fire('Erro', `Selecione pelo menos ${min} jogador(es) por time.`, 'error')
            return
          }
        } else if (idsTimeA.length !== regra.porTime || idsTimeB.length !== regra.porTime) {
          Swal.fire('Erro', `Para esta modalidade, selecione exatamente ${regra.porTime} jogador(es) por time.`, 'error')
          return
        }

        const payload = {
          campeonatoId: Number(this.campeonatoId),
          modalidadeId: modalidadeIdNum,
          faseId: Number(faseId),
          rodadaId: Number(rodadaId),
          timeAId: Number(timeAId),
          timeBId: Number(timeBId),
          quadraId: Number(this.quadraId),
          status: 'EM_ANDAMENTO'
        }

        const { data: partidaCriada } = await api.post('/partida', payload)
        const partidaId = partidaCriada?.id
        if (!partidaId) throw new Error('Partida criada sem ID.')

        const jogadoresPayload = [
          ...idsTimeA.map((jogadorId) => ({ jogadorId: Number(jogadorId), timeId: Number(timeAId) })),
          ...idsTimeB.map((jogadorId) => ({ jogadorId: Number(jogadorId), timeId: Number(timeBId) }))
        ]

        await api.put(`/partidas/${partidaId}/iniciar`, { jogadores: jogadoresPayload })

        Swal.fire('Sucesso', 'Partida criada e iniciada!', 'success')
        this.mostrarModalJogadores = false
        this.mostrarModalPartida = false
        this.$emit('partidaCriada', partidaCriada)
      } catch (err) {
        console.error('Erro no fluxo de criar/iniciar:', err)
        const mensagem = err.response?.data?.erro || err.response?.data?.message || 'Nao foi possivel criar/iniciar.'
        Swal.fire('Erro', mensagem, 'error')
      } finally {
        this.criandoPartida = false
      }
    },

    async salvarPartidaAgendada() {
      const { faseId, rodadaId, timeAId, timeBId, data } = this.partida
      this.criandoPartida = true

      if (!faseId || !rodadaId || !timeAId || !timeBId || !data) {
        Swal.fire('Erro', 'Preencha todos os campos.', 'error')
        this.criandoPartida = false
        return
      }

      if (timeAId === timeBId) {
        Swal.fire('Erro', 'Os times nao podem ser iguais.', 'error')
        this.criandoPartida = false
        return
      }

      try {
        const payload = {
          campeonatoId: Number(this.campeonatoId),
          modalidadeId: Number(this.modalidadeId),
          faseId: Number(faseId),
          rodadaId: Number(rodadaId),
          timeAId: Number(timeAId),
          timeBId: Number(timeBId),
          quadraId: Number(this.quadraId),
          data,
          status: 'AGENDADA'
        }

        const { data: partidaCriada } = await api.post('/partida', payload)

        Swal.fire('Sucesso', 'Partida agendada com sucesso!', 'success')
        this.mostrarModalPartida = false
        this.$emit('partidaCriada', partidaCriada)
      } catch (err) {
        console.error('Erro ao agendar partida:', err)
        const mensagem = err.response?.data?.erro || err.response?.data?.message || 'Nao foi possivel agendar.'
        Swal.fire('Erro', mensagem, 'error')
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
  background-color: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 30px 40px;
  border-radius: 16px;
  width: min(900px, 95vw);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
  font-family: 'Montserrat', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  color: var(--primary);
  font-weight: 800;
  letter-spacing: -0.2px;
}

.title_placar {
  color: #3b82f6;
  font-size: 24px;
  font-weight: bold;
}

.btn-close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(59, 130, 246, 0.55);
  border-radius: 999px;
  background: #fff;
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.btn-close-x:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.9);
}

.modal-escolha {
  width: min(720px, 92vw);
  padding: 26px 28px;
  border-radius: 18px;
  text-align: left;
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 10px 0 18px;
}

.btn-tipo {
  width: 100%;
  cursor: pointer;
  transition: 0.2s ease;
  border: none;
  background: transparent;
  padding: 0;
}

.btn-tipo-card {
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  text-align: left;
  color: var(--text);
}

.btn-tipo-card:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.btn-tipo-card:active {
  transform: translateY(0);
}

.btn-tipo-titulo {
  font-weight: 800;
  color: #000;
  font-size: 18px;
  letter-spacing: -0.1px;
  width: 100%;
  text-align: left;
}

.btn-tipo-titulo-com-icone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-tipo-titulo-com-icone svg {
  color: #3b82f6;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}

.btn-tipo-sub {
  font-size: 13px;
  font-weight: 600;
  color:  #777;
  line-height: 1.25;
  width: 100%;
  text-align: left;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-save {
  flex: 1;
  padding: 12px 0;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  color: #Ffff;
  ;
  font-size: 16px;
  font-weight: 800;
  background-color: #3b82f6;
  ;
}

.btn-cancel {
  flex: 1;
  padding: 12px 0;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  background: transparent;
  color: #3b82f6;;
  border: 1px solid rgba(59, 130, 246, 0.35);
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.modal-escolha .modal-header .title {
  text-align: left;
}


.btn-cancel:hover,
.btn-cancel-sec:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.55);
  transform: translateY(-1px);
}

.modal-times .lista-times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(59, 130, 246, 0.45);
  border-radius: 10px;
  padding: 12px;
  background-color: #fff;
}

.modal-times label {
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 700;
  color: var(--text);
}

.time-card {
  border: 1px solid rgba(59, 130, 246, 0.55);
  border-radius: 10px;
  padding: 12px 16px;
  cursor: pointer;
  transition: 0.2s;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text);
}

.time-card.selecionado {
  background: var(--primary);
  color: #fff;
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
  border: 1px solid rgba(59, 130, 246, 0.6);
}

.time-nome {
  font-size: 16px;
  font-weight: 800;
  color: inherit;
}

.time-jogadores {
  font-size: 14px;
  color: var(--text-2);
}

.filtros-topo {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.filtros-topo label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 700;
  color: var(--text);
}

.filtros-topo select,
.filtros-topo input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  color: var(--text);
  background-color: #fff;
  outline: none;
  transition: 0.2s;
}

.filtros-topo select:hover,
.filtros-topo input:hover {
  border-color: rgba(59, 130, 246, 0.65);
}

.filtros-topo select:focus,
.filtros-topo input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.filtros-topo select option[disabled] {
  color: var(--text-3);
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

.dropdown-custom {
  position: relative;
  cursor: pointer;
  margin-top: 5px;
}

.dropdown-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background-color: #fff;
  font-size: 15px;
  color: var(--text);
  min-height: 42px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dropdown-selected:hover {
  border-color: rgba(59, 130, 246, 0.65);
}

.dropdown-list {
  position: absolute;
  width: 100%;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  margin-top: 6px;
  max-height: 220px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.14);
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
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--text);
}

.dropdown-list li:hover {
  background-color: rgba(59, 130, 246, 0.06);
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.input-busca-jogador {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  outline: none;
  font-size: 14px;
  margin-bottom: 5px;
}

.sem-jogador {
  padding: 10px;
  text-align: center;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 20px 18px;
    border-radius: 14px;
  }

  .modal-escolha h2 {
    font-size: 26px;
  }

  .btn-tipo-titulo {
    font-size: 16px;
  }

  .filtros-linha {
    flex-direction: column;
    gap: 12px;
  }

  .btn-save,
  .btn-cancel,
  .btn-cancel-sec {
    padding: 11px 0;
    font-size: 15px;
  }
}
</style>
