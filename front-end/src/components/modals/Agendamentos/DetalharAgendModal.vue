<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Detalhes do Agendamento</h2>

      <h3>{{ agendamento.titulo }}</h3>
      <p><strong>Realizado por:</strong> {{ agendamento.usuario }}</p>
      <p>
        <strong>Data:</strong> {{ agendamento.data }} 
        às {{ agendamento.hora.toString().padStart(2,'0') }}:00
      </p>
      <p><strong>Duração:</strong> {{ agendamento.duracao }} hora(s)</p>
      <p><strong>Tipo:</strong> {{ agendamento.tipo }}</p>
      <p><strong>Time:</strong> {{ agendamento.usuario?.times?.[0]?.time?.nome || 'Não vinculado' }}</p>

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "DetalheAgendModal",
  props: {
    agendamento: { type: Object, required: true }
  },
  computed: {
    nomeTime() {
      const times = this.agendamento.usuario?.times;
      if (times && times.length > 0 && times[0].time?.nome) {
        return times[0].time.nome;
      }
      return 'Não vinculado';
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}
h2 { color: #3B82F6; margin-bottom: 1rem; }
.btn-cancelar {
  margin-top: 10px;
  padding: 0.5rem 1rem;
  background-color: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.btn-cancelar:hover { background-color: #2563EB; }
</style>