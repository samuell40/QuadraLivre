<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Horários da Quadra</h2>

      <div class="dias-wrapper">
        <div v-for="d in datas" :key="`${d.ano}-${d.mes}-${d.dia}`" class="dia-container">
          <h3>{{ formatarData(d) }}</h3>

          <div class="horarios-linha">
            <div v-for="h in horariosPorDia[`${d.ano}-${d.mes}-${d.dia}`]" :key="h.hora" class="horario"
              :class="h.agendamento ? 'agendado' : 'disponivel'"
              @click="h.agendamento && selecionarAgendamento(h.agendamento)">

              <span>{{ obterHorarioLabel(h.hora, h.agendamento) }}</span>

              <span v-if="h.agendamento" class="nome-agendamento-sm">
                {{ h.agendamento.usuarioNome }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DetalheAgendModal v-if="agendamentoSelecionado" :agendamento="agendamentoSelecionado"
        @fechar="agendamentoSelecionado = null" />

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar</button>
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
          const agendamento = agendamentos.find(a => h >= a.hora && h < a.hora + (a.duracao || 1));

          if (agendamento) {
            agendamento.usuarioNome = agendamento.usuario?.nome || agendamento.usuario || 'Usuário';
            agendamento.timeNome = agendamento.time?.nome || 'Não vinculado';
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

    obterHorarioLabel(horaGrid, agendamento) {
      if (agendamento && agendamento.datahora) {
        const d = new Date(agendamento.datahora);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }

      return `${String(horaGrid).padStart(2, '0')}:00`;
    },

    selecionarAgendamento(agendamento) {
      this.agendamentoSelecionado = agendamento;
    },
    formatarData(d) {
      return `${String(d.dia).padStart(2, '0')}/${String(d.mes).padStart(2, '0')}/${d.ano}`;
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
  padding: 1.5rem;
  border-radius: 10px;
  width: 900px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h2 {
  font-size: 30px;
  color: #3b82f6;
}

.dia-container h3 {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.dia-container {
  padding: 12px 0;
}

.dias-wrapper {
  border: 2px solid #3B82F6;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  background-color: #ffffff;
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

.nome-agendamento-sm {
  display: block;
  font-size: 10px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.9;
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
