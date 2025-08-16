<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Placar</h1>
        <div class="botoes">
          <button class="btn-placar" @click="abrirModalPlacar">Visualizar Placar</button>
          <button @click="abrirModalGerenciarModalidade" class="btn-modalidade">Gerenciar Modalidades</button>
          <button class="btn-add" @click="abrirModalGerenciarTime">Gerenciar Times</button>
        </div>
      </div>

      <!-- dropdowns-->
      <div class="dropdown-row">
        <div class="team">
          <p>Modalidade:</p>
          <select id="modalidade" v-model="modalidadeSelecionada" @change="carregarTimes" class="dropdown">
            <option disabled value="">Selecione uma modalidade</option>
            <option v-for="(modalidade, i) in modalidadesDisponiveis" :key="i" :value="modalidade.nome">
              {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
            </option>
          </select>
        </div>
        <div class="team">
          <p>Time:</p>
          <select v-model="timeSelecionado" class="dropdown">
            <option disabled value="">Selecione um time</option>
            <option v-for="(time, i) in times" :key="i" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
      </div>

      <!-- Controles do Placar -->
      <div class="game">
        <PlacarFutebol v-if="modalidadeSelecionada === 'futebol'" :placar="futebol.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />
        <PlacarFutebolAreia v-else-if="modalidadeSelecionada === 'futebol de areia'" :placar="futebol_de_areia.timeA"
          :timeAtivo="true" @salvar="salvarPlacar" />
        <PlacarFutsal v-else-if="modalidadeSelecionada === 'futsal'" :placar="futsal.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />
        <PlacarVolei v-else-if="modalidadeSelecionada === 'volei'" :placar="volei.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />
        <PlacarVoleibol v-else-if="modalidadeSelecionada === 'voleibol'" :placar="voleibol.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />
        <PlacarVoleiAreia v-else-if="modalidadeSelecionada === 'volei de areia'" :placar="volei_de_areia.timeA"
          :timeAtivo="true" @salvar="salvarPlacar" />
        <PlacarFutevolei v-else-if="modalidadeSelecionada === 'futevolei'" :placar="futevolei.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />

        <OcultarPlacar :aberto="modalControleVisibilidadeAberto" @fechar="modalControleVisibilidadeAberto = false" />
      </div>

      <!-- Modais -->
      <VisualizarPlacarModal :modalPlacarAberto="modalPlacarAberto"
        :modalidadePlacarSelecionada="modalidadePlacarSelecionada" :modalidadesDisponiveis="modalidadesDisponiveis"
        :timesPlacar="timesPlacar" :visibilidadeAberto="modalControleVisibilidadeAberto" @fechar="fecharModalPlacar"
        @abrir-modal-resetar="abrirModalResetarPlacar" @carregar-placar="carregarPlacarModalidade"
        @abrir-visibilidade="modalControleVisibilidadeAberto = true"
        @fechar-visibilidade="modalControleVisibilidadeAberto = false" />

      <ResetarPlacarModal :aberto="modalResetarPlacarAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
        @fechar="fecharModalResetarPlacar" @confirmado="handleResetarConfirmado" />

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
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import PlacarFutebol from '@/components/ControlesPlacar/PlacarFutebol.vue';
import PlacarFutebolAreia from '@/components/ControlesPlacar/PlacarFutebolAreia.vue';
import PlacarFutsal from '@/components/ControlesPlacar/PlacarFutsal.vue';
import PlacarVolei from '@/components/ControlesPlacar/PlacarVolei.vue';
import PlacarVoleibol from '@/components/ControlesPlacar/PlacarVoleibol.vue';
import PlacarVoleiAreia from '@/components/ControlesPlacar/PlacarVoleiAreia.vue';
import PlacarFutevolei from '@/components/ControlesPlacar/PlacarFutevolei.vue';
import VisualizarPlacarModal from '@/components/modals/Visualizar_Placar/VisualizarPlacarModal.vue';
import ResetarPlacarModal from '@/components/modals/Visualizar_Placar/ResetarPlacarModal.vue';
import GerenciarModalidadesModal from '@/components/modals/modalidades/GerenciarModalidadesModal.vue';
import AdicionarModalidadeModal from '@/components/modals/modalidades/AdicionarModalidadeModal.vue';
import RemoverModalidadeModal from '@/components/modals/modalidades/RemoverModalidadeModal.vue';
import GerenciarTimesModal from '@/components/modals/times/GerenciarTimesModal.vue';
import AdicionarTimeModal from '@/components/modals/times/AdicionarTimesModal.vue';
import RemoverTimeModal from '@/components/modals/times/RemoverTimesModal.vue';
import OcultarPlacar from '@/components/modals/Visualizar_Placar/OcultarPlacar.vue';
import Swal from 'sweetalert2';
import api from '@/axios'; 

export default {
  name: 'ControlePlacarView',
  components: {
    SideBar,
    PlacarFutebol,
    PlacarFutebolAreia,
    PlacarFutsal,
    PlacarVolei,
    PlacarVoleibol,
    PlacarVoleiAreia,
    PlacarFutevolei,
    VisualizarPlacarModal,
    ResetarPlacarModal,
    GerenciarModalidadesModal,
    AdicionarModalidadeModal,
    RemoverModalidadeModal,
    GerenciarTimesModal,
    AdicionarTimeModal,
    RemoverTimeModal,
    OcultarPlacar
  },
  data() {
    return {
      modalidadesDisponiveis: [],
      modalidadeSelecionada: '',
      timeSelecionado: '',
      times: [],
      timesPlacar: [],
      futebol: { timeA: this.criarTime('futebol') },
      futebol_de_areia: { timeA: this.criarTime('futebol') },
      futsal: { timeA: this.criarTime('futebol') },
      volei: { timeA: this.criarTime('volei') },
      voleibol: { timeA: this.criarTime('volei') },
      volei_de_areia: { timeA: this.criarTime('volei') },
      futevolei: { timeA: this.criarTime('volei') },
      modalGerenciarModalidadeAberto: false,
      modalResetarPlacarAberto: false,
      modalPlacarAberto: false,
      modalAdicionarModalidadeAberto: false,
      modalRemoverModalidadeAberto: false,
      modalGerenciarTimeAberto: false,
      modalAdicionarTimeAberto: false,
      modalRemoverTimeAberto: false,
      modalControleVisibilidadeAberto: false,
      acaoGerenciarModalidade: '',
      modalidadePlacarSelecionada: '',
      modalidadeParaResetar: '',
      fotoTime: '',
      timeParaAdicionar: '',
      timeParaRemover: ''
    };
  },

  mounted() {
    this.carregarModalidades().then(() => {
      const futebol = this.modalidadesDisponiveis.find(m => m.nome === 'futebol');
      if (futebol) {
        this.modalidadeSelecionada = 'futebol';
        this.carregarTimes();
      }
    });
  },

  watch: {
    modalidadeSelecionada(newVal) {
      this.timeSelecionado = '';
      this.times = [];
      this.limparDadosJogo();
      if (newVal) this.carregarTimes();
    },
    timeSelecionado(newVal) {
      newVal ? this.carregarPlacarTime() : this.limparDadosJogo();
    }
  },

  methods: {
    criarTime(tipo) {
      const modelos = {
        futebol: {
          nome: '',
          pts: { valor: 0 },
          pj: { valor: 0 },
          golspro: { valor: 0 },
          golsofridos: { valor: 0 },
          empates: { valor: 0 },
          vitorias: { valor: 0 },
          derrotas: { valor: 0 },
          cartaoamarelo: { valor: 0 },
          cartaovermelho: { valor: 0 },
        },
        volei: {
          nome: '',
          pts: { valor: 0 },
          pj: { valor: 0 },
          vitorias: { valor: 0 },
          derrotas: { valor: 0 },
          setsVencidos: { valor: 0 },
          doiszero: { valor: 0 },
          doisum: { valor: 0 },
          umdois: { valor: 0 },
          zerodois: { valor: 0 },
          wo: { valor: 0 },
        }
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

    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => (this.fotoTime = reader.result);
        reader.readAsDataURL(file);
      }
    },

    abrirModalPlacar() {
      this.modalPlacarAberto = true;
      this.modalidadePlacarSelecionada = 'futebol';
      this.carregarPlacarModalidade('futebol');
    },
    fecharModalPlacar() { this.modalPlacarAberto = false; this.modalidadePlacarSelecionada = ''; this.timesPlacar = []; },

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

    abrirModalAdicionarModalidade() { this.modalAdicionarModalidadeAberto = true; },
    fecharModalAdicionarModalidade() { this.modalAdicionarModalidadeAberto = false; },

    abrirModalRemoverModalidade() { this.modalRemoverModalidadeAberto = true; },
    fecharModalRemoverModalidade() { this.modalRemoverModalidadeAberto = false; },

    abrirModalGerenciarTime() { this.modalGerenciarTimeAberto = true; },
    fecharModalGerenciarTime() { this.modalGerenciarTimeAberto = false; },

    abrirModalAdicionarTime() { this.modalAdicionarTimeAberto = true; this.timeParaAdicionar = ''; this.fotoTime = ''; },
    fecharModalAdicionarTime() { this.modalAdicionarTimeAberto = false; this.timeParaAdicionar = ''; this.fotoTime = ''; },

    abrirModalRemoverTime() { this.modalRemoverTimeAberto = true; this.carregarTimes(); this.timeParaRemover = ''; },
    fecharModalRemoverTime() { this.modalRemoverTimeAberto = false; this.timeParaRemover = ''; },

    confirmarAcaoGerenciarTime(acao) {
      if (acao === 'adicionar') this.abrirModalAdicionarTime();
      else if (acao === 'remover') this.abrirModalRemoverTime();
      this.fecharModalGerenciarTime();
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/modalidade');
        this.modalidadesDisponiveis = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) return;
      try {
        const res = await api.get(`/times/${this.modalidadeSelecionada}`);
        this.times = res.data.map(t => t.time);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      }
    },

    async carregarPlacarTime() {
      if (!this.modalidadeSelecionada || !this.timeSelecionado) return;
      try {
        const res = await api.get(`/times/${this.modalidadeSelecionada}/${this.timeSelecionado}`);
        const dados = res.data;
        const modalidadesGols = ['futebol', 'futebol_de_areia', 'futsal'];
        const modalidadesSets = ['volei', 'voleibol', 'volei_de_areia', 'futevolei'];
        let destino = this[this.modalidadeSelecionada]?.timeA;

        if (modalidadesGols.includes(this.modalidadeSelecionada)) {
          Object.assign(destino, {
            nome: dados.time || '',
            pts: { valor: dados.pontuacao },
            pj: { valor: dados.jogos },
            golspro: { valor: dados.golsPro },
            golsofridos: { valor: dados.golsSofridos },
            empates: { valor: dados.empates },
            vitorias: { valor: dados.vitorias },
            derrotas: { valor: dados.derrotas },
            cartaoamarelo: { valor: dados.cartoesAmarelos },
            cartaovermelho: { valor: dados.cartoesVermelhos },
          });
        }

        if (modalidadesSets.includes(this.modalidadeSelecionada)) {
          Object.assign(destino, {
            nome: dados.time || '',
            pts: { valor: dados.pontuacao },
            pj: { valor: dados.jogos },
            vitorias: { valor: dados.vitorias },
            derrotas: { valor: dados.derrotas },
            setsVencidos: { valor: dados.setsVencidos },
            doiszero: { valor: dados.vitoria2x0 },
            doisum: { valor: dados.vitoria2x1 },
            umdois: { valor: dados.derrota2x1 },
            zerodois: { valor: dados.derrota2x0 },
            wo: { valor: dados.derrotaWo },
          });
        }
      } catch (error) {
        console.error('Erro ao carregar placar do time:', error);
        Swal.fire('Erro', 'Não foi possível carregar o placar do time.', 'error');
      }
    },

    async carregarPlacarModalidade(modalidade) {
      this.modalidadePlacarSelecionada = modalidade;
      try {
        const res = await api.get(`/placar/${modalidade}`);
        this.timesPlacar = res.data;
      } catch (error) {
        Swal.fire('Erro', 'Erro ao carregar placar.', 'error');
      }
    },

    async salvarPlacar(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        const modalidadesComSaldo = ['futebol', 'futebol_de_areia', 'futsal'];
        if (modalidadesComSaldo.includes(this.modalidadeSelecionada)) {
          dadosParaSalvar.saldoDeGols = dadosParaSalvar.golsPro - dadosParaSalvar.golsSofridos;
        }
        await api.put(`/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        console.error('Erro ao salvar placar:', error);
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
  }
};
</script>

<style scoped>
.container {
  display: flex;
  margin-top: 20px;
}

.layout {
  flex: 1;
  padding: 20px 10px;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  margin-left: 15%;
}

.botoes {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-right: -5%;
}

.btn-placar {
  background-color: #7E7E7E;
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

.btn-add {
  background-color: #152147;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.game {
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-left: 15%;
}

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-bottom: 10px;
}

.dropdown-row {
  display: flex;
  gap: 20px;
  width: 90%;
  margin-left: 15%;
}

.dropdown-row .team {
  flex: 1;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    margin-top: 10px;
  }

  .title {
    margin-left: 0;
    font-size: 24px;
    width: 100%;
  }

  .header {
    width: 95%;
    flex-direction: column;
    align-items: flex-start;
  }

  .botoes {
    margin-right: 0;
    width: 100%;
    justify-content: flex-start;
    gap: 10px;
  }

  .game {
    width: 100%;
    margin-left: 0;
    padding: 0 10px;
  }

  .dropdown-row {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
  }

  .dropdown-row .team {
    width: 100%;
    flex: none;
  }

  .controls button {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .line {
    gap: 15px;
    margin-bottom: 25px;
  }
}
</style>