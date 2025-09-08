<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Horários da Quadra</h2>

      <div v-for="d in datas" :key="`${d.ano}-${d.mes}-${d.dia}`" class="dia-container">
        <h3>{{ formatarData(d) }}</h3>
        <div class="horarios-linha">
          <div 
            v-for="h in horariosPorDia[`${d.ano}-${d.mes}-${d.dia}`]" 
            :key="h.hora" 
            class="horario"
            :class="h.agendamento ? 'agendado' : 'disponivel'"
            @click="h.agendamento && selecionarAgendamento(h.agendamento)"
          >
            <span>{{ h.hora.toString().padStart(2,'0') }}:00</span>
          </div>
        </div>
      </div>

      <!-- Modal de detalhe do agendamento -->
      <DetalheAgendModal 
        v-if="agendamentoSelecionado" 
        :agendamento="agendamentoSelecionado" 
        @fechar="agendamentoSelecionado = null"
      />

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar Modal</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';
import DetalheAgendModal from './DetalharAgendModal.vue';

export default {
  name: 'ListaAgendModal',
  props: {
    quadraId: { type: Number, required: true },
    datas: { type: Array, required: true }
  },
  data() {
    return {
      horariosPorDia: {},
      agendamentoSelecionado: null
    };
  },
  components: { DetalheAgendModal },
  watch: {
    datas: {
      immediate: true,
      handler(newVal) {
        if (this.quadraId && newVal && newVal.length) {
          this.carregarTodosHorarios();
        }
      }
    }
  },
  methods: {
    async carregarTodosHorarios() {
      this.horariosPorDia = {};
      for (const data of this.datas) {
        await this.carregarHorarios(data);
      }
    },
    async carregarHorarios(data) {
      try {
        const { ano, mes, dia } = data;

        const { data: agendamentos } = await api.get(
          `/agendamentos/quadra/${this.quadraId}/confirmados`,
          { params: { ano, mes, dia } }
        );

        const horarios = [];
        for (let h = 7; h <= 23; h++) {
          const agendamento = agendamentos.find(a => h >= a.hora && h < a.hora + a.duracao);
          if (agendamento) {
            agendamento.usuario = agendamento.usuario.nome;
            agendamento.time = agendamento.time?.nome || 'Não vinculado';
          }
          horarios.push({ hora: h, agendamento: agendamento || null, data });
        }

        this.horariosPorDia[`${ano}-${mes}-${dia}`] = horarios;

      } catch (err) {
        console.error('Erro da API ao carregar horários:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: `Não foi possível carregar os horários de ${data.dia}/${data.mes}/${data.ano}.`,
          confirmButtonColor: '#1E3A8A'
        });
      }
    },
    selecionarAgendamento(agendamento) {
      this.agendamentoSelecionado = agendamento;
    },
    formatarData(d) {
      return `${String(d.dia).padStart(2,'0')}/${String(d.mes).padStart(2,'0')}/${d.ano}`;
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
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #3B82F6;
  margin-bottom: 1rem;
}

.dia-container h3 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.dia-container {
  margin-bottom: 1rem;
}

.horarios-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.horario {
  flex: 0 0 70px;
  height: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  font-weight: 200;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.horario.agendado {
  background-color: #3B82F6;
  color: #fff;
} 

.horario.disponivel {
  background-color: #E5E7EB;
  color: #111827;
}

.detalhes-agendamento {
  padding: 10px;
  border: 1px solid #3B82F6;
  border-radius: 8px;
  background-color: #eff6ff;
  margin: 10px 0;
}

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
