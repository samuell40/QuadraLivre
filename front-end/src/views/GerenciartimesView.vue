<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Gerenciar Times</h1>
        <div class="botoes">
          <button class="btn-add" @click="abrirModalAdicionarTime"> Adicionar Time</button>
        </div>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="dropdown-row">
          <div class="team dropdown-container">
            <p>Modalidade:</p>
            <select id="modalidade" v-model="modalidadeSelecionada" class="dropdown">
              <option disabled value="">Selecione uma modalidade</option>
              <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.id">
                {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
              </option>
            </select>


          </div>
        </div>

        <AdicionarTimeModal :aberto="modalAdicionarTimeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
          @fechar="fecharModalAdicionarTime" @atualizar="carregarTimes" />

        <DetalharTimes :aberto="modalDetalharTimeAberto" :time="timeSelecionadoDetalhe"
          :modalidadeSelecionada="modalidadeSelecionada" ref="detalharJogadores" @fechar="fecharModalDetalharTime"
          @gerenciar-jogadores="modalGerenciarJogadoresAberto = true" />

        <GerenciarJogadores :aberto="modalGerenciarJogadoresAberto" :time="timeSelecionadoDetalhe"
          @fechar="modalGerenciarJogadoresAberto = false" @atualizar-lista="atualizarJogadores" />

        <div v-if="isLoadingTimes" class="loader-container-centralizado">
          <div class="loader"></div>
        </div>


        <div v-else>
          <div v-if="times && times.length" class="lista-times">
            <div v-for="time in times" :key="time.id" class="card">
              <div class="card-conteudo">
                <div class="foto">
                  <img :src="time.foto" :alt="time.nome" />
                </div>

                <div class="info">
                  <h2>{{ time.nome }}</h2>
                  <p>{{ obterQtdJogadores(time) }} jogador{{ obterQtdJogadores(time) === 1 ? '' : 'es' }}</p>
                  <p>Treinador: {{ time.treinador || 'N/A' }}</p>
                  <p>Agendamentos: {{ time.agendamentos || 0 }}</p>
                </div>
              </div>

              <div class="botoes">
                <button class="btn-editar" @click="abrirModalDetalharTime(time)">Detalhes</button>
                <button class="btn-detalhar" @click="removerTime(time.id)">Remover</button>

              </div>
            </div>
          </div>

          <div v-else class="mensagem-placar">
            Nenhum time encontrado para esta modalidade.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import AdicionarTimeModal from '@/components/modals/times/AdicionarTimesModal.vue';
import DetalharTimes from '@/components/modals/times/DetalharTimes.vue';
import GerenciarJogadores from '@/components/modals/times/GerenciarJogadores.vue';
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'GerenciartimesView',
  components: {
    SideBar,
    AdicionarTimeModal,
    DetalharTimes,
    GerenciarJogadores
  },
  data() {
    return {
      isLoading: true,
      modalidadesDisponiveis: [],
      modalidadeSelecionada: null,
      times: [],
      timeSelecionadoDetalhe: null,
      modalAdicionarTimeAberto: false,
      modalDetalharTimeAberto: false,
      modalGerenciarJogadoresAberto: false,
      acaoGerenciarModalidade: '',
      fotoTime: '',
      timeParaAdicionar: '',
      timeParaRemover: '',
      isLoadingTimes: false,
    };
  },
  mounted() {
    this.carregarModalidades().finally(() => { this.isLoading = false; });
  },
  watch: {
    modalidadeSelecionada() {
      this.carregarTimes();
    }
  },
  methods: {
    abrirModalAdicionarTime() { this.modalAdicionarTimeAberto = true; this.timeParaAdicionar = ''; this.fotoTime = ''; },
    fecharModalAdicionarTime() { this.modalAdicionarTimeAberto = false; this.timeParaAdicionar = ''; this.fotoTime = ''; },

    abrirModalRemoverTime() { this.modalRemoverTimeAberto = true; this.carregarTimes(); this.timeParaRemover = ''; },
    fecharModalRemoverTime() { this.modalRemoverTimeAberto = false; this.timeParaRemover = ''; },

    abrirModalRemoverTimeComId(id) { this.timeParaRemover = id; this.modalRemoverTimeAberto = true; },

    abrirModalDetalharTime(time) {
      this.timeSelecionadoDetalhe = time;
      this.modalDetalharTimeAberto = true;
    },
    fecharModalDetalharTime() {
      this.modalDetalharTimeAberto = false;
      this.timeSelecionadoDetalhe = null;
    },

    abrirModalGerenciarJogadores() {
      this.modalGerenciarJogadoresAberto = true;
    },

    async atualizarJogadores() {
      if (this.$refs.detalharJogadores && this.timeSelecionadoDetalhe?.id) {
        this.$refs.detalharJogadores.carregarJogadores(this.timeSelecionadoDetalhe.id);
      }
      await this.carregarTimes();
    },

    editarTime(time) {
      Swal.fire('Editar', `Abrir modal de editar para: ${time.nome}`, 'info');
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade');
        this.modalidadesDisponiveis = res.data;

        if (this.modalidadesDisponiveis.length) {
          this.modalidadeSelecionada = this.modalidadesDisponiveis[0].id;
          this.carregarTimes();
        }
      } catch (error) {
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async carregarTimes() {
      if (!this.modalidadeSelecionada) {
        this.times = [];
        return;
      }

      this.isLoadingTimes = true;
      try {
        const res = await api.get(`/times/modalidade/${this.modalidadeSelecionada}`);
        const data = res.data;
        this.times = data.map(t => ({
          id: t.id,
          nome: t.nome,
          foto: t.foto,
          qtdJogadores: t._count?.jogadores
        }));
      } catch (err) {
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      } finally {
        this.isLoadingTimes = false;
      }
    },
    async removerTime(id) {
      const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: "Essa ação vai remover o time permanentemente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
      });

      if (!confirmacao.isConfirmed) {
        return;
      }
      this.isLoadingTimes = true;

      try {
        await api.delete(`/time/remover/${id}`);
        Swal.fire('Removido!', 'O time foi removido com sucesso.', 'success');
        await this.carregarTimes();
      } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Não foi possível remover o time.', 'error');
      } finally {
        this.isLoadingTimes = false;
      }
    },

    obterQtdJogadores(time) { return typeof time.qtdJogadores === 'number' ? time.qtdJogadores : 0; }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
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

.btn-modalidade,
.btn-add {
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
}

.btn-modalidade {
  background-color: #3b82f6;
}

.btn-add {
  background-color: #3b82f6;
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

.lista-times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-conteudo {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.foto {
  flex: 0 0 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.foto img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #276ef1;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
}

.btn-editar,
.btn-detalhar {
  flex: 1;
  padding: 5px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-editar {
  background-color: #3b82f6;
  color: white;
}

.btn-detalhar {
  background-color: #7E7E7E;
  color: white;
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

@media (max-width: 768px) {
  .conteudo {
    margin-left: 0;
    padding: 20px;
  }

  .lista-times {
    grid-template-columns: 1fr;
  }

  .card-conteudo {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .foto img {
    width: 80px;
    height: 80px;
  }

  .info h2 {
    font-size: 18px;
  }

  .info p {
    font-size: 13px;
  }

  .botoes {
    flex-direction: column;
    gap: 10px;
  }

  .btn-editar,
  .btn-detalhar {
    width: 100%;
    padding: 8px 0;
  }
}
</style>