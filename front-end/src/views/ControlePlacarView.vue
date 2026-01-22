<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Controles do Placar</h1>
        <div class="botoes">
          <button class="btn-placar" @click="abrirModalPlacar">Visualizar Placar</button>
        </div>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="dropdown-section">
          <!-- Linha 1: Modalidade -->
          <div class="linha-modalidade">
            <p>Modalidade:</p>
            <select v-model="modalidadeSelecionada" @change="carregarCampeonatos" class="dropdown">
              <option disabled value="">Selecione uma modalidade</option>
              <option v-for="m in modalidadesDisponiveis" :key="m.id" :value="m.id">
                {{ m.nome.charAt(0).toUpperCase() + m.nome.slice(1) }}
              </option>

            </select>
          </div>

          <!-- Linha 2: Campeonato e Time -->
          <div class="linha-campeonato-time dropdown-row">
            <div class="team">
              <p>Campeonato:</p>
              <select v-model="campeonatoSelecionado" @change="carregarTimesDoCampeonato" class="dropdown"
                :disabled="!campeonatos.length">
                <option disabled value="">Selecione um campeonato</option>
                <option v-for="c in campeonatos" :key="c.id" :value="c.id">{{ c.nome }}</option>
              </select>
            </div>

            <div class="team">
              <p>Time:</p>
              <select v-model="timeSelecionado" class="dropdown" :disabled="!times.length">
                <option disabled value="">Selecione um time</option>
                <option v-for="t in times" :key="t.id" :value="t.id">{{ t.nome }}</option>
              </select>
              <span v-if="isLoadingTimes" class="loader-pequena-dropdown"></span>
            </div>
          </div>
        </div>

        <!-- Controles do Placar -->
        <div class="game">
          <!-- obtém o nome da modalidade em minúsculo -->
          <PlacarFutebol v-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeNome)"
            :placar="futebol.timeA" :timeAtivo="true" :timeSelecionado="timeSelecionado" @salvar="salvarPlacar" />

          <PlacarVolei v-else-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeNome)"
            :placar="volei.timeA" :timeAtivo="true" :timeSelecionado="timeSelecionado" @salvar="salvarPlacar" />

          <div v-else class="mensagem-placar">
            <p> Placar em desenvolvimento. Em breve estará disponível!</p>
          </div>
        </div>


        <!-- Modais -->
        <VisualizarPlacarModal :modalPlacarAberto="modalPlacarAberto"
          :modalidadePlacarSelecionada="modalidadePlacarSelecionada" :modalidadesDisponiveis="modalidadesDisponiveis"
          :timesPlacar="timesPlacar" @fechar="fecharModalPlacar" @abrir-modal-resetar="abrirModalResetarPlacar"
          @abrir-visibilidade="abrirModalOcultarPlacar" @carregar-placar="carregarPlacarModalidade" />

        <OcultarPlacar :aberto="modalOcultarPlacarAberto" @fechar="fecharModalOcultarPlacar" />

        <ResetarPlacarModal :aberto="modalResetarPlacarAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="fecharModalResetarPlacar" @confirmado="resetarConfirmado" />

        <GerenciarModalidadesModal :aberto="modalGerenciarModalidadeAberto" :acao="acaoGerenciarModalidade"
          @confirmar="confirmarAcaoGerenciarModalidade" @fechar="fecharModalGerenciarModalidade" />

        <AdicionarModalidadeModal :aberto="modalAdicionarModalidadeAberto" @fechar="fecharModalAdicionarModalidade"
          @atualizar="carregarModalidades" />

        <RemoverModalidadeModal :aberto="modalRemoverModalidadeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="fecharModalRemoverModalidade" @atualizar="carregarModalidades" />

        <GerenciarTimesModal :aberto="modalGerenciarTimeAberto" @fechar="fecharModalGerenciarTime"
          @abrir-adicionar-time="abrirModalAdicionarTime" @abrir-remover-time="abrirModalRemoverTime"
          @carregar-times="carregarTimes" />

        <AdicionarTimeModal :aberto="modalAdicionarTimeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="fecharModalAdicionarTime" @atualizar="carregarTimes" />

        <RemoverTimeModal :aberto="modalRemoverTimeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="fecharModalRemoverTime" @atualizar="carregarTimes" />
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import PlacarFutebol from '@/components/ControlesPlacar/PlacarFutebol.vue';
import PlacarVolei from '@/components/ControlesPlacar/PlacarVolei.vue';
import VisualizarPlacarModal from '@/components/modals/Visualizar_Placar/VisualizarPlacarModal.vue';
import ResetarPlacarModal from '@/components/modals/Visualizar_Placar/ResetarPlacarModal.vue';
import OcultarPlacar from '@/components/modals/Visualizar_Placar/OcultarPlacar.vue';
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'ControlePlacarView',
  components: {
    SideBar, PlacarFutebol,
    PlacarVolei, VisualizarPlacarModal, ResetarPlacarModal, OcultarPlacar
  },
  data() {
    return {
      isLoading: true,
      modalidadesDisponiveis: [],
      modalidadeSelecionada: '',
      campeonatoSelecionado: '',
      campeonatos: [],
      times: [],
      timeSelecionado: '',
      timesPlacar: [],
      futebol: { timeA: this.criarTime('futebol') },
      futebol_de_areia: { timeA: this.criarTime('futebol') },
      futsal: { timeA: this.criarTime('futebol') },
      volei: { timeA: this.criarTime('volei') },
      voleibol: { timeA: this.criarTime('volei') },
      volei_de_areia: { timeA: this.criarTime('volei') },
      futevolei: { timeA: this.criarTime('volei') },
      modalResetarPlacarAberto: false,
      modalPlacarAberto: false,
      modalGerenciarTimeAberto: false,
      modalAdicionarTimeAberto: false,
      modalRemoverTimeAberto: false,
      modalOcultarPlacarAberto: false,
      acaoGerenciarModalidade: '',
      modalidadePlacarSelecionada: '',
      modalidadeParaResetar: '',
      fotoTime: '',
      timeParaAdicionar: '',
      timeParaRemover: '',
      isLoadingTimes: false,
    };
  },
  mounted() {
  this.carregarModalidades().then(() => {
    this.isLoading = false;
  });
  },
  computed: {
    modalidadeNome() {
      const m = this.modalidadesDisponiveis.find(mod => mod.id === this.modalidadeSelecionada);
      return m ? m.nome.toLowerCase() : '';
    }
  },

  watch: {
    modalidadeSelecionada(newVal) {
      this.campeonatoSelecionado = '';
      this.campeonatos = [];
      this.times = [];
      this.timeSelecionado = '';
      this.limparDadosJogo();
      if (newVal) this.carregarCampeonatos(); // chama campeonatos
    },
    campeonatoSelecionado(newVal) {
      this.times = [];
      this.timeSelecionado = '';
      if (newVal) this.carregarTimesDoCampeonato(); // chama times do campeonato
    }
  },

  methods: {
    criarTime(tipo) {
      const modelos = {
        futebol: { nome: '', pts: { valor: 0 }, pj: { valor: 0 }, golspro: { valor: 0 }, golsofridos: { valor: 0 }, empates: { valor: 0 }, vitorias: { valor: 0 }, derrotas: { valor: 0 }, cartaoamarelo: { valor: 0 }, cartaovermelho: { valor: 0 } },
        volei: { nome: '', pts: { valor: 0 }, pj: { valor: 0 }, vitorias: { valor: 0 }, derrotas: { valor: 0 }, setsVencidos: { valor: 0 }, doiszero: { valor: 0 }, doisum: { valor: 0 }, umdois: { valor: 0 }, zerodois: { valor: 0 }, wo: { valor: 0 } }
      };
      return JSON.parse(JSON.stringify(modelos[tipo] || {}));
    },
    limparDadosJogo() {
      this.futebol.timeA = this.criarTime('futebol');
      this.futebol_de_areia.timeA = this.criarTime('futebol');
      this.futsal.timeA = this.criarTime('futebol');
      this.volei.timeA = this.criarTime('volei');
      this.voleibol.timeA = this.criarTime('volei');
      this.volei_de_areia.timeA = this.criarTime('volei');
      this.futevolei.timeA = this.criarTime('volei');
    },
    increment(placar) { if (placar?.valor !== undefined) placar.valor++; },
    decrement(placar) { if (placar?.valor && placar.valor > 0) placar.valor--; },
    handleImagemUpload(event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = () => (this.fotoTime = reader.result); reader.readAsDataURL(file); } },

    abrirModalPlacar() {
      this.modalPlacarAberto = true;
      this.modalidadeSelecionada = '';
      this.modalidadePlacarSelecionada = '';
    },
    fecharModalPlacar() {
      this.modalPlacarAberto = false;
      this.modalidadePlacarSelecionada = '';
      this.timesPlacar = [];
    },
    abrirModalResetarPlacar() { this.modalResetarPlacarAberto = true; this.modalidadeParaResetar = ''; },
    fecharModalResetarPlacar() { this.modalResetarPlacarAberto = false; this.modalidadeParaResetar = ''; },
    abrirModalGerenciarModalidade() { this.modalGerenciarModalidadeAberto = true; this.acaoGerenciarModalidade = ''; },
    fecharModalGerenciarModalidade() { this.modalGerenciarModalidadeAberto = false; this.acaoGerenciarModalidade = ''; },
    confirmarAcaoGerenciarModalidade(acao) {
      this.acaoGerenciarModalidade = acao;
      this.fecharModalGerenciarModalidade();
      if (acao === 'adicionar') this.abrirModalAdicionarModalidade();
      else if (acao === 'remover') this.abrirModalRemoverModalidade();
    },
    abrirModalAdicionarModalidade() {
      this.novaModalidade = '';
      this.modalAdicionarModalidadeAberto = true;
    },

    fecharModalAdicionarModalidade() {
      this.modalAdicionarModalidadeAberto = false;
    },

    abrirModalRemoverModalidade() {
      this.modalRemoverModalidadeAberto = true;
    },

    fecharModalRemoverModalidade() {
      this.modalRemoverModalidadeAberto = false;
    },

    abrirModalGerenciarTime() { this.modalGerenciarTimeAberto = true; },
    fecharModalGerenciarTime() { this.modalGerenciarTimeAberto = false; },
    abrirModalAdicionarTime() { this.modalAdicionarTimeAberto = true; this.timeParaAdicionar = ''; this.fotoTime = ''; },
    fecharModalAdicionarTime() {
      this.modalAdicionarTimeAberto = false;
      this.timeParaAdicionar = '';
      this.fotoTime = '';
    },

    abrirModalRemoverTime() {
      this.modalRemoverTimeAberto = true;
      this.carregarTimes();
      this.timeParaRemover = '';
    },

    fecharModalRemoverTime() {
      this.modalRemoverTimeAberto = false;
      this.timeParaRemover = '';
    },

    abrirModalOcultarPlacar() { this.modalOcultarPlacarAberto = true; },
    fecharModalOcultarPlacar() { this.modalOcultarPlacarAberto = false; },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade');
        this.modalidadesDisponiveis = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async carregarCampeonatos() {
      if (!this.modalidadeSelecionada) return;
      this.campeonatos = [];
      this.campeonatoSelecionado = '';
      this.times = [];
      this.timeSelecionado = '';

      try {
        const res = await api.get(`/listar/${this.modalidadeSelecionada}`);
        this.campeonatos = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err);
        Swal.fire('Erro', 'Não foi possível carregar os campeonatos.', 'error');
      }
    },

    async carregarTimesDoCampeonato() {
      if (!this.campeonatoSelecionado) return;
      this.times = [];
      this.timeSelecionado = '';

      try {
        const res = await api.get(`/${this.campeonatoSelecionado}/times`);
        this.times = Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Erro ao carregar times:', err);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      }
    },

    async carregarPlacarTime() {
      if (!this.modalidadeSelecionada || !this.timeSelecionado) return;

      try {
        const modalidade = this.modalidadesDisponiveis.find(
          m => m.nome === this.modalidadeSelecionada
        );
        if (!modalidade) return;

        const res = await api.get(`/times/modalidade/${modalidade.id}`);
        this.times = Array.isArray(res.data) ? res.data : [];
      } catch (error) {
        console.error('Erro ao atualizar times:', error);
      }

      const time = this.times.find(t => t.nome === this.timeSelecionado);
      if (!time || !time.placar) return;

      const dados = time.placar;
      const key = this.modalidadeSelecionada.replace(/ /g, '_');
      const destino = this[key]?.timeA;
      if (!destino) return;

      const modalidadesGols = ['futebol', 'futebol_de_areia', 'futsal'];
      const modalidadesSets = ['volei', 'voleibol', 'volei_de_areia', 'futevolei'];

      if (modalidadesGols.includes(key)) {
        Object.assign(destino, {
          nome: time.nome || '',
          pts: { valor: dados.pontuacao ?? 0 },
          pj: { valor: dados.jogos ?? 0 },
          golspro: { valor: dados.golsPro ?? 0 },
          golsofridos: { valor: dados.golsSofridos ?? 0 },
          empates: { valor: dados.empates ?? 0 },
          vitorias: { valor: dados.vitorias ?? 0 },
          derrotas: { valor: dados.derrotas ?? 0 },
          cartaoamarelo: { valor: dados.cartoesAmarelos ?? 0 },
          cartaovermelho: { valor: dados.cartoesVermelhos ?? 0 },
        });
      }

      if (modalidadesSets.includes(key)) {
        Object.assign(destino, {
          nome: time.nome || '',
          pts: { valor: dados.pontuacao ?? 0 },
          pj: { valor: dados.jogos ?? 0 },
          vitorias: { valor: dados.vitorias ?? 0 },
          derrotas: { valor: dados.derrotas ?? 0 },
          setsVencidos: { valor: dados.setsVencidos ?? 0 },
          doiszero: { valor: dados.vitoria2x0 ?? 0 },
          doisum: { valor: dados.vitoria2x1 ?? 0 },
          umdois: { valor: dados.derrota2x1 ?? 0 },
          zerodois: { valor: dados.derrota2x0 ?? 0 },
          wo: { valor: dados.derrotaWo ?? 0 },
        });
      }
    },

    async carregarPlacarModalidade(modalidade) {
      if (!modalidade) return;
      this.timesPlacar = null;
      try {
        const modalidadeObj = this.modalidadesDisponiveis.find(m => m.nome === modalidade);
        if (!modalidadeObj) return;

        const res = await api.get(`/placar/modalidade/${modalidadeObj.id}`);
        this.timesPlacar = Array.isArray(res.data.placares) ? res.data.placares : [];
      } catch (error) {
        console.error('Erro ao carregar placar da modalidade:', error);
        Swal.fire('Erro', 'Não foi possível carregar os placares da modalidade.', 'error');
        this.timesPlacar = [];
      }
    },

    async salvarPlacar(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }

      try {
        const time = this.times.find(t => t.nome === this.timeSelecionado);
        if (!time || !time.placar) return;

        const placarId = time.placar.id;
        const modalidadesComSaldo = ['futebol', 'futebol de areia', 'futsal'];
        if (modalidadesComSaldo.includes(this.modalidadeSelecionada)) {
          dadosParaSalvar.saldoDeGols = (dadosParaSalvar.golsPro ?? 0) - (dadosParaSalvar.golsSofridos ?? 0);
        }

        await api.put(`/placar/${placarId}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');

        Object.assign(time.placar, dadosParaSalvar);
        this.carregarPlacarTime();
        this.limparDadosJogo();
      } catch (error) {
        console.error('Erro ao salvar placar:', error);
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async resetarConfirmado(modalidade) {
      try {
        const modalidadeObj = this.modalidadesDisponiveis.find(m => m.nome === modalidade);
        if (!modalidadeObj) return;
        await api.put(`/placar/reset/${modalidadeObj.id}`);
        Swal.fire('Sucesso', `Placar da modalidade "${modalidade}" resetado!`, 'success');
        this.carregarPlacarModalidade(modalidade);
      } catch (error) {
        console.error('Erro ao resetar placar:', error);
        Swal.fire('Erro', 'Não foi possível resetar o placar.', 'error');
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  background: #fff;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  z-index: 100;
  transition: transform 0.3s ease;
}

.sidebar.open {
  transform: translateX(0);
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.botoes {
  display: flex;
  gap: 20px;
  align-items: center;
}

.btn-placar {
  background-color: #3B82F6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-modalidade {
  background-color: #3B82F6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.game {
  display: flex;
  flex-direction: column;
}

.dropdown {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-bottom: 10px;
}

.dropdown-row {
  display: flex;
  gap: 20px;
}

.dropdown-row .team {
  flex: 1;
}

.mensagem-placar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #7E7E7E;
}

.loader-container-centralizado {
  position: fixed;
  top: 50%;
  left: 55%;
  transform: translate(-60%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
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

.dropdown-container {
  position: relative;
  display: inline-block;
  width: 100%;
}

.loader-pequena-dropdown {
  position: absolute;
  right: 30px;
  top: 20%;
  transform: translateY(-50%);
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .conteudo {
    margin-left: 0;
    padding: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .title {
    font-size: 24px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .botoes {
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .btn-placar,
  .btn-modalidade,
  .btn-add {
    width: 100%;
    padding: 10px 0;
  }

  .dropdown-row {
    flex-direction: column;
  }

  .dropdown-row .team {
    width: 100%;
  }
}
</style>