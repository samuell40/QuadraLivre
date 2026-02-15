<template>
  <div class="layout">
    <NavBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Meus Agendamentos</h1>
        <button class="btn-novo" @click="irParaAgendarQuadra(null)">
          + Novo Agendamento
        </button>
      </div>

      <div v-if="isLoading" class="loader"></div>

      <div v-else>
        <div class="accordion-agendamento" v-for="tipo in ['confirmados', 'pendentes', 'recusados']" :key="tipo">

          <div class="accordion-header-agendamento" @click="toggleAccordion(tipo)">
            <div class="header-info">
              <h3>{{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}</h3>
              <span class="badge-total">{{ getTodosPorTipo(tipo).length }}</span>
            </div>
            <span class="seta-accordion" :class="{ 'rotacionada': accordionsAbertos[tipo] }">▼</span>
          </div>

          <div class="accordion-body-agendamento" v-show="accordionsAbertos[tipo]">

            <div v-if="getTodosPorTipo(tipo).length === 0" class="mensagem-vazia">
              {{ tipo === 'pendentes' ? 'Nenhuma solicitação pendente.'
                : tipo === 'confirmados' ? 'Nenhum agendamento confirmado.'
                  : 'Nenhum agendamento recusado ou cancelado.' }}
            </div>

            <div v-else>
              <div class="agendamentos-grid">
                <MeusAgendamentoCard v-for="ag in getItensPagina(tipo)" :key="ag.id" :agendamento="ag"
                  :mostrarBotoes="deveMostrarBotoes(ag)" @gerarPdf="gerarPdfAgendamento(ag)"
                  @cancelar="cancelarAgendamento(ag.id)" @novo="irParaAgendarQuadra(ag.quadraId)" />
              </div>

              <div class="paginacao-controls" v-if="getTotalPaginas(tipo) > 1">
                <button class="btn-paginacao" :disabled="paginasAtuais[tipo] === 1" @click="mudarPagina(tipo, -1)">
                  &lt; Anterior
                </button>

                <span class="info-paginacao">
                  Página <strong>{{ paginasAtuais[tipo] }}</strong> de {{ getTotalPaginas(tipo) }}
                </span>

                <button class="btn-paginacao" :disabled="paginasAtuais[tipo] === getTotalPaginas(tipo)"
                  @click="mudarPagina(tipo, 1)">
                  Próxima &gt;
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import NavBar from "@/components/Usuario/NavBar.vue";
import MeusAgendamentoCard from "@/components/cards/MeusAgendamentosCard.vue";
import api from "@/axios";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import logoImg from "@/assets/Cópia de xxxxx (2).png";

const router = useRouter();
const isLoading = ref(true);
const allAgendamentos = ref([]);

const ITENS_POR_PAGINA = 10;

const accordionsAbertos = ref({
  confirmados: true,
  pendentes: true,
  recusados: false
});

const paginasAtuais = ref({
  confirmados: 1,
  pendentes: 1,
  recusados: 1
});

const toggleAccordion = (tipo) => {
  accordionsAbertos.value[tipo] = !accordionsAbertos.value[tipo];
};

const getTodosPorTipo = (tipo) => {
  if (tipo === 'pendentes') {
    return allAgendamentos.value.filter(a => a.status === 'pendente');
  }
  if (tipo === 'confirmados') {
    return allAgendamentos.value.filter(a => a.status === 'confirmado');
  }
  if (tipo === 'recusados') {
    return allAgendamentos.value.filter(a => a.status === 'recusado' || a.status === 'cancelado');
  }
  return [];
};

const getItensPagina = (tipo) => {
  const todos = getTodosPorTipo(tipo);
  const pagina = paginasAtuais.value[tipo];
  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  return todos.slice(inicio, inicio + ITENS_POR_PAGINA);
};

const getTotalPaginas = (tipo) => {
  return Math.ceil(getTodosPorTipo(tipo).length / ITENS_POR_PAGINA) || 1;
};

const mudarPagina = (tipo, delta) => {
  const novaPagina = paginasAtuais.value[tipo] + delta;
  const max = getTotalPaginas(tipo);

  if (novaPagina >= 1 && novaPagina <= max) {
    paginasAtuais.value[tipo] = novaPagina;
  }
};

const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos");

    allAgendamentos.value = data.map(a => {
      const dataObj = a.datahora ? new Date(a.datahora) : new Date(a.ano, a.mes - 1, a.dia, a.hora);

      return {
        id: a.id,
        quadra: a.quadra?.nome || "Não informado",
        quadraId: a.quadra?.id || null,
        dataObj: dataObj,
        dataFormatada: dataObj.toLocaleDateString('pt-BR'),
        hora: dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        duracao: a.duracao,
        tipo: a.tipo,
        status: a.status.toLowerCase(),
        codigoVerificacao: a.codigoVerificacao,
        motivoRecusa: a.motivoRecusa,
        datahora: a.datahora
      };
    }).sort((a, b) => {
      if (a.status === 'pendente' && b.status !== 'pendente') return -1;
      if (a.status !== 'pendente' && b.status === 'pendente') return 1;
      return b.dataObj - a.dataObj;
    });

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

const deveMostrarBotoes = (ag) => {
  const agora = new Date();
  if (ag.status === 'pendente') return true;
  if (ag.status === 'confirmado' && ag.dataObj >= agora) return true;
  return false;
};

const cancelarAgendamento = async (id) => {
  const confirmacao = await Swal.fire({
    title: "Cancelar agendamento?",
    text: "Essa ação não poderá ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#1E3A8A",
    cancelButtonColor: "#d33",
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

      allAgendamentos.value = allAgendamentos.value.filter(a => a.id !== id);

      Swal.fire({
        icon: "success",
        title: "Cancelado!",
        text: "Agendamento cancelado com sucesso.",
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
  const query = quadraId ? { quadraId } : {};
  router.push({ path: "/agendarquadra", query });
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
  background-color: #F7F9FC;
  margin-top: 60px;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.btn-novo {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-novo:hover {
  background-color: #1E3A8A;
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
  border: 5px solid #e5e7eb;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.accordion-agendamento {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.accordion-header-agendamento {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
}

.accordion-header-agendamento:hover {
  background-color: #f8fafc;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.header-info h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: #4b5563;
}

.badge-total {
  color: #3B82F6;
  font-size: 16px;
  font-weight: 600;
}

.seta-accordion {
  font-size: 14px;
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.seta-accordion.rotacionada {
  transform: rotate(180deg);
  color: #3B82F6;
}

.accordion-body-agendamento {
  padding: 24px;
  background-color: #fff;
}

.mensagem-vazia {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 20px;
}

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .agendamentos-grid {
    grid-template-columns: 1fr;
  }

  .conteudo {
    padding: 20px;
  }
}

.paginacao-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.info-paginacao {
  color: #6b7280;
  font-size: 14px;
}

.btn-paginacao {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-paginacao:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
  background-color: #eff6ff;
}

.btn-paginacao:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}
</style>
