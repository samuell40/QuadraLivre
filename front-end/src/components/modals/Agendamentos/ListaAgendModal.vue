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

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar</button>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'ListaAgendModal',
  emits: ['fechar', 'ver-detalhes'],
  props: {
    quadraId: { type: Number, required: true },
    datas: { type: Array, required: true }
  },
  data() {
    return {
      horariosPorDia: {}
    };
  },
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
            agendamento.timeNome = agendamento.time?.nome || 'Nao vinculado';
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
      this.$emit('ver-detalhes', agendamento);
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
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
}

.modal-content {
  width: min(900px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable both-edges;
  background: #fff;
  padding: 32px 36px;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.modal-content h2 {
  margin: 0 0 14px;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.3px;
  color: #3b82f6;
}

.dias-wrapper {
  margin-top: 16px;
  border-radius: 16px;
  padding: 18px;
  background: #f8fbff;
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.05);
}

.dia-container {
  padding: 14px 0;
}

.dia-container h3 {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.horarios-linha {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.horario {
  flex: 0 0 74px;
  height: 44px;
  padding: 6px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  font-weight: 800;
  cursor: default;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.horario.disponivel {
  background: #f1f5f9;
  color: #334155;
  cursor: default;
}

.horario.disponivel:hover {
  border-color: rgba(59, 130, 246, 0.25);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.06);
}

.horario.agendado {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.18);
  cursor: pointer;
}

.horario.agendado:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.26);
}

.horario.agendado:active {
  transform: translateY(0);
}

.nome-agendamento-sm {
  display: block;
  font-size: 10px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.95;
  max-width: 100%;
}

.detalhes-agendamento {
  padding: 10px 12px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 12px;
  background: #f8fbff;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.05);
  margin: 10px 0;
}

.btn-cancelar {
  width: 100%;
  margin-top: 18px;
  padding: 12px 16px;
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.18);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btn-cancelar:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.24);
  filter: brightness(0.98);
}

.btn-cancelar:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .modal-content {
    padding: 18px 16px;
    border-radius: 14px;
    scrollbar-gutter: auto;
  }

  .modal-content h2 {
    font-size: 24px;
  }

  .dias-wrapper {
    padding: 14px;
    border-radius: 14px;
  }

  .horario {
    flex: 0 0 72px;
    height: 44px;
    border-radius: 12px;
  }
}
</style>

