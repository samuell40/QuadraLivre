<template>
  <div class="card">
    <h3>{{ agendamento.quadra.nome }}</h3>
    <p>
      Realizado por: 
      <strong>{{ agendamento.usuario.nome }} ({{ agendamento.usuario.email }})</strong>
    </p>
    <p>
      Endereço: <strong>{{ agendamento.quadra.endereco }}</strong>
    </p>
    <p>
      Data: <strong>{{ formatarData(agendamento) }}</strong>
    </p>
    <p>
      Hora: <strong>{{ agendamento.hora }}:00</strong>
    </p>
    <div class="buttons">
      <button>Aceitar</button>
      <button>Recusar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgendamentoCard',
  props: {
    agendamento: Object
  },
  methods: {
    formatarData(ag) {
      // Formata para DD/MM/AAAA
      return `${String(ag.dia).padStart(2,'0')}/${String(ag.mes).padStart(2,'0')}/${ag.ano}`;
    }
  }
}
</script>

<style scoped>
.card {
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.buttons {
  margin-top: 12px;
  display: flex;
}

h3 {
  color: #1E3A8A;
  font-weight: bolder;
  margin-bottom: 10px;
}

p {
  color: #7E7E7E;
  margin: 4px 0;
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
  background-color: #1E3A8A;
  color: white;
  margin-right: 12px;
}

button:last-child {
  background-color: #F3F3F3;
  color: #7E7E7E;
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
}
</style>
