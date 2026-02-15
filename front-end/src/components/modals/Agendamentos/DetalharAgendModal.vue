<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="titulo_h2">Detalhes do Agendamento</h2>

      <div class="detalhes-box">
        <h3 class="subtitulo_h3">{{ agendamento.tipo || 'Agendamento' }}</h3>

        <p><strong>Realizado por:</strong> {{ agendamento.usuario?.nome || 'Usuário desconhecido' }}</p>

        <p>
          <strong>Data:</strong> {{ formatarDataHora(agendamento) }}
        </p>

        <p><strong>Duração:</strong> {{ agendamento.duracao }} hora(s)</p>
        <p><strong>Tipo:</strong> {{ agendamento.tipo }}</p>

        <p><strong>Time:</strong> {{ agendamento.time?.nome || 'Não vinculado' }}</p>
        <p><strong>Código de Verificação:</strong> {{ agendamento.codigoVerificacao || 'N/A' }}</p>

        <div v-if="agendamento.motivoRecusa" class="alerta-recusa">
          <strong>Motivo da Recusa:</strong> {{ agendamento.motivoRecusa }}
        </div>
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
  methods: {
    formatarDataHora(ag) {
      if (ag.datahora) {
        const dataObj = new Date(ag.datahora);

        return dataObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) + ' às ' + dataObj.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      const dia = String(ag.dia).padStart(2, '0');
      const mes = String(ag.mes).padStart(2, '0');
      const ano = ag.ano;
      const hora = String(ag.hora).padStart(2, '0');

      return `${dia}/${mes}/${ano} às ${hora}:00`;
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
  z-index: 999;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.detalhes-box {
  border: 2px solid #3B82F6;
  border-radius: 10px;
  padding: 20px;
  margin-top: 12px;
  margin-bottom: 20px;
}

.detalhes-box p {
  margin: 10px 0;
  font-size: 16px;
  color: #374151;
}

.titulo_h2 {
  color: #3B82F6;
  font-size: 30px;
  margin-bottom: 1rem;
  text-align: left;
}

.subtitulo_h3 {
  color: #3B82F6;
  font-size: 20px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
}

.btn-cancelar {
  display: block;
  width: 100%;
  margin-top: 15px;
  background-color: #3b82f6;
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancelar:hover {
  background-color: #2563EB;
}

.alerta-recusa {
  margin-top: 10px;
  padding: 10px;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 6px;
  font-size: 14px;
}
</style>