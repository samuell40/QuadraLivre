<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">

      <div class="header-dashboard">
        <h1 class="title">{{ tituloDashboard }}</h1>
      </div>

      <NavBarUse />

      <section class="section_totalAgendamentos">
        <div class="card_contagem">
          <h3>Usuarios</h3>
          <p>{{ totalUsuarios }}</p>
        </div>
        <div class="card_contagem">
          <h3>Agendamentos</h3>
          <p>{{ totalAgendamentos }}</p>
        </div>
        <div class="card_contagem">
          <h3>Pendentes</h3>
          <p>{{ totalPendentes }}</p>
        </div>
        <div class="card_contagem">
          <h3>Confirmados</h3>
          <p>{{ totalConfirmados }}</p>
        </div>
        <div class="card_contagem">
          <h3>Recusados</h3>
          <p>{{ totalCancelados }}</p>
        </div>
      </section>

      <section class="section_avisos">
        <div class="card_avisos_container">
          <div class="header_avisos">
            <h3 class="avisos">Mural de Avisos</h3>
            <div class="header_actions">
              <button v-if="listaPendentes.length > 1" type="button" @click="exibirTodosAvisos = !exibirTodosAvisos"
                class="btn-padrao btn-ver-mais">
                {{ exibirTodosAvisos ? 'Ver menos' : 'Ver todos (' + listaPendentes.length + ')' }}
              </button>

              <button type="button" @click="abrirHistorico" class="btn-padrao btn-historico">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-mini" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico
              </button>

              <button v-if="podePostar" type="button" @click="abrirModal" class="btn-padrao btn-novo-aviso">
                + Novo Aviso
              </button>
            </div>
          </div>

          <div v-if="listaPendentes.length === 0" class="sem-avisos">
            Nenhum aviso pendente. Consulte o histórico para ver mensagens antigas.
          </div>
          <div class="lista_avisos" v-else>
            <div v-for="aviso in avisosExibidos" :key="aviso.id" class="card_aviso_item"
              :class="{ 'aviso-fixado': aviso.fixado }">
              <div class="aviso_conteudo">
                <div class="aviso_meta">
                  <span class="aviso_origem" style="font-weight: bold; color: #3B82F6; margin-right: 8px;">
                    {{ aviso.quadra?.nome || ' EQUIPE QUADRA LIVRE ' }}
                  </span>
                  <span style="font-size: 11px; color: #666;">• {{ formatarData(aviso.data) }}</span>
                </div>
                <h4>{{ aviso.titulo }}</h4>
                <p>{{ aviso.descricao }}</p>
              </div>
              <div class="aviso_right_side">
                <span class="aviso_autor">Autor: {{ aviso.autor?.nome }}</span>
                <div class="aviso_actions_wrapper">
                  <button class="btn-ler" @click="marcarComoLido(aviso)">
                    Marcar como lido
                  </button>
                  <div class="aviso_actions" v-if="podePostar">
                    <button class="btn-icon btn-fixar" :class="{ 'btn-ativo': aviso.fixado }"
                      @click="alternarFixado(aviso)" :title="aviso.fixado ? 'Desafixar Aviso' : 'Fixar Aviso'">
                      <img v-if="aviso.fixado" :src="require('@/assets/icons/pin-slash.svg')" class="icon-svg"
                        alt="Desafixar" />
                      <img v-else :src="require('@/assets/icons/pin.svg')" class="icon-svg" alt="Fixar" />
                    </button>
                    <button v-if="usuarioLogado.id === aviso.autorId || usuarioLogado.permissaoId === 1"
                      class="btn-icon btn-excluir" @click="deletarAviso(aviso.id)" title="Excluir Aviso">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Teleport to="body">
        <div v-if="exibirModalAviso" class="modal-overlay" @click.self="exibirModalAviso = false">
          <div class="modal-content modal-large">
            <div class="header_avisos" style="border:none;">
              <h3 class="avisos_lidos">Cadastrar Novo Aviso</h3>
            </div>
            <div style="flex: 1; overflow-y: auto;">
              <div class="form-group" v-if="usuarioLogado.permissaoId === 1">
                <label class="label-input">Quadra de Destino</label>
                <select v-model="novoAviso.quadraId" class="input-estilizado">
                  <option value="" disabled>Selecione uma quadra</option>
                  <option :value="null">Aviso Geral</option>
                  <option v-for="q in listaQuadras" :key="q.id" :value="q.id">
                    {{ q.nome }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="label-input">Título</label>
                <input v-model="novoAviso.titulo" placeholder="Digite o título do aviso" class="input-estilizado" />
              </div>
              <div class="form-group">
                <label class="label-input">Descrição</label>
                <textarea v-model="novoAviso.descricao" placeholder="O que você quer avisar?"
                  class="input-estilizado area-texto"></textarea>
              </div>
              <div class="form-group-checkbox">
                <input type="checkbox" id="fixarNovo" v-model="novoAviso.fixado">
                <label for="fixarNovo">Fixar este aviso no topo?</label>
              </div>
            </div>
            <div class="modal-actions">
              <button @click="enviarAviso" class="btn-confirmar" :disabled="enviando">
                {{ enviando ? 'Postando...' : 'Postar Aviso' }}
              </button>
              <button @click="exibirModalAviso = false" class="btn-cancelar">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <Teleport to="body">
        <div v-if="exibirModalHistorico" class="modal-overlay" @click.self="exibirModalHistorico = false">
          <div class="modal-content modal-large">
            <div class="header_avisos" style="margin-bottom: 10px; border:none;">
              <h3 class="avisos_lidos">Histórico de Avisos Lidos</h3>
            </div>
            <div class="filter-row filtros-full">
              <div class="filtro-item">
                <label class="filtro-label">Filtrar por ano</label>
                <select v-model="filtroAno" class="input-estilizado">
                  <option value="todos">Todos</option>
                  <option v-for="ano in anosDisponiveis" :key="ano" :value="ano">
                    {{ ano }}
                  </option>
                </select>
              </div>
              <div class="filtro-item">
                <label class="filtro-label">Origem</label>
                <select v-model="filtroOrigem" class="input-estilizado">
                  <option value="todos">Todos</option>
                  <option value="geral">Geral</option>
                  <option value="quadra">Própria Quadra</option>
                </select>
              </div>
            </div>
            <div class="lista_avisos" style="margin-top: 20px; max-height: 400px; overflow-y: auto;">
              <div v-if="listaLidosFiltrada.length === 0" class="sem-avisos">
                Nenhum aviso lido encontrado em {{ filtroAno }}.
              </div>
              <div v-else v-for="aviso in listaLidosFiltrada" :key="aviso.id" class="card_aviso_item"
                style="opacity: 0.8; background: #f9f9f9;">
                <div class="aviso_conteudo">
                  <div class="aviso_meta">
                    <span style="font-weight: bold; color: #3B82F6;">{{ aviso.quadra?.nome }}</span>
                    <span> • {{ formatarData(aviso.data) }}</span>
                  </div>
                  <h4>{{ aviso.titulo }}</h4>
                  <p>{{ aviso.descricao }}</p>
                </div>
                <div class="aviso_right_side">
                  <span style="color: #10B981; font-weight: bold; font-size: 12px;">✓ Lido</span>
                </div>
              </div>
            </div>
            <button class="btn-fechar-historico" @click="exibirModalHistorico = false">
              Fechar
            </button>
          </div>
        </div>
      </Teleport>

      <section class="section_graficos_top">
        
        <div class="chart-container">
          <canvas id="agendamentosModalidadeChart"></canvas>
        </div>

        <div class="chart-with-actions-container">
          <div class="chart-area-pie">
            <canvas id="agendamentosTipoChart"></canvas>
          </div>
          
          <div class="actions-area-pie">
             <button @click="gerarPDFGraficos" class="btn-pdf-side" :disabled="loading" title="Baixar PDF">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              <span>PDF</span>
            </button>
          </div>
        </div>

      </section>

      <section class="section_graficos_bottom">
        <div v-if="loading" class="loader-container-centralizado">
          <div class="loader"></div>
        </div>
        <div class="chart-container-full">
          <canvas id="agendamentosMesChart"></canvas>
        </div>
      </section>

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
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, 51, null, null, "center");
      
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
      adicionarAoPDF(img3, '3. Evolução Mensal');

      doc.save(`relatorio_graficos_${new Date().toISOString().slice(0,10)}.pdf`);
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

    async carregarUsuarios() { try { const res = await api.get('/usuarios'); this.totalUsuarios = Array.isArray(res.data) ? res.data.length : 0; } catch (error) { console.error(error); } },
    async carregarTimes() { try { const res = await api.get('/times'); this.totalTimes = Array.isArray(res.data) ? res.data.length : 0; } catch (error) { console.error(error); } },
    async carregarModalidades() { try { const res = await api.get('/listar/modalidade'); this.totalModalidades = Array.isArray(res.data) ? res.data.length : 0; } catch (error) { console.error(error); } },

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
        let nome = 'Não definido'
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
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
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
}

.SideBar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  overflow-x: hidden;
}

.header-dashboard {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin: 0;
}

.section_totalAgendamentos {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 20px;
  margin-bottom: 40px;
}

.card_contagem {
  background: white;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 12px;
  font-family: 'Montserrat', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 2px solid #3b82f6;
}

.card_contagem h3 {
  font-size: 1.2em;
  margin-bottom: 10px;
  color: #1E3A8A;
  font-weight: bold;
}

.card_contagem p {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
}

.section_graficos_top {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.chart-container {
  flex: 1;
  min-width: 0;
  height: 350px;
}

.chart-with-actions-container {
  flex: 1;
  min-width: 0;
  height: 350px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.chart-area-pie {
  flex: 1;
  height: 100%;
}

.actions-area-pie {
  display: flex;
  justify-content: center;
  margin-top: 10px; 
}

.btn-pdf-side {
  background-color: #3B82F6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 10px;
  width: 70px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-pdf-side:hover {
  background-color: #2563EB;
}

.btn-pdf-side svg {
  width: 24px;
  height: 24px;
}

.btn-pdf-side span {
  font-size: 12px;
}

.section_graficos_bottom {
  position: relative;
  margin-top: 40px;
}

.chart-container-full {
  width: 100%;
  height: 350px;
}

.loader-container-centralizado {
  position: absolute;
  top: -70%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
}

.section_avisos {
  margin-bottom: 30px;
}

.card_avisos_container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header_avisos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.header_actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.area-texto {
  min-height: 100px;
  resize: none;
}

.btn-padrao {
  height: 38px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-historico {
  background: white;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  gap: 8px;
}

.btn-historico:hover {
  background: #f0f7ff;
}

.btn-ver-mais {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-ver-mais:hover {
  background: #3b82f6;
  color: white;
}

.btn-novo-aviso {
  background: #1E3A8A;
  color: white;
  border: 1px solid #1E3A8A;
}

.btn-novo-aviso:hover {
  background: #152c6e;
  opacity: 0.9;
}

.lista_avisos {
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sem-avisos {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

.card_aviso_item {
  background: #f7f9fc;
  padding: 15px;
  border-radius: 8px;
  border-left: 5px solid #3b82f6;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  transition: all 0.3s ease;
}

.aviso-fixado {
  background: #EFF6FF;
  border-left-color: #1E3A8A;
}

.aviso_conteudo {
  flex: 1;
}

.aviso_meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #888;
  margin-bottom: 5px;
}

.label-input {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  font-weight: 600;
}

.icon-mini {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}

.card_aviso_item h4 {
  color: #1E3A8A;
  margin: 5px 0;
  font-size: 16px;
  font-weight: 700;
}

.aviso_right_side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.aviso_autor {
  font-size: 12px;
  color: #666;
}

.aviso_actions_wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.aviso_actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-ler {
  background: transparent;
  border: none;
  color: #3B82F6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.btn-ler:hover {
  color: #1E3A8A;
}

.btn-icon {
  background: white;
  border: 1px solid #e5e7eb;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #6b7280;
  flex-shrink: 0;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.btn-fixar.btn-ativo {
  background: #EFF6FF;
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.btn-fixar.btn-ativo:hover {
  background: #DBEafe;
}

.btn-excluir:hover {
  background: #FEF2F2;
  border-color: #FECACA;
  color: #DC2626;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-large {
  max-width: 900px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.modal-actions .btn-confirmar,
.modal-actions .btn-cancelar {
  flex: 1;
}

.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #555;
  font-size: 14px;
}

.input-estilizado {
  width: 100%;
  margin-bottom: 15px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #4b5563;
}

.input-estilizado:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.btn-confirmar {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancelar {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-confirmar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filtros-full {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.filtro-item {
  display: flex;
  flex-direction: column;
}

.filtro-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.avisos {
  font-size: 25px;
  color: #3b82f6;
  font-weight: bold;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 10px 16px;
  margin: 12px 0 20px 0;
}

.avisos_lidos {
  font-size: 30px;
  color: #3b82f6;
}

.btn-fechar-historico {
  background-color: #3b82f6;
  color: white;
  padding: 12px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Responsivo */
@media (max-width: 768px) {
  .SideBar {
    position: fixed;
    width: 250px;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    background: #fff;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  }

  .SideBar.open {
    transform: translateX(0);
  }

  .conteudo {
    margin-left: 0;
    padding: 20px;
  }

  .header-dashboard {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .chart-with-actions-container {
    flex-direction: column;
    height: auto;
  }

  .btn-pdf-side {
    width: 100%;
    flex-direction: row;
  }

  .section_totalAgendamentos {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .section_graficos_top {
    flex-direction: column;
    gap: 20px;
  }

  .chart-container,
  .chart-container-full {
    height: 300px;
    width: 100%;
  }

  .card_aviso_item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .aviso_right_side {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .aviso_actions_wrapper {
    align-items: flex-end;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
}
</style>