<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos da Minha Quadra</h1>

      <!-- Loader -->
      <div v-if="isLoading" class="loader"></div>

      <!-- Conteúdo -->
      <div v-else>
        <div v-if="agendamentosPendentes.length === 0">
          Nenhum agendamento pendente.
        </div>
        <div v-else class="agendamentos">
          <h2>Agendamentos Pendentes</h2>
          <AgendamentoCard
            v-for="ag in agendamentosPendentes"
            :key="ag.id"
            :agendamento="ag"
            @atualizar="carregarAgendamentos"
          />
        </div>

        <div v-if="agendamentosProcessados.length > 0" class="agendamentos-processados">
          <h2>Agendamentos Processados</h2>
          <AgendamentoCard
            v-for="ag in agendamentosProcessados"
            :key="ag.id"
            :agendamento="ag"
            :readonly="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import SideBar from "@/components/SideBar.vue";
import AgendamentoCard from "@/components/cards/AgendamentoCard.vue";
import api from "@/axios";
import Swal from "sweetalert2";

const agendamentos = ref([]);
const isLoading = ref(true);

const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos/minha-quadra");
    agendamentos.value = data;
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

const agendamentosPendentes = computed(() => agendamentos.value.filter(a => a.status === "Pendente"));
const agendamentosProcessados = computed(() => agendamentos.value.filter(a => a.status !== "Pendente"));

onMounted(() => {
  carregarAgendamentos();
});
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px 75px;
  background-color: #f2f2f2;
  margin-left: 250px;
}

.agendamentos {
  margin-top: 20px;
}

.agendamentos-processados {
  margin-top: 40px;
}

h1, h2 {
  color: #3B82F6;
}

h1 {
  font-weight: bold;
  font-size: 30px;
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 16px;
}

/* Loader igual MeusAgendamentos */
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
</style>
