<template>
  <div class="layout-agendamento">
    <SideBar />

    <div class="conteudo-agendamento">
      <div class="titulo-container-agendamento">
        <h1 class="titulo-agendamento">Controle de Agendamentos</h1>
        <button class="btn-visualizar-agendamento" @click="abrirModalHojeEAmanha">
          Visualizar Horários
        </button>
      </div>

      <div v-if="isLoading" class="loader-agendamento"></div>

      <div v-else>
        <div class="accordion-agendamento" v-for="tipo in ['pendentes', 'confirmados', 'recusados']" :key="tipo">

          <div class="accordion-header-agendamento" @click="toggleAccordion(tipo)">
            <div class="header-info">
              <h3>{{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}</h3>
              <span class="badge-total">{{ getTodosPorTipo(tipo).length }}</span>
            </div>
            <span class="seta-accordion" :class="{ 'rotacionada': accordionsAbertos[tipo] }">▼</span>
          </div>

          <div class="accordion-body-agendamento" v-show="accordionsAbertos[tipo]"
            :class="{ 'is-open': accordionsAbertos[tipo] }">

            <div v-if="getTodosPorTipo(tipo).length === 0" class="agendamento-card-agendamento nenhum">
              {{ tipo === 'pendentes' ? 'No momento não há nenhum agendamento pendente.'
                : tipo === 'confirmados' ? 'Nenhum agendamento futuro confirmado.'
                  : 'Nenhum agendamento recusado.' }}
            </div>

            <div v-else>
              <div class="agendamentos-grid">
                <AgendamentoCard v-for="ag in getItensPagina(tipo)" :key="ag.id"
                  :agendamento="normalizarAgendamento(ag)" :loading="loadingCards.includes(ag.id)"
                  :class="{ finalizado: ag.status === 'Finalizado' }"
                  @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)" @confirmar="aceitarAgendamento(ag.id)"
                  @recusar="abrirModalRecusa(ag.id)" />
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

        <ListaAgendModal v-if="modalAberto && datasModal.length" :quadraId="quadraId" :datas="datasModal"
          @fechar="modalAberto = false" @ver-detalhes="abrirModalDetalhes" />

        <DetalheAgendModal v-if="detalheAberto" :agendamento="agendamentoSelecionado" @fechar="detalheAberto = false" />

        <RecusarAgendModal v-if="modalRecusaAberto" :agendamentoId="idParaRecusar" :loading="isRecusando"
          @fechar="modalRecusaAberto = false" @confirmar="processarRecusa" />

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SideBar from "@/components/SideBar.vue";
import AgendamentoCard from "@/components/cards/AgendamentoCard.vue";
import ListaAgendModal from "@/components/modals/Agendamentos/ListaAgendModal.vue";
import DetalheAgendModal from "@/components/modals/Agendamentos/DetalharAgendModal.vue";
import RecusarAgendModal from "@/components/modals/Agendamentos/RecusarAgendModal.vue";
import api from "@/axios";
import Swal from "sweetalert2";

const agendamentos = ref([]);
const isLoading = ref(true);
const modalAberto = ref(false);
const datasModal = ref([]);
const quadraId = ref(null);
const detalheAberto = ref(false);
const agendamentoSelecionado = ref(null);
const modalRecusaAberto = ref(false);
const idParaRecusar = ref(null);
const isRecusando = ref(false);
const loadingCards = ref([]);

const ITENS_POR_PAGINA = 10;

const accordionsAbertos = ref({
  pendentes: true,
  confirmados: false,
  recusados: false
});

const paginasAtuais = ref({
  pendentes: 1,
  confirmados: 1,
  recusados: 1
});

const toggleAccordion = (tipo) => {
  accordionsAbertos.value[tipo] = !accordionsAbertos.value[tipo];
};

const getTodosPorTipo = (tipo) => {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  if (tipo === 'pendentes') return agendamentos.value.filter(a => a.status === "Pendente");
  if (tipo === 'confirmados') return agendamentos.value.filter(a => a.status === "Confirmado" && new Date(a.ano, a.mes - 1, a.dia).getTime() >= hoje.getTime());
  if (tipo === 'recusados') return agendamentos.value.filter(a => a.status === "Recusado");
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
  const maxPaginas = getTotalPaginas(tipo);

  if (novaPagina >= 1 && novaPagina <= maxPaginas) {
    paginasAtuais.value[tipo] = novaPagina;
  }
};

const normalizarAgendamento = (ag) => ({
  ...ag,
  usuario: ag.usuario?.nome || 'Sem usuário',
  time: ag.time?.nome || 'Não especificado',
  codigoVerificacao: ag.codigoVerificacao,
  motivoRecusa: ag.motivoRecusa
});

const carregarAgendamentos = async () => {
  isLoading.value = true;
  try {
    const { data } = await api.get("/agendamentos/minha-quadra");
    agendamentos.value = data;
    if (data.length) quadraId.value = data[0].quadra.id;
  } catch (err) {
    console.error("Erro ao carregar agendamentos:", err);
    Swal.fire({ icon: "error", title: "Erro", text: "Falha ao carregar agendamentos da quadra." });
  } finally {
    isLoading.value = false;
  }
};

const aceitarAgendamento = async (id) => {
  if (loadingCards.value.includes(id)) return;
  loadingCards.value.push(id);
  try {
    await api.patch(`/agendamento/${id}/aceitar`);
    agendamentos.value = agendamentos.value.map(a => a.id === id ? { ...a, status: "Confirmado" } : a);
    Swal.fire("Sucesso", "Agendamento aceito!", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Não foi possível aceitar o agendamento.", "error");
  } finally {
    loadingCards.value = loadingCards.value.filter(item => item !== id);
  }
};

const abrirModalRecusa = (id) => {
  idParaRecusar.value = id;
  modalRecusaAberto.value = true;
};

const processarRecusa = async ({ id, motivo }) => {
  isRecusando.value = true;
  loadingCards.value.push(id);
  try {
    await api.patch(`/agendamento/${id}/recusar`, { motivoRecusa: motivo });
    agendamentos.value = agendamentos.value.map(a => a.id === id ? { ...a, status: "Recusado", motivoRecusa: motivo } : a);
    modalRecusaAberto.value = false;
    Swal.fire("Recusado", "O usuário será notificado do motivo.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Falha ao recusar agendamento.", "error");
  } finally {
    isRecusando.value = false;
    loadingCards.value = loadingCards.value.filter(item => item !== id);
  }
};

const abrirModal = (dia, mes, ano) => {
  datasModal.value = [{ dia, mes, ano }];
  modalAberto.value = true;
};

const abrirModalHojeEAmanha = () => {
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);
  datasModal.value = [
    { dia: hoje.getDate(), mes: hoje.getMonth() + 1, ano: hoje.getFullYear() },
    { dia: amanha.getDate(), mes: amanha.getMonth() + 1, ano: amanha.getFullYear() }
  ];
  modalAberto.value = true;
};

const abrirModalDetalhes = (agendamento) => {
  agendamentoSelecionado.value = normalizarAgendamento(agendamento);
  detalheAberto.value = true;
};

onMounted(() => carregarAgendamentos());
</script>

<style>
.layout-agendamento {
  display: flex;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.conteudo-agendamento {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  overflow-x: hidden;
  background-color: #F7F9FC;
}

.titulo-container-agendamento {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.titulo-agendamento {
  font-size: 30px;
  color: #3B82F6;
  font-weight: bold;
  margin: 0;
}

.btn-visualizar-agendamento {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.btn-visualizar-agendamento:hover {
  background-color: #1E3A8A;
}

.loader-agendamento {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-agendamento::after {
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
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.accordion-header-agendamento:hover {
  background-color: #f8fafc;
}

.accordion-body-agendamento {
  padding: 24px;
  background-color: #fff;
}

.accordion-body-agendamento.is-open {
  border-top: 1px solid #f1f5f9;
}

.accordion-header-agendamento {
  border-bottom: 1px solid #f1f5f9;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
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
  margin-left: 4px;
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

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 1100px) {
  .agendamentos-grid {
    grid-template-columns: 1fr;
  }
}

.agendamento-card-agendamento.nenhum {
  grid-column: 1 / -1;
  color: #9ca3af;
  font-size: 16px;
  padding: 40px;
  text-align: center;
  font-style: italic;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px dashed #d1d5db;
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

.info-paginacao strong {
  color: #1f2937;
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
  display: flex;
  align-items: center;
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