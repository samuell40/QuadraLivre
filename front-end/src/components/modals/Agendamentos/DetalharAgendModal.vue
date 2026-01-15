<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Detalhes do Agendamento</h2>

      <div class="detalhes-box">
        <h3>{{ agendamento.titulo }}</h3>

        <p><strong>Realizado por:</strong> {{ agendamento.usuario }}</p>

        <p>
          <strong>Data:</strong> {{ agendamento.data }}
          às {{ agendamento.hora.toString().padStart(2, '0') }}:00
        </p>

        <p><strong>Duração:</strong> {{ agendamento.duracao }} hora(s)</p>
        <p><strong>Tipo:</strong> {{ agendamento.tipo }}</p>
        <p><strong>Time:</strong> {{ agendamento.usuario?.times?.[0]?.time?.nome || 'Não vinculado' }}</p>
      </div>

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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 100vh;
  overflow-y: auto;
}

.detalhes-box {
  border: 2px solid #3B82F6;
  border-radius: 10px;
  padding: 16px;
  margin-top: 12px;
  margin-bottom: 20px;
}

h2 {
  color: #3B82F6;
  margin-bottom: 1rem;
}

.btn-cancelar {
  margin-top: 15px;
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-cancelar:hover {
  background-color: #2563EB;
}
</style>