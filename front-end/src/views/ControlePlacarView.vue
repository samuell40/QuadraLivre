<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Placar</h1>
        <div class="botoes">
          <button class="btn-placar" @click="abrirModalPlacar">Visualizar Placar</button>
          <button class="btn-add" @click="abrirModal">Adicionar Time</button>
          <button class="btn-rm" @click="abrirModalRemover">Remover Time</button>
        </div>
      </div>

      <!-- Linha com os dois dropdowns lado a lado -->
      <div class="dropdown-row">
        <div class="team">
          <p>Modalidade:</p>
          <select id="modalidade" v-model="modalidadeSelecionada" @change="carregarTimes" class="dropdown">
            <option disabled value="">Selecione uma modalidade</option>
            <option value="futebol">Futebol</option>
            <option value="volei">Vôlei</option>
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
      <div class="game" v-if="modalidadeSelecionada === 'futebol'">
        <div class="team">
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
                <button @click="decrement(jogo.timeA.empates)" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.empates.valor }}</span>
                <button @click="increment(jogo.timeA.empates)" :disabled="!jogo.timeA.nome">+</button>
              </div>
            </div>
          </div>

          <div class="line">
            <div class="box-small">
              <p>Vitórias</p>
              <div class="controls">
                <button @click="decrement(jogo.timeA.vitorias)" :disabled="!jogo.timeA.nome">−</button>
                <span>{{ jogo.timeA.vitorias.valor }}</span>
                <button @click="increment(jogo.timeA.vitorias)" :disabled="!jogo.timeA.nome">+</button>
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
      </div>

      <!-- Placar Vôlei -->
      <div class="game" v-if="modalidadeSelecionada === 'volei'">
        <div class="team">
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
    </div>

    <!-- Modal adicionar time -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <h2>Adicionar Time</h2>
        <form @submit.prevent="adicionarTime">
          <div class="form-group">
            <label for="nome">Nome do Time</label>
            <input type="text" id="nome" v-model="form.nome" required />
          </div>

          <div class="form-group">
            <label for="modalidade">Modalidade</label>
            <select v-model="form.modalidade" required class="dropdown">
              <option disabled value="">Selecione</option>
              <option value="futebol">Futebol</option>
              <option value="volei">Vôlei</option>
            </select>
          </div>

          <div class="form-group">
            <label for="imagem">Foto do Time</label>
            <input type="file" id="imagem" @change="onFileChange" accept="image/*" />
          </div>

          <div class="buttons">
            <button type="submit" class="btn-save">Salvar</button>
            <button type="button" class="btn-cancel" @click="fecharModal">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Remover Time -->
    <div v-if="modalRemoverAberto" class="modal-overlay" @click.self="fecharModalRemover">
      <div class="modal-content">
        <h2>Remover Time</h2>

        <div class="form-group">
          <label for="modalidadeRemover">Modalidade:</label>
          <select v-model="modalidadeSelecionada" @change="carregarTimes" class="dropdown">
            <option disabled value="">Selecione uma modalidade</option>
            <option value="futebol">Futebol</option>
            <option value="volei">Vôlei</option>
          </select>
        </div>

        <div class="form-group">
          <label for="timeRemover">Time:</label>
          <select v-model="timeSelecionado" class="dropdown">
            <option disabled value="">Selecione um time</option>
            <option v-for="(time, i) in times" :key="i" :value="time">{{ time }}</option>
          </select>
        </div>

        <div class="buttons">
          <button @click="removerTime" class="btn-save">Remover</button>
          <button @click="fecharModalRemover" class="btn-cancel">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal Placar -->
    <div v-if="modalPlacarAberto" class="modalPlacarPai" @click.self="fecharModalPlacar">
      <div class="modal-conteudo modal-placar">
        <div style="display: flex; flex-direction: column; margin-bottom: 10px;">
          <div class="header-placar">
            <h3 class="title_placar">Placar Virtual</h3>
            <button class="btn-reset" @click="abrirModalResetar">Resetar Placar</button>
          </div>

          <div style="margin-top: 10px; margin-bottom: 10px;">
            <label for="modalidadePlacar" style="margin-right: 10px;">Modalidade:</label>
            <select id="modalidadePlacar" v-model="modalidadePlacarSelecionada" @change="carregarPlacar"
              class="dropdown">
              <option disabled value="">Selecione uma modalidade</option>
              <option value="futebol">Futebol</option>
              <option value="volei">Vôlei</option>
            </select>
          </div>
        </div>

        <div class="placar-table">
          <table class="placar">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Time</th>
                <th>Pontos</th>
                <th>Vitórias</th>
                <th v-if="modalidadePlacarSelecionada === 'futebol'">Empates</th>
                <th>Derrotas</th>
                <th v-if="modalidadePlacarSelecionada === 'futebol'">Gols</th>
                <th v-if="modalidadePlacarSelecionada === 'volei'">Sets Vencidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(placar, index) in timesPlacar" :key="index">
                <td>{{ index + 1 }}</td>
                <td class="time-info">
                  <img :src="placar.foto" alt="Foto do time" class="time-image" />
                  <span>{{ placar.time }}</span>
                </td>
                <td>{{ placar.pontuacao || placar.pts || 0 }}</td>
                <td>{{ placar.vitorias || 0 }}</td>
                <td v-if="modalidadePlacarSelecionada === 'futebol'">{{ placar.empates || 0 }}</td>
                <td>{{ placar.derrotas || 0 }}</td>
                <td v-if="modalidadePlacarSelecionada === 'futebol'">{{ placar.golsMarcados || 0 }}</td>
                <td v-if="modalidadePlacarSelecionada === 'volei'">{{ placar.setsVencidos || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="buttons">
          <button class="btn-cancel-placar" @click="fecharModalPlacar">Fechar</button>
        </div>
      </div>
    </div>
    <!-- Modal Resetar Placar -->
    <div v-if="modalResetAberto" class="modal-overlay" @click.self="fecharModalResetar">
      <div class="modal-content">
        <h2>Resetar Placar</h2>

        <div class="form-group">
          <label for="modalidadeResetar">Modalidade:</label>
          <select v-model="modalidadeParaReset" class="dropdown">
            <option disabled value="">Selecione uma modalidade</option>
            <option value="futebol">Futebol</option>
            <option value="volei">Vôlei</option>
          </select>
        </div>

        <div class="buttons">
          <button class="btn-save" @click="resetarPlacarPorModalidade">Resetar</button>
          <button class="btn-cancel" @click="fecharModalResetar">Cancelar</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';

export default {
  name: "ControlePlacarView",
  components: { SideBar },
  data() {
    return {
      modalidadeSelecionada: 'futebol',
      modalidadePlacarSelecionada: 'futebol',
      jogo: this.criarNovoJogo(),
      jogoVolei: this.criarNovoJogoVolei(),
      times: [],
      timesPlacar: [],
      modalAberto: false,
      modalPlacarAberto: false,
      modalRemoverAberto: false,
      modalResetAberto: false,
      modalidadeParaReset: '',
      form: {
        nome: '',
        imagem: null,
        modalidade: ''
      }
    };
  },

  mounted() {
    this.carregarTimes();
  },

  watch: {
    timeSelecionado(novoNome) {
      if (novoNome) {
        this.carregarDadosTimeSelecionado(novoNome);
      }
    },
    'jogo.timeA.vitorias.valor': 'atualizarPontos',
    'jogo.timeA.empates.valor': 'atualizarPontos'
  },

  computed: {
    timeSelecionado: {
      get() {
        return this.modalidadeSelecionada === 'futebol'
          ? this.jogo.timeA.nome
          : this.jogoVolei.timeA.nome;
      },
      set(valor) {
        if (this.modalidadeSelecionada === 'futebol') {
          this.jogo.timeA.nome = valor;
        } else {
          this.jogoVolei.timeA.nome = valor;
        }
      }
    }
  },

  methods: {
    abrirModal() {
      this.modalAberto = true;
    },
    fecharModal() {
      this.modalAberto = false;
      this.limparForm();
    },
    abrirModalPlacar() {
      this.modalPlacarAberto = true;
      this.modalidadePlacarSelecionada = this.modalidadeSelecionada;
      this.carregarPlacar();
    },
    fecharModalPlacar() {
      this.modalPlacarAberto = false;
      this.timesPlacar = [];
    },
    abrirModalRemover() {
      this.modalRemoverAberto = true;
    },
    fecharModalRemover() {
      this.modalRemoverAberto = false;
    },
    abrirModalResetar() {
      this.modalResetAberto = true;
      this.modalidadeParaReset = this.modalidadeSelecionada;
    },
    fecharModalResetar() {
      this.modalResetAberto = false;
      this.modalidadeParaReset = '';
    },
    async resetarPlacarPorModalidade() {
      if (!this.modalidadeParaReset) {
        Swal.fire('Atenção', 'Selecione uma modalidade.', 'warning');
        return;
      }

      try {
        await fetch('http://localhost:3000/placar/reset', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modalidade: this.modalidadeParaReset })
        });

        Swal.fire('Sucesso', `Placar da modalidade "${this.modalidadeParaReset}" resetado com sucesso!`, 'success');
        this.fecharModalResetar();
        this.carregarPlacar();
      } catch (error) {
        console.error('Erro ao resetar placar:', error);
        Swal.fire('Erro', 'Erro ao resetar placar.', 'error');
      }
    },
    async removerTime() {
      if (!this.modalidadeSelecionada || !this.timeSelecionado) {
        Swal.fire('Atenção', 'Selecione a modalidade e o time.', 'warning');
        return;
      }

      try {
        await fetch(`http://localhost:3000/placar/${this.modalidadeSelecionada}/${encodeURIComponent(this.timeSelecionado)}`, {
          method: 'DELETE'
        });

        Swal.fire('Removido!', 'Time removido com sucesso.', 'success');
        this.fecharModalRemover();
        this.carregarTimes();
      } catch (error) {
        console.error('Erro ao remover time:', error);
        Swal.fire('Erro', error.message || 'Erro ao remover time.', 'error');
      }
    },
    onFileChange(event) {
      this.form.imagem = event.target.files[0];
    },
    async carregarPlacar() {
      try {
        const response = await fetch(`http://localhost:3000/placar/${this.modalidadePlacarSelecionada}`);
        const data = await response.json();
        this.timesPlacar = data;
      } catch {
        Swal.fire('Erro', 'Erro ao carregar placar.', 'error');
      }
    },
    async adicionarTime() {
      let urlImagem = null;
      try {
        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);
          const uploadRes = await fetch('http://localhost:3000/upload', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          urlImagem = uploadData.fileUrl;
        }

        await fetch('http://localhost:3000/times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: this.form.nome,
            foto: urlImagem,
            modalidade: this.form.modalidade
          })
        });

        Swal.fire('Sucesso!', 'Time cadastrado com sucesso!', 'success');
        this.carregarTimes();
        this.fecharModal();
      } catch (error) {
        Swal.fire('Erro', error.message || 'Erro ao cadastrar time.', 'error');
      }
    },
    limparForm() {
      this.form = { nome: '', imagem: null, modalidade: '' };
      const inputImagem = document.getElementById('imagem');
      if (inputImagem) inputImagem.value = null;
    },
    criarNovoJogo() {
      const criarStats = () => ({
        nome: '',
        gols: { valor: 0 },
        pts: { valor: 0 },
        empates: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 }
      });
      return { timeA: criarStats() };
    },
    criarNovoJogoVolei() {
      const criarStats = () => ({
        nome: '',
        pts: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 },
        setsVencidos: { valor: 0 }
      });
      return { timeA: criarStats() };
    },
    increment(item) {
      item.valor++;
    },
    decrement(item) {
      if (item.valor > 0) item.valor--;
    },
    atualizarPontos() {
      const { vitorias, empates, pts } = this.jogo.timeA;
      pts.valor = (vitorias.valor * 3) + (empates.valor * 1);
    },
    async carregarTimes() {
      if (!this.modalidadeSelecionada) return;
      try {
        const response = await fetch(`http://localhost:3000/times/${this.modalidadeSelecionada}`);
        const data = await response.json();
        this.times = data.times;
      } catch {
        Swal.fire('Erro', 'Erro ao carregar times.', 'error');
        this.times = [];
      }
    },
    async salvarPlacar() {
      const nome = this.jogo.timeA.nome;
      if (!nome) {
        Swal.fire('Atenção', 'Selecione um time.', 'warning');
        return;
      }

      const payload = {
        modalidade: 'futebol',
        nome: nome,
        dados: {
          gols: this.jogo.timeA.gols.valor,
          pts: this.jogo.timeA.pts.valor,
          empates: this.jogo.timeA.empates.valor,
          vitorias: this.jogo.timeA.vitorias.valor,
          derrotas: this.jogo.timeA.derrotas.valor
        }
      };

      try {
        await fetch(`http://localhost:3000/placar/${encodeURIComponent(nome)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        Swal.fire('Sucesso', 'Placar atualizado!', 'success');
        this.resetarPlacarFutebol();
        this.limparForm();
      } catch {
        Swal.fire('Erro', 'Erro ao atualizar placar.', 'error');
      }
    },
    async salvarPlacarVolei() {
      const nome = this.jogoVolei.timeA.nome;
      if (!nome) {
        Swal.fire('Atenção', 'Selecione um time.', 'warning');
        return;
      }

      const payload = {
        modalidade: 'volei',
        nome: nome,
        dados: {
          pts: this.jogoVolei.timeA.pts.valor,
          vitorias: this.jogoVolei.timeA.vitorias.valor,
          derrotas: this.jogoVolei.timeA.derrotas.valor,
          setsVencidos: this.jogoVolei.timeA.setsVencidos.valor
        }
      };

      try {
        await fetch(`http://localhost:3000/placar/${encodeURIComponent(nome)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        Swal.fire('Sucesso', 'Placar atualizado!', 'success');
        this.resetarPlacarVolei();
        this.limparForm();
      } catch {
        Swal.fire('Erro', 'Erro ao atualizar placar.', 'error');
      }
    },
    carregarDadosTimeSelecionado(nomeTime) {
      const modalidade = this.modalidadeSelecionada;

      fetch(`http://localhost:3000/times/${modalidade}/${encodeURIComponent(nomeTime)}`)
        .then(response => response.json())
        .then(time => {
          console.log('Time carregado:', time);

          if (modalidade === 'futebol') {
            this.jogo.timeA.nome = time.time;
            this.jogo.timeA.pts.valor = time.pontuacao || 0;
            this.jogo.timeA.gols.valor = time.golsMarcados || 0;
            this.jogo.timeA.empates.valor = time.empates || 0;
            this.jogo.timeA.vitorias.valor = time.vitorias || 0;
            this.jogo.timeA.derrotas.valor = time.derrotas || 0;
          } else if (modalidade === 'volei') {
            this.jogoVolei.timeA.nome = time.time;
            this.jogoVolei.timeA.pts.valor = time.pontuacao || 0;
            this.jogoVolei.timeA.vitorias.valor = time.vitorias || 0;
            this.jogoVolei.timeA.derrotas.valor = time.derrotas || 0;
            this.jogoVolei.timeA.setsVencidos.valor = time.setsVencidos || 0;
          }
        })
        .catch(error => {
          console.error('Erro ao carregar dados do time:', error);
          Swal.fire('Erro', 'Erro ao carregar dados do time selecionado.', 'error');
        });
    },
    resetarPlacarFutebol() {
      this.jogo = this.criarNovoJogo();
    },
    resetarPlacarVolei() {
      this.jogoVolei = this.criarNovoJogoVolei();
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

.btn-add {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-placar {
  background-color: #7b7979;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-rm {
  background-color: #1E3A8A;
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

  .game {
    width: 100%;
    margin-left: 0;
    padding: 0 10px;
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