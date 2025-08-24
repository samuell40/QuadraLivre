<template> 
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <!-- Escolha da data -->
      <label for="data"><strong>Escolha a data:</strong></label>
      <input type="date" v-model="data" :min="minDate" :max="maxDate" />

      <!-- Escolha da hora e duração (quando aplicável) -->
      <label for="hora"><strong>Escolha a hora {{ exibirDuracao ? 'e duração' : '' }}:</strong></label>
      <div class="linha-horizontal">
        <input type="time" v-model="hora" min="07:00" max="23:59" />
        
        <!-- Só exibe a duração se for modalidade que permite -->
        <select v-if="exibirDuracao" v-model="duracao" class="select-tempo">
          <option disabled value="">Duração</option>
          <option value="1">1 hora</option>
          <option value="2">2 horas</option>
        </select>
      </div>

      <!-- Tipo de agendamento -->
      <label for="tipo"><strong>Tipo de agendamento:</strong></label>
      <select v-model="tipo">
        <option disabled value="">Selecione</option>
        <option value="PARTIDA">Partida</option>
        <option value="TREINO">Treino</option>
        <option value="EVENTO">Evento</option>
        <option value="OUTRO">Outro</option>
      </select>

      <!-- Ações -->
      <div class="modal-actions">
        <button
          @click="confirmar"
          class="btn-confirmar"
          :disabled="!data || !hora || (exibirDuracao && !duracao) || !tipo"
        >
          Confirmar
        </button>
        <button @click="$emit('fechar')" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { useAuthStore } from '@/store'

export default {
  name: 'AgendamentoModal',
  props: { quadra: Object },
  data() {
    const hoje = new Date()
    const umAno = new Date()
    umAno.setFullYear(hoje.getFullYear() + 1)

    return {
      data: '',
      hora: '',
      duracao: '',
      tipo: '',
      minDate: hoje.toISOString().split('T')[0],
      maxDate: umAno.toISOString().split('T')[0],
      authStore: useAuthStore()
    }
  },
  computed: {
    modalidadesPadronizadas() {
      if (!this.quadra?.modalidades || this.quadra.modalidades.length === 0) return []
      return this.quadra.modalidades.map(m =>
        m.nome.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
      )
    },
    isFutebol() {
      const modalidadesFutebol = ['futebol', 'futsal', 'futebol de areia', 'futevolei']
      return this.modalidadesPadronizadas.some(m => modalidadesFutebol.includes(m))
    },
    exibirDuracao() {
      const modalidadesDuracao = ['volei', 'volei de areia', 'futevolei']
      return this.modalidadesPadronizadas.some(m => modalidadesDuracao.includes(m))
    }
  },
  methods: {
    confirmar() {
      if (!this.data || !this.hora || (this.exibirDuracao && !this.duracao) || !this.tipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obrigatórios',
          text: 'Preencha todos os campos necessários.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const agora = new Date()
      const dataSelecionada = new Date(`${this.data}T${this.hora}`)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      if (dataSelecionada < hoje) {
        Swal.fire({ icon: 'error', title: 'Data inválida', text: 'Não é possível agendar para datas anteriores a hoje.', confirmButtonColor: '#1E3A8A' })
        return
      }

      const limite = new Date()
      limite.setFullYear(limite.getFullYear() + 1)
      if (dataSelecionada > limite) {
        Swal.fire({ icon: 'error', title: 'Data muito distante', text: 'Você não pode agendar para mais de 1 ano no futuro.', confirmButtonColor: '#1E3A8A' })
        return
      }

      const [h, m] = this.hora.split(':')
      const horaSelecionada = parseInt(h) * 60 + parseInt(m)
      if (horaSelecionada < 7 * 60 || horaSelecionada > 23 * 60 + 59) {
        Swal.fire({ icon: 'error', title: 'Horário inválido', text: 'Escolha um horário entre 07:00 e 23:59.', confirmButtonColor: '#1E3A8A' })
        return
      }

      if ((dataSelecionada - agora) / (1000 * 60 * 60) < 24) {
        Swal.fire({ icon: 'error', title: 'Agendamento muito próximo', text: 'Você só pode agendar com pelo menos 24 horas de antecedência.', confirmButtonColor: '#1E3A8A' })
        return
      }

      const duracaoFinal = this.exibirDuracao ? parseInt(this.duracao) : 1

      this.$emit('confirmar', {
        usuarioId: this.authStore.usuario.id,
        quadraId: this.quadra.id,
        dia: parseInt(this.data.split('-')[2]),
        mes: parseInt(this.data.split('-')[1]),
        ano: parseInt(this.data.split('-')[0]),
        hora: parseInt(this.hora.split(':')[0]),
        duracao: duracaoFinal,
        tipo: this.tipo,
        status: 'Pendente'
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: #7E7E7E;
  padding: 18px 56px;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 550px;
  height: 70%;
}

.modal-content input,
.select-tempo,
select {
  color: #7E7E7E;
  height: 50px;
  padding: 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 18px;
}

.modal-content label {
  margin-bottom: 6px;
  display: block;
}

.title {
  margin-bottom: 32px;
  color: #3b82f6;
  text-align: center;
}

.linha-horizontal {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.linha-horizontal input,
.linha-horizontal select {
  flex: 1;
  height: 50px;
  padding: 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  color: #7E7E7E;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.modal-actions button {
  width: 48%;
  height: 42px;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-confirmar {
  background-color: #1E3A8A;
  color: #fff;
}

.btn-confirmar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-cancelar {
  background-color: #F7F9FC;
  color: #7E7E7E;
}

.btn-cancelar:hover, .btn-confirmar:hover {
  opacity: 0.8;
}

input[type="time"]::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}

input[type="time"] {
  appearance: none;
  -moz-appearance: textfield;
}

h2 {
  text-align: center;
}
</style>
