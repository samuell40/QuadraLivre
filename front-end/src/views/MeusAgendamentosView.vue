<template>
  <div class="layout">
    <NavBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Meus Agendamentos</h1>
      </div>

      <!-- Loader -->
      <div v-if="isLoading" class="loader"></div>

      <!-- Lista de agendamentos -->
      <div v-else>
        <div v-if="agendamentos.length === 0" class="mensagem-nenhum-agendamento">
          <p>Nenhum agendamento encontrado.</p>
        </div>

        <div v-else>
          <MeusAgendamentoCard
            v-for="ag in agendamentos"
            :key="ag.id"
            :agendamento="ag"
            @cancelar="cancelarAgendamento(ag.id)"
            @novo="irParaAgendarQuadra(ag.quadraId)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "@/components/NavBar.vue";
import MeusAgendamentoCard from "@/components/cards/MeusAgendamentosCard.vue";
import api from "@/axios";
import { useAuthStore } from "@/store";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const router = useRouter();
const agendamentos = ref([]);
const isLoading = ref(true);

// Carrega os agendamentos do usuário usando a mesma lógica do AgendarQuadra
const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos", {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    agendamentos.value = data.map(a => ({
      id: a.id,
      quadra: a.quadra?.nome || "Não informado",
      quadraId: a.quadra?.id || null,
      data: `${a.dia.toString().padStart(2, "0")}/${a.mes.toString().padStart(2, "0")}/${a.ano}`,
      hora: `${a.hora.toString().padStart(2, "0")}:00`,
      status: a.status.toLowerCase(),
    }));
  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível carregar seus agendamentos.",
      confirmButtonColor: "#1E3A8A",
    });
  } finally {
    isLoading.value = false;
  }
};

// Cancelar um agendamento
const cancelarAgendamento = async (id) => {
  try {
    await api.delete(`/agendamento/${id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });
    agendamentos.value = agendamentos.value.filter(a => a.id !== id);
    Swal.fire({
      icon: "success",
      title: "Agendamento cancelado",
      timer: 2000,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  } catch (err) {
    console.error("Erro ao cancelar agendamento:", err);
    Swal.fire({
      icon: "error",
      title: "Erro",
      text: "Não foi possível cancelar o agendamento.",
      confirmButtonColor: "#1E3A8A",
    });
  }
};

// Redireciona para a tela AgendarQuadra
const irParaAgendarQuadra = (quadraId) => {
  router.push({ path: "/agendarquadra", query: { quadraId } });
};

onMounted(() => {
  carregarAgendamentos();
});
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px 75px;
  background-color: #f2f2f2;
  margin-top: 60px;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Loader estilo igual AgendarQuadra */
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

.mensagem-nenhum-agendamento {
  text-align: center;
  color: #555;
  font-size: 18px;
  padding: 40px 0;
}
</style>
