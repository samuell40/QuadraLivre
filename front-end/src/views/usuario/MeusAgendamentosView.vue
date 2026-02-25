<template>
  <div class="layout-agendamento-user">
    <NavBar />

    <div class="conteudo-agendamento">
      <div class="titulo-container-agendamento">
        <h1 class="titulo-agendamento">Meus Agendamentos</h1>
        <button class="btn-acao-topo" @click="irParaAgendarQuadra(null)" aria-label="Novo Agendamento">
          <svg class="btn-acao-icone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span class="btn-acao-texto">Novo Agendamento</span>
        </button>
      </div>

      <div v-if="isLoading" class="loader-agendamento"></div>

      <div v-else>
        <div class="abas-config-container-agendamento">
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'confirmados' }"
            @click="abaAtiva = 'confirmados'">
            Confirmados
            <span class="badge-total">{{ getTodosPorTipo('confirmados').length }}</span>
          </button>
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'pendentes' }"
            @click="abaAtiva = 'pendentes'">
            Pendentes
            <span class="badge-total">{{ getTodosPorTipo('pendentes').length }}</span>
          </button>
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'recusados' }"
            @click="abaAtiva = 'recusados'">
            Recusados
            <span class="badge-total">{{ getTodosPorTipo('recusados').length }}</span>
          </button>
        </div>

        <div class="section-agendamento">
          <div v-if="getTodosPorTipo(abaAtiva).length === 0" class="agendamento-card-agendamento nenhum">
            {{ abaAtiva === 'pendentes' ? 'Nenhuma solicitação pendente no momento.'
              : abaAtiva === 'confirmados' ? 'Nenhum agendamento futuro confirmado.'
                : 'Nenhum agendamento recusado ou cancelado.' }}
          </div>

          <div v-else>
            <div class="agendamentos-grid">
              <MeusAgendamentoCard v-for="ag in getItensPagina(abaAtiva)" :key="ag.id" 
                :agendamento="ag"
                :mostrarBotoes="deveMostrarBotoes(ag)" 
                @gerarPdf="gerarPdfAgendamento(ag)"
                @cancelar="cancelarAgendamento(ag.id)" 
                @novo="irParaAgendarQuadra(ag.quadraId)" />
            </div>

            <div class="paginacao-controls" v-if="getTotalPaginas(abaAtiva) > 1">
              <button class="btn-paginacao" :disabled="paginasAtuais[abaAtiva] === 1"
                @click="mudarPagina(abaAtiva, -1)">
                &lt; Anterior
              </button>

              <span class="info-paginacao">
                Página <strong>{{ paginasAtuais[abaAtiva] }}</strong> de {{ getTotalPaginas(abaAtiva) }}
              </span>

              <button class="btn-paginacao" :disabled="paginasAtuais[abaAtiva] === getTotalPaginas(abaAtiva)"
                @click="mudarPagina(abaAtiva, 1)">
                Próxima &gt;
              </button>
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
const abaAtiva = ref('confirmados');

const ITENS_POR_PAGINA = 10;

const paginasAtuais = ref({
  confirmados: 1,
  pendentes: 1,
  recusados: 1
});

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
.layout-agendamento-user {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  background: #F7F9FC;
}

.conteudo-agendamento {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 60px auto 0 auto;
  padding: 32px 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.titulo-container-agendamento {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 18px;
}

.titulo-agendamento {
  font-size: 32px;
  color: #3B82F6;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.2px;
}

.btn-acao-topo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #fff;
  background: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.35);
  padding: 11px 16px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.2px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}

.btn-acao-topo:hover {
  background: #1E3A8A;
}

.btn-acao-icone {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.loader-agendamento {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-agendamento::after {
  content: '';
  width: 54px;
  height: 54px;
  border: 6px solid #e5e7eb;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.abas-config-container-agendamento {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  margin-bottom: 16px;
}

.aba-config-agendamento {
  flex: 1;
  border: 1px solid transparent;
  background: #F8FAFC;
  color: #64748b;
  font-size: 16px;
  font-weight: 900;
  padding: 12px 12px;
  cursor: pointer;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  user-select: none;
}

.aba-config-agendamento:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.aba-config-agendamento.ativa {
  background: #3B82F6;
  color: #fff;
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
  border-color: rgba(255, 255, 255, 0.18);
}

.badge-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  color: #2563eb;
  background: #dbeafe;
  border: 1px solid rgba(37, 99, 235, 0.18);
}

.aba-config-agendamento.ativa .badge-total {
  color: #2563eb;
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.55);
}

.section-agendamento {
  background-color: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.agendamento-card-agendamento.nenhum {
  grid-column: 1 / -1;
  color: #64748b;
  font-size: 15px;
  padding: 44px 22px;
  text-align: center;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 14px;
  border: 1px dashed rgba(100, 116, 139, 0.35);
}

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.paginacao-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.info-paginacao {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.info-paginacao strong {
  color: #0f172a;
  font-weight: 900;
}

.btn-paginacao {
  background-color: #fff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: #334155;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-paginacao:hover:not(:disabled) {
  border-color: rgba(59, 130, 246, 0.55);
  color: #2563eb;
  background-color: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.10);
}

.btn-paginacao:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #f8fafc;
  transform: none;
  box-shadow: none;
}

@media (max-width: 900px) {
  .agendamentos-grid {
    grid-template-columns: 1fr;
  }

  .conteudo-agendamento {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .conteudo-agendamento {
    padding: 24px 16px 16px;
  }

  .titulo-container-agendamento {
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 14px;
  }

  .titulo-agendamento {
    font-size: 24px;
    line-height: 1.2;
    padding-right: 8px;
  }

  .btn-acao-topo {
    width: 38px;
    height: 38px;
    padding: 0;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.18);
    flex: 0 0 38px;
  }

  .btn-acao-texto {
    display: none;
  }

  .btn-acao-icone {
    width: 18px;
    height: 18px;
  }

  .abas-config-container-agendamento {
    overflow-x: visible;
    gap: 8px;
    padding: 8px;
  }

  .aba-config-agendamento {
    flex: 1 1 0;
    min-width: 0;
    padding: 10px 6px;
    font-size: 13px;
    gap: 6px;
  }

  .badge-total {
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
  }

  .section-agendamento {
    padding: 16px;
  }

  .paginacao-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .btn-paginacao {
    width: 100%;
    justify-content: center;
  }

  .info-paginacao {
    text-align: center;
  }
}
</style>