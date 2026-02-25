caso vc ache interresante aq tá o codigo: <template>
  <div class="layout-agendamento">
    <SideBar />

    <div class="conteudo-agendamento">
      <div class="titulo-container-agendamento">
        <h1 class="titulo-agendamento">Controle de Agendamentos</h1>
        <button class="btn-visualizar-agendamento" @click="abrirModalHojeEAmanha" aria-label="Visualizar horários">
          <svg class="btn-visualizar-icone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor"
              d="M12 8a1 1 0 0 1 1 1v2.586l1.707 1.707a1 1 0 1 1-1.414 1.414l-2-2A1 1 0 0 1 11 12V9a1 1 0 0 1 1-1Zm0-6a10 10 0 1 1 0 20a10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z" />
          </svg>
          <span class="btn-visualizar-texto">Visualizar Horários</span>
        </button>
      </div>

      <div v-if="isLoading" class="loader-agendamento"></div>

      <div v-else>
        <div class="abas-config-container-agendamento">
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'pendentes' }"
            @click="abaAtiva = 'pendentes'">
            Pendentes
            <span class="badge-total">{{ getTodosPorTipo('pendentes').length }}</span>
          </button>
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'confirmados' }"
            @click="abaAtiva = 'confirmados'">
            Confirmados
            <span class="badge-total">{{ getTodosPorTipo('confirmados').length }}</span>
          </button>
          <button type="button" class="aba-config-agendamento" :class="{ ativa: abaAtiva === 'recusados' }"
            @click="abaAtiva = 'recusados'">
            Recusados
            <span class="badge-total">{{ getTodosPorTipo('recusados').length }}</span>
          </button>
        </div>

        <div class="section-agendamento">
          <div v-if="getTodosPorTipo(abaAtiva).length === 0" class="agendamento-card-agendamento nenhum">
            {{ abaAtiva === 'pendentes' ? 'No momento não há nenhum agendamento pendente.'
              : abaAtiva === 'confirmados' ? 'Nenhum agendamento futuro confirmado.'
                : 'Nenhum agendamento recusado.' }}
          </div>

          <div v-else>
            <div class="agendamentos-grid">
              <AgendamentoCard v-for="ag in getItensPagina(abaAtiva)" :key="ag.id"
                :agendamento="normalizarAgendamento(ag)" :loading="loadingCards.includes(ag.id)"
                :class="{ finalizado: ag.status === 'Finalizado' }"
                @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)" @confirmar="aceitarAgendamento(ag.id)"
                @recusar="abrirModalRecusa(ag.id)" />
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
const abaAtiva = ref('pendentes');

const ITENS_POR_PAGINA = 10;

const paginasAtuais = ref({
  pendentes: 1,
  confirmados: 1,
  recusados: 1
});

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
  modalAberto.value = false;
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
  background: #F7F9FC;
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

.btn-visualizar-agendamento {
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
}

.btn-visualizar-icone {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  opacity: 0.95;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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


@media (max-width: 768px) {
  .conteudo-agendamento {
    margin-left: 0;
    padding: 12px 16px 16px !important;
  }

  .titulo-container-agendamento {
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-left: 52px;
    min-height: 42px;
    margin-bottom: 14px;
  }

  .titulo-agendamento {
    font-size: 24px;
    line-height: 1.2;
    min-width: 0;
    flex: 1;
    padding-right: 8px;
  }

  .btn-visualizar-agendamento {
    width: 38px;
    height: 38px;
    padding: 0;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.18);
    flex: 0 0 38px;
  }

  .btn-visualizar-texto {
    display: none;
  }

  .btn-visualizar-icone {
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

  .agendamentos-grid {
    grid-template-columns: 1fr;
    gap: 14px;
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
