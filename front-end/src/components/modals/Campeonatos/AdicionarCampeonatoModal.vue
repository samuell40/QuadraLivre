<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Adicionar Campeonato</h2>

      <form @submit.prevent="cadastrarCampeonato">

        <div class="form-row">
          <div class="form-group">
            <label for="modalidade">Modalidade</label>
            <select id="modalidade" v-model="modalidadeSelecionada" required>
              <option value="" disabled>Selecione a modalidade</option>
              <option v-for="m in modalidades" :key="m.id" :value="m.id">
                {{ m.nome }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="quadra">Quadra</label>
            <select id="quadra" v-model="quadraSelecionada" :disabled="!modalidadeSelecionada" required>
              <option value="" disabled v-if="!modalidadeSelecionada">
                Selecione uma modalidade primeiro
              </option>

              <option value="" disabled v-else>
                Selecione a quadra
              </option>

              <option v-for="q in quadras" :key="q.id" :value="q.id">
                {{ q.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="nomeCampeonato">Nome do Campeonato</label>
          <input type="text" id="nomeCampeonato" v-model="nomeCampeonato" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dataInicio">Data de Início</label>
            <input type="date" id="dataInicio" v-model="dataInicio" required />
          </div>

          <div class="form-group">
            <label for="dataFim">Data de Fim</label>
            <input type="date" id="dataFim" v-model="dataFim" required />
          </div>
        </div>

        <div class="form-group">
          <label><strong>Selecione os Horários em que vão Decorrer as Partidas:</strong></label>

          <div class="horarios">
            <button v-for="h in horariosDisponiveis" :key="h" :class="{ selecionado: horariosSelecionados.includes(h) }"
              @click.prevent="toggleHorario(h)">
              {{ h }}
            </button>
          </div>
          <div class="select-all">
            <label>
              <input type="checkbox" v-model="todosHorariosSelecionados" @change="toggleTodosHorarios" />
              Selecionar todos os horários
            </label>
          </div>
        </div>

        <div class="botoes">
          <button type="submit" class="btn-save">Cadastrar</button>
          <button type="button" class="btn-cancel" @click="$emit('fechar')">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import api from '@/axios'

export default {
  name: 'AdicionarCampeonatoModal',

  props: {
    aberto: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      modalidades: [],
      quadras: [],
      modalidadeSelecionada: '',
      quadraSelecionada: '',
      nomeCampeonato: '',
      dataInicio: '',
      dataFim: '',
      horariosDisponiveis: [],
      horariosSelecionados: [],
      todosHorariosSelecionados: false,
      carregandoQuadras: false
    }
  },

  watch: {
    aberto(valor) {
      if (valor) {
        this.limparCampos()
        this.carregarModalidades()
        this.gerarHorarios()
      }
    },

    modalidadeSelecionada(valor) {
      this.quadraSelecionada = ''
      if (valor) {
        this.carregarQuadras(valor)
      } else {
        this.quadras = []
      }
    }
  },

  methods: {
    limparCampos() {
      this.modalidadeSelecionada = ''
      this.quadraSelecionada = ''
      this.nomeCampeonato = ''
      this.dataInicio = ''
      this.dataFim = ''
      this.horariosSelecionados = []
      this.todosHorariosSelecionados = false
      this.quadras = []
    },

    toggleHorario(horario) {
      if (this.horariosSelecionados.includes(horario)) {
        this.horariosSelecionados =
          this.horariosSelecionados.filter(h => h !== horario)
      } else {
        this.horariosSelecionados.push(horario)
      }
      this.todosHorariosSelecionados =
        this.horariosSelecionados.length === this.horariosDisponiveis.length
    },

    toggleTodosHorarios() {
      this.horariosSelecionados = []
      if (this.todosHorariosSelecionados) {
        this.horariosDisponiveis.forEach(horario => {
          this.horariosSelecionados.push(horario)
        })
      }
    },
    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade')
        this.modalidades = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar modalidades.', 'error')
      }
    },

    async carregarQuadras(modalidadeId) {
      try {
        this.carregandoQuadras = true
        const res = await api.get(`/listar/quadras/${modalidadeId}`)
        this.quadras = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar quadras.', 'error')
      } finally {
        this.carregandoQuadras = false
      }
    },

    gerarHorarios() {
      const horarios = []
      for (let h = 0; h < 24; h++) {
        horarios.push(`${String(h).padStart(2, '0')}:00`)
      }
      this.horariosDisponiveis = horarios
    },

    async cadastrarCampeonato() {
      if (!this.modalidadeSelecionada) {
        Swal.fire('Atenção', 'Selecione uma modalidade.', 'warning')
        return
      }

      if (!this.quadraSelecionada) {
        Swal.fire('Atenção', 'Selecione uma quadra.', 'warning')
        return
      }

      if (!this.nomeCampeonato.trim()) {
        Swal.fire('Atenção', 'Informe o nome do campeonato.', 'warning')
        return
      }

      if (!this.dataInicio || !this.dataFim) {
        Swal.fire('Atenção', 'Informe as datas do campeonato.', 'warning')
        return
      }

      if (this.dataFim < this.dataInicio) {
        Swal.fire(
          'Atenção',
          'Data de fim não pode ser menor que a de início.',
          'warning'
        )
        return
      }

      if (this.horariosSelecionados.length === 0) {
        Swal.fire('Atenção', 'Selecione pelo menos um horário.', 'warning')
        return
      }

      try {
        await api.post('/criar/campeonato', {
          nome: this.nomeCampeonato.trim(),
          modalidadeId: this.modalidadeSelecionada,
          quadraId: this.quadraSelecionada,
          dataInicio: this.dataInicio,
          dataFim: this.dataFim,
          horarios: this.horariosSelecionados
        })

        Swal.fire('Sucesso', 'Campeonato cadastrado com sucesso!', 'success')
        this.$emit('atualizar')
        this.$emit('fechar')
      } catch (error) {
        const msg =
          error.response?.data?.erro
        Swal.fire('Erro', msg, 'error')
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
  width: 800px;
  max-width: 95%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.form-group {
  margin-bottom: 16px;
}

input,
select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
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
  background-color: #7e7e7e;
}

.select-all {
  margin-bottom: 10px;
  font-size: 14px;
}

.select-all label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.select-all input[type="checkbox"] {
  margin: 0;
}

.horarios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}

.horarios button {
  height: 40px;
  font-size: 14px;
  border: 1px solid #1E3A8A;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
}

.horarios button:hover {
  background-color: #3b82f6;
  color: #fff;
}

.horarios button.selecionado {
  background-color: #1E3A8A;
  color: #fff;
}
</style>