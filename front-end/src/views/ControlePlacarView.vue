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

      <!-- Linha com os dois dropdowns lado a lado -->
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

      <!-- Placar Futebol -->
      <div class="game">
        <div class="team" v-if="modalidadeSelecionada === 'futebol'">
          <div class="line">
            <div class="box-small">
              <p>Pontos</p>
              <div class="controls espacamento">
                <button @click="decrement(jogo.timeA.pts)" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.pts.valor }}</span>
                <button @click="increment(jogo.timeA.pts)" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Gols Marcados</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.gols)" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.gols.valor }}</span>
                <button @click="increment(jogo.timeA.gols)" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>

            <div class="box-small">
              <p>Empates</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.empates, 'empate')" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.empates.valor }}</span>
                <button @click="increment(jogo.timeA.empates, 'empate')" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Vitórias</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.vitorias, 'vitoria')" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.vitorias.valor }}</span>
                <button @click="increment(jogo.timeA.vitorias, 'vitoria')" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>

            <div class="box-small">
              <p>Derrotas</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.derrotas)" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.derrotas.valor }}</span>
                <button @click="increment(jogo.timeA.derrotas)" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <button class="btn-save1" @click="salvarPlacar">Salvar</button>
        </div>

        <!-- Placar Vôlei -->
        <div class="team" v-else-if="modalidadeSelecionada === 'volei'">
          <div class="line">
            <div class="box-small">
              <p>Pontos</p>
              <div class="controls espacamento">
                <button @click="decrement(jogoVolei.timeA.pts)" :disabled="!jogoVolei.timeA.nome">−</button>
                <span>{{ jogoVolei.timeA.pts.valor }}</span>
                <button @click="increment(jogoVolei.timeA.pts)" :disabled="!jogoVolei.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Vitórias</p>
              <div class="controls">
                <button @click="decrement(jogoVolei.timeA.vitorias)" :disabled="!jogoVolei.timeA.nome">−</button>
                <span>{{ jogoVolei.timeA.vitorias.valor }}</span>
                <button @click="increment(jogoVolei.timeA.vitorias)" :disabled="!jogoVolei.timeA.nome">+</button>
              </div>
            </div>

            <div class="box-small">
              <p>Derrotas</p>
              <div class="controls">
                <button @click="decrement(jogoVolei.timeA.derrotas)" :disabled="!jogoVolei.timeA.nome">−</button>
                <span>{{ jogoVolei.timeA.derrotas.valor }}</span>
                <button @click="increment(jogoVolei.timeA.derrotas)" :disabled="!jogoVolei.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Sets Vencidos</p>
              <div class="controls espacamento">
                <button @click="decrement(jogoVolei.timeA.setsVencidos)" :disabled="!jogoVolei.timeA.nome">−</button>
                <span>{{ jogoVolei.timeA.setsVencidos.valor }}</span>
                <button @click="increment(jogoVolei.timeA.setsVencidos)" :disabled="!jogoVolei.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <button class="btn-save1" @click="salvarPlacarVolei">Salvar</button>
        </div>
      </div>

      <!-- Modal Visualizar Placar -->
      <div v-if="modalPlacarAberto" class="modalPlacarPai">
        <div class="modal-conteudo modal-placar">
          <div class="header-placar">
            <h2 class="title_placar">Visualizar Placar</h2>
            <button class="btn-reset" @click="abrirModalResetarPlacar">Resetar Placar</button>
          </div>

          <div>
            <label for="modalidade-placar">Escolha a modalidade:</label>
            <select id="modalidade-placar" v-model="modalidadePlacarSelecionada" @change="carregarPlacarModalidade"
              class="dropdown">
              <option disabled value="">Selecione</option>
              <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
                {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
              </option>
            </select>
          </div>

          <div class="placar-table">
            <!-- TABELA FUTEBOL -->
            <table class="placar" v-if="modalidadePlacarSelecionada === 'futebol' || !modalidadePlacarSelecionada">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Time</th>
                  <th>Pontos</th>
                  <th>Gols Marcados</th>
                  <th>Empates</th>
                  <th>Vitórias</th>
                  <th>Derrotas</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(time, index) in timesPlacar" :key="time.id">
                  <td>{{ index + 1 }}º</td>
                  <td class="time-info">
                    <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                    {{ time.time }}
                  </td>
                  <td>{{ time.pontuacao }}</td>
                  <td>{{ time.golsMarcados }}</td>
                  <td>{{ time.empates }}</td>
                  <td>{{ time.vitorias }}</td>
                  <td>{{ time.derrotas }}</td>
                </tr>
              </tbody>
            </table>

            <!-- TABELA VOLEI -->
            <table class="placar" v-if="modalidadePlacarSelecionada === 'volei'">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Time</th>
                  <th>Pontos</th>
                  <th>Vitórias</th>
                  <th>Derrotas</th>
                  <th>Sets Vencidos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(time, index) in timesPlacar" :key="time.id">
                  <td>{{ index + 1 }}º</td>
                  <td class="time-info">
                    <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                    {{ time.time }}
                  </td>
                  <td>{{ time.pontuacao }}</td>
                  <td>{{ time.vitorias }}</td>
                  <td>{{ time.derrotas }}</td>
                  <td>{{ time.setsVencidos }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button class="btn-cancel-placar" @click="fecharModalPlacar">Fechar</button>
        </div>
      </div>

      <!-- Modal de Resetar Placar -->
      <div v-if="modalResetarPlacarAberto" class="modal-overlay">
        <div class="modal-content modal-placar">
          <h2>Resetar Placar</h2>
          <label for="modalidade-resetar">Escolha a modalidade:</label>
          <select id="modalidade-resetar" v-model="modalidadeParaResetar" class="dropdown">
            <option disabled value="">Selecione</option>
            <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
              {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
            </option>
          </select>
          <div class="botoes" style="margin-top: 1rem;">
            <button class="btn-save1" @click="confirmarResetarPlacar">Confirmar</button>
            <button class="btn-cancel-placar" @click="fecharModalResetarPlacar">Cancelar</button>
          </div>
        </div>
      </div>
      <!-- Modal Gerenciar Modalidade -->
      <div v-if="modalGerenciarModalidadeAberto" class="modal-overlay" @click.self="fecharModalGerenciarModalidade">
        <div class="modal-content">
          <h2>Gerenciar Modalidades</h2>
          <div class="form-group">
            <label for="acaoGerenciarModalidade">Escolha a ação:</label>
            <select id="acaoGerenciarModalidade" v-model="acaoGerenciarModalidade" class="dropdown">
              <option disabled value="">Selecione uma opção</option>
              <option value="adicionar">Adicionar Modalidade</option>
              <option value="remover">Remover Modalidade</option>
            </select>
          </div>

          <div class="buttons">
            <button :disabled="!acaoGerenciarModalidade" @click="confirmarAcaoGerenciarModalidade" class="btn-save">
              Continuar
            </button>
            <button class="btn-cancel" @click="fecharModalGerenciarModalidade">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Modal Adicionar Modalidade -->
      <div v-if="modalModalidadeAberto" class="modal-overlay" @click.self="fecharModalModalidade">
        <div class="modal-content">
          <h2>Adicionar Modalidade</h2>
          <form @submit.prevent="cadastrarModalidade">
            <div class="form-group">
              <label for="novaModalidade">Nome da Modalidade</label>
              <input type="text" id="novaModalidade" v-model="novaModalidade" required />
            </div>
            <div class="buttons">
              <button type="submit" class="btn-save">Cadastrar</button>
              <button type="button" class="btn-cancel" @click="fecharModalModalidade">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Remover Modalidade -->
      <div v-if="modalRemoverModalidadeAberto" class="modal-overlay" @click.self="fecharModalRemoverModalidade">
        <div class="modal-content">
          <h2>Remover Modalidade</h2>

          <div class="form-group">
            <label for="modalidadeRemover">Selecione a Modalidade:</label>
            <select id="modalidadeRemover" v-model="modalidadeParaRemover" class="dropdown">
              <option disabled value="">Selecione uma modalidade</option>
              <option v-for="(modalidade, i) in modalidadesDisponiveis" :key="i" :value="modalidade.nome">
                {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
              </option>
            </select>
          </div>

          <div class="buttons">
            <button class="btn-save" @click="removerModalidade">Remover</button>
            <button class="btn-cancel" @click="fecharModalRemoverModalidade">Cancelar</button>
          </div>
        </div>
      </div>
      <div v-if="modalGerenciarTimeAberto" class="modal-overlay" @click.self="fecharModalGerenciarTime">
        <div class="modal-content">
          <h2>Gerenciar Times</h2>
          <div class="form-group">
            <label for="acaoGerenciarTime">Escolha a ação:</label>
            <select id="acaoGerenciarTime" v-model="acaoGerenciarTime" class="dropdown">
              <option disabled value="">Selecione uma opção</option>
              <option value="adicionar">Adicionar Time</option>
              <option value="remover">Remover Time</option>
            </select>
          </div>

          <div class="buttons">
            <button :disabled="!acaoGerenciarTime" @click="confirmarAcaoGerenciarTime" class="btn-save">
              Continuar
            </button>
            <button class="btn-cancel" @click="fecharModalGerenciarTime">Cancelar</button>
          </div>
        </div>
      </div>
      <div v-if="modalAdicionarTimeAberto" class="modal-overlay" @click.self="fecharModalAdicionarTime">
        <div class="modal-content">
          <h2>Adicionar Time</h2>
          <form @submit.prevent="adicionarTime">
            <div class="form-group">
              <label for="modalidade-add-time">Modalidade:</label>
              <select id="modalidade-add-time" v-model="modalidadeSelecionada" required class="dropdown">
                <option disabled value="">Selecione uma modalidade</option>
                <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
                  {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="novoTime">Nome do Time:</label>
              <input type="text" id="novoTime" v-model="timeParaAdicionar" required />
            </div>

            <div class="form-group">
              <label for="fotoTime">Foto (opcional):</label>
              <input type="file" id="fotoTime" @change="handleImagemUpload" accept="image/*" />
            </div>

            <div class="buttons">
              <button type="submit" class="btn-save">Cadastrar</button>
              <button type="button" class="btn-cancel" @click="fecharModalAdicionarTime">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="modalRemoverTimeAberto" class="modal-overlay" @click.self="fecharModalRemoverTime">
        <div class="modal-content">
          <h2>Remover Time</h2>

          <div class="form-group">
            <label for="modalidade-remover-time">Modalidade:</label>
            <select id="modalidade-remover-time" v-model="modalidadeSelecionada" @change="carregarTimes"
              class="dropdown">
              <option disabled value="">Selecione uma modalidade</option>
              <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
                {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="removerTime">Selecione o Time:</label>
            <select id="removerTime" v-model="timeParaRemover" class="dropdown">
              <option disabled value="">Selecione</option>
              <option v-for="(time, i) in times" :key="i" :value="time">
                {{ time }}
              </option>
            </select>
          </div>

          <div class="buttons">
            <button class="btn-save" @click="removerTime">Remover</button>
            <button class="btn-cancel" @click="fecharModalRemoverTime">Cancelar</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'ControlePlacarView',
  components: { SideBar },
  data() {
    return {
      modalidadesDisponiveis: [],
      modalidadeSelecionada: '',
      timeSelecionado: '',
      times: [],
      timesPlacar: [],
      jogo: {
        timeA: {
          nome: '',
          pts: { valor: 0 },
          gols: { valor: 0 },
          empates: { valor: 0 },
          vitorias: { valor: 0 },
          derrotas: { valor: 0 },
        },
      },
      jogoVolei: {
        timeA: {
          nome: '',
          pts: { valor: 0 },
          vitorias: { valor: 0 },
          derrotas: { valor: 0 },
          setsVencidos: { valor: 0 },
        },
      },
      modalGerenciarModalidadeAberto: false,
      modalModalidadeAberto: false,
      modalRemoverModalidadeAberto: false,
      modalPlacarAberto: false,
      modalResetarPlacarAberto: false,
      acaoGerenciarModalidade: '',
      novaModalidade: '',
      modalidadeParaRemover: '',
      modalidadePlacarSelecionada: '',
      modalidadeParaResetar: '',
      modalGerenciarTimeAberto: false,
      acaoGerenciarTime: '',
      modalAdicionarTimeAberto: false,
      modalRemoverTimeAberto: false,
      timeParaAdicionar: '',
      timeParaRemover: '',
      fotoTime: '',
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
      if (newVal) {
        this.carregarTimes();
      }
    },
    timeSelecionado(newVal) {
      if (newVal) this.carregarPlacarTime();
      else this.limparDadosJogo();
    }
  },
  methods: {
    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.fotoTime = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },

    abrirModalGerenciarTime() {
      this.modalGerenciarTimeAberto = true;
      this.acaoGerenciarTime = '';
    },

    fecharModalGerenciarTime() {
      this.modalGerenciarTimeAberto = false;
    },

    confirmarAcaoGerenciarTime() {
      if (this.acaoGerenciarTime === 'adicionar') {
        this.modalAdicionarTimeAberto = true;
      } else if (this.acaoGerenciarTime === 'remover') {
        this.modalRemoverTimeAberto = true;
        this.carregarTimes();
      }
      this.fecharModalGerenciarTime();
    },

    fecharModalAdicionarTime() {
      this.modalAdicionarTimeAberto = false;
      this.timeParaAdicionar = '';
      this.fotoTime = '';
    },

    fecharModalRemoverTime() {
      this.modalRemoverTimeAberto = false;
      this.timeParaRemover = '';
    },

    abrirModalGerenciarModalidade() {
      this.modalGerenciarModalidadeAberto = true;
      this.acaoGerenciarModalidade = '';
      this.novaModalidade = '';
      this.modalidadeParaRemover = '';
      this.carregarModalidades();
    },

    fecharModalGerenciarModalidade() {
      this.modalGerenciarModalidadeAberto = false;
      this.acaoGerenciarModalidade = '';
    },

    confirmarAcaoGerenciarModalidade() {
      if (!this.acaoGerenciarModalidade) return;

      this.modalGerenciarModalidadeAberto = false;

      if (this.acaoGerenciarModalidade === 'adicionar') {
        this.modalModalidadeAberto = true;
      } else if (this.acaoGerenciarModalidade === 'remover') {
        this.modalRemoverModalidadeAberto = true;
      }
    },

    fecharModalModalidade() {
      this.modalModalidadeAberto = false;
      this.novaModalidade = '';
    },

    fecharModalRemoverModalidade() {
      this.modalRemoverModalidadeAberto = false;
      this.modalidadeParaRemover = '';
    },

    async adicionarTime() {
      try {
        const payload = {
          modalidade: this.modalidadeSelecionada,
          time: this.timeParaAdicionar.trim(),
          foto: this.fotoTime || null,
        };

        await axios.post('http://localhost:3000/times', payload);

        Swal.fire('Sucesso', 'Time adicionado com sucesso!', 'success');
        this.fecharModalAdicionarTime();
        this.carregarTimes();
      } catch (error) {
        console.error('Erro ao adicionar time:', error);
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao adicionar time.', 'error');
      }
    },

    async removerTime() {
      try {
        await axios.delete(`http://localhost:3000/placar/${this.modalidadeSelecionada}/${this.timeParaRemover}`);

        Swal.fire('Sucesso', 'Time removido com sucesso!', 'success');
        this.fecharModalRemoverTime();
        this.carregarTimes();
      } catch (error) {
        console.error('Erro ao remover time:', error);
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao remover time.', 'error');
      }
    },

    async carregarModalidades() {
      try {
        const res = await axios.get('http://localhost:3000/modalidade');
        this.modalidadesDisponiveis = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async cadastrarModalidade() {
      const nome = this.novaModalidade.trim();
      if (!nome) {
        Swal.fire('Atenção', 'Informe o nome da modalidade.', 'warning');
        return;
      }
      try {
        await axios.post('http://localhost:3000/modalidade', { nome });
        Swal.fire('Sucesso', 'Modalidade cadastrada com sucesso!', 'success');
        this.novaModalidade = '';
        this.modalModalidadeAberto = false;
        this.carregarModalidades();
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao cadastrar modalidade.', 'error');
      }
    },

    async removerModalidade() {
      try {
        await axios.delete(`http://localhost:3000/modalidade/${this.modalidadeParaRemover}`);
        Swal.fire('Sucesso', 'Modalidade removida com sucesso!', 'success');
        this.modalidadeParaRemover = '';
        this.modalRemoverModalidadeAberto = false;
        this.carregarModalidades();

        if (this.modalidadeSelecionada === this.modalidadeParaRemover) {
          this.modalidadeSelecionada = '';
          this.timeSelecionado = '';
          this.times = [];
          this.limparDadosJogo();
        }
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao remover modalidade.', 'error');
      }
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) return;
      try {
        const res = await axios.get(`http://localhost:3000/times/${this.modalidadeSelecionada}`);
        this.times = res.data.map(t => t.time);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      }
    },

    async carregarPlacarTime() {
      if (!this.modalidadeSelecionada || !this.timeSelecionado) return;
      try {
        const res = await axios.get(`http://localhost:3000/times/${this.modalidadeSelecionada}/${this.timeSelecionado}`);
        const dados = res.data;

        if (this.modalidadeSelecionada === 'futebol') {
          this.jogo.timeA.nome = dados.time;
          this.jogo.timeA.pts.valor = dados.pontuacao || 0;
          this.jogo.timeA.gols.valor = dados.golsMarcados || 0;
          this.jogo.timeA.empates.valor = dados.empates || 0;
          this.jogo.timeA.vitorias.valor = dados.vitorias || 0;
          this.jogo.timeA.derrotas.valor = dados.derrotas || 0;
        } else if (this.modalidadeSelecionada === 'volei') {
          this.jogoVolei.timeA.nome = dados.time;
          this.jogoVolei.timeA.pts.valor = dados.pontuacao || 0;
          this.jogoVolei.timeA.vitorias.valor = dados.vitorias || 0;
          this.jogoVolei.timeA.derrotas.valor = dados.derrotas || 0;
          this.jogoVolei.timeA.setsVencidos.valor = dados.setsVencidos || 0;
        }
      } catch (error) {
        console.error('Erro ao carregar placar do time:', error);
        Swal.fire('Erro', 'Não foi possível carregar o placar do time.', 'error');
      }
    },

    limparDadosJogo() {
      this.jogo.timeA = {
        nome: '',
        pts: { valor: 0 },
        gols: { valor: 0 },
        empates: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 },
      };
      this.jogoVolei.timeA = {
        nome: '',
        pts: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 },
        setsVencidos: { valor: 0 },
      };
    },

    increment(obj, tipo = '') {
      obj.valor++;
      if (this.modalidadeSelecionada === 'futebol') {
        if (tipo === 'vitoria') this.jogo.timeA.pts.valor += 3;
        else if (tipo === 'empate') this.jogo.timeA.pts.valor += 1;
      }
    },

    decrement(obj, tipo = '') {
      if (obj.valor > 0) {
        obj.valor--;
        if (this.modalidadeSelecionada === 'futebol') {
          if (tipo === 'vitoria' && this.jogo.timeA.pts.valor >= 3) this.jogo.timeA.pts.valor -= 3;
          else if (tipo === 'empate' && this.jogo.timeA.pts.valor >= 1) this.jogo.timeA.pts.valor -= 1;
        }
      }
    },

    async salvarPlacar() {
      try {
        const dadosParaSalvar = {
          gols: this.jogo.timeA.gols.valor,
          pts: this.jogo.timeA.pts.valor,
          empates: this.jogo.timeA.empates.valor,
          vitorias: this.jogo.timeA.vitorias.valor,
          derrotas: this.jogo.timeA.derrotas.valor,
        };
        await axios.put(`http://localhost:3000/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dadosParaSalvar);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },

    async salvarPlacarVolei() {
      try {
        const dados = {
          pts: this.jogoVolei.timeA.pts.valor,
          vitorias: this.jogoVolei.timeA.vitorias.valor,
          derrotas: this.jogoVolei.timeA.derrotas.valor,
          setsVencidos: this.jogoVolei.timeA.setsVencidos.valor,
        };
        await axios.put(`http://localhost:3000/placar/${this.modalidadeSelecionada}/${this.timeSelecionado}`, dados);
        Swal.fire('Sucesso', 'Placar salvo com sucesso!', 'success');
        this.limparDadosJogo();
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },

    abrirModalPlacar() {
      this.modalPlacarAberto = true;
      this.modalidadePlacarSelecionada = '';
      this.timesPlacar = [];
    },

    fecharModalPlacar() {
      this.modalPlacarAberto = false;
      this.modalidadePlacarSelecionada = '';
      this.timesPlacar = [];
    },

    async carregarPlacarModalidade() {
      if (!this.modalidadePlacarSelecionada) {
        this.timesPlacar = [];
        return;
      }
      try {
        const res = await axios.get(`http://localhost:3000/placar/${this.modalidadePlacarSelecionada}`);
        this.timesPlacar = res.data;
      } catch (error) {
        Swal.fire('Erro', 'Erro ao carregar placar.', 'error');
      }
    },

    abrirModalResetarPlacar() {
      this.modalResetarPlacarAberto = true;
      this.fecharModalPlacar();
      this.modalidadeParaResetar = '';
    },

    fecharModalResetarPlacar() {
      this.modalResetarPlacarAberto = false;
      this.modalidadeParaResetar = '';
    },

    async confirmarResetarPlacar() {
      try {
        await axios.put('http://localhost:3000/reset', { modalidade: this.modalidadeParaResetar });
        Swal.fire('Sucesso', 'Placar resetado com sucesso!', 'success');
        this.modalResetarPlacarAberto = false;
        this.modalidadeParaResetar = '';
      } catch (error) {
        console.error('Erro ao resetar placar:', error);
        Swal.fire('Erro', 'Erro ao resetar placar.', 'error');
      }
    }
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


.line {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 20px;
}


.box-small {
  flex: 1;
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
  background-color:#152147;
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


.box,
.box-small {
  background: #f1f1f1;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  text-align: center;
}


.controls {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 20px;
}


.controls button {
  background-color: #1e3a8a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 18px;
  cursor: pointer;
}


.espacamento {
  gap: 27%;
}


.controls button:last-child {
  background-color: #3b82f6;
}


.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}


.btn-cancel {
  background-color: #7E7E7E;
  flex: 1;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
}


.btn-save {
  background-color: #3b82f6;
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
}


.btn-save1 {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}


.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
}


.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}


.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}


.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
}


.form-group input[type="text"],
.form-group input[type="file"] {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}


.modalPlacarPai {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}


.modal-conteudo.modal-placar {
  background-color: #fff;
  border-radius: 12px;
  width: 800px;
  height: 600px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}


.placar-table {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}


.placar {
  width: 100%;
  border-collapse: collapse;
}


.title_placar {
  color: #3b82f6;
  font-size: 28px;
}


.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 14px 12px;
  font-size: 16px;
  text-align: left;
}


.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}


.placar tbody tr:hover {
  background-color: #f3f4f6;
}


.placar tbody td {
  color: #4b5563;
  padding: 12px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
}


.placar tbody tr:last-child td {
  border-bottom: none;
}


.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}


.time-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}


.btn-cancel-placar {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}


.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}


.btn-reset {
  background-color: #7E7E7E;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
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

  .placar {
    min-width: 100%;
    font-size: 14px;
  }

  .line {
    gap: 15px;
    margin-bottom: 25px;
  }

  .modal-conteudo.modal-placar {
    width: 90vw;
    height: 80vh;
    overflow: hidden;
    padding: 20px;
  }

  .placar-table {
    overflow-x: auto;
    overflow-y: auto;
    max-height: calc(80vh - 100px);
    border-radius: 12px;
    background-color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .placar {
    min-width: 700px;
    border-collapse: collapse;
  }
}
</style>