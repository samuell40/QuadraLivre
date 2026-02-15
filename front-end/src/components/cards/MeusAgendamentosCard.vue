<template>
  <div class="card">
    <button class="btn-pdf-topo" @click="$emit('gerarPdf', agendamento)" title="Baixar Comprovante">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
        <path
          d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
      </svg>
      Gerar Comprovante
    </button>

    <h3>{{ agendamento.quadra?.nome || agendamento.quadra || 'Quadra' }}</h3>

    <p> Data:
      <strong>{{ formatarData(agendamento) }}</strong>, às <strong>{{ formatarHora(agendamento) }}</strong>
    </p>

    <p>Duração: <strong>{{ agendamento.duracao }} hora(s)</strong></p>
    <p>Tipo: <strong>{{ agendamento.tipo }}</strong></p>

    <p>
      Status:
      <span class="status" :class="agendamento.status ? agendamento.status.toLowerCase() : ''">
        {{ agendamento.status }}
      </span>
    </p>

    <p v-if="agendamento.status === 'Confirmado' || agendamento.status === 'confirmado'">
      Código de Verificação: <strong class="codigo-texto">{{ agendamento.codigoVerificacao || 'N/A' }}</strong>
    </p>

    <p v-if="(agendamento.status === 'Recusado' || agendamento.status === 'recusado') && agendamento.motivoRecusa"
      class="motivo-recusa">
      Motivo da recusa: <strong>{{ agendamento.motivoRecusa }}</strong>
    </p>

    <div class="buttons" v-if="mostrarBotoes">
      <button v-if="agendamento.status !== 'Confirmado' && agendamento.status !== 'confirmado'"
        @click="$emit('cancelar', agendamento.id)" class="cancelar">
        Cancelar
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
  methods: {
    formatarData(ag) {
      if (ag.datahora) {
        return new Date(ag.datahora).toLocaleDateString('pt-BR');
      }
      if (ag.data) return ag.data;

      if (ag.dia && ag.mes && ag.ano) {
        return `${String(ag.dia).padStart(2, '0')}/${String(ag.mes).padStart(2, '0')}/${ag.ano}`;
      }
      return '--/--/----';
    },

    formatarHora(ag) {
      if (ag.datahora) {
        return new Date(ag.datahora).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      if (ag.hora !== undefined) {
        return `${String(ag.hora).padStart(2, '0')}:00`;
      }

      return '--:--';
    }
  }
}
</script>

<style scoped>
.card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Montserrat', sans-serif;
  position: relative;
}

.btn-pdf-topo {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.btn-pdf-topo:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

h3 {
  color: #1e3a8a;
  font-weight: bold;
  margin: 0 0 10px 0;
  padding-right: 180px;
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

.motivo-recusa {
  margin: 4px 0;
  color: #7e7e7e;
}

.codigo-texto {
  color: #1e3a8a;
  letter-spacing: 1.5px;
  font-weight: 800;
}

.buttons {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

button.cancelar,
button.novo {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  font-weight: 600;
  transition: all 0.2s;
}

button.cancelar:hover,
button.novo:hover {
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