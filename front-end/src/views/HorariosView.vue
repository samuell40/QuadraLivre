<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Horário Semanal da Quadra</h1>
        <NavBarUse />
        <!-- Dropdown Quadras -->
        <select v-model="quadraSelecionada" @change="buscarHorarios" class="select-quadra">
          <option v-for="quadra in quadras" :key="quadra.id" :value="quadra.id">
            {{ quadra.nome }}
          </option>
        </select>
      </div>

      <!-- Tabela de horários com loader -->
      <div class="tabela-container">
        <div v-if="isLoading" class="loader-overlay">
          <div class="loader"></div>
        </div>

        <!-- Tabela -->
        <table v-if="!isLoading" class="tabela-horarios">
          <thead>
            <tr>
              <th class="col-hora">Hora</th>
              <th v-for="(dia, index) in diasSemana" :key="index">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hora, idx) in horarios" :key="hora" :class="idx % 2 === 0 ? 'linha-branca' : 'linha-cinza'">
              <td class="col-hora">{{ hora }}</td>
              <td v-for="(dia, index) in diasSemana" :key="dia + hora" :class="{
                reservado: agenda[`${index}-${hora}`]?.time || agenda[`${index}-${hora}`]?.usuario,
                disponivel: !agenda[`${index}-${hora}`]
              }" @click="agenda[`${index}-${hora}`] && (agendamentoSelecionado = agenda[`${index}-${hora}`])">
                <span v-if="agenda[`${index}-${hora}`]">
                  <span v-if="agenda[`${index}-${hora}`].time">
                    Time: {{ agenda[`${index}-${hora}`].time }}
                  </span>
                  <span v-else>
                    Usuário: {{ agenda[`${index}-${hora}`].usuario }}
                  </span>
                </span>
                <span v-else>Disponível</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="isLoading" class="loader-spacer"></div>
      </div>
    </div>

    <!-- Modal de detalhe do agendamento -->
    <DetalheAgendModal v-if="agendamentoSelecionado" :agendamento="agendamentoSelecionado"
      @fechar="agendamentoSelecionado = null" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { startOfWeek, addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import api from "@/axios";
import SideBar from "@/components/SideBar.vue";
import NavBarUse from '@/components/NavBarUser.vue'
import DetalheAgendModal from "@/components/modals/Agendamentos/DetalharAgendModal.vue";

export default {
  name: "HorariosView",
  components: { SideBar, NavBarUse, DetalheAgendModal },
  setup() {
    const quadras = ref([]);
    const quadraSelecionada = ref(null);
    const agenda = ref({});
    const isLoading = ref(false);
    const agendamentoSelecionado = ref(null);

    const hoje = new Date();
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });

    // Dias semana no formato: Segunda, 08/09
    const diasSemana = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(inicioSemana, i);
      const diaStr = format(d, 'dd/MM');
      const nomeDia = format(d, 'EEEE', { locale: ptBR });
      return nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1) + ', ' + diaStr;
    });

    // Horários 7h às 23h
    const horarios = Array.from({ length: 17 }).map((_, i) => {
      const inicio = 7 + i;
      const fim = inicio + 1;
      return `${String(inicio).padStart(2, "0")}:00 - ${String(fim).padStart(2, "0")}:00`;
    });

    const buscarQuadras = async () => {
      try {
        const { data } = await api.get("/quadra");
        quadras.value = data;
        if (data.length > 0) {
          quadraSelecionada.value = data[0].id;
          buscarHorarios();
        }
      } catch (error) {
        console.error("Erro ao carregar quadras", error.response?.data || error);
      }
    };

    const buscarHorarios = async () => {
      if (!quadraSelecionada.value) return;
      isLoading.value = true;
      try {
        const { data } = await api.get(
          `/agendamentos/quadra/${quadraSelecionada.value}/confirmados/semana`
        );

        const novaAgenda = {};
        data
          .filter(a => a.status === 'Confirmado' || a.status === 'confirmado')
          .forEach(a => {
            const dataAgendamento = new Date(a.ano, a.mes - 1, a.dia);
            const diffDias = Math.floor(
              (dataAgendamento - inicioSemana) / (1000 * 60 * 60 * 24)
            );
            if (diffDias >= 0 && diffDias < 7) {
              for (let i = 0; i < (a.duracao ?? 1); i++) {
                const horaInicio = a.hora + i;
                const chave = `${diffDias}-${String(horaInicio).padStart(2, '0')}:00 - ${String(horaInicio + 1).padStart(2, '0')}:00`;
                novaAgenda[chave] = {
                  ...a,
                  time: a.time?.nome || null,
                  usuario: a.usuario.nome
                };
              }
            }
          });
        agenda.value = novaAgenda;
      } catch (err) {
        console.error("Erro ao carregar horários", err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      buscarQuadras();
    });

    return {
      diasSemana,
      horarios,
      quadras,
      quadraSelecionada,
      agenda,
      isLoading,
      agendamentoSelecionado,
      buscarHorarios
    };
  },
};
</script>

<style scoped>
.layout {
  display: flex;
}

.conteudo {
  flex: 1;
  margin-left: 260px;
  padding: 20px;
}

.topo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.title {
  margin-top: 20px;
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
}

.select-quadra {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  font-size: 14px;
}

.tabela-container {
  overflow-x: auto;
  position: relative;
  min-height: 300px;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.tabela-horarios {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
}

.tabela-horarios th {
  background-color: #1E3A8A;
  color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
}

.tabela-horarios td {
  border: 1px solid #ddd;
  padding: 8px;
}

.col-hora {
  font-weight: 600;
}

.disponivel {
  color: #6b7280;
}

.reservado {
  color: #2563eb;
  font-weight: 600;
}

.reservado:hover {
  cursor: pointer;
  text-decoration: underline;
}

.linha-branca {
  background-color: #ffffff;
}

.linha-cinza {
  background-color: #f5f5f5;
}
</style>
