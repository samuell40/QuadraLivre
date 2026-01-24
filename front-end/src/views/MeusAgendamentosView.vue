<template>
  <div class="layout">
    <NavBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Meus Agendamentos</h1>
      </div>

      <div v-if="isLoading" class="loader"></div>

      <div v-else>
        <div v-if="agendamentosFuturos.length > 0">
          <MeusAgendamentoCard
            v-for="ag in agendamentosFuturos"
            :key="ag.id"
            :agendamento="{ ...ag, data: ag.dataFormatada, hora: ag.hora }"
            :mostrarBotoes="true"
            @gerarPdf="gerarPdfAgendamento(ag)"   @cancelar="cancelarAgendamento(ag.id)"
            @novo="irParaAgendarQuadra(ag.quadraId)"
          />
        </div>

        <div v-if="agendamentosPassados.length > 0">
          <h4>Histórico de agendamentos</h4>
          <MeusAgendamentoCard
            v-for="ag in agendamentosPassados"
            :key="ag.id"
            :agendamento="{ ...ag, data: ag.dataFormatada, hora: ag.hora }"
            :mostrarBotoes="false"
            @gerarPdf="gerarPdfAgendamento(ag)"   />
        </div>

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
import { jsPDF } from "jspdf";
import logoImg from "@/assets/Cópia de xxxxx (2).png";

const router = useRouter();
const isLoading = ref(true);
const agendamentosFuturos = ref([]);
const agendamentosPassados = ref([]);

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
        data: dataObj,
        dataFormatada: `${a.dia.toString().padStart(2, "0")}/${a.mes.toString().padStart(2, "0")}/${a.ano}`,
        hora: `${a.hora.toString().padStart(2, "0")}:00`,
        duracao: a.duracao,
        tipo: a.tipo,
        status: a.status.toLowerCase(),
        codigoVerificacao: a.codigoVerificacao,
        motivoRecusa: a.motivoRecusa
      };
    });

    agendamentosFuturos.value = agendamentosFormatados
      .filter(a => a.data >= agora)
      .sort((x, y) => {
        if (x.status === "confirmado" && y.status !== "confirmado") return -1;
        if (x.status !== "confirmado" && y.status === "confirmado") return 1;
        return x.data - y.data;
      });

    agendamentosPassados.value = agendamentosFormatados
      .filter(a => a.data < agora)
      .sort((x, y) => y.data - x.data);

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

const gerarPdfAgendamento = async (agendamento) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [140, 80]
  });

  const corPrimaria = [30, 58, 138];
  const codigoFinal = agendamento.codigoVerificacao || `ID-${agendamento.id}`;

  doc.setDrawColor(220, 220, 220);
  doc.rect(5, 5, 130, 70);

  const img = new Image();
  img.src = logoImg;
  
  await new Promise((resolve) => {
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 12, 12);
      resolve();
    };
  });

  doc.setFontSize(16);
  doc.setTextColor(...corPrimaria);
  doc.setFont("helvetica", "bold");
  doc.text("QuadraLivre", 25, 18);

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("COMPROVANTE DE AGENDAMENTO", 130, 18, { align: "right" });

  doc.setDrawColor(...corPrimaria);
  doc.setLineWidth(0.5);
  doc.line(10, 25, 130, 25);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.text("Local:", 15, 38);
  doc.text("Data/Hora:", 15, 48);
  
  doc.setFont("helvetica", "normal");
  doc.text(agendamento.quadra, 40, 38);
  doc.text(`${agendamento.dataFormatada} às ${agendamento.hora}`, 40, 48);

  doc.setFont("helvetica", "bold");
  doc.text("Tipo:", 85, 38);
  doc.text("Status:", 85, 48);

  doc.setFont("helvetica", "normal");
  doc.text(agendamento.tipo.toUpperCase(), 105, 38);
  doc.text(agendamento.status.toUpperCase(), 105, 48);

  doc.setDrawColor(230, 230, 230);
  doc.line(15, 58, 125, 58);

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CÓDIGO DE VERIFICAÇÃO", 70, 64, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(...corPrimaria);
  doc.setFont("helvetica", "bold");
  doc.text(codigoFinal, 70, 71, { align: "center" });

  doc.save(`Voucher_${agendamento.quadra}_${codigoFinal}.pdf`);
  
  Swal.fire({
    icon: 'success',
    title: 'Comprovante pronto!',
    text: 'O arquivo foi salvo no seu dispositivo.',
    timer: 1500,
    showConfirmButton: false
  });
};

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
