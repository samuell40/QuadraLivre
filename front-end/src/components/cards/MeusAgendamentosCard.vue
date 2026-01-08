<template>
  <div class="card">
    <h3>{{ agendamento.quadra }}</h3>
    <p> Data:
      <strong>{{ agendamento.data }}</strong>, às <strong>{{ agendamento.hora }}</strong>
    </p>
    <p>Duração: <strong>{{ agendamento.duracao }} hora(s)</strong></p>
    <p>Tipo: <strong>{{ agendamento.tipo }}</strong></p>

    <p>
      Status:
      <span class="status" :class="agendamento.status">
        {{ agendamento.status }}
      </span>
    </p>

    <div class="buttons" v-if="mostrarBotoes">
      <button 
        v-if="agendamento.status !== 'confirmado'" 
        @click="$emit('cancelar', agendamento.id)"
      >
        Cancelar Agendamento
      </button>
      <button class="novo" @click="$emit('novo')">Novo Agendamento</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MeusAgendamentoCard',
  props: {
    agendamento: Object,
    mostrarBotoes: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    console.log(this.agendamento);
  }
}
</script>

<style scoped>
.card {
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Montserrat', sans-serif;
}

h3 {
  color: #1e3a8a;
  font-weight: bold;
  margin-bottom: 10px;
}

p {
  color: #7e7e7e;
  margin: 4px 0;
}

.status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  text-transform: capitalize;
  font-size: 13px;
  margin-left: 8px;
  color: #5F5F5F;
}

.status.pendente {
  background-color: #fdfd96;
  border: 2px solid #e6e666;
}

.status.confirmado {
  background-color: #bdecb6;
  border: 2px solid #91c98b;
}

.status.recusado {
  background-color: #ff6961;
  border: 2px solid #d94d47;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
}

button:hover {
  opacity: 0.8;
}

button.cancelar {
  background-color: #1e3a8a;
  color: white;
}

button.novo {
  background-color: #3b82f6;
  color: white;
}
</style>
