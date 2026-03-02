<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <NavBarUse class="dashboard-nav" />

      <section class="page-header">
        <div class="header-copy">
          <div class="header-topline">
            <h1 class="title">{{ tituloDashboard }}</h1>
          </div>
        </div>
      </section>

      <section class="section_totalAgendamentos">
        <article class="card_contagem card_contagem-usuarios">
          <p class="card_kicker">USUÁRIOS</p>
          <div class="card_metric_row">
            <p class="card_valor">{{ totalUsuarios }}</p>
            <span class="card_legenda">Cadastrados em {{ anoAtual }}</span>
          </div>
        </article>

        <article class="card_contagem card_contagem-agendamentos">
          <p class="card_kicker">AGENDAMENTOS</p>
          <div class="card_metric_row">
            <p class="card_valor">{{ totalAgendamentos }}</p>
            <span class="card_legenda">Total Anual</span>
          </div>
        </article>

        <article class="card_contagem card_contagem-pendentes">
          <p class="card_kicker">PENDENTES</p>
          <div class="card_metric_row">
            <p class="card_valor">{{ totalPendentes }}</p>
            <span class="card_legenda">Aguardando resposta</span>
          </div>
        </article>

        <article class="card_contagem card_contagem-confirmados">
          <p class="card_kicker">CONFIRMADOS</p>
          <div class="card_metric_row">
            <p class="card_valor">{{ totalConfirmados }}</p>
            <span class="card_legenda">Reservas aprovadas</span>
          </div>
        </article>

        <article class="card_contagem card_contagem-recusados">
          <p class="card_kicker">RECUSADOS</p>
          <div class="card_metric_row">
            <p class="card_valor">{{ totalCancelados }}</p>
            <span class="card_legenda">Não Aceitos</span>
          </div>
        </article>
      </section>

      <section class="section_avisos">
        <div class="card_avisos_container">
          <div class="panel-head">
            <div class="panel-copy">
              <p class="section-kicker">AVISOS</p>
              <h2 class="section-title">Mural de avisos</h2>
              <p class="section-subtitle">Acompanhe recados recentes da administração e gerencie o que fica em destaque.
              </p>
            </div>

            <div class="header_actions">
              <button v-if="listaPendentes.length > 1" type="button" @click="exibirTodosAvisos = !exibirTodosAvisos"
                class="btn-padrao btn-secundario">
                {{ exibirTodosAvisos ? 'Ver menos' : 'Ver todos (' + listaPendentes.length + ')' }}
              </button>

              <button type="button" @click="abrirHistorico" class="btn-padrao btn-secundario">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-mini" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico
              </button>

              <button v-if="podePostar" type="button" @click="abrirModal" class="btn-padrao btn-primario">
                + Novo aviso
              </button>
            </div>
          </div>

          <div v-if="listaPendentes.length === 0" class="sem-avisos">
            <p class="sem-avisos-title">Nenhum aviso pendente.</p>
            <p class="sem-avisos-copy">Consulte o histórico para revisar as mensagens antigas quando precisar.</p>
          </div>

          <div class="lista_avisos" v-else>
            <article v-for="aviso in avisosExibidos" :key="aviso.id" class="card_aviso_item"
              :class="{ 'aviso-fixado': aviso.fixado }">
              <div class="aviso_topo">
                <div class="aviso_meta">
                  <span class="aviso_origem">{{ aviso.quadra?.nome || 'Equipe Quadra Livre' }}</span>
                  <span class="aviso_data">{{ formatarData(aviso.data) }}</span>
                </div>
                <span class="aviso_status" :class="{ 'aviso_status-fixado': aviso.fixado }">
                  {{ aviso.fixado ? 'Fixado' : 'Recente' }}
                </span>
              </div>

              <div class="aviso_conteudo">
                <h3>{{ aviso.titulo }}</h3>
                <p>{{ aviso.descricao }}</p>
              </div>

              <div class="aviso_footer">
                <span class="aviso_autor">Autor: {{ aviso.autor?.nome }}</span>

                <div class="aviso_actions_wrapper">
                  <button class="btn-ler" @click="marcarComoLido(aviso)">
                    <svg class="icon-check" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"
                      aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span>Marcar como lido</span>
                  </button>

                  <div class="aviso_actions" v-if="podePostar">
                    <button class="btn-icon btn-fixar" :class="{ 'btn-ativo': aviso.fixado }"
                      @click="alternarFixado(aviso)" :title="aviso.fixado ? 'Desafixar aviso' : 'Fixar aviso'">
                      <img v-if="aviso.fixado" :src="require('@/assets/icons/pin-slash.svg')" class="icon-svg"
                        alt="Desafixar" />
                      <img v-else :src="require('@/assets/icons/pin.svg')" class="icon-svg" alt="Fixar" />
                    </button>

                    <button v-if="usuarioLogado.id === aviso.autorId || usuarioLogado.permissaoId === 1"
                      class="btn-icon btn-excluir" @click="deletarAviso(aviso.id)" title="Excluir aviso">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div class="charts-toolbar">
        <div class="panel-copy">
          <p class="section-kicker">RELATÓRIOS</p>
          <h2 class="section-title">Gráficos operacionais</h2>
        </div>

        <button @click="gerarPDFGraficos" class="btn-pdf-side" :disabled="loading" title="Baixar PDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path>
            <path d="M14 2v6h6"></path>
            <text x="5" y="17" font-size="7" font-family="Arial, sans-serif" font-weight="bold" fill="currentColor"
              stroke="none">PDF</text>
          </svg>
          <span class="btn-pdf-label btn-pdf-label-desktop">Relatório PDF</span>
          <span class="btn-pdf-label btn-pdf-label-mobile">PDF</span>
        </button>
      </div>

      <section class="section_graficos_top">
        <article class="chart-panel">
          <div class="chart-panel-head">
            <p class="chart-kicker">Distribuição por modalidade</p>
          </div>
          <div class="chart-wrapper chart-wrapper-fixed">
            <div class="chart-container">
              <canvas id="agendamentosModalidadeChart"></canvas>
            </div>
          </div>
        </article>

        <article class="chart-panel">
          <div class="chart-panel-head">
            <p class="chart-kicker">Participação por Tipo</p>
          </div>
          <div class="chart-wrapper chart-wrapper-fixed">
            <div class="chart-area-pie">
              <canvas id="agendamentosTipoChart"></canvas>
            </div>
          </div>
        </article>
      </section>

      <section class="section_graficos_bottom">
        <article class="chart-panel chart-panel-full">
          <div class="chart-panel-head">
            <p class="chart-kicker">Agendamento por mês</p>
          </div>

          <div v-if="loading" class="loader-container-centralizado">
            <div class="loader"></div>
          </div>

          <div class="chart-wrapper chart-wrapper-fixed">
            <div class="chart-container-full">
              <canvas id="agendamentosMesChart"></canvas>
            </div>
          </div>
        </article>
      </section>

      <Teleport to="body">
        <div v-if="exibirModalAviso" class="modal-overlay" @click.self="exibirModalAviso = false">
          <div class="modal-content modal-form">
            <div class="modal-header">
              <div class="modal-header-copy">
                <h3 class="modal-title">Cadastrar novo aviso</h3>
                <p class="modal-subtitle">Preencha os dados e publique o recado no mural principal.</p>
              </div>
              <button type="button" class="btn-close-x-modal" @click="exibirModalAviso = false"
                aria-label="Fechar modal">x</button>
            </div>

            <div class="modal-body-scroll">
              <div class="form-group" v-if="usuarioLogado.permissaoId === 1">
                <label class="label-input">Quadra de destino</label>
                <select v-model="novoAviso.quadraId" class="input-estilizado">
                  <option value="" disabled>Selecione uma quadra</option>
                  <option :value="null">Aviso geral</option>
                  <option v-for="q in listaQuadras" :key="q.id" :value="q.id">{{ q.nome }}</option>
                </select>
              </div>

              <div class="form-group">
                <label class="label-input">Titulo</label>
                <input v-model="novoAviso.titulo" placeholder="Digite o título do aviso" class="input-estilizado" />
              </div>

              <div class="form-group">
                <label class="label-input">Descrição</label>
                <textarea v-model="novoAviso.descricao" placeholder="O que você quer avisar?"
                  class="input-estilizado area-texto"></textarea>
              </div>

              <label class="form-group-checkbox" for="fixarNovo">
                <input type="checkbox" id="fixarNovo" v-model="novoAviso.fixado" />
                <span>Fixar este aviso no topo.</span>
              </label>
            </div>

            <div class="modal-actions modal-actions-single">
              <button @click="enviarAviso" class="btn-confirmar" :disabled="enviando">
                {{ enviando ? 'Postando...' : 'Postar aviso' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="exibirModalHistorico" class="modal-overlay" @click.self="exibirModalHistorico = false">
          <div class="modal-content modal-historico">
            <div class="modal-header">
              <div class="modal-header-copy">
                <h3 class="modal-title">Avisos lidos</h3>
                <p class="modal-subtitle">Filtre por ano e origem para revisar comunicados antigos.</p>
              </div>
              <button type="button" class="btn-close-x-modal" @click="exibirModalHistorico = false"
                aria-label="Fechar modal">x</button>
            </div>

            <div class="filter-row filtros-full">
              <div>
                <label class="filtro-label">Filtrar por ano</label>
                <select v-model="filtroAno" class="input-estilizado">
                  <option value="todos">Todos</option>
                  <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">{{ ano }}</option>
                </select>
              </div>

              <div>
                <label class="filtro-label">Origem</label>
                <select v-model="filtroOrigem" class="input-estilizado">
                  <option value="todos">Todos</option>
                  <option value="geral">Geral</option>
                  <option value="quadra">Própria quadra</option>
                </select>
              </div>
            </div>

            <div class="lista_avisos lista_avisos_historico">
              <div v-if="listaLidosFiltrada.length === 0" class="sem-avisos sem-avisos-historico">
                <p class="sem-avisos-title">Nenhum aviso encontrado.</p>
                <p class="sem-avisos-copy">Não há avisos lidos para o filtro {{ filtroAno }}.</p>
              </div>

              <article v-else v-for="aviso in listaLidosFiltrada" :key="aviso.id"
                class="card_aviso_item card_aviso_item-historico">
                <div class="aviso_topo">
                  <div class="aviso_meta">
                    <span class="aviso_origem">{{ aviso.quadra?.nome || 'Aviso geral' }}</span>
                    <span class="aviso_data">{{ formatarData(aviso.data) }}</span>
                  </div>
                  <span class="aviso_status aviso_status-lido">Lido</span>
                </div>

                <div class="aviso_conteudo">
                  <h3>{{ aviso.titulo }}</h3>
                  <p>{{ aviso.descricao }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
<script>
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import { Chart, registerables } from 'chart.js'
import { nextTick } from 'vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import jsPDF from "jspdf";
import logoImg from "@/assets/Cópia de xxxxx (2).png";

Chart.register(...registerables)

const pdfExportPlugin = {
  id: 'pdfExportPlugin',
  beforeDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    ctx.save();

    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#1E3A8A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      meta.data.forEach((element, index) => {
        const data = dataset.data[index];
        if (data > 0) {
          let x, y;

          if (chart.config.type === 'pie' || chart.config.type === 'doughnut') {
            const model = element;
            const midAngle = model.startAngle + (model.endAngle - model.startAngle) / 2;
            const radius = (model.outerRadius + model.innerRadius) / 2;

            x = model.x + Math.cos(midAngle) * radius;
            y = model.y + Math.sin(midAngle) * radius;

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;
          }
          else {
            x = element.x;
            y = element.y - 15;
            ctx.fillStyle = '#1E3A8A';
            ctx.shadowColor = "transparent";
          }
          ctx.fillText(data, x, y);
        }
      });
    });
    ctx.restore();
  }
};

export default {
  name: 'DashboardView',
  components: { SideBar, NavBarUse },
  data() {
    return {
      agendamentos: [],
      totalAgendamentos: 0,
      totalPendentes: 0,
      totalConfirmados: 0,
      totalCancelados: 0,
      totalUsuarios: 0,
      totalTimes: 0,
      totalModalidades: 0,
      agendamentosMesChart: null,
      agendamentosModalidadeChart: null,
      agendamentosTipoChart: null,
      loading: false,

      exibirTodosAvisos: false,
      todosAvisos: [],
      listaQuadras: [],
      exibirModalAviso: false,
      exibirModalHistorico: false,
      filtroAno: new Date().getFullYear(),
      filtroOrigem: 'todos',
      enviando: false,
      usuarioLogado: {},
      novoAviso: {
        titulo: '',
        descricao: '',
        fixado: false,
        quadraId: ""
      }
    }
  },
  computed: {
    anoAtual() {
      return new Date().getFullYear();
    },
    podePostar() {
      return this.usuarioLogado?.permissaoId === 1 || this.usuarioLogado?.permissaoId === 2;
    },
    listaPendentes() {
      return this.todosAvisos.filter(a => !this.verificarSeLi(a)).sort((a, b) => {
        if (a.fixado === b.fixado) return new Date(b.data) - new Date(a.data);
        return a.fixado ? -1 : 1;
      });
    },
    avisosExibidos() {
      if (this.exibirTodosAvisos) {
        return this.listaPendentes;
      }
      return this.listaPendentes.length > 0 ? [this.listaPendentes[0]] : [];
    },
    tituloDashboard() {
      const usuario = JSON.parse(localStorage.getItem("usuario"));

      if (usuario?.permissaoId === 1) {
        return 'Dashboard';
      }

      if (usuario?.permissaoId === 2 && usuario?.quadra?.nome) {
        return `Dashboard (${usuario.quadra.nome})`;
      }
      return 'Dashboard';
    },
    listaLidos() {
      return this.todosAvisos.filter(a => this.verificarSeLi(a));
    },
    listaLidosFiltrada() {
      return this.listaLidos.filter(aviso => {
        const anoAviso = new Date(aviso.data).getFullYear()

        const passaAno =
          this.filtroAno === 'todos' || anoAviso === Number(this.filtroAno)

        const passaOrigem =
          this.filtroOrigem === 'todos' ||
          (this.filtroOrigem === 'geral' && !aviso.quadra) ||
          (this.filtroOrigem === 'quadra' && aviso.quadra)

        return passaAno && passaOrigem
      })
    },
    anosDisponiveis() {
      const anos = this.listaLidos.map(a => new Date(a.data).getFullYear());
      const unicos = [...new Set(anos)];
      if (!unicos.includes(new Date().getFullYear())) {
        unicos.push(new Date().getFullYear());
      }
      return unicos.sort((a, b) => b - a);
    }
  },
  async mounted() {
    this.usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
    window.scrollTo(0, 0)

    if (this.usuarioLogado.quadraId) {
      this.novoAviso.quadraId = this.usuarioLogado.quadraId;
    }

    await Promise.all([
      this.carregarQuadrasParaSelect(),
      this.carregarUsuarios(),
      this.carregarTimes(),
      this.carregarModalidades()
    ]);

    this.carregarAvisos();
    this.carregarAgendamentos();
  },
  methods: {
    async gerarPDFGraficos() {
      const doc = new jsPDF('p', 'mm', 'a4');
      const corPrimaria = [30, 58, 138];

      doc.setFillColor(...corPrimaria);
      doc.rect(0, 0, 210, 25, 'F');

      const img = new Image();
      img.src = logoImg;
      await new Promise((resolve) => {
        img.onload = () => {
          doc.addImage(img, 'PNG', 15, 6, 13, 13);
          resolve();
        };
      });

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("QuadraLivre", 32, 15);
      doc.setTextColor(...corPrimaria);
      doc.setFontSize(16);
      doc.text(`Relatório de Agendamentos - ${this.tituloDashboard}`, 105, 45, null, null, "center");

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`, 105, 51, null, null, "center");

      let cursorY = 70;

      const capturarGraficoComNumeros = (chartId) => {
        const chartInstance = Chart.getChart(chartId);
        if (!chartInstance) return null;

        Chart.register(pdfExportPlugin);
        chartInstance.update('none');
        const imgData = chartInstance.canvas.toDataURL("image/png", 1.0);
        Chart.unregister(pdfExportPlugin);
        chartInstance.update('none');

        return imgData;
      };

      const adicionarAoPDF = (imgData, titulo, isPie = false) => {
        if (!imgData) return;

        doc.setFontSize(12);
        doc.setTextColor(...corPrimaria);
        doc.setFont("helvetica", "bold");
        doc.text(titulo, 15, cursorY);

        const imgProps = doc.getImageProperties(imgData);
        let pdfWidth = 180;
        let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (isPie) {
          pdfWidth = 100;
          pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(imgData, 'PNG', 55, cursorY + 5, pdfWidth, pdfHeight);
        } else {
          doc.addImage(imgData, 'PNG', 15, cursorY + 5, pdfWidth, pdfHeight);
        }

        cursorY += pdfHeight + 20;
      };

      const img1 = capturarGraficoComNumeros('agendamentosModalidadeChart');
      adicionarAoPDF(img1, '1. Agendamentos por Modalidade');

      if (cursorY > 200) { doc.addPage(); cursorY = 20; }
      const img2 = capturarGraficoComNumeros('agendamentosTipoChart');
      adicionarAoPDF(img2, '2. Agendamentos por Tipo', true);

      if (cursorY > 200) { doc.addPage(); cursorY = 20; }
      const img3 = capturarGraficoComNumeros('agendamentosMesChart');
      adicionarAoPDF(img3, '3. Evolucao Mensal');

      doc.save(`relatorio_graficos_${new Date().toISOString().slice(0, 10)}.pdf`);
    },

    verificarSeLi(aviso) {
      if (!this.usuarioLogado?.id || !aviso.leituras) return false;
      return aviso.leituras.some(leitura => String(leitura.usuarioId) === String(this.usuarioLogado.id));
    },

    abrirModal() {
      if (this.usuarioLogado.permissaoId === 2 && this.usuarioLogado.quadraId) {
        this.novoAviso.quadraId = this.usuarioLogado.quadraId;
      } else {
        this.novoAviso.quadraId = "";
      }
      this.exibirModalAviso = true;
    },

    abrirHistorico() {
      this.exibirModalHistorico = true;
    },

    async carregarQuadrasParaSelect() {
      if (this.listaQuadras.length > 0) return;
      try {
        const res = await api.get('/quadra');
        this.listaQuadras = res.data;
      } catch (error) {
        console.error("Erro ao carregar lista de quadras", error);
      }
    },

    async carregarUsuarios() {
      try {
        const res = await api.get('/usuarios');
        const usuarios = Array.isArray(res.data) ? res.data : [];
        this.totalUsuarios = usuarios.filter((usuario) => {
          const dataCadastro =
            usuario?.dataCadastro ||
            usuario?.createdAt ||
            usuario?.criadoEm ||
            null;

          if (!dataCadastro) return false;

          const data = new Date(dataCadastro);
          if (Number.isNaN(data.getTime())) return false;

          return data.getFullYear() === this.anoAtual;
        }).length;
      }
      catch (error) {
        console.error(error);
      }
    },

    async carregarTimes() {
      try {
        const res = await api.get('/times');
        this.totalTimes = Array.isArray(res.data) ? res.data.length : 0;
      }
      catch (error) {
        console.error(error);
      }
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade');
        this.totalModalidades = Array.isArray(res.data) ? res.data.length : 0;
      }
      catch (error) {
        console.error(error);
      }
    },

    async carregarAgendamentos() {
      try {
        this.loading = true
        let data = []
        if (this.usuarioLogado?.permissaoId === 1) {
          const res = await api.get('/agendamentos/todos')
          data = res.data
        } else if (this.usuarioLogado?.permissaoId === 2) {
          if (!this.usuarioLogado.quadraId) return
          const res = await api.get(`/agendamentos/quadra/${this.usuarioLogado.quadraId}`)
          data = res.data
        } else {
          return
        }
        const anoAtual = new Date().getFullYear()
        this.agendamentos = data.filter(a => {
          if (a.ano) return a.ano === anoAtual
          if (a.data) return new Date(a.data).getFullYear() === anoAtual
          return false
        })
        this.totalAgendamentos = this.agendamentos.length
        this.totalPendentes = this.agendamentos.filter(a => a.status === 'Pendente').length
        this.totalConfirmados = this.agendamentos.filter(a => a.status === 'Confirmado').length
        this.totalCancelados = this.agendamentos.filter(a => a.status === 'Recusado').length

        await nextTick()
        this.renderAgendamentosModalidadeChart()
        this.renderAgendamentosTipoChart()
        this.renderAgendamentosMesChart()
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error)
      } finally {
        this.loading = false
      }
    },

    async carregarAvisos() {
      try {
        let requests = [];

        requests.push(
          api.get(`/quadras/geral/avisos`).catch(() => ({ data: [] }))
        );

        if (this.usuarioLogado.permissaoId === 1) {
          if (this.listaQuadras.length === 0) {
            await this.carregarQuadrasParaSelect();
          }
          this.listaQuadras.forEach(q => {
            requests.push(api.get(`/quadras/${q.id}/avisos`).catch(() => ({ data: [] })));
          });
        }
        else if (this.usuarioLogado.quadraId) {
          requests.push(api.get(`/quadras/${this.usuarioLogado.quadraId}/avisos`).catch(() => ({ data: [] })));
        }

        const respostas = await Promise.all(requests);
        let tempAvisos = [];
        respostas.forEach(res => {
          if (res && Array.isArray(res.data)) {
            tempAvisos.push(...res.data);
          }
        });

        this.todosAvisos = [...new Map(tempAvisos.map(item => [item.id, item])).values()];

      } catch (error) {
        console.error('Erro ao carregar avisos', error);
      }
    },

    async marcarComoLido(aviso) {
      try {
        await api.post(`/avisos/${aviso.id}/ler`, { usuarioId: this.usuarioLogado.id });

        if (!aviso.leituras) aviso.leituras = [];
        aviso.leituras.push({ usuarioId: this.usuarioLogado.id });

        const Toast = Swal.mixin({
          toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
        });
        Toast.fire({ icon: 'success', title: 'Lido' });
      } catch (error) {
        console.error("Erro ao ler", error);
      }
    },

    async enviarAviso() {
      const ehAdmin = this.usuarioLogado.permissaoId === 1;
      const quadraObrigatoria = !ehAdmin;

      if (!this.novoAviso.titulo || !this.novoAviso.descricao || (quadraObrigatoria && !this.novoAviso.quadraId) || (ehAdmin && this.novoAviso.quadraId === "")) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos Incompletos',
          text: 'Preencha título, descrição e escolha o destino.',
          confirmButtonColor: '#1E3A8A',
        });
        return;
      }

      try {
        this.enviando = true;
        await api.post('/avisos', {
          titulo: this.novoAviso.titulo,
          descricao: this.novoAviso.descricao,
          fixado: this.novoAviso.fixado,
          quadraId: this.novoAviso.quadraId,
          autorId: this.usuarioLogado.id
        });

        const quadraMantida = this.usuarioLogado.permissaoId === 2 ? this.usuarioLogado.quadraId : "";
        this.novoAviso = { titulo: '', descricao: '', fixado: false, quadraId: quadraMantida };

        this.exibirModalAviso = false;
        await this.carregarAvisos();

        Swal.fire({
          icon: 'success',
          title: 'Aviso Publicado',
          text: 'O aviso foi salvo com sucesso.',
          confirmButtonColor: '#1E3A8A',
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Erro na Operação',
          text: 'Falha ao registrar o aviso.',
          confirmButtonColor: '#1E3A8A',
        });
      } finally {
        this.enviando = false;
      }
    },

    formatarData(data) { return new Date(data).toLocaleDateString('pt-BR'); },
    async deletarAviso(id) {
      const result = await Swal.fire({
        title: 'Excluir Aviso?',
        text: "Essa ação não pode ser desfeita.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#1E3A8A',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/avisos/${id}`);
          await this.carregarAvisos();
          Swal.fire('Excluído!', 'O aviso foi removido.', 'success');
        } catch (error) {
          Swal.fire('Erro', 'Não foi possível excluir o aviso.', 'error');
        }
      }
    },
    async alternarFixado(aviso) {
      try {
        const novoStatus = !aviso.fixado;
        const index = this.todosAvisos.findIndex(a => a.id === aviso.id);
        if (index !== -1) this.todosAvisos[index].fixado = novoStatus;
        await api.patch(`/avisos/${aviso.id}/fixar`, { fixado: novoStatus });
        await this.carregarAvisos();
      } catch (error) {
        console.error("Erro ao fixar aviso", error);
        Swal.fire('Erro', 'Falha ao alterar status fixado.', 'error');
      }
    },

    renderAgendamentosModalidadeChart() {
      const canvas = document.getElementById('agendamentosModalidadeChart')
      if (this.agendamentosModalidadeChart) this.agendamentosModalidadeChart.destroy()
      const ctx = canvas.getContext('2d')

      const agendamentosConfirmados = this.agendamentos.filter(a => a.status === 'Confirmado')

      const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

      const nomesModalidades = agendamentosConfirmados.map(a => {
        let nome = 'Nao definido'
        if (a.modalidade?.nome) nome = a.modalidade.nome
        else if (a.quadra?.modalidades?.length > 0) nome = a.quadra.modalidades[0].nome
        return capitalize(nome)
      })

      const modalidades = [...new Set(nomesModalidades)]

      const quantidade = modalidades.map(m => nomesModalidades.filter(n => n === m).length)

      this.agendamentosModalidadeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: modalidades,
          datasets: [{
            label: 'Agendamentos Confirmados por Modalidade',
            data: quantidade,
            backgroundColor: '#3B82F6'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          layout: {
            padding: { top: 20 }
          }
        }
      })
    },
    renderAgendamentosTipoChart() {
      const canvas = document.getElementById('agendamentosTipoChart')
      if (this.agendamentosTipoChart) this.agendamentosTipoChart.destroy()
      const ctx = canvas.getContext('2d')

      const agendamentosConfirmados = this.agendamentos.filter(a => a.status === 'Confirmado')

      const tipos = ['AMISTOSO', 'TREINO', 'EVENTO', 'OUTRO']

      const quantidade = tipos.map(t => agendamentosConfirmados.filter(a => a.tipo === t).length)

      this.agendamentosTipoChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: tipos,
          datasets: [{ data: quantidade, backgroundColor: ['#152147', '#1E3A8A', '#3B82F6', '#D9D9D9', '#F7F9FC'] }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      })
    },
    renderAgendamentosMesChart() {
      const canvas = document.getElementById('agendamentosMesChart')
      if (this.agendamentosMesChart) this.agendamentosMesChart.destroy()
      const ctx = canvas.getContext('2d')

      const agendamentosConfirmados = this.agendamentos.filter(a => a.status === 'Confirmado')

      const mesesNomes = [
        'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]

      const mesesAgendamentos = agendamentosConfirmados.map(a => a.mes)

      if (mesesAgendamentos.length === 0) {
        this.agendamentosMesChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: mesesNomes,
            datasets: [{ label: 'Agendamentos Confirmados por Mês', data: new Array(12).fill(0), backgroundColor: '#1E3A8A' }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
            layout: { padding: { top: 20 } }
          }
        })
        return
      }

      const mesInicial = Math.min(...mesesAgendamentos) - 1
      const mesesFiltrados = mesesNomes.slice(mesInicial)

      const quantidade = mesesFiltrados.map((_, idx) =>
        agendamentosConfirmados.filter(a => a.mes === (mesInicial + idx + 1)).length
      )

      this.agendamentosMesChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mesesFiltrados,
          datasets: [{ label: 'Agendamentos Confirmados por Mês', data: quantidade, backgroundColor: '#1E3A8A' }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          layout: { padding: { top: 20 } }
        }
      })
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

.dashboard-nav {
  margin-bottom: 18px;
}

.page-header {
  margin-bottom: 22px;
}

.header-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.section-kicker,
.card_kicker,
.chart-kicker {
  margin: 0;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.18em;
  font-weight: 800;
  color: #2563eb;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-size: 42px;
  line-height: 1.04;
  font-weight: 800;
  color: #2563eb;
}

.section-subtitle,
.modal-subtitle {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
}

.section_totalAgendamentos {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.card_contagem {
  display: flex;
  flex-direction: column; 
  gap: 10px;
  padding: 16px 16px 14px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
}

.card_metric_row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card_valor {
  margin: 0;
  font-size: 28px;
  line-height: 1;
  font-weight: 800;
  color: #0f172a;
}

.card_legenda {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.card_contagem-usuarios .card_valor {
  color: #2563eb;
}

.card_contagem-agendamentos .card_valor {
  color: #0f172a;
}

.card_contagem-pendentes .card_valor {
  color: #d97706;
}

.card_contagem-confirmados .card_valor {
  color: #059669;
}

.card_contagem-recusados .card_valor {
  color: #dc2626;
}

.section_avisos {
  margin-bottom: 22px;
}

.card_avisos_container,
.chart-panel {
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.panel-head,
.chart-panel-head,
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
}

.panel-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.section-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.15;
  font-weight: 800;
  color: #0f172a;
}

.modal-title {
  margin: 0;
  font-size: 26px;
  line-height: 1.1;
  font-weight: 800;
  color: #2563eb;
}

.header_actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-padrao,
.btn-pdf-side,
.btn-confirmar {
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.btn-padrao:hover,
.btn-pdf-side:hover,
.btn-confirmar:hover {
  transform: translateY(-1px);
}

.btn-padrao {
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-secundario {
  background: #ffffff;
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
}

.btn-secundario:hover {
  background: rgba(37, 99, 235, 0.06);
}

.btn-primario,
.btn-confirmar,
.btn-pdf-side {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
}

.icon-mini {
  width: 16px;
  height: 16px;
}

.lista_avisos {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card_aviso_item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 12px 10px;
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.12);
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.card_aviso_item-historico {
  background: #f8fafc;
  gap: 8px;
  padding: 12px 12px 10px;
  border-radius: 16px;
}

.card_aviso_item-historico .aviso_meta {
  gap: 6px;
}

.card_aviso_item-historico .aviso_origem {
  font-size: 10px;
}

.card_aviso_item-historico .aviso_data,
.card_aviso_item-historico .aviso_autor {
  font-size: 11px;
}

.card_aviso_item-historico .aviso_status {
  min-height: 28px;
  padding: 0 9px;
  font-size: 10px;
}

.card_aviso_item-historico .aviso_conteudo h3 {
  margin: 0 0 5px;
  font-size: 18px;
  line-height: 1.04;
}

.card_aviso_item-historico .aviso_conteudo p {
  font-size: 13px;
  line-height: 1.38;
}

.aviso-fixado {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.08) 0%, #ffffff 100%);
  border-color: rgba(37, 99, 235, 0.22);
}

.aviso_topo,
.aviso_footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.aviso_meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.aviso_origem {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2563eb;
}

.aviso_data,
.aviso_autor {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.aviso_status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.aviso_status-fixado {
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}

.aviso_status-lido {
  background: rgba(5, 150, 105, 0.12);
  color: #047857;
}

.aviso_conteudo h3 {
  margin: 0 0 5px;
  font-size: 18px;
  line-height: 1.04;
  color: #0f172a;
}

.aviso_conteudo p {
  margin: 0;
  font-size: 13px;
  line-height: 1.38;
  color: #475569;
}

.aviso_actions_wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-left: auto;
}

.aviso_actions {
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-ler {
  height: 32px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(37, 99, 235, 0.06);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.icon-check {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
}

.btn-ler:hover {
  background: rgba(37, 99, 235, 0.12);
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #ffffff;
  color: #475569;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-icon:hover {
  background: #f8fafc;
}

.icon-svg {
  width: 15px;
  height: 15px;
}

.btn-fixar.btn-ativo {
  background: rgba(37, 99, 235, 0.1);
  border-color: rgba(37, 99, 235, 0.28);
}

.btn-excluir:hover {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.22);
}

.sem-avisos {
  margin-top: 20px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 24px;
  border-radius: 24px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  background: #f8fafc;
}

.sem-avisos-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.sem-avisos-copy {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: #64748b;
  max-width: 520px;
}

.charts-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.btn-pdf-side {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-pdf-label {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}


.btn-pdf-label-desktop {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.15;
}

.btn-pdf-label-mobile {
  display: none;
  align-items: center;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.12;
}

.btn-pdf-label {
  display: inline-flex;
  align-items: center;
}

.section_graficos_top {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.section_graficos_bottom {
  position: relative;
}

.chart-panel-full {
  min-height: 380px;
}

.chart-wrapper {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding-bottom: 0;
}

.chart-wrapper-fixed {
  margin-top: 16px;
}

.chart-container,
.chart-area-pie,
.chart-container-full {
  position: relative;
  width: 100%;
  min-width: 0;
}

.chart-container {
  height: 300px;
}

.chart-area-pie {
  height: 340px;
}

.chart-container-full {
  height: 320px;
}

.chart-container canvas,
.chart-area-pie canvas,
.chart-container-full canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
}

.chart-container canvas,
.chart-area-pie canvas,
.chart-container-full canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
}

.loader-container-centralizado {
  position: absolute;
  inset: 82px 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.88);
  z-index: 2;
}

.loader {
  border: 6px solid #e2e8f0;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 72px;
  height: 72px;
  animation: spin 1s linear infinite;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.62);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.modal-form {
  max-width: 760px;
}

.modal-historico {
  max-width: 980px;
}

.modal-body-scroll {
  overflow-y: auto;
  padding-right: 4px;
}

.modal-header-copy {
  flex: 1;
  min-width: 0;
}

.btn-close-x-modal {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.24);
  background: #ffffff;
  color: #2563eb;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 38px;
  padding: 0;
}

.btn-close-x-modal:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.label-input,
.filtro-label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.input-estilizado {
  width: 100%;
  min-height: 46px;
  padding: 0 10px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: #f8fafc;
  font-size: 14px;
  color: #334155;
}

.area-texto {
  min-height: 128px;
  padding: 12px 14px;
  resize: vertical;
}

.input-estilizado:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.45);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.form-group-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions-single .btn-confirmar {
  width: 100%;
  min-height: 44px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
}

.filter-row.filtros-full {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.lista_avisos_historico {
  max-height: 420px;
  overflow-y: auto;
  gap: 10px;
  padding-right: 4px;
}

.sem-avisos-historico {
  margin-top: 0;
  min-height: 140px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.btn-pdf-label-mobile {
  display: none;
}

@media (max-width: 1200px) {
  .section_totalAgendamentos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .section_graficos_top {
    grid-template-columns: 1fr;
  }

  .header-topline,
  .panel-head,
  .chart-panel-head,
  .modal-header {
    flex-direction: column;
    align-items: flex-start;
  }


  .charts-toolbar {
    flex-direction: row;
    align-items: center;
  }

  .header_actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 12px 14px 18px;
  }

  .dashboard-nav {
    margin-bottom: 12px;
  }

  .title,
  .section-title,
  .modal-title {
    font-size: 24px;
    line-height: 1.12;
  }

  .section-subtitle,
  .modal-subtitle,
  .aviso_conteudo p {
    font-size: 14px;
  }

  .section_totalAgendamentos {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .section_graficos_top,
  .filter-row.filtros-full {
    grid-template-columns: 1fr;
  }

  .card_avisos_container,
  .chart-panel,
  .modal-content {
    padding: 18px;
    border-radius: 22px;
  }

  .modal-content .modal-header {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: nowrap;
  }

  .card_contagem {
    padding: 10px 8px 9px;
    border-radius: 14px;
    gap: 5px;
  }

  .card_kicker {
    font-size: 9px;
    letter-spacing: 0.08em;
  }

  .card_valor {
    font-size: 20px;
  }

  .card_legenda {
    font-size: 9px;
    line-height: 1.2;
  }

  .aviso_topo,
  .aviso_footer {
    align-items: flex-start;
  }

  .aviso_actions_wrapper {
    margin-left: 0;
  }

  .card_aviso_item-historico {
    gap: 6px;
    padding: 10px 10px 8px;
    border-radius: 14px;
  }

  .card_aviso_item-historico .aviso_conteudo h3 {
    margin-bottom: 4px;
    font-size: 16px;
  }

  .card_aviso_item-historico .aviso_conteudo p {
    font-size: 12px;
    line-height: 1.34;
  }

  .card_aviso_item-historico .aviso_status {
    min-height: 26px;
    padding: 0 8px;
  }

  .chart-container,
  .chart-area-pie,
  .chart-container-full {
    min-width: 0;
  }

  .chart-container {
    height: 220px;
  }

  .chart-area-pie {
    height: 300px;
  }

  .chart-container-full {
    height: 270px;
  }

  .chart-panel-full {
    height: auto;
    min-height: 0;
  }

  .loader-container-centralizado {
    inset: 84px 16px 16px;
  }

  .loader {
    width: 52px;
    height: 52px;
    border-width: 5px;
  }

  .modal-overlay {
    padding: 14px;
  }

  .charts-toolbar {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  .btn-pdf-side {
    min-height: 30px;
    padding: 0 8px;
    border-radius: 10px;
    gap: 6px;
    font-size: 14px;
    box-shadow: 0 6px 14px rgba(37, 99, 235, 0.18);
  }

  .btn-pdf-label-mobile {
    display: inline-flex;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }

  .btn-pdf-side svg {
    width: 18px;
    height: 18px;
  }

  .btn-pdf-label-desktop {
    display: none;
  }

}
</style>
