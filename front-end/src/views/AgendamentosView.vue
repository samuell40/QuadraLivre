<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos da Minha Quadra</h1>

      <!-- Consultar horários compacto no topo -->
      <div class="consultar-horarios">
        <label for="data-horarios">Consultar horários:</label>
        <Datepicker
          v-model="dataSelecionada"
          :day-class="getDayClass"
          :enable-time-picker="false"
          @update:model-value="abrirModalDataSelecionada"
          :format="formatDate"
          placeholder="Escolha um dia"
        />
      </div>

      <!-- Loader -->
      <div v-if="isLoading" class="loader"></div>

      <!-- Conteúdo -->
      <div v-else>
        <!-- Pendentes -->
        <div v-if="agendamentosPendentes.length === 0">
          Nenhum agendamento pendente.
        </div>
        <div v-else class="agendamentos">
          <h4>Agendamentos Pendentes</h4>
          <AgendamentoCard
            v-for="ag in agendamentosPendentes"
            :key="ag.id"
            :agendamento="ag"
            :class="{ finalizado: ag.status === 'Finalizado' }"
            @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)"
          />
        </div>

        <!-- Modal de horários -->
        <ListaAgendModal
          v-if="modalAberto && modalData"
          :quadraId="quadraId"
          :data="modalData"
          @fechar="modalAberto = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import SideBar from "@/components/SideBar.vue";
import AgendamentoCard from "@/components/cards/AgendamentoCard.vue";
import ListaAgendModal from "@/components/modals/Agendamentos/ListaAgendModal.vue";
import api from "@/axios";
import Swal from "sweetalert2";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const agendamentos = ref([]);
const isLoading = ref(true);
const modalAberto = ref(false);
const modalData = ref('');
const quadraId = ref(null);

// Abre modal manualmente por data
const dataSelecionada = ref('');

// Carregar agendamentos da quadra
const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos/minha-quadra");
    agendamentos.value = data;
    if (data.length) quadraId.value = data[0].quadra.id;
  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Falha ao carregar agendamentos da quadra."
    });
  } finally {
    isLoading.value = false;
  }
};

const agendamentosPendentes = computed(() =>
  agendamentos.value.filter(a => a.status === "Pendente")
);

const datasComAgendamento = computed(() =>
  agendamentos.value.map(a => new Date(a.ano, a.mes - 1, a.dia))
);

// Marca os dias com agendamento no calendário
const getDayClass = (date) => {
  const existe = datasComAgendamento.value.some(d =>
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
  return existe ? 'dia-com-agendamento' : '';
};

const abrirModal = async (dia, mes, ano) => {
  modalData.value = `${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
  await nextTick();
  modalAberto.value = true;
};

const abrirModalDataSelecionada = () => {
  if (!dataSelecionada.value) return;
  const d = dataSelecionada.value;
  const ano = d.getFullYear();
  const mes = (d.getMonth() + 1).toString().padStart(2,'0');
  const dia = d.getDate().toString().padStart(2,'0');
  modalData.value = `${ano}-${mes}-${dia}`;
  modalAberto.value = true;
};

const formatDate = date => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

onMounted(() => carregarAgendamentos());
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px 75px;
  margin-left: 250px;
}

.consultar-horarios {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.consultar-horarios label {
  font-weight: 600;
  color: #3B82F6;
}

.agendamentos .agendamento-card {
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.agendamentos .agendamento-card.finalizado {
  background-color: #f3f4f6;
  border-left: 4px solid #6b7280;
  opacity: 0.8;
}

h1, h4 {
  color: #3B82F6;
}

h1 {
  font-weight: bold;
  font-size: 30px;
  margin-bottom: 10px;
}

h4 {
  margin-bottom: 16px;
}

.loader {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader::after {
  content: '';
  width: 50px;
  height: 50px;
  border: 5px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Datepicker */
:deep(.dp__input_wrap) {
  display: flex;
  align-items: center;
}

:deep(.dp__input_icon) {
  width: 18px;
  height: 18px;
  margin-left: 4px; 
}

:deep(.dp__menu) {
  width: auto;
  max-width: 280px;
  font-size: 0.85rem;
  padding: 8px;
  border-radius: 8px;
}

:deep(.dp__calendar) {
  min-width: 250px;
}

.vue-datepicker {
  width: 160px;
  font-size: 0.85rem;
}

.vue-datepicker input {
  padding: 4px 8px;      
  font-size: 0.85rem;
}

.vue-datepicker__calendar {
  font-size: 0.8rem;
  width: 240px;
}

.vue-datepicker__calendar-trigger {
  padding: 2px 4px !important;
  font-size: 0.8rem !important; 
  width: 20px !important;
  height: 20px !important;
}

:deep(.dia-com-agendamento) {
  background-color: #3B82F6 !important;
  color: white !important;
  border-radius: 50% !important;
}
</style>
