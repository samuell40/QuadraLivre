<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Grade Semanal da Quadra</h1>
        <NavBarUse />

        <div class="controles-topo">
          <select v-model="quadraSelecionada" @change="carregarTudo" class="select-quadra">
            <option v-for="quadra in quadras" :key="quadra.id" :value="quadra.id">
              {{ quadra.nome }}
            </option>
          </select>

          <button @click="gerarPDF" class="btn-pdf" :disabled="isLoading || !quadraSelecionada">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Gerar PDF
          </button>
        </div>
      </div>

      <div class="tabela-container">
        <div v-if="isLoading" class="loader-overlay">
          <div class="loader"></div>
        </div>

        <div v-if="!isLoading && gradeMontada.length === 0" class="aviso-vazio">
          <h3>Nenhum dia com horários configurados para esta quadra.</h3>
        </div>

        <table v-if="!isLoading && gradeMontada.length > 0" class="tabela-horarios" id="tabela-agenda">
          <thead>
            <tr>
              <th colspan="2" v-for="(dia, index) in diasSemanaHeader" :key="index" class="header-dia">
                {{ dia }}
              </th>
            </tr>
            <tr class="sub-header">
              <template v-for="i in gradeMontada.length" :key="i">
                <th class="col-min">Hr</th>
                <th>Time</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slotIndex in maxSlots" :key="slotIndex"
              :class="slotIndex % 2 === 0 ? 'linha-branca' : 'linha-cinza'">

              <template v-for="(colunaDia, colIndex) in gradeMontada" :key="colIndex">
                <template v-if="colunaDia[slotIndex - 1]">
                  <td class="celula-hora">{{ colunaDia[slotIndex - 1].horario }}</td>
                  <td class="celula-status" :class="{
                    'reservado': colunaDia[slotIndex - 1].ocupado,
                    'livre': !colunaDia[slotIndex - 1].ocupado
                  }" @click="abrirDetalhes(colunaDia[slotIndex - 1])">
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

    <DetalheAgendModal v-if="agendamentoSelecionado" :agendamento="agendamentoSelecionado"
      @fechar="agendamentoSelecionado = null" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/axios";
import { useAuthStore } from "@/store";
import SideBar from "@/components/SideBar.vue";
import NavBarUse from '@/components/NavBarUser.vue'
import DetalheAgendModal from "@/components/modals/Agendamentos/DetalharAgendModal.vue";
import logoImg from "@/assets/Cópia de xxxxx (2).png";

export default {
  name: "HorariosView",
  components: { SideBar, NavBarUse, DetalheAgendModal },
  setup() {
    const authStore = useAuthStore();
    const quadras = ref([]);
    const quadraSelecionada = ref(null);
    const isLoading = ref(false);
    const agendamentoSelecionado = ref(null);
    const diasSemanaHeader = ref([]);
    const gradeMontada = ref([]);
    const maxSlots = ref(0);
    const hoje = new Date();
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });
    const formatarHoraIntParaString = (h) => String(h).padStart(2, '0') + ":00";

    const extrairHoraMinutoStr = (ag) => {
      if (ag.datahora) {
        const d = new Date(ag.datahora);
        return format(d, 'HH:mm');
      }
      return String(ag.hora).padStart(2, '0') + ":00";
    };

    const buscarQuadras = async () => {
      try {
        const { data } = await api.get("/quadra");
        quadras.value = data;
        if (data.length > 0) {
          const usuarioQuadraId = authStore.usuario?.quadraId;
          const quadraDoUsuario = data.find(q => q.id === usuarioQuadraId);
          quadraSelecionada.value = quadraDoUsuario ? quadraDoUsuario.id : data[0].id;
          carregarTudo();
        }
      } catch (error) {
        console.error("Erro ao carregar quadras", error);
      }
    };

    const carregarTudo = async () => {
      if (!quadraSelecionada.value) return;
      isLoading.value = true;
      gradeMontada.value = [];
      diasSemanaHeader.value = [];
      maxSlots.value = 0;

      try {
        let slotsConfig = [];
        try {
          const res = await api.get(`/grade-horarios/${quadraSelecionada.value}`);
          slotsConfig = res.data;
        } catch (e) { console.warn("Grade não configurada."); }

        let diasAtivosIndices = [];
        if (!slotsConfig || slotsConfig.length === 0) {
          diasAtivosIndices = [0, 1, 2, 3, 4, 5, 6];
          for (let d = 0; d <= 6; d++) {
            for (let h = 7; h < 23; h++) {
              slotsConfig.push({ diaSemana: d, horario: formatarHoraIntParaString(h) });
            }
          }
        } else {
          const diasSet = new Set(slotsConfig.map(s => s.diaSemana));
          diasAtivosIndices = [...diasSet].sort();
        }

        const agendamentosRes = await api.get(
          `/agendamentos/quadra/${quadraSelecionada.value}/confirmados/semana`
        );
        const agendamentos = agendamentosRes.data;

        for (let i = 0; i < 7; i++) {
          const dataDoDia = addDays(inicioSemana, i);
          const diaSemanaBanco = dataDoDia.getDay();

          if (!diasAtivosIndices.includes(diaSemanaBanco)) continue;

          const diaStr = format(dataDoDia, 'dd/MM');
          const nomeDia = format(dataDoDia, 'EEEE', { locale: ptBR });
          const textoHeader = nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1).split('-')[0] + ', ' + diaStr;
          diasSemanaHeader.value.push(textoHeader);

          const slotsDoDia = slotsConfig.filter(s => {
             const ds = s.diaSemana !== undefined ? s.diaSemana : s.dia_semana;
             return Number(ds) === diaSemanaBanco;
          });
          slotsDoDia.sort((a, b) => a.horario.localeCompare(b.horario));

          const colunaDoDia = slotsDoDia.map(slot => {
            const agendamentoEncontrado = agendamentos.find(a => {
              const dataAg = a.datahora ? new Date(a.datahora) : new Date(a.ano, a.mes - 1, a.dia);
              
              const mesmaData = isSameDay(dataAg, dataDoDia);
              if (!mesmaData) return false;

              const horaAgStr = extrairHoraMinutoStr(a);
              return slot.horario === horaAgStr;
            });

            return {
              horario: slot.horario,
              ocupado: !!agendamentoEncontrado,
              texto: agendamentoEncontrado 
                ? (agendamentoEncontrado.time?.nome || agendamentoEncontrado.usuario?.nome || 'Reservado') 
                : 'Disponível',
              dadosAgendamento: agendamentoEncontrado
            };
          });

          gradeMontada.value.push(colunaDoDia);
          if (colunaDoDia.length > maxSlots.value) maxSlots.value = colunaDoDia.length;
        }

      } catch (err) { 
        console.error("Erro ao montar grade:", err); 
      } finally { 
        isLoading.value = false; 
      }
    };

    const abrirDetalhes = (celula) => {
      if (celula.ocupado && celula.dadosAgendamento) {
        agendamentoSelecionado.value = celula.dadosAgendamento;
      }
    };

    const gerarPDF = async () => {
      const doc = new jsPDF('l', 'mm', 'a4');
      const nomeQuadra = quadras.value.find(q => q.id === quadraSelecionada.value)?.nome || 'Quadra';

      const corHeaderDia = [30, 58, 138];
      const corSubHeaderBg = [226, 232, 240];
      const corSubHeaderTxt = [30, 41, 59];
      const corReservadoBg = [255, 255, 255];
      const corReservadoTxt = [30, 58, 138];
      const corLivreTxt = [148, 163, 184];
      const corTraco = [203, 213, 225];

      doc.setFillColor(...corHeaderDia);
      doc.rect(0, 0, 297, 18, 'F');

      const img = new Image();
      img.src = logoImg;
      try {
        await new Promise((r) => { img.onload = r; img.onerror = r; });
        doc.addImage(img, 'PNG', 10, 3, 12, 12);
      } catch (e) { console.warn("Logo não carregada no PDF", e); }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("QuadraLivre", 26, 11);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...corHeaderDia);
      doc.text(`Horários: ${nomeQuadra}`, 10, 24);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      const dataGeracao = format(new Date(), "dd/MM HH:mm", { locale: ptBR });
      doc.text(`| Gerado em: ${dataGeracao}`, 80, 24);

      const diasAtivos = gradeMontada.value.length;
      const margemTotal = 10;
      const larguraUtilPagina = 297 - margemTotal;
      const larguraColunaHora = 12;
      const larguraTotalHoras = diasAtivos * larguraColunaHora;
      const espacoParaTimes = larguraUtilPagina - larguraTotalHoras;
      const larguraColunaTime = espacoParaTimes / diasAtivos;
      const estilosColunas = {};
      const totalColunasTabela = diasAtivos * 2;

      for (let i = 0; i < totalColunasTabela; i++) {
        if (i % 2 === 0) {
          estilosColunas[i] = { cellWidth: larguraColunaHora };
        } else {
          estilosColunas[i] = { cellWidth: larguraColunaTime };
        }
      }

      const head1 = diasSemanaHeader.value.map(dia => ({
        content: dia,
        colSpan: 2,
        styles: { halign: 'center', fillColor: corHeaderDia, textColor: 255, fontStyle: 'bold' }
      }));

      const head2 = [];
      for (let i = 0; i < diasAtivos; i++) {
        head2.push({
          content: 'Hr',
          styles: { halign: 'center', fillColor: corSubHeaderBg, textColor: corSubHeaderTxt, fontStyle: 'bold' }
        });
        head2.push({
          content: 'Time',
          styles: { halign: 'center', fillColor: corSubHeaderBg, textColor: corSubHeaderTxt, fontStyle: 'bold' }
        });
      }

      const body = [];
      for (let i = 0; i < maxSlots.value; i++) {
        const row = [];
        for (let d = 0; d < diasAtivos; d++) {
          const slot = gradeMontada.value[d][i];
          if (slot) {
            row.push(slot.horario);
            let texto = slot.texto === 'Disponível' ? '---' : slot.texto;
            if (texto.length > 22 && texto !== '---') texto = texto.substring(0, 20) + '...';
            row.push(texto);
          } else {
            row.push('-');
            row.push('---');
          }
        }
        body.push(row);
      }

      autoTable(doc, {
        head: [head1, head2],
        body: body,
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
          const colIndex = data.column.index;
          const text = data.cell.raw;
          const diaIndex = Math.floor(colIndex / 2);

          if (diaIndex % 2 !== 0 && data.section === 'body') {
            data.cell.styles.fillColor = [248, 250, 252];
          }

          if (data.section === 'body') {
            if (colIndex % 2 === 0) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [255, 255, 255];
              if (text === '-' || text === '---') data.cell.styles.textColor = corLivreTxt;
              else data.cell.styles.textColor = [71, 85, 105];
            } else {
              if (text && text !== '-' && text !== '---') {
                data.cell.styles.fillColor = corReservadoBg;
                data.cell.styles.textColor = corReservadoTxt;
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.fillColor = [255, 255, 255];
                data.cell.styles.textColor = corLivreTxt;
                if (text === '---') {
                  data.cell.styles.textColor = corTraco;
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          }
        }
      });

      doc.save(`grade_${nomeQuadra}.pdf`);
    };

    onMounted(() => { buscarQuadras(); });

    return {
      quadras, quadraSelecionada, isLoading, agendamentoSelecionado,
      diasSemanaHeader, gradeMontada, maxSlots,
      buscarQuadras, carregarTudo, gerarPDF, abrirDetalhes
    };
  },
};
</script>

<style scoped>
.layout {
  display: flex;
}

.conteudo {
  flex: 1;
  margin-left: 260px;
  padding: 20px;
}

.topo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.controles-topo {
  display: flex;
  gap: 10px;
  align-items: center;
}

.title {
  margin-top: 20px;
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
}

.select-quadra {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0 10px;
  height: 45px;
  background: white;
}

.btn-pdf {
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 45px;
  padding: 0 20px;
  white-space: nowrap;
}

.btn-pdf:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-pdf svg {
  width: 20px;
  height: 20px;
}

.tabela-container {
  overflow-x: auto;
  min-height: 300px;
  position: relative;
}

.tabela-horarios {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 13px;
  min-width: 1000px;
}

.tabela-horarios th,
.tabela-horarios td {
  border: 1px solid #ddd;
  padding: 6px;
}

.header-dia {
  background-color: #1E3A8A;
  color: white;
  font-size: 14px;
  text-transform: uppercase;
}

.sub-header th {
  background-color: #e2e8f0;
  color: #1e293b;
  font-weight: bold;
  font-size: 12px;
}

.col-min {
  width: 50px;
  background-color: #f8fafc;
  font-weight: bold;
  color: #64748b;
}

.celula-status {
  cursor: default;
}

.celula-status.reservado {
  color: #1E3A8A;
  font-weight: bold;
  cursor: pointer;
  background-color: #dbeafe;
}

.celula-status.livre {
  color: #94a3b8;
}

.celula-vazia {
  color: #cbd5e1;
  font-weight: bold;
  letter-spacing: 2px;
  user-select: none;
  background-color: #f8fafc;
  vertical-align: middle;
}

.linha-branca {
  background-color: #ffffff;
}

.linha-cinza {
  background-color: #f9fafb;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.aviso-vazio {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>