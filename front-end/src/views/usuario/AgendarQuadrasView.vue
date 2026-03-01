<template>
  <div class="container">
    <NavBar />

    <div class="page-shell">
      <div v-if="avisoDestaque" class="aviso-banner">
        <div class="aviso-body">
          <div class="aviso-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon-atencao" viewBox="0 0 24 24" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div class="aviso-content-col">
            <p class="aviso-quadra-tag">
              {{ avisoDestaque.quadra?.nome }}
            </p>
            <h4 class="aviso-titulo">{{ avisoDestaque.titulo }}</h4>
            <p class="aviso-descricao">{{ avisoDestaque.descricao }}</p>
          </div>

          <button class="btn-ler" type="button" @click="marcarLido">
            Confirmar leitura
          </button>
        </div>
      </div>

      <section class="page-header">
        <div class="header-copy">
          <div class="header-topline">
            <h1 class="titulo-principal">Agendar quadra</h1>
            <div class="resumo-chip">
              <span class="resumo-valor">{{ quadrasDisponiveis }}</span>
              <span class="resumo-texto">Quadras Disponiveis</span>
            </div>
          </div>
          <p class="subtitulo">Escolha a quadra ideal e faca sua reserva em poucos passos.</p>
        </div>
      </section>

      <div v-if="isLoadingQuadras" class="loader-wrap">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="quadras.length === 0" class="mensagem-nenhuma-quadra">
          <p>Nenhuma unidade disponivel para agendamento.</p>
        </div>

        <section v-else class="quadras-painel">
          <div class="section-head">
            <p class="section-kicker">QUADRAS</p>
            <h2 class="section-title">Escolha onde reservar</h2>
            <p class="section-subtitle">Clique em agendar agora e siga direto para o agendamento.</p>
          </div>

          <div class="quadras-grid">
            <article
              v-for="quadra in quadras"
              :key="quadra.id"
              class="card-quadra"
              :class="{ 'is-interditada': quadra.interditada }"
            >
              <span class="card-status" :class="{ 'is-indisponivel': quadra.interditada }">
                {{ quadra.interditada ? "Indisponivel" : "Disponivel" }}
              </span>

              <img
                :src="quadra.foto"
                :alt="quadra.nome"
                class="imagem-quadra"
              />

              <div class="overlay">
                <div class="card-copy">
                  <p class="card-kicker">QUADRA</p>
                  <h3 class="nome-quadra">{{ quadra.nome }}</h3>
                  <p class="endereco">{{ quadra.endereco }}</p>
                </div>

                <button
                  class="btn-agendar"
                  :disabled="quadra.interditada"
                  @click="!quadra.interditada && abrirAgendamentoDireto(quadra)"
                >
                  {{ quadra.interditada ? "Indisponivel" : "Agendar agora" }}
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>

      <AgendamentoModal
        v-if="mostrarModalAgendamento"
        :quadra="quadraSelecionada"
        :times="times"
        @fechar="mostrarModalAgendamento = false"
        @confirmar="confirmarAgendamento"
      />
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import NavBar from "@/components/Usuario/NavBar.vue";
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
    ...mapState(useAuthStore, ["usuario"]),
    quadrasDisponiveis() {
      return this.quadras.filter((quadra) => !quadra.interditada).length;
    },
  },

  watch: {
    usuario: {
      handler(novoUsuario) {
        if (novoUsuario?.id) {
          this.carregarTimes(novoUsuario.id);
        }
      },
      immediate: true,
    },
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

      if (this.usuario?.id) {
        if (this.times.length === 0) {
          await this.carregarTimes(this.usuario.id);
        }
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
          promessasQuadras = this.quadras.map((q) => api.get(`/quadras/${q.id}/avisos`));
        }

        const [resGerais, ...respostasQuadras] = await Promise.all([reqGerais, ...promessasQuadras]);

        if (Array.isArray(resGerais.data)) {
          const geraisNaoLidos = resGerais.data.filter((aviso) => {
            if (!aviso.leituras) return true;
            return !aviso.leituras.some((leitura) => String(leitura.usuarioId) === String(usuarioId));
          });
          const geraisFormatados = geraisNaoLidos.map((a) => ({ ...a, quadra: null }));
          todosAvisos.push(...geraisFormatados);
        }

        respostasQuadras.forEach((res, index) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const naoLidos = res.data.filter((aviso) => {
              if (!aviso.leituras) return true;
              return !aviso.leituras.some((leitura) => String(leitura.usuarioId) === String(usuarioId));
            });
            const avisosComQuadra = naoLidos.map((aviso) => ({ ...aviso, quadra: this.quadras[index] }));
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
            usuarioId: authStore.usuario.id,
          });
          this.avisoDestaque = null;
          window.dispatchEvent(new Event("avisos-atualizados"));

          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Lido",
            showConfirmButton: false,
            timer: 2000,
          });
        } catch (error) {
          console.warn("Nao foi possivel marcar como lido", error);
        }
      }
    },

    async carregarQuadras() {
      this.isLoadingQuadras = true;
      try {
        const { data } = await api.get("/quadra");
        this.quadras = data;

        const quadraIdUrl = this.$route.query.quadraId;
        if (quadraIdUrl) {
          const quadraAlvo = this.quadras.find((q) => q.id === Number(quadraIdUrl));

          if (quadraAlvo && !quadraAlvo.interditada) {
            this.$router.replace({ query: null });
            this.abrirAgendamentoDireto(quadraAlvo);
          }
        }
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
          title: "Voce precisa estar logado",
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
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Nenhuma quadra selecionada.",
          confirmButtonColor: "#1E3A8A",
        });
        return;
      }

      if (agendamentoDoModal.fixo && Array.isArray(agendamentoDoModal.lote)) {
        const loteFormatado = agendamentoDoModal.lote.map((item) => ({
          ...item,
          usuarioId: authStore.usuario.id,
          quadraId: this.quadraSelecionada.id,
        }));

        try {
          Swal.fire({
            title: "Processando agenda fixa...",
            html: "Isso pode levar alguns segundos.",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          await api.post("/agendamentos/fixos", {
            lote: loteFormatado,
            usuarioId: authStore.usuario.id,
          });

          Swal.fire({
            icon: "success",
            title: "Agenda fixa salva!",
            text: `Os horarios fixos da quadra ${this.quadraSelecionada.nome} foram atualizados com sucesso.`,
            confirmButtonColor: "#1E3A8A",
          });

          this.mostrarModalAgendamento = false;
        } catch (err) {
          const msgErro =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "Nao foi possivel processar os agendamentos fixos.";
          Swal.fire({
            icon: "error",
            title: "Erro ao salvar agenda fixa",
            text: msgErro,
            confirmButtonColor: "#1E3A8A",
          });
        }

        return;
      }

      const agendamento = {
        ...agendamentoDoModal,
        usuarioId: authStore.usuario.id,
        quadraId: this.quadraSelecionada.id,
        fixo: false,
      };

      try {
        Swal.fire({
          title: "Processando seu agendamento...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        await api.post("/agendamento", agendamento);

        Swal.fire({
          icon: "success",
          title: "Agendamento realizado!",
          text: `Sua reserva na quadra ${this.quadraSelecionada.nome} foi enviada para analise.`,
          confirmButtonColor: "#1E3A8A",
          timer: 5000,
          showConfirmButton: true,
          timerProgressBar: true,
        });

        this.mostrarModalAgendamento = false;
      } catch (err) {
        const msg = err.response?.data?.error || err.response?.data?.message || "Ocorreu um erro inesperado.";
        const status = err.response?.status;

        if (status === 409) {
          Swal.fire({
            icon: "warning",
            title: "Horario indisponivel",
            text: "Vixe! Alguem acabou de pegar esse horario. Escolha outro, macho!",
            confirmButtonColor: "#1E3A8A",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Nao foi possivel agendar",
            text: msg,
            confirmButtonColor: "#1E3A8A",
          });
        }
      }
    },
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
  background-color: #f4f6fb;
  min-height: 100vh;
  width: 100%;
  max-width: none;
  padding: 100px 0 32px 0;
}

.page-shell {
  width: calc(100% - 120px);
  margin: 0 auto;
}

.aviso-banner {
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  border: 1px solid #dbe7ff;
  border-radius: 24px;
  padding: 16px 18px;
  margin-bottom: 20px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.07);
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.aviso-body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.aviso-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: #dbeafe;
  border-radius: 50%;
  flex-shrink: 0;
}

.icon-atencao {
  width: 20px;
  height: 20px;
  color: #1d4ed8;
}

.aviso-content-col {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.aviso-quadra-tag {
  margin: 0 0 6px 0;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #2563eb;
  letter-spacing: 0.14em;
}

.aviso-titulo {
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px 0;
}

.aviso-descricao {
  color: #64748b;
  font-size: 14px;
  margin: 0;
  line-height: 1.45;
}

.btn-ler {
  flex-shrink: 0;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  padding: 0 16px;
  min-width: 150px;
  height: 40px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.btn-ler:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.page-header {
  display: block;
  margin-bottom: 20px;
}

.header-copy {
  min-width: 0;
}

.header-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.titulo-principal {
  font-size: 42px;
  font-weight: 900;
  color: #2563eb;
  margin: 0;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.subtitulo {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.5;
}

.resumo-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 18px 32px rgba(37, 99, 235, 0.18);
}

.resumo-valor {
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.resumo-texto {
  margin-top: 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.loader-wrap,
.mensagem-nenhuma-quadra,
.quadras-painel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.07);
}

.loader-wrap,
.mensagem-nenhuma-quadra {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quadras-painel {
  padding: 22px;
}

.section-head {
  margin-bottom: 18px;
}

.section-kicker {
  margin: 0 0 8px 0;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.section-title {
  margin: 0 0 6px 0;
  color: #0f172a;
  font-size: 20px;
  font-weight: 800;
}

.section-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
}

.quadras-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.card-quadra {
  position: relative;
  height: 248px;
  border-radius: 24px;
  overflow: hidden;
  background: #0f172a;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.14);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card-quadra:hover:not(.is-interditada) {
  transform: translateY(-4px);
  box-shadow: 0 20px 36px rgba(15, 23, 42, 0.18);
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease, filter 0.3s ease;
}

.card-quadra:hover:not(.is-interditada) .imagem-quadra {
  transform: scale(1.03);
}

.card-quadra.is-interditada .imagem-quadra {
  filter: grayscale(100%) brightness(0.9) opacity(0.76);
}

.card-status {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 102px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.94);
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.card-status.is-indisponivel {
  background: rgba(239, 68, 68, 0.92);
}

.overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(3, 7, 18, 0.04) 0%, rgba(3, 7, 18, 0.56) 48%, rgba(3, 7, 18, 0.92) 100%);
  color: #ffffff;
}

.card-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-kicker {
  margin: 0;
  color: rgba(191, 219, 254, 0.9);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.nome-quadra {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  line-height: 1.12;
  letter-spacing: -0.03em;
  text-shadow: 0 10px 18px rgba(0, 0, 0, 0.28);
}

.endereco {
  font-size: 14px;
  margin: 0 0 8px;
  line-height: 1.35;
  color: rgba(226, 232, 240, 0.88);
  font-weight: 500;
}

.btn-agendar {
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  padding: 0 16px;
  cursor: pointer;
  min-width: 118px;
  height: 42px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  transition: background-color 0.2s ease, transform 0.2s ease;
  align-self: flex-start;
}

.btn-agendar:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.btn-agendar:disabled {
  background-color: rgba(148, 163, 184, 0.92);
  color: rgba(255, 255, 255, 0.72);
  cursor: not-allowed;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 88px;
  height: 88px;
  animation: spin 1s linear infinite;
}

.mensagem-nenhuma-quadra {
  text-align: center;
  color: #64748b;
  font-size: 18px;
}

.mensagem-nenhuma-quadra p {
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .container {
    padding: 96px 0 24px 0;
  }

  .page-shell {
    width: calc(100% - 28px);
  }

  .aviso-banner {
    border-radius: 24px;
    padding: 16px;
  }

  .aviso-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-ler {
    width: 100%;
    min-width: 0;
  }

  .page-header {
    display: block;
  }

  .header-topline {
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
  }

  .titulo-principal {
    font-size: 28px;
    min-width: 0;
  }

  .resumo-chip {
    flex: 0 0 auto;
    height: 36px;
    padding: 0 12px;
    gap: 6px;
  }

  .resumo-valor {
    font-size: 16px;
  }

  .resumo-texto {
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .subtitulo {
    font-size: 15px;
    line-height: 1.55;
  }

  .loader-wrap,
  .mensagem-nenhuma-quadra,
  .quadras-painel {
    border-radius: 24px;
  }

  .quadras-painel {
    padding: 18px 14px;
  }

  .section-head {
    margin-bottom: 18px;
  }

  .quadras-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .card-quadra {
    height: 216px;
    border-radius: 24px;
  }

  .card-status {
    top: 14px;
    right: 14px;
    min-width: 108px;
    height: 34px;
    font-size: 11px;
  }

  .overlay {
    padding: 14px;
    gap: 6px;
  }

  .nome-quadra {
    font-size: 20px;
  }

  .endereco {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .btn-agendar {
    width: 100%;
  }
}
</style>
