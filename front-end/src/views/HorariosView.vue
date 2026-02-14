<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Horário Semanal da Quadra</h1>
        <NavBarUse />

        <div class="controles-topo">
          <select v-model="quadraSelecionada" @change="buscarHorarios" class="select-quadra">
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

        <table v-if="!isLoading" class="tabela-horarios" id="tabela-agenda">
          <thead>
            <tr>
              <th class="col-hora">Hora</th>
              <th v-for="(dia, index) in diasSemana" :key="index">{{ dia }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(hora, idx) in horarios" :key="hora" :class="idx % 2 === 0 ? 'linha-branca' : 'linha-cinza'">
              <td class="col-hora">{{ hora }}</td>
              <td v-for="(dia, index) in diasSemana" :key="dia + hora" :class="{
                reservado: agenda[`${index}-${hora}`]?.time || agenda[`${index}-${hora}`]?.usuario,
                disponivel: !agenda[`${index}-${hora}`]
              }" @click="agenda[`${index}-${hora}`] && (agendamentoSelecionado = agenda[`${index}-${hora}`])">
                <span v-if="agenda[`${index}-${hora}`]">
                  <span v-if="agenda[`${index}-${hora}`].time">
                    {{ agenda[`${index}-${hora}`].time }}
                  </span>
                  <span v-else>
                    {{ agenda[`${index}-${hora}`].usuario }}
                  </span>
                </span>
                <span v-else>Disponível</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="isLoading" class="loader-spacer"></div>
      </div>
    </div>

    <DetalheAgendModal v-if="agendamentoSelecionado" :agendamento="agendamentoSelecionado"
      @fechar="agendamentoSelecionado = null" />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { startOfWeek, addDays, format, differenceInCalendarDays } from "date-fns";
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
    const agenda = ref({});
    const isLoading = ref(false);
    const agendamentoSelecionado = ref(null);

    const hoje = new Date();
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });

    const diasSemana = Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(inicioSemana, i);
      const diaStr = format(d, 'dd/MM');
      const nomeDia = format(d, 'EEEE', { locale: ptBR });
      return nomeDia.charAt(0).toUpperCase() + nomeDia.slice(1) + ', ' + diaStr;
    });

    const horarios = Array.from({ length: 17 }).map((_, i) => {
      const inicio = 7 + i;
      const fim = (inicio + 1) % 24;
      return `${String(inicio).padStart(2, "0")}:00 - ${String(fim).padStart(2, "0")}:00`;
    });

    const buscarQuadras = async () => {
      try {
        const { data } = await api.get("/quadra");
        quadras.value = data;

        if (data.length > 0) {
          const usuarioQuadraId = authStore.usuario?.quadraId;

          const quadraDoUsuario = data.find(q => q.id === usuarioQuadraId);

          if (quadraDoUsuario) {
            quadraSelecionada.value = quadraDoUsuario.id;
          } else {
            quadraSelecionada.value = data[0].id;
          }

          buscarHorarios();
        }
      } catch (error) {
        console.error("Erro ao carregar quadras", error.response?.data || error);
      }
    };

    const buscarHorarios = async () => {
      if (!quadraSelecionada.value) return;
      isLoading.value = true;

      try {
        const { data } = await api.get(
          `/agendamentos/quadra/${quadraSelecionada.value}/confirmados/semana`
        );

        const novaAgenda = {};

        data
          .filter(a => a.status === 'Confirmado' || a.status === 'confirmado')
          .forEach(a => {
            const dataAgendamento = new Date(a.ano, a.mes - 1, a.dia);
            const diffDias = differenceInCalendarDays(dataAgendamento, inicioSemana);

            if (diffDias >= 0 && diffDias < 7) {
              for (let i = 0; i < (a.duracao ?? 1); i++) {
                const horaInicio = a.hora + i;
                const horaFim = (horaInicio + 1) % 24;

                const strInicio = String(horaInicio).padStart(2, '0');
                const strFim = String(horaFim).padStart(2, '0');
                const faixaHoraria = `${strInicio}:00 - ${strFim}:00`;

                const chave = `${diffDias}-${faixaHoraria}`;

                novaAgenda[chave] = {
                  ...a,
                  time: a.time?.nome || null,
                  usuario: a.usuario.nome
                };
              }
            }
          });

        agenda.value = novaAgenda;

      } catch (err) {
        console.error("Erro ao carregar horários", err);
      } finally {
        isLoading.value = false;
      }
    };

    const gerarPDF = async () => {
      const doc = new jsPDF('l', 'mm', 'a4');
      const nomeQuadra = quadras.value.find(q => q.id === quadraSelecionada.value)?.nome || 'Quadra';
      const corPrimaria = [30, 58, 138];

      doc.setFillColor(...corPrimaria);
      doc.rect(0, 0, 297, 25, 'F');

      const img = new Image();
      img.src = logoImg;
      try {
        await new Promise((resolve) => {
          img.onload = () => {
            doc.addImage(img, 'PNG', 15, 6, 13, 13);
            resolve();
          };
          img.onerror = resolve;
        });
      } catch (e) {
        console.warn("Logo não carregada para o PDF");
      }

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("QuadraLivre", 32, 15);

      doc.setTextColor(...corPrimaria);
      doc.setFontSize(14);
      doc.text(`Relatório Semanal - ${nomeQuadra}`, 14, 33);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 38);

      const head = [['Hora', ...diasSemana]];
      const body = horarios.map(hora => {
        const linha = [hora];
        for (let i = 0; i < 7; i++) {
          const chave = `${i}-${hora}`;
          const agendamento = agenda.value[chave];
          linha.push(agendamento ? (agendamento.time || agendamento.usuario) : 'Disponível');
        }
        return linha;
      });

      autoTable(doc, {
        head: head,
        body: body,
        startY: 43,
        theme: 'grid',
        margin: { top: 10, bottom: 10, left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 2, halign: 'center', valign: 'middle' },
        headStyles: { fillColor: corPrimaria, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 25 }
        },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index > 0) {
            const texto = data.cell.raw;
            if (texto !== 'Disponível') {
              data.cell.styles.textColor = [37, 99, 235];
              data.cell.styles.fontStyle = 'bold';
            } else {
              data.cell.styles.textColor = [107, 114, 128];
            }
          }
        }
      });

      doc.save(`agenda_${nomeQuadra}_${format(new Date(), 'dd-MM')}.pdf`);
    };

    onMounted(() => {
      buscarQuadras();
    });

    return {
      diasSemana,
      horarios,
      quadras,
      quadraSelecionada,
      agenda,
      isLoading,
      agendamentoSelecionado,
      buscarHorarios,
      gerarPDF
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
  font-size: 14px;
  height: 45px;
  background-color: white;
}

.btn-pdf {
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;

  display: flex;
  align-items: center;
  gap: 8px;

  height: 45px;
  padding: 0 20px;
  white-space: nowrap;
}

.btn-pdf:hover {
  background-color: #2563EB;
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
  position: relative;
  min-height: 300px;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
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

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.tabela-horarios {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 14px;
}

.tabela-horarios th {
  background-color: #1E3A8A;
  color: #fff;
  padding: 10px;
  border: 1px solid #ddd;
}

.tabela-horarios td {
  border: 1px solid #ddd;
  padding: 8px;
}

.col-hora {
  font-weight: 600;
}

.disponivel {
  color: #6b7280;
}

.reservado {
  color: #2563eb;
  font-weight: 600;
}

.reservado:hover {
  cursor: pointer;
  text-decoration: underline;
}

.linha-branca {
  background-color: #ffffff;
}

.linha-cinza {
  background-color: #f5f5f5;
}
</style>