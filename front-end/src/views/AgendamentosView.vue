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
            <p class="section-kicker">OPERAÇÃO</p>
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
              <span class="btn-top-action-label-desktop">Visualizar horários</span>
              <span class="btn-top-action-label-mobile">Horários</span>
            </button>
          </div>
        </div>

        <div class="filters-toolbar">
          <label class="filter-field filter-field-quadra">
            <span class="filter-label">Quadra</span>

            <select
              v-if="podeTrocarQuadra"
              v-model.number="quadraId"
              class="input-filter input-filter-select"
              @change="carregarAgendamentos"
            >
              <option v-if="!quadras.length" :value="null">Nenhuma quadra disponivel</option>
              <option v-for="quadra in quadras" :key="quadra.id" :value="quadra.id">
                {{ quadra.nome }}
              </option>
            </select>

            <div v-else class="input-filter input-filter-static">
              {{ nomeQuadraOperacao }}
            </div>
          </label>

          <label class="filter-field filter-field-wide">
            <span class="filter-label">Buscar</span>
            <input
              v-model="filtroBusca"
              type="text"
              class="input-filter"
              placeholder="Usuario, time, codigo ou tipo"
            />
          </label>

          <label class="filter-field filter-field-date">
            <span class="filter-label">Data</span>
            <input v-model="filtroData" type="date" class="input-filter" />
          </label>

          <label class="filter-field filter-field-time">
            <span class="filter-label">Horario</span>
            <input v-model="filtroHorario" type="time" class="input-filter" />
          </label>

          <button
            type="button"
            class="btn-clear-filters"
            :disabled="!filtrosAtivos"
            @click="limparFiltros"
          >
            Limpar filtros
          </button>
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
                Página <strong>{{ paginasAtuais[abaAtiva] }}</strong> de {{ totalPaginasAbaAtiva }}
              </span>

              <button
                type="button"
                class="btn-paginacao"
                :disabled="paginasAtuais[abaAtiva] === totalPaginasAbaAtiva"
                @click="mudarPagina(abaAtiva, 1)"
              >
                <span>Próxima</span>
                <span>&gt;</span>
              </button>
            </div>
          </div>
        </template>

        <ListaAgendModal
          v-if="modalAberto && datasModal.length && quadraId"
          :quadraId="quadraId"
          :quadraNome="nomeQuadraOperacao"
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
import { computed, onMounted, ref, watch } from 'vue'
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
const normalizarTexto = (valor) => String(valor || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()

const agendamentos = ref([])
const quadras = ref([])
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
const filtroBusca = ref('')
const filtroData = ref('')
const filtroHorario = ref('')

const ITENS_POR_PAGINA = 10
const podeTrocarQuadra = computed(() => Number(authStore.usuario?.permissaoId) === 1)
const filtrosAtivos = computed(() =>
  Boolean(normalizarTexto(filtroBusca.value) || filtroData.value || filtroHorario.value),
)

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

const formatarDataFiltro = (data) => {
  if (!data) return ''

  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const obterHoraAgendamento = (agendamento) => {
  if (agendamento?.datahora) {
    const data = new Date(agendamento.datahora)
    if (Number.isNaN(data.getTime())) return ''
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
  }

  if (Number.isInteger(agendamento?.hora)) {
    return `${String(agendamento.hora).padStart(2, '0')}:00`
  }

  return ''
}

const agendamentosFiltrados = computed(() => {
  const busca = normalizarTexto(filtroBusca.value)

  return agendamentos.value.filter((agendamento) => {
    if (quadraId.value && Number(agendamento?.quadra?.id) !== Number(quadraId.value)) {
      return false
    }

    if (busca) {
      const conteudoBusca = [
        agendamento?.usuario?.nome,
        agendamento?.time?.nome,
        agendamento?.quadra?.nome,
        agendamento?.codigoVerificacao,
        agendamento?.tipo,
      ]
        .map(normalizarTexto)
        .join(' ')

      if (!conteudoBusca.includes(busca)) return false
    }

    if (filtroData.value) {
      const dataAgendamento = obterDataAgendamento(agendamento)
      if (formatarDataFiltro(dataAgendamento) !== filtroData.value) return false
    }

    if (filtroHorario.value) {
      if (obterHoraAgendamento(agendamento) !== filtroHorario.value) return false
    }

    return true
  })
})

const getTodosPorTipo = (tipo) => {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  return agendamentosFiltrados.value.filter((agendamento) => {
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

const resetarPaginas = () => {
  paginasAtuais.value = {
    pendentes: 1,
    confirmados: 1,
    recusados: 1,
  }
}

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
  const quadraSelecionada = quadras.value.find((quadra) => Number(quadra.id) === Number(quadraId.value))
  return quadraSelecionada?.nome || agendamentos.value[0]?.quadra?.nome || authStore.usuario?.quadra?.nome || 'a quadra selecionada'
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
    pendentes: `Revise os pedidos vinculados a ${nomeQuadraOperacao.value} e decida quais horários seguem para confirmação.`,
    confirmados: 'Acompanhe os agendamentos futuros que já estão liberados para operação normal.',
    recusados: 'Consulte os pedidos encerrados e mantenha o histórico de justificativas sempre acessível.',
  }

  return subtitulos[abaAtiva.value] || 'Acompanhe os agendamentos vinculados a operação da sua quadra.'
})

const resumoAbaAtiva = computed(() => {
  const abaSelecionada = abas.value.find((aba) => aba.id === abaAtiva.value)
  const total = abaSelecionada?.total || 0
  return `${total} ${total === 1 ? 'item' : 'itens'} em ${abaSelecionada?.label || 'Reservas'}`
})

const itensAbaAtiva = computed(() => getItensPagina(abaAtiva.value))
const totalPaginasAbaAtiva = computed(() => getTotalPaginas(abaAtiva.value))

const tituloEstadoVazio = computed(() => {
  if (podeTrocarQuadra.value && !quadraId.value) {
    return 'Selecione uma quadra para visualizar os agendamentos.'
  }

  if (filtrosAtivos.value) {
    return 'Nenhum agendamento corresponde aos filtros aplicados.'
  }

  const mensagens = {
    pendentes: 'Nenhum pedido pendente no momento.',
    confirmados: 'Nenhuma reserva futura confirmada.',
    recusados: 'Nenhum agendamento recusado.',
  }

  return mensagens[abaAtiva.value] || 'Nenhum agendamento encontrado.'
})

const descricaoEstadoVazio = computed(() => {
  if (podeTrocarQuadra.value && !quadraId.value) {
    return 'Escolha uma unidade no filtro acima para iniciar a operacao.'
  }

  if (filtrosAtivos.value) {
    return 'Ajuste a busca, data ou horario para ampliar o resultado desta aba.'
  }

  const descricoes = {
    pendentes: 'Quando novos pedidos forem enviados para a quadra, eles aparecerão aqui para análise.',
    confirmados: 'Os agendamentos aprovados para datas futuras ficarão organizados nesta aba.',
    recusados: 'Os pedidos recusados aparecerão aqui com o motivo informado ao solicitante.',
  }

  return descricoes[abaAtiva.value] || 'Não há itens para exibir nesta etapa.'
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
  timeNome: agendamento.time?.nome || 'Não especificado',
  quadraNome: agendamento.quadra?.nome || authStore.usuario?.quadra?.nome || 'Quadra',
  codigoVerificacao: agendamento.codigoVerificacao || 'N/A',
  motivoRecusa: agendamento.motivoRecusa || '',
})

const carregarQuadrasDisponiveis = async () => {
  try {
    const { data } = await api.get('/quadra')
    const listaQuadras = Array.isArray(data) ? data : []
    const quadraUsuarioId = resolverQuadraId(authStore.usuario?.quadraId)

    if (podeTrocarQuadra.value) {
      quadras.value = listaQuadras
      const quadraPadrao =
        listaQuadras.find((quadra) => Number(quadra.id) === quadraUsuarioId)?.id ??
        listaQuadras[0]?.id ??
        null
      quadraId.value = resolverQuadraId(quadraId.value) ?? resolverQuadraId(quadraPadrao)
      return
    }

    const quadraDoUsuario = listaQuadras.find((quadra) => Number(quadra.id) === quadraUsuarioId)
    quadras.value = quadraDoUsuario ? [quadraDoUsuario] : []
    quadraId.value = resolverQuadraId(quadraDoUsuario?.id ?? quadraId.value)
  } catch (error) {
    console.error('Erro ao carregar quadras disponiveis:', error)
    quadras.value = []
    quadraId.value = resolverQuadraId(authStore.usuario?.quadraId)
  }
}

const carregarAgendamentos = async () => {
  if (podeTrocarQuadra.value && !quadraId.value) {
    agendamentos.value = []
    resetarPaginas()
    normalizarPaginas()
    isLoading.value = false
    return
  }

  isLoading.value = true
  try {
    const endpoint = podeTrocarQuadra.value
      ? `/agendamentos/quadra/${quadraId.value}`
      : '/agendamentos/minha-quadra'
    const { data } = await api.get(endpoint)
    agendamentos.value = Array.isArray(data) ? data : []
    quadraId.value =
      resolverQuadraId(quadraId.value) ??
      resolverQuadraId(agendamentos.value[0]?.quadra?.id || authStore.usuario?.quadraId)
    normalizarPaginas()
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: podeTrocarQuadra.value
        ? 'Falha ao carregar agendamentos da quadra selecionada.'
        : 'Falha ao carregar agendamentos da quadra.',
    })
  } finally {
    isLoading.value = false
  }
}

const limparFiltros = () => {
  filtroBusca.value = ''
  filtroData.value = ''
  filtroHorario.value = ''
  resetarPaginas()
  normalizarPaginas()
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
    Swal.fire('Erro', 'Não foi possível aceitar o agendamento.', 'error')
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
    Swal.fire('Recusado', 'O usuário será notificado do motivo.', 'success')
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

watch([filtroBusca, filtroData, filtroHorario], () => {
  resetarPaginas()
  normalizarPaginas()
})

watch(
  agendamentosFiltrados,
  () => {
    normalizarPaginas()
  },
  { deep: true },
)

onMounted(async () => {
  await carregarQuadrasDisponiveis()
  await carregarAgendamentos()
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

.filters-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(240px, 1.5fr) repeat(2, minmax(150px, 0.8fr)) auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 18px;
  padding: 16px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.filter-field-wide {
  min-width: 0;
}

.filter-label {
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
}

.input-filter {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #ffffff;
  font-size: 14px;
  color: #0f172a;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.input-filter:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.input-filter-select {
  appearance: none;
}

.input-filter-static {
  display: flex;
  align-items: center;
  font-weight: 700;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
}

.btn-clear-filters {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid rgba(37, 99, 235, 0.18);
  background: #ffffff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.btn-clear-filters:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(37, 99, 235, 0.32);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.08);
}

.btn-clear-filters:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
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

  .filters-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .filters-toolbar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .btn-clear-filters {
    width: 100%;
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

  .filters-toolbar {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    padding: 14px;
    border-radius: 18px;
  }

  .filter-field-quadra {
    grid-column: span 3;
  }

  .filter-field-wide {
    grid-column: span 3;
  }

  .filter-field-date {
    grid-column: span 2;
  }

  .filter-field-time {
    grid-column: span 2;
  }

  .btn-clear-filters {
    grid-column: span 2;
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
