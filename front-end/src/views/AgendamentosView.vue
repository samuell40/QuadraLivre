<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <NavBarUse class="page-nav" />

      <section class="page-header">
        <div class="header-copy">
          <div class="header-topline">
            <h1 class="title">Controle de agendamentos</h1>
          </div>
        </div>
      </section>

      <section class="agendamentos-panel">
        <div class="panel-head">
          <div class="panel-copy">
            <p class="section-kicker">OPERACAO</p>
            <h2 class="section-title">{{ tituloAbaAtiva }}</h2>
            <p class="section-subtitle">{{ subtituloAbaAtiva }}</p>
          </div>

          <div class="panel-actions">
            <span class="panel-pill">{{ resumoAbaAtiva }}</span>

            <button
              type="button"
              class="btn-top-action"
              @click="abrirModalHojeEAmanha"
              :disabled="!quadraId || isLoading"
              aria-label="Visualizar horarios"
            >
              <svg class="btn-top-action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 8a1 1 0 0 1 1 1v2.586l1.707 1.707a1 1 0 1 1-1.414 1.414l-2-2A1 1 0 0 1 11 12V9a1 1 0 0 1 1-1Zm0-6a10 10 0 1 1 0 20a10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z"
                />
              </svg>
              <span class="btn-top-action-label-desktop">Visualizar horarios</span>
              <span class="btn-top-action-label-mobile">Horarios</span>
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="state-card state-card-loading">
          <div class="loader"></div>
          <p class="state-title">Carregando agendamentos</p>
          <p class="state-copy">Buscando as reservas vinculadas a {{ nomeQuadraOperacao }}.</p>
        </div>

        <template v-else>
          <div class="abas-config-container">
            <button
              v-for="aba in abas"
              :key="aba.id"
              type="button"
              class="aba-config"
              :class="{ ativa: abaAtiva === aba.id }"
              @click="abaAtiva = aba.id"
            >
              <span>{{ aba.label }}</span>
              <span class="badge-total">{{ aba.total }}</span>
            </button>
          </div>

          <div v-if="itensAbaAtiva.length === 0" class="state-card state-card-empty">
            <p class="state-title">{{ tituloEstadoVazio }}</p>
            <p class="state-copy">{{ descricaoEstadoVazio }}</p>
          </div>

          <div v-else class="content-stack">
            <div class="agendamentos-grid">
              <AgendamentoCard
                v-for="ag in itensAbaAtiva"
                :key="ag.id"
                :agendamento="normalizarAgendamento(ag)"
                :loading="loadingCards.includes(ag.id)"
                :class="{ finalizado: normalizarStatus(ag.status) === 'finalizado' }"
                @confirmar="aceitarAgendamento(ag.id)"
                @recusar="abrirModalRecusa(ag.id)"
              />
            </div>

            <div class="paginacao-controls" v-if="totalPaginasAbaAtiva > 1">
              <button
                type="button"
                class="btn-paginacao"
                :disabled="paginasAtuais[abaAtiva] === 1"
                @click="mudarPagina(abaAtiva, -1)"
              >
                <span>&lt;</span>
                <span>Anterior</span>
              </button>

              <span class="info-paginacao">
                Pagina <strong>{{ paginasAtuais[abaAtiva] }}</strong> de {{ totalPaginasAbaAtiva }}
              </span>

              <button
                type="button"
                class="btn-paginacao"
                :disabled="paginasAtuais[abaAtiva] === totalPaginasAbaAtiva"
                @click="mudarPagina(abaAtiva, 1)"
              >
                <span>Proxima</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </template>

        <ListaAgendModal
          v-if="modalAberto && datasModal.length && quadraId"
          :quadraId="quadraId"
          :datas="datasModal"
          @fechar="modalAberto = false"
          @ver-detalhes="abrirModalDetalhes"
        />

        <DetalheAgendModal
          v-if="detalheAberto"
          :agendamento="agendamentoSelecionado"
          @fechar="detalheAberto = false"
        />

        <RecusarAgendModal
          v-if="modalRecusaAberto"
          :agendamentoId="idParaRecusar"
          :loading="isRecusando"
          @fechar="modalRecusaAberto = false"
          @confirmar="processarRecusa"
        />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import AgendamentoCard from '@/components/cards/AgendamentoCard.vue'
import ListaAgendModal from '@/components/modals/Agendamentos/ListaAgendModal.vue'
import DetalheAgendModal from '@/components/modals/Agendamentos/DetalharAgendModal.vue'
import RecusarAgendModal from '@/components/modals/Agendamentos/RecusarAgendModal.vue'
import api from '@/axios'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const resolverQuadraId = (valor) => {
  const numero = Number(valor)
  return Number.isFinite(numero) && numero > 0 ? numero : null
}
const agendamentos = ref([])
const isLoading = ref(true)
const modalAberto = ref(false)
const datasModal = ref([])
const quadraId = ref(resolverQuadraId(authStore.usuario?.quadraId))
const detalheAberto = ref(false)
const agendamentoSelecionado = ref(null)
const modalRecusaAberto = ref(false)
const idParaRecusar = ref(null)
const isRecusando = ref(false)
const loadingCards = ref([])
const abaAtiva = ref('pendentes')

const ITENS_POR_PAGINA = 10

const paginasAtuais = ref({
  pendentes: 1,
  confirmados: 1,
  recusados: 1,
})

const normalizarStatus = (status) => String(status || '').trim().toLowerCase()

const obterDataAgendamento = (agendamento) => {
  if (agendamento?.datahora) {
    const data = new Date(agendamento.datahora)
    return Number.isNaN(data.getTime()) ? null : data
  }

  if (
    Number.isInteger(agendamento?.ano) &&
    Number.isInteger(agendamento?.mes) &&
    Number.isInteger(agendamento?.dia)
  ) {
    const data = new Date(
      agendamento.ano,
      Math.max(0, agendamento.mes - 1),
      agendamento.dia,
      agendamento.hora || 0,
      0,
      0,
    )

    return Number.isNaN(data.getTime()) ? null : data
  }

  return null
}

const getTodosPorTipo = (tipo) => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return agendamentos.value.filter((agendamento) => {
    const status = normalizarStatus(agendamento.status)

    if (tipo === 'pendentes') return status === 'pendente'
    if (tipo === 'recusados') return status === 'recusado'
    if (tipo === 'confirmados') {
      const dataAgendamento = obterDataAgendamento(agendamento)
      return status === 'confirmado' && dataAgendamento && dataAgendamento.getTime() >= hoje.getTime()
    }

    return false
  })
}

const getItensPagina = (tipo) => {
  const todos = getTodosPorTipo(tipo)
  const paginaAtual = paginasAtuais.value[tipo]
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA
  return todos.slice(inicio, inicio + ITENS_POR_PAGINA)
}

const getTotalPaginas = (tipo) => Math.max(1, Math.ceil(getTodosPorTipo(tipo).length / ITENS_POR_PAGINA))

const normalizarPaginas = () => {
  Object.keys(paginasAtuais.value).forEach((tipo) => {
    const maxPaginas = getTotalPaginas(tipo)
    paginasAtuais.value[tipo] = Math.min(Math.max(1, paginasAtuais.value[tipo]), maxPaginas)
  })
}

const totalPendentes = computed(() => getTodosPorTipo('pendentes').length)
const totalConfirmados = computed(() => getTodosPorTipo('confirmados').length)
const totalRecusados = computed(() => getTodosPorTipo('recusados').length)

const abas = computed(() => [
  { id: 'pendentes', label: 'Pendentes', total: totalPendentes.value },
  { id: 'confirmados', label: 'Confirmados', total: totalConfirmados.value },
  { id: 'recusados', label: 'Recusados', total: totalRecusados.value },
])

const nomeQuadraOperacao = computed(() => {
  return agendamentos.value[0]?.quadra?.nome || authStore.usuario?.quadra?.nome || 'sua quadra'
})

const tituloAbaAtiva = computed(() => {
  const titulos = {
    pendentes: 'Fila de aprovacao das reservas',
    confirmados: 'Agenda validada da quadra',
    recusados: 'Historico de recusas recentes',
  }

  return titulos[abaAtiva.value] || 'Controle operacional das reservas'
})

const subtituloAbaAtiva = computed(() => {
  const subtitulos = {
    pendentes: `Revise os pedidos vinculados a ${nomeQuadraOperacao.value} e decida quais horarios seguem para confirmacao.`,
    confirmados: 'Acompanhe os agendamentos futuros que ja estao liberados para operacao normal.',
    recusados: 'Consulte os pedidos encerrados e mantenha o historico de justificativas sempre acessivel.',
  }

  return subtitulos[abaAtiva.value] || 'Acompanhe os agendamentos vinculados a operacao da sua quadra.'
})

const resumoAbaAtiva = computed(() => {
  const abaSelecionada = abas.value.find((aba) => aba.id === abaAtiva.value)
  const total = abaSelecionada?.total || 0
  return `${total} ${total === 1 ? 'item' : 'itens'} em ${abaSelecionada?.label || 'Reservas'}`
})

const itensAbaAtiva = computed(() => getItensPagina(abaAtiva.value))
const totalPaginasAbaAtiva = computed(() => getTotalPaginas(abaAtiva.value))

const tituloEstadoVazio = computed(() => {
  const mensagens = {
    pendentes: 'Nenhum pedido pendente no momento.',
    confirmados: 'Nenhuma reserva futura confirmada.',
    recusados: 'Nenhum agendamento recusado.',
  }

  return mensagens[abaAtiva.value] || 'Nenhum agendamento encontrado.'
})

const descricaoEstadoVazio = computed(() => {
  const descricoes = {
    pendentes: 'Quando novos pedidos forem enviados para a quadra, eles aparecerao aqui para analise.',
    confirmados: 'Os agendamentos aprovados para datas futuras ficarao organizados nesta aba.',
    recusados: 'Os pedidos recusados aparecerao aqui com o motivo informado ao solicitante.',
  }

  return descricoes[abaAtiva.value] || 'Nao ha itens para exibir nesta etapa.'
})

const mudarPagina = (tipo, delta) => {
  const novaPagina = paginasAtuais.value[tipo] + delta
  const maxPaginas = getTotalPaginas(tipo)

  if (novaPagina >= 1 && novaPagina <= maxPaginas) {
    paginasAtuais.value[tipo] = novaPagina
  }
}

const normalizarAgendamento = (agendamento) => ({
  ...agendamento,
  solicitanteNome: agendamento.usuario?.nome || 'Sem usuario',
  timeNome: agendamento.time?.nome || 'Nao especificado',
  quadraNome: agendamento.quadra?.nome || authStore.usuario?.quadra?.nome || 'Quadra',
  codigoVerificacao: agendamento.codigoVerificacao || 'N/A',
  motivoRecusa: agendamento.motivoRecusa || '',
})

const carregarAgendamentos = async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/agendamentos/minha-quadra')
    agendamentos.value = Array.isArray(data) ? data : []
    quadraId.value = resolverQuadraId(agendamentos.value[0]?.quadra?.id || authStore.usuario?.quadraId)
    normalizarPaginas()
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Falha ao carregar agendamentos da quadra.',
    })
  } finally {
    isLoading.value = false
  }
}

const aceitarAgendamento = async (id) => {
  if (loadingCards.value.includes(id)) return

  loadingCards.value.push(id)
  try {
    await api.patch(`/agendamento/${id}/aceitar`)
    agendamentos.value = agendamentos.value.map((agendamento) =>
      agendamento.id === id ? { ...agendamento, status: 'Confirmado' } : agendamento,
    )
    normalizarPaginas()
    Swal.fire('Sucesso', 'Agendamento aceito!', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Erro', 'Nao foi possivel aceitar o agendamento.', 'error')
  } finally {
    loadingCards.value = loadingCards.value.filter((item) => item !== id)
  }
}

const abrirModalRecusa = (id) => {
  idParaRecusar.value = id
  modalRecusaAberto.value = true
}

const processarRecusa = async ({ id, motivo }) => {
  isRecusando.value = true
  loadingCards.value.push(id)

  try {
    await api.patch(`/agendamento/${id}/recusar`, { motivoRecusa: motivo })
    agendamentos.value = agendamentos.value.map((agendamento) =>
      agendamento.id === id
        ? { ...agendamento, status: 'Recusado', motivoRecusa: motivo }
        : agendamento,
    )
    modalRecusaAberto.value = false
    normalizarPaginas()
    Swal.fire('Recusado', 'O usuario sera notificado do motivo.', 'success')
  } catch (error) {
    console.error(error)
    Swal.fire('Erro', 'Falha ao recusar agendamento.', 'error')
  } finally {
    isRecusando.value = false
    loadingCards.value = loadingCards.value.filter((item) => item !== id)
  }
}

const abrirModalHojeEAmanha = () => {
  if (!quadraId.value) return

  const hoje = new Date()
  const amanha = new Date()
  amanha.setDate(hoje.getDate() + 1)

  datasModal.value = [
    { dia: hoje.getDate(), mes: hoje.getMonth() + 1, ano: hoje.getFullYear() },
    { dia: amanha.getDate(), mes: amanha.getMonth() + 1, ano: amanha.getFullYear() },
  ]
  modalAberto.value = true
}

const abrirModalDetalhes = (agendamento) => {
  modalAberto.value = false
  agendamentoSelecionado.value = normalizarAgendamento(agendamento)
  detalheAberto.value = true
}

onMounted(() => {
  carregarAgendamentos()
})
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  background: #f7f9fc;
}

.conteudo {
  flex: 1;
  margin-left: 250px;
  padding: 20px 32px 32px;
  min-width: 0;
  overflow-x: hidden;
}

.page-nav {
  margin-bottom: 18px;
}

.page-header {
  margin-bottom: 22px;
}

.header-copy,
.panel-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.header-topline,
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.title {
  margin: 0;
  font-size: 42px;
  line-height: 1.04;
  font-weight: 800;
  color: #2563eb;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.overview-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px 14px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
}

.metric-kicker,
.section-kicker {
  margin: 0;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.16em;
  font-weight: 800;
  text-transform: uppercase;
  color: #2563eb;
}

.metric-value {
  margin: 0;
  font-size: 30px;
  line-height: 1;
  font-weight: 800;
  color: #0f172a;
}

.metric-caption,
.section-subtitle,
.state-copy {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #64748b;
}

.overview-card-pending .metric-value {
  color: #d97706;
}

.overview-card-confirmed .metric-value {
  color: #059669;
}

.overview-card-refused .metric-value {
  color: #dc2626;
}

.agendamentos-panel {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
}

.panel-head {
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.panel-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.btn-top-action {
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.btn-top-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-top-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-top-action-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.btn-top-action-label-mobile {
  display: none;
}

.abas-config-container {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
  margin-bottom: 18px;
}

.aba-config {
  flex: 1;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 800;
  padding: 12px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.aba-config:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.aba-config.ativa {
  background: #ffffff;
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.16);
  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.12);
}

.badge-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
}

.aba-config.ativa .badge-total {
  background: #2563eb;
  color: #ffffff;
}

.state-card {
  min-height: 300px;
  border-radius: 20px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;
}

.state-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.state-card-loading {
  min-height: 320px;
}

.loader {
  width: 68px;
  height: 68px;
  border: 6px solid #dbe5f1;
  border-top-color: #2563eb;
  border-radius: 999px;
  animation: spin 1s linear infinite;
}

.content-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.agendamentos-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.paginacao-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
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
  min-height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.btn-paginacao:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.28);
  color: #2563eb;
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
}

.btn-paginacao:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .agendamentos-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 12px 14px 18px;
  }

  .page-nav {
    margin-bottom: 12px;
  }

  .title {
    font-size: 24px;
    line-height: 1.12;
    margin: 0 0 8px 0;
    padding-left: 0;
    min-height: auto;
    display: flex;
    align-items: center;
  }

  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 16px;
  }

  .overview-card {
    padding: 10px 8px 9px;
    border-radius: 14px;
    gap: 5px;
  }

  .metric-kicker,
  .section-kicker {
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  .metric-value {
    font-size: 20px;
  }

  .metric-caption {
    font-size: 9px;
    line-height: 1.25;
  }

  .agendamentos-panel {
    padding: 18px;
    border-radius: 22px;
  }

  .panel-head {
    gap: 12px;
  }

  .panel-pill {
    min-height: 32px;
    font-size: 11px;
  }

  .panel-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .btn-top-action {
    width: 100%;
    min-height: 40px;
    border-radius: 16px;
    padding: 0 14px;
    justify-content: center;
  }

  .btn-top-action-label-desktop {
    display: none;
  }

  .btn-top-action-label-mobile {
    display: inline;
  }

  .abas-config-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    padding: 5px;
    overflow: visible;
  }

  .aba-config {
    min-width: 0;
    padding: 10px 6px;
    font-size: 12px;
    gap: 6px;
    flex: none;
    white-space: nowrap;
  }

  .badge-total {
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    font-size: 10px;
  }

  .state-card,
  .state-card-loading {
    min-height: 240px;
    border-radius: 18px;
  }

  .state-title {
    font-size: 20px;
  }

  .content-stack {
    gap: 16px;
  }

  .agendamentos-grid {
    gap: 14px;
  }

  .paginacao-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .info-paginacao {
    text-align: center;
    font-size: 13px;
  }

  .btn-paginacao {
    width: 100%;
  }
}
</style>
