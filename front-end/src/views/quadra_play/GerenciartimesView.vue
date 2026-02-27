<template>
  <div class="layout">
    <NavBarQuadras />

    <div class="main">
      <SidebarQuadra @sidebar-toggle="sidebarCollapsed = $event" />

      <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
        <div class="header-times">
          <div class="header-top">
            <h2 class="title">Gerenciar Times</h2>

            <button class="btn-add" @click="abrirModalAdicionarTime">
              Adicionar Time
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="loader-container-centralizado">
          <div class="loader"></div>
        </div>

        <div v-else>
          <div class="abas-container">
            <div class="aba" v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id"
              :class="{ ativa: modalidadeSelecionada === modalidade.id }" @click="selecionarModalidade(modalidade.id)">
              {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
            </div>
          </div>
          <!-- MODAIS -->
          <AdicionarTimeModal :aberto="modalAdicionarTimeAberto" :modalidadesDisponiveis="modalidadesDisponiveis"
            @fechar="fecharModalAdicionarTime" @atualizar="carregarTimes" />

          <DetalharTimes :aberto="modalDetalharTimeAberto" :time="timeSelecionadoDetalhe"
            :modalidadeSelecionada="modalidadeSelecionada" @fechar="fecharModalDetalharTime"
            @atualizar-lista="carregarTimes" />

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
                    <p>
                      {{ obterQtdJogadores(time) }}
                      jogador{{ obterQtdJogadores(time) === 1 ? '' : 'es' }}
                    </p>
                    <p>Treinador: {{ time.treinador }}</p>
                  </div>
                </div>

                <div class="botoes">
                  <button class="btn-editar" @click="abrirModalDetalharTime(time)">
                    Detalhes
                  </button>

                  <button class="btn-detalhar" @click="removerTime(time.id)">
                    Remover
                  </button>
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
  </div>
</template>

<script>
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue';
import SidebarQuadra from '@/components/quadraplay/SidebarQuadra.vue';
import AdicionarTimeModal from '@/components/quadraplay/times/AdicionarTimesModal.vue';
import DetalharTimes from '@/components/quadraplay/times/DetalharTimes.vue';
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'GerenciartimesView',
  components: {
    NavBarQuadras,
    SidebarQuadra,
    AdicionarTimeModal,
    DetalharTimes
  },
  data() {
    return {
      sidebarCollapsed: false,
      isLoading: true,
      modalidadesDisponiveis: [],
      modalidadeSelecionada: null,
      times: [],
      timeSelecionadoDetalhe: null,
      modalAdicionarTimeAberto: false,
      modalDetalharTimeAberto: false,
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

    editarTime(time) {
      Swal.fire('Editar', `Abrir modal de editar para: ${time.nome}`, 'info');
    },
    selecionarModalidade(id) {
      if (this.modalidadeSelecionada === id) return;
      this.modalidadeSelecionada = id;
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
          modalidadeId: t.modalidadeId,
          qtdJogadores: t._count?.jogadores,
          treinador: t.treinador?.usuario?.nome
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
  flex-direction: column;
  min-height: 100vh;
}

.main {
  display: flex;
  flex: 1;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-top: 70px;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
  background: #f8fafc;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.header-times {
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.title {
  margin: 0;
  color:  #3b82f6;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.botoes {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-modalidade,
.btn-add {
  padding: 12px 18px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 999px;
  cursor: pointer;
  color: #fff;
  background-color: #3b82f6;
  font-weight: 700;
  letter-spacing: -0.1px;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.22);
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.btn-modalidade:hover,
.btn-add:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.28);
}

.dropdown {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 15px;
  color: #0f172a;
  background: #fff;
  margin-bottom: 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.dropdown:hover {
  border-color: rgba(59, 130, 246, 0.65);
}

.dropdown:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.dropdown-row {
  display: flex;
  gap: 20px;
}

.dropdown-row .team {
  flex: 1;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin: 16px 0 22px;
}

.aba {
  text-align: center;
  padding: 10px 10px;
  border-radius: 12px;
  cursor: pointer;
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  letter-spacing: -0.1px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.aba:hover {
  background: #eaf2ff;
  transform: translateY(-1px);
  box-shadow: 0 10px 16px rgba(15, 23, 42, 0.06);
}

.aba.ativa {
  background: #3b82f6;
  color: #fff;
  border-color: rgba(59, 130, 246, 0.45);
  box-shadow: 0 14px 24px rgba(59, 130, 246, 0.22);
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
  gap: 14px;
  background: #fff;
  border-radius: 18px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
}

.card-conteudo {
  display: flex;
  flex-direction: row;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
}

.foto {
  flex: 0 0 96px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.foto img {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.75);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.info h2 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.info p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

.card .botoes {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  justify-content: flex-end;
}

.btn-editar,
.btn-detalhar {
  flex: 1;
  padding: 12px 0;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.btn-editar {
  border: none;
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.20);
}

.btn-editar:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.28);
}

.btn-detalhar {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #64748b;
}

.btn-detalhar:hover {
  border-color: rgba(239, 68, 68, 0.45);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  transform: translateY(-1px);
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
    margin-top: 70px;
    padding: 18px;
  }

  .conteudo.collapsed {
    margin-left: 0;
  }

  .header-top {
    margin-top: -40px;
    align-items: flex-start;
  }

  .title {
    font-size: 30px;
    margin: 0;
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

  .card .botoes {
    flex-direction: column;
    gap: 10px;
  }

  .btn-editar,
  .btn-detalhar {
    width: 100%;
    padding: 11px 0;
  }

  .abas-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
}
</style>
