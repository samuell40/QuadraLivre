<template>
  <div class="card">
    <h3>{{ agendamento.quadra }}</h3>
    <p>Realizado por: <strong>{{ agendamento.usuario }}</strong></p>
    <p>Data: <strong>{{ agendamento.data }}</strong></p>
    <p>Hora: <strong>{{ agendamento.hora }}</strong></p>
    <div class="buttons ">
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
  }
}
</script>

<style scoped>
.card {
  width: 100%;
  box-sizing: border-box;
  padding: 24px;
  margin-bottom: 12px;
}

.buttons {
 margin-top: 12px;
}

.title {
 color: #1E3A8A;
}

h3 {
 color: #1E3A8A;
 font-weight: bolder;
 margin-bottom: 20px;
}

p {
 color: #7E7E7E;
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
    display: flex;          
    flex-direction: column; 
    gap: 10px;             
  }

  .buttons button {
    width: 100%; 
    margin: 0;  
  }
}
</style>
