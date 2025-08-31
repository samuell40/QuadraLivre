<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Horários do dia {{ data }}</h2>
      
      <div class="horarios-dia">
        <div v-for="h in horariosDia" :key="h.hora" 
          class="horario" 
          :class="h.agendamento ? 'agendado' : 'disponivel'">
          <span>{{ h.hora.toString().padStart(2,'0') }}:00</span>
          <span v-if="h.agendamento">
            {{ h.agendamento.usuario.nome }} ({{ h.agendamento.tipo }})
          </span>
          <span v-else>Disponível</span>
        </div>
      </div>

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'ListaAgendModal',
  props: {
    quadraId: { type: Number, required: true },
    data: { type: String, required: true }
  },
  data() {
    return {
      horariosDia: []
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(newVal) {
        if (this.quadraId && newVal) {
          this.carregarHorarios();
        }
      }
    }
  },
  methods: {
    async carregarHorarios() {
      // não tenta carregar se props inválidas
      if (!this.data || !this.quadraId) return;

      try {
        const [anoStr, mesStr, diaStr] = this.data.split('-');
        const ano = parseInt(anoStr, 10);
        const mes = parseInt(mesStr, 10);
        const dia = parseInt(diaStr, 10);

        if (isNaN(ano) || isNaN(mes) || isNaN(dia)) {
          console.error('Data inválida recebida no modal:', this.data);
          return;
        }

        const { data: agendamentos } = await api.get(
          `/agendamentos/quadra/${this.quadraId}/confirmados?ano=${ano}&mes=${mes}&dia=${dia}`
        );

        // cria todos os horários do dia (07h até 23h)
        const horarios = [];
        for (let h = 7; h <= 23; h++) {
          const agendamento = agendamentos.find(a => h >= a.hora && h < a.hora + a.duracao);
          horarios.push({ hora: h, agendamento: agendamento || null });
        }

        this.horariosDia = horarios;

      } catch (err) {
        console.error('Erro da API ao carregar horários:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os horários desse dia.',
          confirmButtonColor: '#1E3A8A'
        });
      }
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
  padding: 2rem;
  border-radius: 10px;
  width: 420px;
  max-height: 80vh;
  overflow-y: auto;
}

.horarios-dia {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.horario {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.horario span:first-child {
  font-weight: bold;
}

.horario.agendado {
  background-color: #3B82F6;
  color: #fff;
}

.horario.disponivel {
  background-color: #D1FAE5; /* verde claro */
  color: #065F46;
}

.btn-cancelar {
  margin-top: 1.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar:hover { background-color: #2563EB; }

.abrir-modal-dia input[type="date"] {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.btn-consultar {
  padding: 6px 14px;
  background-color: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.btn-consultar:hover { background-color: #2563EB; }
</style>
