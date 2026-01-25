<template>
  <div class="container">
    <NavBar />

    <div v-if="avisoDestaque" class="aviso-banner">
      <div class="aviso-body">
        <div class="aviso-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon-atencao" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd" />
          </svg>
        </div>

        <div class="aviso-content-col">
          <div class="aviso-quadra-tag">
            {{ avisoDestaque.quadra?.nome || ' INFORMAÇÃO GERAL ' }}
          </div>
          <h4 class="aviso-titulo">{{ avisoDestaque.titulo }}</h4>
          <p class="aviso-descricao">
            {{ avisoDestaque.descricao }}
          </p>
          <div class="btn-ler-container">
            <span class="btn-ler" @click="marcarLido" role="button">Confirmar leitura</span>
          </div>
        </div>
      </div>
    </div>

    <div class="titulo">
      <h1>Agendar Quadra</h1>
    </div>

    <div v-if="isLoadingQuadras" class="loader"></div>

    <div v-else>
      <div v-if="quadras.length === 0" class="mensagem-nenhuma-quadra">
        <p>Nenhuma unidade disponível para agendamento.</p>
      </div>

      <div v-else class="quadras-grid">
        <div class="card-quadra" v-for="quadra in quadras" :key="quadra.id"
          :class="{ 'is-interditada': quadra.interditada }">
          <div v-if="quadra.interditada" class="badge-interditada-overlay">
            INTERDITADA
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
</template>

<script>
import Swal from "sweetalert2";
import NavBar from "@/components/NavBar.vue";
import AgendamentoModal from "@/components/modals/Agendamentos/AgendModal.vue";
import api from "@/axios";
import { useAuthStore } from "@/store";
import { mapState } from "pinia";

export default {
  name: "AgendarQuadras",
  components: { NavBar, AgendamentoModal },
  data() {
    return {
      quadras: [],
      isLoadingQuadras: true,
      mostrarModalAgendamento: false,
      quadraSelecionada: null,
      avisoDestaque: null,
      times: [],
    };
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
        const { data } = await api.get(`/usuarios/${userId}/times`);
        this.times = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Erro ao carregar times na tela principal:", error);
      }
    },

    async abrirAgendamentoDireto(quadra) {
      this.quadraSelecionada = quadra;

      if (this.times.length === 0 && this.usuario?.id) {
        await this.carregarTimes(this.usuario.id);
      }

      this.mostrarModalAgendamento = true;
    },

    async carregarAvisoDestaque() {
      try {
        const authStore = useAuthStore();
        const usuarioId = authStore.usuario?.id;
        let todosAvisos = [];
        const reqGerais = api.get("/quadras/geral/avisos").catch(() => ({ data: [] }));

        let promessasQuadras = [];
        if (this.quadras.length > 0) {
          promessasQuadras = this.quadras.map(q => api.get(`/quadras/${q.id}/avisos`));
        }

        const [resGerais, ...respostasQuadras] = await Promise.all([reqGerais, ...promessasQuadras]);

        if (Array.isArray(resGerais.data)) {
          const geraisNaoLidos = resGerais.data.filter(aviso => {
            if (!aviso.leituras) return true;
            return !aviso.leituras.some(leitura => String(leitura.usuarioId) === String(usuarioId));
          });
          const geraisFormatados = geraisNaoLidos.map(a => ({ ...a, quadra: null }));
          todosAvisos.push(...geraisFormatados);
        }

        respostasQuadras.forEach((res, index) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const naoLidos = res.data.filter(aviso => {
              if (!aviso.leituras) return true;
              return !aviso.leituras.some(leitura => String(leitura.usuarioId) === String(usuarioId));
            });
            const avisosComQuadra = naoLidos.map(aviso => ({ ...aviso, quadra: this.quadras[index] }));
            todosAvisos.push(...avisosComQuadra);
          }
        });

        if (todosAvisos.length === 0) {
          this.avisoDestaque = null;
          return;
        }

        todosAvisos.sort((a, b) => {
          if (a.fixado === b.fixado) return new Date(b.data) - new Date(a.data);
          return a.fixado ? -1 : 1;
        });
        this.avisoDestaque = todosAvisos[0];
      } catch (err) {
        console.error("Erro ao carregar avisos para destaque:", err);
      }
    },

    async marcarLido() {
      const authStore = useAuthStore();
      if (this.avisoDestaque && authStore.usuario) {
        try {
          await api.post(`/avisos/${this.avisoDestaque.id}/ler`, {
            usuarioId: authStore.usuario.id
          });
          this.avisoDestaque = null;
          window.dispatchEvent(new Event('avisos-atualizados'));

          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Lido',
            showConfirmButton: false,
            timer: 2000
          });
        } catch (error) {
          console.warn("Não foi possível marcar como lido", error);
        }
      }
    },

    async carregarQuadras() {
      this.isLoadingQuadras = true;
      try {
        const { data } = await api.get("/quadra");
        this.quadras = data;
        this.carregarAvisoDestaque();
      } catch (err) {
        console.error("Erro ao carregar quadras:", err);
      } finally {
        this.isLoadingQuadras = false;
      }
    },

    async confirmarAgendamento(agendamentoDoModal) {
      const authStore = useAuthStore();
      if (!authStore.usuario) {
        Swal.fire({
          title: "Você precisa estar logado",
          text: "Deseja ir para a tela de login?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Ir para login",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#1E3A8A",
        }).then((result) => {
          if (result.isConfirmed) this.$router.push("/login");
        });
        return;
      }
      if (!this.quadraSelecionada) {
        Swal.fire({ icon: "error", title: "Erro", text: "Nenhuma quadra selecionada.", confirmButtonColor: "#1E3A8A" });
        return;
      }

      const regrasAntecedencia = { TREINO: 24, AMISTOSO: 7 * 24, CAMPEONATO: 30 * 24, EVENTO: 180 * 24, OUTRO: 24 };
      const tipo = agendamentoDoModal.tipo?.toUpperCase();
      const antecedenciaHoras = regrasAntecedencia[tipo] || regrasAntecedencia.OUTRO;

      let hora = 0; let minuto = 0;
      if (typeof agendamentoDoModal.hora === 'string' && agendamentoDoModal.hora.includes(':')) {
        [hora, minuto] = agendamentoDoModal.hora.split(':').map(Number);
      } else {
        hora = Number(agendamentoDoModal.hora ?? 0);
      }

      const dataAgendamento = new Date(Date.UTC(
        Number(agendamentoDoModal.ano), Number(agendamentoDoModal.mes) - 1, Number(agendamentoDoModal.dia),
        hora, minuto, 0
      ));

      const agora = new Date();
      const diferencaMs = dataAgendamento.getTime() - agora.getTime();
      const diferencaHoras = diferencaMs / (1000 * 60 * 60);

      if (diferencaHoras < antecedenciaHoras) {
        Swal.fire({
          icon: "warning",
          title: "Antecedência mínima não respeitada",
          text: `Para ${tipo}, o agendamento deve ser feito com pelo menos ${antecedenciaHoras >= 24 ? antecedenciaHoras / 24 + " dias" : antecedenciaHoras + " horas"} de antecedência.`,
          confirmButtonColor: "#1E3A8A",
        });
        return;
      }

      const agendamento = {
        ...agendamentoDoModal,
        usuarioId: authStore.usuario.id,
        quadraId: this.quadraSelecionada.id,
        datahora: dataAgendamento
      };

      try {
        await api.post("/agendamento", agendamento);
        Swal.fire({
          icon: "success", title: "Agendamento realizado!", text: `Quadra: ${this.quadraSelecionada.nome}`,
          confirmButtonColor: "#1E3A8A", timer: 5000, showConfirmButton: false, timerProgressBar: true,
        });
        this.mostrarModalAgendamento = false;
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.message;
        if (err.response?.status === 409) {
          Swal.fire({ icon: "warning", title: "Horário já agendado", text: "Escolha outro horário.", confirmButtonColor: "#1E3A8A" });
        } else if (err.response?.status === 400 && msg?.includes("já possui 2 agendamentos")) {
          Swal.fire({ icon: "warning", title: "Limite atingido", text: msg, confirmButtonColor: "#1E3A8A" });
        } else {
          Swal.fire({ icon: "error", title: "Erro inesperado", text: "Tente novamente.", confirmButtonColor: "#1E3A8A" });
        }
      }
    }
  },
};
</script>

<style scoped>
body {
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.container {
  font-family: "Montserrat", sans-serif;
  background-color: #F7F9FC;
  min-height: 100vh;
  width: 100%;
  max-width: none;
  padding: 100px 40px 24px 40px;
}

.aviso-banner {
  background-color: #EFF6FF;
  border-left: 5px solid #3B82F6;
  border-radius: 8px;
  padding: 16px 20px;
  margin-top: 0;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.aviso-body {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.aviso-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #DBEafe;
  padding: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.icon-atencao {
  width: 24px;
  height: 24px;
  color: #1E3A8A;
}

.aviso-content-col {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.aviso-quadra-tag {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #60A5FA;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  text-align: left;
}

.aviso-titulo {
  color: #1E3A8A;
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 6px 0;
}

.aviso-descricao {
  color: #1E3A8A;
  font-size: 14px;
  margin: 0 0 8px 0;
  line-height: 1.5;
  text-align: left;
}

.btn-ler-container {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-top: 4px;
}

.btn-ler {
  font-size: 13px;
  font-weight: 700;
  color: #3B82F6;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-ler:hover {
  color: #1E3A8A;
}

.titulo {
  margin-top: 0;
  margin-bottom: 32px;
}

.titulo h1 {
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
}

.quadras-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 240px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out;
}

.card-quadra:hover:not(.is-interditada) {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
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
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 15%, rgba(0, 0, 0, 0.5) 60%, transparent);
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nome-quadra {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.endereco {
  font-size: 14px;
  margin: 0;
  line-height: 1.3;
  color: #E0E0E0;
  font-weight: 500;
}

.btn-agendar {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 8px 20px;
  cursor: pointer;
  min-width: 100px;
  height: 38px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: bold;
  transition: background-color 0.2s;
  align-self: flex-start;
  margin-top: 6px;
  letter-spacing: 0.5px;
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
  border: 6px solid #F3F3F3;
  border-top: 6px solid #3B82F6;
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
  margin-top: 40px;
  font-size: 18px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .quadras-grid {
    grid-template-columns: 1fr;
  }

  .container {
    padding: 100px 20px 24px 20px;
  }

  .card-quadra {
    height: 220px;
  }

  .badge-interditada-overlay {
    font-size: 24px;
  }
}
</style>