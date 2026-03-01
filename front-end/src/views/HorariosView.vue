<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <NavBarUse class="page-nav" />

      <section class="page-header">
        <div class="header-copy">
          <div class="header-topline">
            <h1 class="title">Grade Semanal</h1>
          </div>
        </div>
      </section>

      <section v-if="podeTrocarQuadra" class="controls-panel">
        <div class="panel-head">
          <div class="panel-copy">
            <p class="section-kicker">{{ kickerControles }}</p>
            <h2 class="section-title">{{ tituloControles }}</h2>
            <p class="section-subtitle">
              {{ subtituloControles }}
            </p>
          </div>
        </div>

        <div class="controls-row">
          <label class="filter-field">
            <select v-model="quadraSelecionada" @change="carregarTudo" class="select-quadra">
              <option v-for="quadra in quadras" :key="quadra.id" :value="quadra.id">
                {{ quadra.nome }}
              </option>
            </select>
          </label>
        </div>
      </section>

      <section class="schedule-panel">
        <div class="panel-head">
          <div class="panel-copy">
            <p class="section-kicker">SEMANA</p>
            <div class="section-topline">
              <h2 class="section-title">Agenda de {{ nomeQuadraSelecionada }}</h2>
              <button @click="gerarPDF" class="btn-pdf" :disabled="isLoading || !quadraSelecionada" title="Gerar PDF">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
                  <path d="M14 2v6h6"></path>
                  <text x="5" y="17" font-size="7" font-family="Arial, sans-serif" font-weight="bold" fill="currentColor" stroke="none">PDF</text>
                </svg>
                <span class="btn-pdf-label btn-pdf-label-desktop">Relatorio PDF</span>
                <span class="btn-pdf-label btn-pdf-label-mobile">PDF</span>
              </button>
            </div>
            <p class="section-subtitle">
              Horarios livres ficam apenas para consulta. Horarios reservados podem ser abertos para ver o agendamento.
            </p>
          </div>
        </div>

        <div class="tabela-container">
          <div v-if="isLoading" class="loader-overlay">
            <div class="loader"></div>
          </div>

          <div v-else-if="gradeMontada.length === 0" class="state-card">
            <p class="state-title">Nenhum dia com horarios configurados para esta quadra.</p>
            <p class="state-copy">Ajuste a grade da unidade para exibir a semana operacional aqui.</p>
          </div>

          <div v-else class="tabela-shell">
            <table class="tabela-horarios" id="tabela-agenda">
              <thead>
                <tr>
                  <th colspan="2" v-for="(dia, index) in diasSemanaHeader" :key="index" class="header-dia">
                    {{ dia }}
                  </th>
                </tr>

                <tr class="sub-header">
                  <template v-for="(colunaDia, index) in gradeMontada" :key="index">
                    <th class="col-min">Hr</th>
                    <th>Time</th>
                  </template>
                </tr>
              </thead>

              <tbody>
                <tr v-for="slotIndex in maxSlots" :key="slotIndex" :class="slotIndex % 2 === 0 ? 'linha-branca' : 'linha-cinza'">
                  <template v-for="(colunaDia, colIndex) in gradeMontada" :key="colIndex">
                    <template v-if="colunaDia[slotIndex - 1]">
                      <td class="celula-hora">{{ colunaDia[slotIndex - 1].horario }}</td>
                      <td
                        class="celula-status"
                        :class="{
                          reservado: colunaDia[slotIndex - 1].ocupado,
                          livre: !colunaDia[slotIndex - 1].ocupado
                        }"
                        @click="abrirDetalhes(colunaDia[slotIndex - 1])"
                      >
                        {{ colunaDia[slotIndex - 1].texto }}
                      </td>
                    </template>

                    <template v-else>
                      <td class="celula-vazia">---</td>
                      <td class="celula-vazia">---</td>
                    </template>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>

    <DetalheAgendModal
      v-if="agendamentoSelecionado"
      :agendamento="agendamentoSelecionado"
      @fechar="agendamentoSelecionado = null"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { startOfWeek, addDays, format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/axios'
import { useAuthStore } from '@/store'
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import DetalheAgendModal from '@/components/modals/Agendamentos/DetalharAgendModal.vue'
import logoImg from '@/assets/Cópia de xxxxx (2).png'

export default {
  name: 'HorariosView',
  components: { SideBar, NavBarUse, DetalheAgendModal },
  setup() {
    const authStore = useAuthStore()
    const quadras = ref([])
    const quadraSelecionada = ref(null)
    const isLoading = ref(false)
    const agendamentoSelecionado = ref(null)
    const diasSemanaHeader = ref([])
    const gradeMontada = ref([])
    const maxSlots = ref(0)
    const hoje = new Date()
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 })
    const formatarHoraIntParaString = (h) => String(h).padStart(2, '0') + ':00'

    const podeTrocarQuadra = computed(() => Number(authStore.usuario?.permissaoId) === 1)

    const nomeQuadraSelecionada = computed(() => {
      return quadras.value.find((q) => Number(q.id) === Number(quadraSelecionada.value))?.nome || authStore.usuario?.quadra?.nome || 'Quadra'
    })
    const kickerControles = computed(() => (podeTrocarQuadra.value ? 'FILTROS' : 'UNIDADE'))
    const tituloControles = computed(() => (podeTrocarQuadra.value ? 'Selecione a Quadra ' : 'Quadra vinculada'))
    const subtituloControles = computed(() => {
      if (podeTrocarQuadra.value) {
        return 'A grade abaixo reflete a quadra selecionada. Clique em um horario reservado para abrir os detalhes.'
      }

      return 'Esta agenda exibe apenas a unidade vinculada ao seu perfil administrativo.'
    })

    const totalDiasAtivos = computed(() => diasSemanaHeader.value.length)
    const totalSlotsConfigurados = computed(() => {
      return gradeMontada.value.reduce((sum, coluna) => sum + coluna.length, 0)
    })
    const totalReservasSemana = computed(() => {
      return gradeMontada.value.reduce((sum, coluna) => {
        return sum + coluna.filter((slot) => slot.ocupado).length
      }, 0)
    })

    const extrairHoraMinutoStr = (ag) => {
      if (ag.datahora) {
        const d = new Date(ag.datahora)
        return format(d, 'HH:mm')
      }
      return String(ag.hora).padStart(2, '0') + ':00'
    }

    const buscarQuadras = async () => {
      try {
        const { data } = await api.get('/quadra')
        const usuarioQuadraId = Number(authStore.usuario?.quadraId)
        const quadraDoUsuario = data.find((q) => Number(q.id) === usuarioQuadraId)

        if (Number(authStore.usuario?.permissaoId) === 2) {
          quadras.value = quadraDoUsuario ? [quadraDoUsuario] : []
          quadraSelecionada.value = quadraDoUsuario?.id || null
        } else {
          quadras.value = data
          if (data.length > 0) {
            quadraSelecionada.value = quadraDoUsuario ? quadraDoUsuario.id : data[0].id
          }
        }

        if (quadraSelecionada.value) {
          carregarTudo()
        }
      } catch (error) {
        console.error('Erro ao carregar quadras', error)
      }
    }

    const carregarTudo = async () => {
      if (!quadraSelecionada.value) return
      isLoading.value = true
      gradeMontada.value = []
      diasSemanaHeader.value = []
      maxSlots.value = 0

      try {
        let slotsConfig = []
        try {
          const res = await api.get(`/grade-horarios/${quadraSelecionada.value}`)
          slotsConfig = res.data
        } catch (e) {
          console.warn('Grade nao configurada.')
        }

        let diasAtivosIndices = []
        if (!slotsConfig || slotsConfig.length === 0) {
          diasAtivosIndices = [0, 1, 2, 3, 4, 5, 6]
          for (let d = 0; d <= 6; d++) {
            for (let h = 7; h < 23; h++) {
              slotsConfig.push({ diaSemana: d, horario: formatarHoraIntParaString(h) })
            }
          }
        } else {
          const diasSet = new Set(slotsConfig.map((s) => s.diaSemana))
          diasAtivosIndices = [...diasSet].sort()
        }

        const agendamentosRes = await api.get(`/agendamentos/quadra/${quadraSelecionada.value}/confirmados/semana`)
        const agendamentos = agendamentosRes.data

        for (let i = 0; i < 7; i++) {
          const dataDoDia = addDays(inicioSemana, i)
          const diaSemanaBanco = dataDoDia.getDay()

          if (!diasAtivosIndices.includes(diaSemanaBanco)) continue

          const diaStr = format(dataDoDia, 'dd/MM')
          const nomeDia = format(dataDoDia, 'EEEE', { locale: ptBR })
          const textoHeader = nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1).split('-')[0] + ', ' + diaStr
          diasSemanaHeader.value.push(textoHeader)

          const slotsDoDia = slotsConfig.filter((s) => {
            const ds = s.diaSemana !== undefined ? s.diaSemana : s.dia_semana
            return Number(ds) === diaSemanaBanco
          })
          slotsDoDia.sort((a, b) => a.horario.localeCompare(b.horario))

          const colunaDoDia = slotsDoDia.map((slot) => {
            const agendamentoEncontrado = agendamentos.find((a) => {
              const dataAg = a.datahora ? new Date(a.datahora) : new Date(a.ano, a.mes - 1, a.dia)

              const mesmaData = isSameDay(dataAg, dataDoDia)
              if (!mesmaData) return false

              const horaAgStr = extrairHoraMinutoStr(a)
              return slot.horario === horaAgStr
            })

            return {
              horario: slot.horario,
              ocupado: !!agendamentoEncontrado,
              texto: agendamentoEncontrado
                ? (agendamentoEncontrado.time?.nome || agendamentoEncontrado.usuario?.nome || 'Reservado')
                : 'Disponivel',
              dadosAgendamento: agendamentoEncontrado
            }
          })

          gradeMontada.value.push(colunaDoDia)
          if (colunaDoDia.length > maxSlots.value) maxSlots.value = colunaDoDia.length
        }
      } catch (err) {
        console.error('Erro ao montar grade:', err)
      } finally {
        isLoading.value = false
      }
    }

    const abrirDetalhes = (celula) => {
      if (celula.ocupado && celula.dadosAgendamento) {
        agendamentoSelecionado.value = celula.dadosAgendamento
      }
    }

    const gerarPDF = async () => {
      const doc = new jsPDF('l', 'mm', 'a4')
      const nomeQuadra = nomeQuadraSelecionada.value

      const corHeaderDia = [30, 58, 138]
      const corSubHeaderBg = [226, 232, 240]
      const corSubHeaderTxt = [30, 41, 59]
      const corReservadoBg = [255, 255, 255]
      const corReservadoTxt = [30, 58, 138]
      const corLivreTxt = [148, 163, 184]
      const corTraco = [203, 213, 225]

      doc.setFillColor(...corHeaderDia)
      doc.rect(0, 0, 297, 18, 'F')

      const img = new Image()
      img.src = logoImg
      try {
        await new Promise((r) => {
          img.onload = r
          img.onerror = r
        })
        doc.addImage(img, 'PNG', 10, 3, 12, 12)
      } catch (e) {
        console.warn('Logo nao carregada no PDF', e)
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      doc.text('QuadraLivre', 26, 11)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(...corHeaderDia)
      doc.text(`Horarios: ${nomeQuadra}`, 10, 24)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(100)
      const dataGeracao = format(new Date(), 'dd/MM HH:mm', { locale: ptBR })
      doc.text(`| Gerado em: ${dataGeracao}`, 80, 24)

      const diasAtivos = gradeMontada.value.length
      const margemTotal = 10
      const larguraUtilPagina = 297 - margemTotal
      const larguraColunaHora = 12
      const larguraTotalHoras = diasAtivos * larguraColunaHora
      const espacoParaTimes = larguraUtilPagina - larguraTotalHoras
      const larguraColunaTime = espacoParaTimes / diasAtivos
      const estilosColunas = {}
      const totalColunasTabela = diasAtivos * 2

      for (let i = 0; i < totalColunasTabela; i++) {
        if (i % 2 === 0) {
          estilosColunas[i] = { cellWidth: larguraColunaHora }
        } else {
          estilosColunas[i] = { cellWidth: larguraColunaTime }
        }
      }

      const head1 = diasSemanaHeader.value.map((dia) => ({
        content: dia,
        colSpan: 2,
        styles: { halign: 'center', fillColor: corHeaderDia, textColor: 255, fontStyle: 'bold' }
      }))

      const head2 = []
      for (let i = 0; i < diasAtivos; i++) {
        head2.push({
          content: 'Hr',
          styles: { halign: 'center', fillColor: corSubHeaderBg, textColor: corSubHeaderTxt, fontStyle: 'bold' }
        })
        head2.push({
          content: 'Time',
          styles: { halign: 'center', fillColor: corSubHeaderBg, textColor: corSubHeaderTxt, fontStyle: 'bold' }
        })
      }

      const body = []
      for (let i = 0; i < maxSlots.value; i++) {
        const row = []
        for (let d = 0; d < diasAtivos; d++) {
          const slot = gradeMontada.value[d][i]
          if (slot) {
            row.push(slot.horario)
            let texto = slot.texto === 'Disponivel' ? '---' : slot.texto
            if (texto.length > 22 && texto !== '---') texto = texto.substring(0, 20) + '...'
            row.push(texto)
          } else {
            row.push('-')
            row.push('---')
          }
        }
        body.push(row)
      }

      autoTable(doc, {
        head: [head1, head2],
        body,
        startY: 28,
        theme: 'grid',
        margin: { left: 5, right: 5, bottom: 5 },
        columnStyles: estilosColunas,
        styles: {
          fontSize: 7,
          cellPadding: 1,
          valign: 'middle',
          halign: 'center',
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
          overflow: 'hidden'
        },
        didParseCell: (data) => {
          const colIndex = data.column.index
          const text = data.cell.raw
          const diaIndex = Math.floor(colIndex / 2)

          if (diaIndex % 2 !== 0 && data.section === 'body') {
            data.cell.styles.fillColor = [248, 250, 252]
          }

          if (data.section === 'body') {
            if (colIndex % 2 === 0) {
              data.cell.styles.fontStyle = 'bold'
              data.cell.styles.fillColor = [255, 255, 255]
              if (text === '-' || text === '---') data.cell.styles.textColor = corLivreTxt
              else data.cell.styles.textColor = [71, 85, 105]
            } else if (text && text !== '-' && text !== '---') {
              data.cell.styles.fillColor = corReservadoBg
              data.cell.styles.textColor = corReservadoTxt
              data.cell.styles.fontStyle = 'bold'
            } else {
              data.cell.styles.fillColor = [255, 255, 255]
              data.cell.styles.textColor = corLivreTxt
              if (text === '---') {
                data.cell.styles.textColor = corTraco
                data.cell.styles.fontStyle = 'bold'
              }
            }
          }
        }
      })

      doc.save(`grade_${nomeQuadra}.pdf`)
    }

    onMounted(() => {
      buscarQuadras()
    })

    return {
      quadras,
      quadraSelecionada,
      isLoading,
      agendamentoSelecionado,
      diasSemanaHeader,
      gradeMontada,
      maxSlots,
      podeTrocarQuadra,
      nomeQuadraSelecionada,
      kickerControles,
      tituloControles,
      subtituloControles,
      totalDiasAtivos,
      totalSlotsConfigurados,
      totalReservasSemana,
      buscarQuadras,
      carregarTudo,
      gerarPDF,
      abrirDetalhes
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f4f7fb;
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
  width: 100%;
}

.header-topline,
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.panel-head {
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 42px;
  line-height: 1.04;
  font-weight: 800;
  color: #2563eb;
}

.page-subtitle,
.section-subtitle,
.metric-caption,
.state-copy {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: #64748b;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.overview-card-slots .metric-value {
  color: #059669;
}

.overview-card-reserved .metric-value {
  color: #d97706;
}

.controls-panel,
.schedule-panel {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
}

.controls-panel {
  margin-bottom: 18px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.section-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
}

.section-topline .section-title {
  flex: 1;
  min-width: 0;
}

.controls-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.select-quadra {
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #f8fafc;
  font-size: 14px;
  color: #334155;
}

.select-quadra:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.quadra-fixa {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 46px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #f8fafc;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.btn-pdf {
  min-height: 46px;
  padding: 0 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  white-space: nowrap;
}

.btn-pdf:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-pdf-label {
  display: inline-flex;
  align-items: center;
}

.btn-pdf-label-mobile {
  display: none;
}

.tabela-container {
  position: relative;
  min-height: 320px;
}

.tabela-shell {
  overflow-x: auto;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  background: #ffffff;
}

.tabela-horarios {
  width: 100%;
  min-width: 1000px;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;
  font-size: 13px;
}

.tabela-horarios th,
.tabela-horarios td {
  padding: 8px 10px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.tabela-horarios th:last-child,
.tabela-horarios td:last-child {
  border-right: none;
}

.tabela-horarios tbody tr:last-child td {
  border-bottom: none;
}

.header-dia {
  background: #1e3a8a;
  color: #ffffff;
  font-size: 13px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.sub-header th {
  background: #eff6ff;
  color: #1e293b;
  font-weight: 800;
  font-size: 12px;
}

.col-min,
.celula-hora {
  width: 62px;
  background: #f8fafc;
  font-weight: 800;
  color: #475569;
}

.celula-status {
  cursor: default;
  transition: background 0.2s ease, color 0.2s ease;
}

.celula-status.reservado {
  color: #1e40af;
  font-weight: 800;
  cursor: pointer;
  background: rgba(37, 99, 235, 0.1);
}

.celula-status.reservado:hover {
  background: rgba(37, 99, 235, 0.16);
}

.celula-status.livre {
  color: #94a3b8;
}

.celula-vazia {
  color: #cbd5e1;
  font-weight: 800;
  letter-spacing: 1px;
  user-select: none;
  background: #f8fafc;
  vertical-align: middle;
}

.linha-branca td {
  background: #ffffff;
}

.linha-cinza td {
  background: #fbfdff;
}

.linha-branca .celula-hora,
.linha-cinza .celula-hora,
.linha-branca .celula-vazia,
.linha-cinza .celula-vazia {
  background: #f8fafc;
}

.linha-branca .celula-status.reservado,
.linha-cinza .celula-status.reservado {
  background: rgba(37, 99, 235, 0.1);
}

.loader-overlay,
.state-card {
  min-height: 320px;
  border-radius: 20px;
  background: #f8fafc;
}

.loader-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.9);
  z-index: 2;
}

.loader {
  width: 56px;
  height: 56px;
  border: 5px solid #e2e8f0;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  padding: 24px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
}

.state-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .controls-row,
  .panel-head {
    flex-direction: column;
    align-items: flex-start;
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
  }

  .overview-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .overview-card {
    padding: 10px 8px 9px;
    border-radius: 14px;
    gap: 5px;
  }

  .metric-kicker {
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

  .controls-panel,
  .schedule-panel {
    padding: 18px;
    border-radius: 22px;
  }

  .controls-row {
    flex-direction: row;
    width: 100%;
    align-items: stretch;
  }

  .btn-pdf {
    width: auto;
    min-width: 72px;
    height: 44px;
    min-height: 44px;
    padding: 0 12px;
    gap: 6px;
    flex: 0 0 auto;
    border-radius: 14px;
  }

  .btn-pdf-label-desktop {
    display: none;
  }

  .btn-pdf-label-mobile {
    display: inline-flex;
  }

  .section-topline {
    gap: 10px;
  }

  .tabela-container,
  .loader-overlay,
  .state-card {
    min-height: 260px;
  }
}
</style>
