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
        <!-- Dropdown / Accordion -->
        <div class="accordion-agendamento" v-for="tipo in ['pendentes', 'confirmados', 'recusados']" :key="tipo">
          <div class="accordion-header-agendamento" @click="tipo !== 'pendentes' && toggleAccordion(tipo)">
            <h3>{{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}</h3>
            <span v-if="tipo !== 'pendentes'">{{ accordionAberto === tipo ? '▲' : '▼' }}</span>
          </div>

          <div 
            class="accordion-body-agendamento"
            v-show="tipo === 'pendentes' || accordionAberto === tipo"
            :class="{'scrollable': tipo === 'pendentes'}"
          >
            <div v-if="agendamentosPorTipo(tipo).length === 0" class="agendamento-card-agendamento nenhum">
              {{ tipo === 'pendentes' ? 'No momento não há nenhum agendamento pendente.' 
                : tipo === 'confirmados' ? 'Nenhum agendamento futuro confirmado.' 
                : 'Nenhum agendamento recusado.' }}
            </div>

            <div v-else class="agendamentos-agendamento">
              <AgendamentoCard 
                v-for="ag in agendamentosPorTipo(tipo)" 
                :key="ag.id" 
                :agendamento="normalizarAgendamento(ag)"
                :loading="loadingCards.includes(ag.id)"
                :class="{ finalizado: ag.status === 'Finalizado' }"
                @ver-horarios="() => abrirModal(ag.dia, ag.mes, ag.ano)" 
                @confirmar="aceitarAgendamento(ag.id)"
                @recusar="recusarAgendamento(ag.id)"
              />
            </div>
          </div>
        </div>

        <!-- Modal de horários -->
        <ListaAgendModal 
          v-if="modalAberto && datasModal.length" 
          :quadraId="quadraId" 
          :datas="datasModal"
          @fechar="modalAberto = false" 
          @ver-detalhes="abrirModalDetalhes" 
        />

        <!-- Modal de detalhes -->
        <DetalheAgendModal 
          v-if="detalheAberto" 
          :agendamento="agendamentoSelecionado"
          @fechar="detalheAberto = false" 
        />
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
import api from "@/axios";
import Swal from "sweetalert2";

const agendamentos = ref([]);
const isLoading = ref(true);
const modalAberto = ref(false);
const datasModal = ref([]);
const quadraId = ref(null);

const detalheAberto = ref(false);
const agendamentoSelecionado = ref(null);

// Accordion para pendentes, confirmados e recusados
const accordionAberto = ref(null);
const toggleAccordion = (tipo) => {
  accordionAberto.value = accordionAberto.value === tipo ? null : tipo;
};

const agendamentosPorTipo = (tipo) => {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  if(tipo === 'pendentes') return agendamentos.value.filter(a => a.status === "Pendente");
  if(tipo === 'confirmados') return agendamentos.value.filter(a => a.status === "Confirmado" && new Date(a.ano, a.mes-1, a.dia).getTime() >= hoje.getTime());
  if(tipo === 'recusados') return agendamentos.value.filter(a => a.status === "Recusado");
  return [];
};

const normalizarAgendamento = (ag) => ({
  ...ag,
  usuario: ag.usuario?.nome || 'Sem usuário',
  time: ag.time?.nome || 'Não especificado',
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

const loadingCards = ref([]);

const aceitarAgendamento = async (id) => {
  if (loadingCards.value.includes(id)) return;
  loadingCards.value.push(id);

  try {
    await api.patch(`/agendamento/${id}/aceitar`);
    agendamentos.value = agendamentos.value.map(a =>
      a.id === id ? { ...a, status: "Confirmado" } : a
    );
    Swal.fire("Sucesso", "Agendamento aceito!", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Não foi possível aceitar o agendamento.", "error");
  } finally {
    loadingCards.value = loadingCards.value.filter(item => item !== id);
  }
};

const recusarAgendamento = async (id) => {
  if (loadingCards.value.includes(id)) return;
  loadingCards.value.push(id);

  try {
    await api.patch(`/agendamento/${id}/recusar`);
    agendamentos.value = agendamentos.value.map(a =>
      a.id === id ? { ...a, status: "Recusado" } : a
    );
    Swal.fire("Sucesso", "Agendamento recusado!", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Não foi possível recusar o agendamento.", "error");
  } finally {
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
}

.conteudo-agendamento {
  flex: 1;
  padding: 32px;      
  margin-left: 250px;
  overflow-x: hidden; 
}

.titulo-container-agendamento {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.titulo-agendamento {
  font-size: 30px;
  color: #3B82F6;
  font-weight: bold;
  margin-top: 12px;
}

.btn-visualizar-agendamento {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.loader-agendamento {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-agendamento::after {
  content: '';
  width: 50px;
  height: 50px;
  border: 5px solid #3b82f6;
  border-top-color: transparent;
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
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.accordion-header-agendamento {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  font-weight: 400;
  color: #374151;
}
.accordion-header-agendamento:hover {
  background-color: #f3f4f6;
}
.accordion-header-agendamento h3 {
  font-size: 17px;
  font-weight: bold;
  margin: 0;
  color: #7E7E7E;
}
.accordion-body-agendamento {
  padding: 12px 16px;
  background-color: #fff;
}
.accordion-body-agendamento.scrollable {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}
.accordion-body-agendamento.scrollable::-webkit-scrollbar {
  width: 8px;
}
.accordion-body-agendamento.scrollable::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}
.accordion-body-agendamento.scrollable::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.agendamento-card-agendamento {
  width: 100%;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.agendamento-card-agendamento.finalizado {
  background-color: #f3f4f6;
  border-left: 4px solid #6b7280;
  opacity: 0.8;
}
.agendamento-card-agendamento.nenhum {
  color: #7E7E7E;
  font-size: 1rem;
  height: 100px;
  font-weight: 600;
  text-align: center;
  justify-content: center;
  display: flex;
}
.agendamentos-agendamento {
  padding: 12px 0;
}
</style>
