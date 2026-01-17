<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="titulo">
        <h1>Agendar Quadra (Admin)</h1>
      </div>

      <NavBarUse />

      <div v-if="isLoadingQuadras" class="loader"></div>

      <div v-else>
        <div v-if="quadras.length === 0" class="mensagem-nenhuma-quadra">
          <p>Nenhuma quadra encontrada.</p>
        </div>

        <div v-else class="quadras-grid">
          <div class="card-quadra" v-for="quadra in quadras" :key="quadra.id">
            <img :src="quadra.foto || require('@/assets/futibinha.png')" :alt="quadra.nome" class="imagem-quadra" />
            <div class="overlay">
              <h3 class="nome-quadra">{{ quadra.nome }}</h3>
              <h3 class="endereco">{{ quadra.endereco }}</h3>
              <button class="btn-agendar" @click="abrirAgendamentoDireto(quadra)">
                Agendar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AgendamentoModal v-if="mostrarModalAgendamento" :quadra="quadraSelecionada" :times="times"
        @fechar="mostrarModalAgendamento = false" @confirmar="confirmarAgendamento" />
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import AgendamentoModal from '@/components/modals/Agendamentos/AgendModal.vue'
import api from '@/axios'
import { useAuthStore } from '@/store'
import { mapState } from 'pinia'

export default {
  name: 'AgendarQuadrasAdm',
  components: { SideBar, NavBarUse, AgendamentoModal },
  data() {
    return {
      quadras: [],
      isLoadingQuadras: true,
      mostrarModalAgendamento: false,
      quadraSelecionada: null,
      times: [],
    }
  },

  computed: {
    ...mapState(useAuthStore, ['usuario'])
  },

  watch: {
    usuario: {
      handler(novoUsuario) {
        if (novoUsuario?.id) {
          this.carregarTimes(novoUsuario.id);
        }
      },
      immediate: true
    }
  },

  mounted() {
    this.carregarQuadras();
    if (this.usuario?.id) {
      this.carregarTimes(this.usuario.id);
    }
  },

  methods: {
    async carregarTimes(userId) {
      if (!userId) return;

      try {
        let response;

        // Permissão 1 (Admin) ou 2 (Gestor) vê todos os times
        if (this.usuario.permissaoId === 1 || this.usuario.permissaoId === 2) {
          response = await api.get('/times');
        } else {
          response = await api.get(`/usuarios/${userId}/times`);
        }

        this.times = Array.isArray(response.data) ? response.data : [];

      } catch (error) {
        console.error("Erro ao carregar times:", error);
        this.times = [];
      }
    },

    async carregarQuadras() {
      this.isLoadingQuadras = true
      try {
        const { data } = await api.get('/quadra')
        this.quadras = data
      } catch (err) {
        console.error('Erro ao carregar quadras:', err)
      } finally {
        this.isLoadingQuadras = false
      }
    },

    async abrirAgendamentoDireto(quadra) {
      this.quadraSelecionada = quadra;

      if (this.times.length === 0 && this.usuario?.id) {
        await this.carregarTimes(this.usuario.id);
      }

      this.mostrarModalAgendamento = true;
    },

    async confirmarAgendamento(agendamentoDoModal, forcarAgendamento = false) {
      const authStore = useAuthStore()

      if (!authStore.usuario) {
        Swal.fire({
          title: 'Você precisa estar logado',
          text: 'Deseja ir para a tela de login?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ir para login',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#1E3A8A'
        }).then(result => {
          if (result.isConfirmed) this.$router.push('/login')
        })
        return
      }

      const agendamento = {
        ...agendamentoDoModal,
        usuarioId: authStore.usuario.id,
        quadraId: this.quadraSelecionada.id,
        ignorarRegra: forcarAgendamento
      }

      try {
        await api.post('/agendamento', agendamento)

        Swal.fire({
          icon: 'success',
          title: 'Agendamento realizado!',
          text: `Quadra: ${this.quadraSelecionada.nome}`,
          confirmButtonColor: '#1E3A8A',
          timer: 5000,
          showConfirmButton: false,
          timerProgressBar: true
        })

        this.mostrarModalAgendamento = false

      } catch (err) {
        const msgErro = err.response?.data?.message || err.response?.data?.error;
        const status = err.response?.status;

        // 1. TRATAMENTO DE LIMITE DE AGENDAMENTOS (Visual Customizado)
        if (status === 400 && msgErro?.includes('já possui 2 agendamentos')) {
          Swal.fire({
            title: 'Limite Atingido',
            text: `${msgErro} Como administrador, deseja ignorar a regra e agendar mesmo assim?`,
            icon: 'warning', // Ícone de alerta
            showCancelButton: true,
            confirmButtonText: 'Sim, forçar',
            cancelButtonText: 'Cancelar',
            // Desabilita o estilo padrão para usarmos nossas classes
            buttonsStyling: false,
            // Injeta nossas classes CSS personalizadas (definidas lá embaixo)
            customClass: {
              actions: 'swal2-custom-actions',
              confirmButton: 'swal2-custom-confirm-red',
              cancelButton: 'swal2-custom-cancel-white'
            }
          }).then((result) => {
            if (result.isConfirmed) {
              this.confirmarAgendamento(agendamentoDoModal, true);
            }
          });
          return;
        }

        // 2. Erro de Conflito de Horário
        if (status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Horário já agendado',
            text: 'Escolha outro horário para esta quadra.',
            confirmButtonColor: '#1E3A8A'
          })
        }
        // 3. Outros Erros 400
        else if (status === 400) {
          Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: msgErro || 'Dados inválidos para o agendamento.',
            confirmButtonColor: '#1E3A8A'
          })
        }
        // 4. Erro Genérico
        else {
          Swal.fire({
            icon: 'error',
            title: 'Erro inesperado',
            text: 'Ocorreu um problema ao tentar agendar. Tente novamente.',
            confirmButtonColor: '#1E3A8A'
          })
        }
        console.error('Erro ao agendar:', err)
      }
    }
  }
}
</script>

<style scoped>
/* Estilos do componente (Layout, Cards, etc) */
.layout {
  display: flex;
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
  background-color: #f9f9f9;
}

.layout> :first-child {
  width: 240px;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 10;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.conteudo {
  flex: 1;
  padding: 24px 40px;
  margin-left: 240px;
}

.titulo {
  margin-top: 24px;
  margin-bottom: 32px;
}

.titulo h1 {
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
}

.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #fff
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.card-quadra {
  position: relative;
  max-width: 100%;
  width: 100%;
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nome-quadra {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.btn-agendar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 8px;
  cursor: pointer;
  width: 80px;
  height: 36px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.2s;
}

.btn-agendar:hover {
  background-color: #2563eb;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

.mensagem-nenhuma-quadra {
  text-align: center;
  font-style: italic;
  color: #777;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

<style>
.swal2-custom-actions {
  display: flex !important;
  justify-content: space-between !important;
  width: 100% !important;
  gap: 16px !important;
  padding: 0 1.6em !important;
  box-sizing: border-box !important;
  margin-top: 20px !important;
}

.swal2-custom-confirm-red,
.swal2-custom-cancel-white {
  flex: 1 !important;
  /* Ocupa espaço igual */
  height: 42px !important;
  /* Mesma altura do modal */
  font-size: 14px !important;
  font-weight: bold !important;
  border-radius: 5px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s;
}

/* Botão Cancelar Branco/Cinza (Igual ao Modal) */
.swal2-custom-cancel-white {
  background-color: #F7F9FC !important;
  color: #7E7E7E !important;
  border: 1px solid #D9D9D9 !important;
}

.swal2-custom-cancel-white:hover {
  opacity: 0.8;
}

/* Botão Confirmar Vermelho (Ação Destrutiva/Forçar) */
.swal2-custom-confirm-red {
  background-color: #d33 !important;
  color: white !important;
  border: none !important;
  margin: 0 !important;
  /* Remove margem padrão do SWAL */
}

.swal2-custom-confirm-red:hover {
  opacity: 0.8;
}
</style>
