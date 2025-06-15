<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Placar</h1>
        <div style="display: flex; gap: 10px;">
          <button class="btn-add" @click="abrirModal">Adicionar Time</button>
          <button class="btn-rm" @click="abrirModalRemover">Remover Time</button>
        </div>
      </div>

      <div class="game">
        <div class="team">
          <select v-model="jogo.timeA.nome" class="dropdown">
            <option disabled value="">Selecione um time</option>
            <option v-for="(time, i) in times" :key="i" :value="time">{{ time }}</option>
          </select>

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

          <button class="btn-save" @click="salvarPlacar">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal Adicionar -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <h2>Adicionar Time</h2>
        <form @submit.prevent="adicionarTime">
          <div class="form-group">
            <label for="nome">Nome do Time</label>
            <input type="text" id="nome" v-model="form.nome" required />
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

    <!-- Modal Remover -->
    <div v-if="modalRemoverAberto" class="modal-overlay" @click.self="fecharModalRemover">
      <div class="modal-content">
        <h2>Remover Time</h2>
        <form @submit.prevent="removerTime">
          <div class="form-group">
            <label for="timeRemover">Selecione o Time</label>
            <select v-model="timeSelecionadoRemover" required>
              <option disabled value="">Selecione um time</option>
              <option v-for="(time, i) in times" :key="i" :value="time">{{ time }}</option>
            </select>
          </div>

          <div class="buttons">
            <button type="submit" class="btn-save">Excluir</button>
            <button type="button" class="btn-cancel" @click="fecharModalRemover">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';

export default {
  name: "ControlePlacarView",
  components: {
    SideBar
  },
  data() {
    return {
      jogo: this.criarNovoJogo(),
      times: [],
      modalAberto: false,
      modalRemoverAberto: false,
      timeSelecionadoRemover: '',
      form: {
        nome: '',
        imagem: null
      }
    };
  },
  mounted() {
    this.carregarTimes();
  },
  methods: {
    abrirModal() {
      this.modalAberto = true;
    },
    fecharModal() {
      this.modalAberto = false;
      this.limparForm();
    },
    abrirModalRemover() {
      this.modalRemoverAberto = true;
    },
    fecharModalRemover() {
      this.modalRemoverAberto = false;
      this.timeSelecionadoRemover = '';
    },
    onFileChange(event) {
      const file = event.target.files[0];
      this.form.imagem = file;
    },
    async adicionarTime() {
      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          const uploadResponse = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) throw new Error('Erro ao enviar imagem');

          const uploadData = await uploadResponse.json();
          urlImagem = uploadData.fileUrl;
        }

        const response = await fetch('http://localhost:3000/times', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            time: this.form.nome,
            foto: urlImagem,
            pontuacao: 0,
            vitorias: 0,
            derrotas: 0,
            empates: 0,
            golsMarcados: 0
          }),
        });

        if (!response.ok) throw new Error('Erro ao cadastrar time');

        Swal.fire('Sucesso!', 'Time cadastrado com sucesso!', 'success');
        this.carregarTimes();
        this.fecharModal();
      } catch (error) {
        console.error('Erro ao cadastrar time:', error);
        Swal.fire('Erro', 'Erro ao cadastrar time. Tente novamente.', 'error');
      }
    },
    async removerTime() {
      if (!this.timeSelecionadoRemover) return;

      try {
        const response = await fetch(`http://localhost:3000/times/${encodeURIComponent(this.timeSelecionadoRemover)}`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao remover time');

        Swal.fire('Sucesso!', 'Time removido com sucesso!', 'success');
        this.carregarTimes();
        this.fecharModalRemover();
      } catch (error) {
        console.error('Erro ao remover time:', error);
        Swal.fire('Erro', 'Erro ao remover time. Tente novamente.', 'error');
      }
    },
    limparForm() {
      this.form = { nome: '', imagem: null };
      const inputImagem = document.getElementById('imagem');
      if (inputImagem) inputImagem.value = null;
    },
    async carregarTimes() {
      try {
        const response = await fetch('http://localhost:3000/times');
        const data = await response.json();
        this.times = data.times;
      } catch (error) {
        Swal.fire('Erro', 'Erro ao carregar os times.', 'error');
      }
    },
    criarNovoJogo() {
      const criarStats = () => ({
        nome: "",
        gols: { valor: 0 },
        pts: { valor: 0 },
        empates: { valor: 0 },
        vitorias: { valor: 0 },
        derrotas: { valor: 0 }
      });
      return {
        timeA: criarStats()
      };
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
    async salvarPlacar() {
      const nome = this.jogo.timeA.nome;
      if (!nome) {
        Swal.fire('Atenção', 'Selecione um time antes de salvar.', 'warning');
        return;
      }

      const payload = {
        gols: this.jogo.timeA.gols.valor,
        pts: this.jogo.timeA.pts.valor,
        empates: this.jogo.timeA.empates.valor,
        vitorias: this.jogo.timeA.vitorias.valor,
        derrotas: this.jogo.timeA.derrotas.valor
      };

      try {
        const response = await fetch(`http://localhost:3000/placar/${encodeURIComponent(nome)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro ao atualizar placar');

        Swal.fire('Sucesso', 'Placar atualizado com sucesso!', 'success');
      } catch (error) {
        Swal.fire('Erro', 'Erro ao salvar placar.', 'error');
      }
    },
    async carregarDadosTimeSelecionado(nomeTime) {
      try {
        const response = await fetch(`http://localhost:3000/times/${encodeURIComponent(nomeTime)}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do time');

        const time = await response.json();

        this.jogo.timeA.gols.valor = time.golsMarcados || 0;
        this.jogo.timeA.pts.valor = (time.vitorias * 3) + (time.empates || 0);
        this.jogo.timeA.empates.valor = time.empates || 0;
        this.jogo.timeA.vitorias.valor = time.vitorias || 0;
        this.jogo.timeA.derrotas.valor = time.derrotas || 0;
      } catch (error) {
        console.error('Erro ao carregar dados do time:', error);
        Swal.fire('Erro', 'Erro ao carregar dados do time selecionado.', 'error');
      }
    }
  },
  watch: {
    'jogo.timeA.vitorias.valor': 'atualizarPontos',
    'jogo.timeA.empates.valor': 'atualizarPontos',
    'jogo.timeA.nome'(novoNome) {
      if (novoNome) {
        this.carregarDadosTimeSelecionado(novoNome);
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  margin-top: 20px;
  flex-direction: row;
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
  margin-bottom: 35px;
  flex-wrap: wrap;
}

.line {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.box-small {
  flex: 1;
  min-width: 150px;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  margin-left: 15%;
}

.btn-add, .btn-rm {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-rm {
  background-color: #1E3A8A;
  margin-right: -66px;
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
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-bottom: 40px;
}

.box, .box-small {
  background: #f1f1f1;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 8px;
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

.controls button:last-child {
  background-color: #3b82f6;
}

.espacamento {
  gap: 27%;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-save {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}

.btn-cancel {
  background-color: #7E7E7E;
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

@media (max-width: 768px) {
  .header {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .title {
    margin-left: 0;
    font-size: 24px;
    margin-bottom: 10px;
  }

  .btn-add, .btn-rm {
    margin-right: 20px;
    padding: 9px 38px; 
    border-radius: 30px; 
    font-size: 16px; 
  }

  .game {
    margin-left: 0;
    width: 100%;
  }

  .line {
    margin-bottom: 6%;
  }
}

</style>