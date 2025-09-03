<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <!-- Título + Botão -->
      <div class="titulo-container">
        <h1>Controle de Agendamentos</h1>
        <button class="btn-visualizar" @click="abrirModalHojeEAmanha">
          Visualizar Horários
        </button>
      </div>

      <!-- Loader -->
      <div v-if="isLoading" class="loader"></div>

      <!-- Conteúdo -->
      <div v-else>
        <!-- Abas -->
        <div class="abas">
          <button
            :class="['aba-btn', { ativa: abaAtiva === 'pendentes' }]"
            @click="abaAtiva = 'pendentes'"
          >
            Pendentes
          </button>
          <button
            :class="['aba-btn', { ativa: abaAtiva === 'futuros' }]"
            @click="abaAtiva = 'futuros'"
          >
            Agendamentos Futuros
          </button>
        </div>

        <!-- Pendentes -->
        <div v-if="abaAtiva === 'pendentes'">
          <div v-if="agendamentosPendentes.length === 0" class="nenhum">
            Nenhum agendamento pendente.
          </div>
          <div v-else class="agendamentos">
            <AgendamentoCard
              v-for="ag in agendamentosPendentes"
              :key="ag.id"
              :agendamento="ag"
              :class="{ finalizado: ag.status === 'Finalizado' }"
              @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)"
            />
          </div>
        </div>

        <!-- Futuros Confirmados -->
        <div v-if="abaAtiva === 'futuros'">
          <div v-if="agendamentosFuturos.length === 0" class="nenhum">
            Nenhum agendamento futuro confirmado.
          </div>
          <div v-else class="agendamentos">
            <AgendamentoCard
              v-for="ag in agendamentosFuturos"
              :key="ag.id"
              :agendamento="ag"
              :class="{ finalizado: ag.status === 'Finalizado' }"
              @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)"
            />
          </div>
        </div>

        <!-- Modal de horários -->
        <ListaAgendModal
          v-if="modalAberto && datasModal.length"
          :quadraId="quadraId"
          :datas="datasModal"
          @fechar="modalAberto = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import SideBar from "@/components/SideBar.vue";
import AgendamentoCard from "@/components/cards/AgendamentoCard.vue";
import ListaAgendModal from "@/components/modals/Agendamentos/ListaAgendModal.vue";
import api from "@/axios";
import Swal from "sweetalert2";

const agendamentos = ref([]);
const isLoading = ref(true);
const modalAberto = ref(false);
const datasModal = ref([]);
const quadraId = ref(null);
const abaAtiva = ref("pendentes");

const agendamentosPendentes = computed(() =>
  agendamentos.value.filter(a => a.status === "Pendente")
);

const agendamentosFuturos = computed(() => {
  const hoje = new Date();
  hoje.setHours(0,0,0,0);

  return agendamentos.value.filter(a => {
    if (a.status !== "Confirmado") return false;

    const agData = new Date(a.ano, a.mes - 1, a.dia);
    agData.setHours(0,0,0,0);

    return agData.getTime() >= hoje.getTime();
  });
});

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

const formatarData = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

const abrirModal = (dia, mes, ano) => {
  datasModal.value = [`${ano}-${String(mes).padStart(2,'0')}-${String(dia).padStart(2,'0')}`];
  modalAberto.value = true;
};

const abrirModalHojeEAmanha = () => {
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);
  datasModal.value = [formatarData(hoje), formatarData(amanha)];
  modalAberto.value = true;
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

.titulo-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn-visualizar {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-visualizar:hover {
  background-color: #2563eb;
}

.agendamentos .agendamento-card {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
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
  font-size: 28px;
  margin: 0;
}

h4 {
  margin-bottom: 12px;
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

/* Estilo das abas */
.abas {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.aba-btn {
  padding: 6px 14px;
  font-size: 0.9rem;
  border-radius: 20px;
  border: 1px solid #3B82F6;
  background-color: #fff;
  color: #3B82F6;
  cursor: pointer;
  transition: 0.2s;
}

.aba-btn.ativa {
  background-color: #3B82F6;
  color: #fff;
}
</style>
