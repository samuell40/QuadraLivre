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
        <!-- Futuros -->
        <div v-if="agendamentosFuturos.length > 0">
          <MeusAgendamentoCard
            v-for="ag in agendamentosFuturos"
            :key="ag.id"
            :agendamento="{ ...ag, data: ag.dataFormatada, hora: ag.hora }"
            :mostrarBotoes="true"
            @cancelar="cancelarAgendamento(ag.id)"
            @novo="irParaAgendarQuadra(ag.quadraId)"
          />
        </div>

        <!-- Passados -->
        <div v-if="agendamentosPassados.length > 0">
          <h4>Historico de agendamentos</h4>
          <MeusAgendamentoCard
            v-for="ag in agendamentosPassados"
            :key="ag.id"
            :agendamento="{ ...ag, data: ag.dataFormatada, hora: ag.hora }"
            :mostrarBotoes="false"
          />
        </div>

        <!-- Nenhum agendamento -->
        <div v-if="agendamentosFuturos.length === 0 && agendamentosPassados.length === 0" class="mensagem-nenhum-agendamento">
          <p>Nenhum agendamento encontrado.</p>
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
import Swal from "sweetalert2";

const router = useRouter();
const isLoading = ref(true);
const agendamentosFuturos = ref([]);
const agendamentosPassados = ref([]);

// Carrega os agendamentos do usuário
const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos");
    const agora = new Date();

    const agendamentosFormatados = data.map(a => {
      const dataObj = new Date(a.ano, a.mes - 1, a.dia, a.hora);
      return {
        id: a.id,
        quadra: a.quadra?.nome || "Não informado",
        quadraId: a.quadra?.id || null,
        data: dataObj, // usado internamente para lógica
        dataFormatada: `${a.dia.toString().padStart(2, "0")}/${a.mes.toString().padStart(2, "0")}/${a.ano}`,
        hora: `${a.hora.toString().padStart(2, "0")}:00`,
        duracao: a.duracao,
        tipo: a.tipo,
        status: a.status.toLowerCase(),
      };
    });

    // Futuros (ordenando confirmados primeiro)
    agendamentosFuturos.value = agendamentosFormatados
      .filter(a => a.data >= agora)
      .sort((x, y) => {
        if (x.status === "confirmado" && y.status !== "confirmado") return -1;
        if (x.status !== "confirmado" && y.status === "confirmado") return 1;
        return x.data - y.data;
      });

    // Passados
    agendamentosPassados.value = agendamentosFormatados
      .filter(a => a.data < agora)
      .sort((x, y) => y.data - x.data); // mais recentes primeiro

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
  const confirmacao = await Swal.fire({
    title: "Você realmente deseja cancelar o agendamento?",
    text: "Essa ação não poderá ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1E3A8A",
    cancelButtonColor: "#7e7e7e",
    confirmButtonText: "Sim, cancelar",
    cancelButtonText: "Não",
    customClass: {
      confirmButton: 'swal-botao',
      cancelButton: 'swal-botao'
    }
  });

  if (confirmacao.isConfirmed) {
    try {
      await api.delete(`/agendamento/${id}`);

      // Remove dos arrays futuros e passados
      agendamentosFuturos.value = agendamentosFuturos.value.filter(a => a.id !== id);
      agendamentosPassados.value = agendamentosPassados.value.filter(a => a.id !== id);

      Swal.fire({
        icon: "success",
        title: "Agendamento cancelado com sucesso",
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

h4 {
  color: #3b82f6;
  margin-bottom: 10px;
}
</style>
