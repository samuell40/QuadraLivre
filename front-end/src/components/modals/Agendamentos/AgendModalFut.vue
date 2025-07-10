<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <label for="data"><strong>Escolha a data:</strong></label>
      <input type="date" v-model="data" :min="minDate" :max="maxDate" />

      <label for="hora"><strong>Escolha a hora:</strong></label>
      <input type="time" v-model="hora" min="07:00" max="23:00" />

      <div class="modal-actions">
        <button @click="confirmar" class="btn-confirmar" :disabled="!data || !hora">Confirmar</button>
        <button @click="$emit('fechar')" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'

export default {
  name: 'AgendamentoFutebolModal',
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
      minDate: hoje.toISOString().split('T')[0],
      maxDate: umAno.toISOString().split('T')[0]
    }
  },
  methods: {
    confirmar() {
      if (!this.data || !this.hora) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obrigatórios',
          text: 'Preencha todos os campos para agendar.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const agora = new Date()
      const dataSelecionada = new Date(`${this.data}T${this.hora}`)

      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      // Validação: data não pode ser no passado
      if (dataSelecionada < hoje) {
        Swal.fire({
          icon: 'error',
          title: 'Data inválida',
          text: 'Não é possível agendar para datas anteriores a hoje.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      // Validação: não pode agendar com mais de 1 ano de antecedência
      const limite = new Date()
      limite.setFullYear(limite.getFullYear() + 1)
      if (dataSelecionada > limite) {
        Swal.fire({
          icon: 'error',
          title: 'Data muito distante',
          text: 'Você não pode agendar para mais de 1 ano a frente da data atual.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      // Validação: horário permitido (entre 07:00 e 00:00)
      const [h, m] = this.hora.split(':')
      const horaSelecionada = parseInt(h) * 60 + parseInt(m)
      const horaMin = 7 * 60
      const horaMax = (23 * 60) + 1
      if (horaSelecionada < horaMin || horaSelecionada >= horaMax) {
        Swal.fire({
          icon: 'error',
          title: 'Horário inválido',
          text: 'Escolha um horário entre 07:00 e 23:00.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      // Validação: com no mínimo 24h de antecedência
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

      // Agendamento confirmado
      Swal.fire({
        icon: 'success',
        title: 'Agendamento confirmado!',
        text: `Local: ${this.quadra?.nome} às ${this.hora} do dia ${this.data}`,
        confirmButtonColor: '#1E3A8A',
        timer: 5000,
        showConfirmButton: false,
        timerProgressBar: true
      })

      this.$emit('confirmar', {
        quadra: this.quadra,
        data: this.data,
        hora: this.hora
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
  padding: 24px 56px;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 500px;
  height: 55%;
}

.modal-content input {
  color: #7E7E7E;
  height: 50px;
  padding: 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
}

.modal-content input:first-of-type {
  margin-bottom: 20px;
}

.modal-content input:nth-of-type(2) {
  margin-bottom: 24px;
}

.modal-content label {
  margin-bottom: 6px;
}

.title {
  margin-bottom: 32px;
  color: #3b82f6;
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
