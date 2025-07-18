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
        <PlacarFutebol v-if="modalidadeSelecionada === 'futebol'" :placar="jogo.timeA" :timeAtivo="true"
          @salvar="salvarPlacar" />

        <PlacarFutebolAreia v-if="modalidadeSelecionada === 'futebol de areia'" :placar="futebol_de_areia.timeA"
          :timeAtivo="true" @salvar="salvarPlacarFutebolAreia" />

        <PlacarFutsal v-else-if="modalidadeSelecionada === 'futsal'" :placar="futsal.timeA" :timeAtivo="true"
          @salvar="salvarPlacarFutsal" />

        <PlacarVolei v-else-if="modalidadeSelecionada === 'volei'" :placar="volei.timeA" :timeAtivo="true"
          @salvar="salvarPlacarVolei" />

        <PlacarVoleibol v-else-if="modalidadeSelecionada === 'voleibol'" :placar="voleibol.timeA" :timeAtivo="true"
          @salvar="salvarPlacarVoleibol" />

        <PlacarVoleiAreia v-else-if="modalidadeSelecionada === 'volei de areia'" :placar="volei_de_areia.timeA"
          :timeAtivo="true" @salvar="salvarPlacarVoleiAreia" />

        <PlacarFutevolei v-else-if="modalidadeSelecionada === 'futevolei'" :placar="futevolei.timeA" :timeAtivo="true"
          @salvar="salvarPlacarFutevolei" />

        <OcultarPlacar :aberto="modalControleVisibilidadeAberto" @fechar="modalControleVisibilidadeAberto = false" />

      </div>

      <!--Modal de Visualizar Placar-->
      <VisualizarPlacarModal :modalPlacarAberto="modalPlacarAberto"
        :modalidadePlacarSelecionada="modalidadePlacarSelecionada" :modalidadesDisponiveis="modalidadesDisponiveis"
        :timesPlacar="timesPlacar" :visibilidadeAberto="modalControleVisibilidadeAberto" @fechar="fecharModalPlacar"
        @abrir-modal-resetar="abrirModalResetarPlacar" @carregar-placar="carregarPlacarModalidade"
        @abrir-visibilidade="modalControleVisibilidadeAberto = true"
        @fechar-visibilidade="modalControleVisibilidadeAberto = false" />

      <!-- Modal Resetar Placar -->
      <ResetarPlacarModal :aberto="modalResetarPlacarAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
        @fechar="fecharModalResetarPlacar" @confirmado="handleResetarConfirmado" />


      <!--Gerenciar Modalidades-->
      <GerenciarModalidadesModal :aberto="modalGerenciarModalidadeAberto" :acao="acaoGerenciarModalidade"
        @confirmar="confirmarAcaoGerenciarModalidade" @fechar="fecharModalGerenciarModalidade" />

      <!-- Modal Adicionar Modalidade -->
      <AdicionarModalidadeModal :aberto="modalAdicionarModalidadeAberto" @fechar="fecharModalAdicionarModalidade"
        @atualizar="carregarModalidades" />

      <!-- Modal Remover Modalidade -->
      <RemoverModalidadeModal :aberto="modalRemoverModalidadeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
        @fechar="fecharModalRemoverModalidade" @atualizar="carregarModalidades" />

      <!--Gerenciar Times-->
      <GerenciarTimesModal :aberto="modalGerenciarTimeAberto" @fechar="fecharModalGerenciarTime"
        @abrir-adicionar-time="abrirModalAdicionarTime" @abrir-remover-time="abrirModalRemoverTime"
        @carregar-times="carregarTimes" />

      <!--Adicionar Time-->
      <AdicionarTimeModal :aberto="modalAdicionarTimeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
        @fechar="fecharModalAdicionarTime" @atualizar="carregarTimes" />

      <!--Remover Time-->
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
import axios from 'axios';
import Swal from 'sweetalert2';

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
      jogo: { timeA: this.criarTimeFutebol() },
      futebol_de_areia: { timeA: this.criarTimeFutebolAreia() },
      futsal: { timeA: this.criarTimeFutsal() },
      volei: { timeA: this.criarTimeVolei() },
      voleibol: { timeA: this.criarTimeVoleibol() },
      volei_de_areia: { timeA: this.criarTimeVoleiAreia() },
      futevolei: { timeA: this.criarTimeFutevolei() },
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
    };
  },

  mounted() {
    this.carregarModalidades().then(() => {
      const futebol = this.modalidadesDisponiveis.find(m => m.nome === 'futebol');
      console.log(this.modalidadesDisponiveis);
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
    },
  },

  methods: {
    handleResetarConfirmado() {
      this.fecharModalResetarPlacar();

      if (this.modalidadePlacarSelecionada) {
        this.carregarPlacarModalidade(this.modalidadePlacarSelecionada);
      }
    },
    criarTimeFutebol() {
      return {
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
      };
    },
    criarTimeFutebolAreia() {
      return {
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
      };
    },
    criarTimeFutsal() {
      return {
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
      };
    },
    criarTimeVolei() {
      return {
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
      };
    },
    criarTimeVoleibol() {
      return {
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
      };
    },
    criarTimeVoleiAreia() {
      return {
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
      };
    },
    criarTimeFutevolei() {
      return {
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
      };
    },
    limparDadosJogo() {
      this.jogo.timeA = this.criarTimeFutebol();
      this.futebol_de_areia.timeA = this.criarTimeFutebol();
      this.futsal.timeA = this.criarTimeFutsal();
      this.volei.timeA = this.criarTimeVolei();
      this.voleibol.timeA = this.criarTimeVoleibol();
      this.volei_de_areia.timeA = this.criarTimeVoleiAreia();
      this.futevolei.timeA = this.criarTimeFutevolei();
    },

    increment(placar) {
      if (placar?.valor !== undefined) placar.valor++;
    },

    decrement(placar) {
      if (placar?.valor && placar.valor > 0) placar.valor--;
    },

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

    fecharModalPlacar() {
      this.modalPlacarAberto = false;
      this.modalidadePlacarSelecionada = '';
      this.timesPlacar = [];
    },

    abrirModalResetarPlacar() {
      this.modalResetarPlacarAberto = true;
      //this.fecharModalPlacar();
      this.modalidadeParaResetar = '';
    },

    fecharModalResetarPlacar() {
      this.modalResetarPlacarAberto = false;
      this.modalidadeParaResetar = '';
    },

    abrirModalGerenciarModalidade() {
      this.modalGerenciarModalidadeAberto = true;
      this.acaoGerenciarModalidade = '';
    },

    fecharModalGerenciarModalidade() {
      this.modalGerenciarModalidadeAberto = false;
      this.acaoGerenciarModalidade = '';
    },

    confirmarAcaoGerenciarModalidade(acao) {
      this.acaoGerenciarModalidade = acao;
      this.fecharModalGerenciarModalidade();
      if (acao === 'adicionar') {
        this.abrirModalAdicionarModalidade();
      } else if (acao === 'remover') {
        this.abrirModalRemoverModalidade();
      }
    },

    abrirModalAdicionarModalidade() {
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

    abrirModalGerenciarTime() {
      this.modalGerenciarTimeAberto = true;
    },

    fecharModalGerenciarTime() {
      this.modalGerenciarTimeAberto = false;
    },

    abrirModalAdicionarTime() {
      this.modalAdicionarTimeAberto = true;
      this.timeParaAdicionar = '';
      this.fotoTime = '';
    },

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

    confirmarAcaoGerenciarTime(acao) {
      if (acao === 'adicionar') {
        this.abrirModalAdicionarTime();
      } else if (acao === 'remover') {
        this.abrirModalRemoverTime();
      }
      this.fecharModalGerenciarTime();

    },
    alternarVisibilidade(modalidade) {
      this.visibilidadePlacar[modalidade] = !this.visibilidadePlacar[modalidade];
      localStorage.setItem(`exibirPlacar_${modalidade}`, JSON.stringify(this.visibilidadePlacar[modalidade]));
    },

    async carregarModalidades() {
      try {
        const res = await axios.get('https://quadra-livre-backend.onrender.com/modalidade');
        this.modalidadesDisponiveis = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) return;
      try {
        const res = await axios.get(`https://quadra-livre-backend.onrender.com/times/${this.modalidadeSelecionada}`);
        this.times = res.data.map(t => t.time);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      }
    },

    async carregarPlacarTime() {
      if (!this.modalidadeSelecionada || !this.timeSelecionado) return;

      try {
        const res = await axios.get(`https://quadra-livre-backend.onrender.com/times/${this.modalidadeSelecionada}/${this.timeSelecionado}`);
        const dados = res.data;

        if (this.modalidadeSelecionada === 'futebol') {
          Object.assign(this.jogo.timeA, {
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
        } else if (this.modalidadeSelecionada === 'futebol_de_areia') {
          Object.assign(this.futebol_de_areia.timeA, {
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
        } else if (this.modalidadeSelecionada === 'futsal') {
          Object.assign(this.futsal.timeA, {
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
        } else if (this.modalidadeSelecionada === 'volei') {
          Object.assign(this.volei.timeA, {
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
        } else if (this.modalidadeSelecionada === 'voleibol') {
          Object.assign(this.voleibol.timeA, {
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
        } else if (this.modalidadeSelecionada === 'volei de areia') {
          Object.assign(this.volei_de_areia.timeA, {
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
        } else if (this.modalidadeSelecionada === 'futevolei') {
          Object.assign(this.futevolei.timeA, {
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
        const res = await axios.get(`https://quadra-livre-backend.onrender.com/placar/${modalidade}`);
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
        if (this.modalidadeSelecionada === 'futebol') {
          dadosParaSalvar.saldoDeGols = dadosParaSalvar.golsPro - dadosParaSalvar.golsSofridos;
        }
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        console.error('Erro ao salvar placar:', error);
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarFutebolAreia(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        if (this.modalidadeSelecionada === 'futebol_de_areia') {
          dadosParaSalvar.saldoDeGols = dadosParaSalvar.golsPro - dadosParaSalvar.golsSofridos;
        }
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        console.error('Erro ao salvar placar:', error);
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarFutsal(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        if (this.modalidadeSelecionada === 'futsal') {
          dadosParaSalvar.saldoDeGols = dadosParaSalvar.golsPro - dadosParaSalvar.golsSofridos;
        }
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        console.error('Erro ao salvar placar:', error);
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarVolei(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarVoleibol(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarVoleiAreia(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async salvarPlacarFutevolei(dadosParaSalvar) {
      if (!this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar o placar.', 'warning');
        return;
      }
      try {
        console.log('Dados que serão enviados:', dadosParaSalvar);
        await axios.put(`https://quadra-livre-backend.onrender.com/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
  },
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