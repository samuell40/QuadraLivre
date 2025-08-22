<template> 
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <!-- Escolha da data -->
      <label for="data"><strong>Escolha a data:</strong></label>
      <input type="date" v-model="data" :min="minDate" :max="maxDate" />

      <!-- Escolha da hora e duração -->
      <label for="hora"><strong>Escolha a hora e duração:</strong></label>
      <div class="linha-horizontal">
        <input type="time" v-model="hora" min="07:00" max="23:59" />
        <select v-model="duracao" class="select-tempo">
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
          :disabled="!data || !hora || !duracao || !tipo"
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

export default {
  name: 'AgendamentoVoleiModal',
  props: {
    quadra: Object
  },
  data() {
    const hoje = new Date()
    const umAno = new Date()
    umAno.setFullYear(hoje.getFullYear() + 1)

    return {
      data: '',
      hora: '',
      duracao: '',  // duração em horas (1 ou 2)
      tipo: '',     // PARTIDA | TREINO | EVENTO | OUTRO
      minDate: hoje.toISOString().split('T')[0],
      maxDate: umAno.toISOString().split('T')[0]
    }
  },
  methods: {
    confirmar() {
      if (!this.data || !this.hora || !this.duracao || !this.tipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obrigatórios',
          text: 'Preencha data, hora, duração e tipo de agendamento.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const agora = new Date()
      const dataSelecionada = new Date(`${this.data}T${this.hora}`)
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Validações
      if (dataSelecionada < hoje) {
        Swal.fire({
          icon: 'error',
          title: 'Data inválida',
          text: 'Não é possível agendar para datas anteriores a hoje.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const limite = new Date()
      limite.setFullYear(limite.getFullYear() + 1)
      if (dataSelecionada > limite) {
        Swal.fire({
          icon: 'error',
          title: 'Data muito distante',
          text: 'Você não pode agendar para mais de 1 ano no futuro.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const [h, m] = this.hora.split(':')
      const horaSelecionada = parseInt(h) * 60 + parseInt(m)
      const horaMin = 7 * 60
      const horaMax = 23 * 60 + 59
      if (horaSelecionada < horaMin || horaSelecionada > horaMax) {
        Swal.fire({
          icon: 'error',
          title: 'Horário inválido',
          text: 'Escolha um horário entre 07:00 e 23:59.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const diffHoras = (dataSelecionada - agora) / (1000 * 60 * 60)
      if (diffHoras < 24) {
        Swal.fire({
          icon: 'error',
          title: 'Agendamento muito próximo',
          text: 'Você só pode agendar com pelo menos 24 horas de antecedência.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      // Confirmação
      Swal.fire({
        icon: 'success',
        title: 'Agendamento confirmado!',
        text: `Local: ${this.quadra?.nome} às ${this.hora} do dia ${this.data} por ${this.duracao} hora(s) [${this.tipo}]`,
        confirmButtonColor: '#1E3A8A',
        timer: 4000,
        showConfirmButton: false,
        timerProgressBar: true
      })

      // Emissão para o backend
      this.$emit('confirmar', {
        usuarioId: this.$store.state.usuario.id,
        dia: parseInt(this.data.split('-')[2]),
        mes: parseInt(this.data.split('-')[1]),
        ano: parseInt(this.data.split('-')[0]),
        hora: parseInt(this.hora.split(':')[0]),
        duracao: parseInt(this.duracao),
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
