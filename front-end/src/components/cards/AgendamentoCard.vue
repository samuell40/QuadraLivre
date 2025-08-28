<template>
  <div class="card">
    <div class="header">
      <div class="quadra-info">
        <h3>{{ agendamento.quadra.nome }}</h3>
      </div>
    </div>
    <p>Realizado por: <strong>{{ agendamento.usuario.nome }}</strong></p>
    <p>Data: <strong>{{ formatarData(agendamento) }}</strong></p>
    <p>Hora: <strong>{{ agendamento.hora }}:00</strong></p>
    <p>Duração: <strong>{{ agendamento.duracao }} hora(s)</strong></p>
    <p>Tipo: <strong>{{ agendamento.tipo }}</strong></p>

    <div class="buttons" v-if="!readonly && agendamento.status === 'Pendente'">
      <button @click="aceitar">Aceitar</button>
      <button @click="recusar">Recusar</button>
    </div>

    <p v-else>Status: <strong>{{ agendamento.status }}</strong></p>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  props: {
    agendamento: Object,
    readonly: { type: Boolean, default: false }
  },
  methods: {
    formatarData(ag) {
      return `${String(ag.dia).padStart(2,'0')}/${String(ag.mes).padStart(2,'0')}/${ag.ano}`;
    },
    async aceitar() {
      try {
        await api.patch(`/agendamento/${this.agendamento.id}/aceitar`);
        Swal.fire('Sucesso', 'Agendamento confirmado!', 'success');
        this.$emit('atualizar');
      } catch (err) {
        Swal.fire('Erro', err.response?.data?.error || 'Falha ao confirmar agendamento', 'error');
      }
    },
    async recusar() {
      try {
        await api.patch(`/agendamento/${this.agendamento.id}/recusar`);
        Swal.fire('Sucesso', 'Agendamento recusado!', 'success');
        this.$emit('atualizar');
      } catch (err) {
        Swal.fire('Erro', err.response?.data?.error || 'Falha ao recusar agendamento', 'error');
      }
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.quadra-foto {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
}

.quadra-info h3 {
  color: #1E3A8A;
  font-weight: bolder;
  margin: 0;
}

.quadra-info p {
  color: #7E7E7E;
  margin: 2px 0 0 0;
}

.usuario {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.usuario-foto {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
}

p {
  color: #7E7E7E;
  margin: 4px 0;
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

  .header, .usuario {
    flex-direction: column;
    align-items: flex-start;
  }

  .quadra-foto, .usuario-foto {
    margin-bottom: 6px;
    margin-right: 0;
  }
}
</style>
