<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="titulo">
        <h1>Agendar Quadra</h1>
      </div>
      <NavBarUse />

      <div v-if="isLoadingQuadras" class="loader"></div>

      <div v-else>
        <div v-if="quadras.length === 0" class="mensagem-nenhuma-quadra">
          <p>Nenhuma quadra encontrada.</p>
        </div>

        <div v-else class="quadras-grid">
          <div class="card-quadra" v-for="quadra in quadras" :key="quadra.id"
            :class="{ 'is-interditada': quadra.interditada }">
            <div v-if="quadra.interditada" class="badge-interditada-overlay">
              INDISPONÍVEL
            </div>

            <img :src="quadra.foto || require('@/assets/futibinha.png')" :alt="quadra.nome" class="imagem-quadra" />

            <div class="overlay">
              <h3 class="nome-quadra">{{ quadra.nome }}</h3>
              <h3 class="endereco">{{ quadra.endereco }}</h3>

              <button class="btn-agendar" :disabled="quadra.interditada"
                @click="!quadra.interditada && abrirAgendamentoDireto(quadra)">
                {{ quadra.interditada ? 'Indisponível' : 'Agendar' }}
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
          confirmButtonColor: '#1E3A8A',
        }).then(result => {
          if (result.isConfirmed) this.$router.push('/login')
        })
        return
      }

      const isAdministrador = authStore.usuario.permissaoId === 2;
      const statusAutomatico = isAdministrador ? 'Confirmado' : 'Pendente';

      if (agendamentoDoModal.lote && Array.isArray(agendamentoDoModal.lote)) {

        const loteFormatado = agendamentoDoModal.lote.map(item => ({
          ...item,
          usuarioId: authStore.usuario.id,
          quadraId: this.quadraSelecionada.id,
          ignorarRegra: forcarAgendamento,
          status: statusAutomatico
        }));

        Swal.fire({
          title: 'Processando...',
          html: 'Gerando agendamentos...<br>Isso pode levar alguns segundos.',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        if (agendamentoDoModal.fixo) {
          try {
            await api.post('/agendamentos/fixos', {
              lote: loteFormatado,
              usuarioId: authStore.usuario.id
            });

            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Agenda Atualizada!',
              text: 'Os horários fixos foram atualizados com sucesso.',
              confirmButtonColor: '#1E3A8A',
              timer: 3000
            });

            this.mostrarModalAgendamento = false;

          } catch (err) {
            Swal.close();
            const msgErro = err.response?.data?.message || err.response?.data?.error || 'Erro ao processar agendamentos fixos.';

            if (err.response?.status === 409) {
              Swal.fire({
                icon: 'error',
                title: 'Conflito de Horário',
                text: 'Existe um agendamento avulso ou bloqueio impedindo um desses horários.',
                confirmButtonColor: '#1E3A8A'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: msgErro,
                confirmButtonColor: '#1E3A8A'
              });
            }
          }
          return;
        }

        let sucessos = 0;
        let erros = 0;

        for (const item of loteFormatado) {
          try {
            await api.post('/agendamento', item);
            sucessos++;
          } catch (err) {
            console.error('Erro no item do lote:', err);
            erros++;
          }
        }

        Swal.close();

        if (erros === 0) {
          Swal.fire({
            icon: 'success',
            title: 'Sucesso Total!',
            text: `${sucessos} agendamentos criados.`,
            confirmButtonColor: '#1E3A8A',
            timer: 3000
          });
          this.mostrarModalAgendamento = false;
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Finalizado com pendências',
            text: `Criados: ${sucessos} | Falhas: ${erros} (Provavelmente horários ocupados)`,
            confirmButtonColor: '#1E3A8A'
          });
          if (sucessos > 0) this.mostrarModalAgendamento = false;
        }
        return;
      }

      const agendamento = {
        ...agendamentoDoModal,
        usuarioId: authStore.usuario.id,
        quadraId: this.quadraSelecionada.id,
        ignorarRegra: forcarAgendamento,
        status: statusAutomatico,
        fixo: agendamentoDoModal.fixo ?? false
      }

      try {
        await api.post('/agendamento', agendamento)

        Swal.fire({
          icon: 'success',
          title: isAdministrador ? 'Agendamento Confirmado!' : 'Solicitação Enviada!',
          text: isAdministrador
            ? `Quadra: ${this.quadraSelecionada.nome} reservada com sucesso.`
            : `Quadra: ${this.quadraSelecionada.nome}. Aguarde a aprovação.`,
          confirmButtonColor: '#1E3A8A',
          timer: 5000,
          showConfirmButton: false,
          timerProgressBar: true
        })

        this.mostrarModalAgendamento = false

      } catch (err) {
        const msgErro = err.response?.data?.message || err.response?.data?.error;
        const status = err.response?.status;

        if (status === 400 && (msgErro?.includes('já possui 2 agendamentos') || msgErro?.includes('FIXOS'))) {
          Swal.fire({
            title: 'Limite Atingido',
            text: `${msgErro} Deseja forçar o agendamento?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim, forçar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#1E3A8A',
          }).then((result) => {
            if (result.isConfirmed) {
              this.confirmarAgendamento(agendamentoDoModal, true);
            }
          });
          return;
        }

        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: msgErro || 'Erro ao agendar.',
          confirmButtonColor: '#1E3A8A'
        });
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  font-family: "Montserrat", sans-serif;
  background-color: #F7F9FC;
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.card-quadra.is-interditada .imagem-quadra {
  filter: grayscale(100%) brightness(1.1) opacity(0.6);
}

.badge-interditada-overlay {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  color: #FFFFFF;
  font-weight: 900;
  font-size: 32px;
  letter-spacing: 3px;
  text-transform: uppercase;
  pointer-events: none;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
}

.overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(21, 33, 71, 0.9), transparent);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nome-quadra {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.2;
  color: #D9D9D9;
}

.btn-agendar {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  width: fit-content;
  min-width: 100px;
  height: 38px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  transition: background-color 0.2s;
  margin-top: 8px;
}

.btn-agendar:hover:not(:disabled) {
  background-color: #1E3A8A;
}

.btn-agendar:disabled {
  background-color: #D9D9D9;
  color: #7E7E7E;
  cursor: not-allowed;
  opacity: 0.8;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3B82F6;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1s linear infinite;
  margin: 60px auto;
}

.mensagem-nenhuma-quadra {
  text-align: center;
  font-style: italic;
  color: #7E7E7E;
  margin-top: 40px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


.swal2-custom-actions {
  display: flex !important;
  gap: 15px !important;
  margin-top: 25px !important;
}

.btn-confirmar-swal {
  background-color: #152147 !important;
  color: white !important;
  border: none !important;
  padding: 12px 30px !important;
  border-radius: 6px !important;
  font-weight: bold !important;
  font-family: 'Montserrat', sans-serif !important;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirmar-swal:hover {
  background-color: #1E3A8A !important;
}

.btn-cancelar-swal {
  background-color: #D9D9D9 !important;
  color: #152147 !important;
  border: none !important;
  padding: 12px 30px !important;
  border-radius: 6px !important;
  font-weight: bold !important;
  font-family: 'Montserrat', sans-serif !important;
  cursor: pointer;
}

.btn-cancelar-swal:hover {
  background-color: #c0c0c0 !important;
}

.swal2-custom-title {
  color: #152147 !important;
  font-family: 'Montserrat', sans-serif !important;
}
</style>
