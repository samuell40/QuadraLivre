<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Horários do dia {{ data }}</h2>
      
      <div class="horarios-dia">
        <div 
          v-for="h in horariosDia" 
          :key="h.hora" 
          class="horario-wrapper"
        >
          <div 
            class="horario" 
            :class="h.agendamento ? 'agendado' : 'disponivel'"
            @click="h.agendamento && selecionarAgendamento(h.agendamento)"
          >
            <span>{{ h.hora.toString().padStart(2,'0') }}:00</span>
            <span v-if="h.agendamento">
              {{ h.agendamento.usuario?.times[0]?.time?.nome || 'Sem time' }} 
              ({{ h.agendamento.tipo }})
            </span>
            <span v-else>Disponível</span>
          </div>

          <!-- Card de detalhes logo abaixo do horário clicado -->
          <div 
            v-if="agendamentoSelecionado && agendamentoSelecionado.id === h.agendamento?.id" 
            class="detalhes-agendamento"
          >
            <h3>{{ agendamentoSelecionado.titulo || 'Agendamento' }}</h3>
            <p><strong>Realizado por:</strong> {{ agendamentoSelecionado.usuario.nome }}</p>
            <p>
              <strong>Data:</strong> {{ data }} 
              às {{ agendamentoSelecionado.hora.toString().padStart(2,'0') }}:00
            </p>
            <p><strong>Duração:</strong> {{ agendamentoSelecionado.duracao }} hora(s)</p>
            <p><strong>Tipo:</strong> {{ agendamentoSelecionado.tipo }}</p>
            <p>
              <strong>Time:</strong> {{ agendamentoSelecionado.usuario?.times[0]?.time?.nome || 'Sem time' }}
            </p>
            <button class="btn-cancelar" @click="agendamentoSelecionado = null">Fechar Detalhes</button>
          </div>
        </div>
      </div>

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar Modal</button>
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
      horariosDia: [],
      agendamentoSelecionado: null
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
    },
    selecionarAgendamento(agendamento) {
      this.agendamentoSelecionado = agendamento;
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

.horario-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.horario {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.horario.agendado {
  background-color: #3B82F6;
  color: #fff;
}

.horario.disponivel {
  background-color: #D1FAE5;
  color: #065F46;
}

.detalhes-agendamento {
  padding: 10px;
  border: 1px solid #3B82F6;
  border-radius: 8px;
  background-color: #eff6ff;
}

.btn-cancelar {
  margin-top: 10px;
  padding: 0.6rem 1.2rem;
  background-color: #3B82F6;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancelar:hover { background-color: #2563EB; }
</style>
