<template>
  <div class="card">
    <div class="header">
      <div class="quadra-info">
        <h3>{{ agendamento.quadra.nome }}</h3>
      </div>
    </div>

    <p>Realizado por: <strong>{{ agendamento.usuario }}</strong></p>
    <p>Time: <strong>{{ agendamento.time }}</strong></p>
    <p><strong>{{ formatarData(agendamento) }}</strong>, às <strong>{{ agendamento.hora }}:00</strong></p>
    <p>Duração: <strong>{{ agendamento.duracao }} hora(s)</strong></p>
    <p>Tipo: <strong>{{ agendamento.tipo }}</strong></p>
    <p>
      Código de Verificação: <strong class="codigo-texto">{{ agendamento.codigoVerificacao || 'N/A' }}</strong>
    </p>

    <div v-if="loading" class="overlay-loader">
      <div class="loader"></div>
    </div>
    <div v-else>
      <div v-if="!readonly && agendamento.status === 'Pendente'" class="buttons">
        <button @click="confirmar">Aceitar</button>
        <button @click="recusar">Recusar</button>
      </div>
      <p v-else>Status: <strong>{{ agendamento.status }}</strong></p>
    </div>

    <p v-if="(agendamento.status === 'Recusado' || agendamento.status === 'recusado') && agendamento.motivoRecusa"
      class="motivo-recusa">
      Motivo da recusa: <strong>{{ agendamento.motivoRecusa }}</strong>
    </p>
  </div>
</template>

<script>
export default {
  props: {
    agendamento: Object,
    readonly: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ["confirmar", "recusar"],
  methods: {
    formatarData(ag) {
      return `${String(ag.dia).padStart(2, '0')}/${String(ag.mes).padStart(2, '0')}/${ag.ano}`;
    },
    confirmar() {
      this.$emit("confirmar");
    },
    recusar() {
      this.$emit("recusar");
    }
  }
};
</script>

<style scoped>
.card {
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  font-family: 'Montserrat', sans-serif;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.quadra-info h3 {
  color: #3b82f6;
  font-weight: bolder;
  margin: 0;
}

p {
  color: #7E7E7E;
  margin: 4px 0;
}

.codigo-texto {
  color: #1e3a8a;
  letter-spacing: 1.5px;
  font-weight: 800;
}

.motivo-recusa {
  margin: 4px 0;
  color: #7e7e7e;
}

.buttons {
  margin-top: 12px;
  display: flex;
}

button {
  width: 49%;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  opacity: 0.8;
}

button:first-child {
  background-color: #3b82f6;
  color: white;
  margin-right: 12px;
}

button:last-child {
  background-color: #F3F3F3;
  color: #7E7E7E;
}

.overlay-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.overlay-loader .loader {
  width: 40px;
  height: 40px;
  border: 5px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .buttons {
    flex-direction: column;
    gap: 10px;
  }

  .buttons button {
    width: 100%;
    margin: 0;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>