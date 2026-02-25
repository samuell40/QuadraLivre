<template>
  <div class="meus-avisos-container">
    <NavBar />

    <div class="content-wrapper">
      <div class="titulo-container">
        <div class="titulo">
          <h1 class="title">Meus Avisos</h1>
          <p class="subtitulo">Acompanhe as atualizações das quadras</p>
        </div>
      </div>

      <div v-if="loading" class="loader-container">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="abas-config-container-aviso">
          <button type="button" class="aba-config-aviso" :class="{ ativa: abaAtiva === 'naoLidos' }"
            @click="abaAtiva = 'naoLidos'">
            Não Lidos
            <span class="badge-total">{{ getTodosPorTipo('naoLidos').length }}</span>
          </button>
          <button type="button" class="aba-config-aviso" :class="{ ativa: abaAtiva === 'importantes' }"
            @click="abaAtiva = 'importantes'">
            Importantes
            <span class="badge-total">{{ getTodosPorTipo('importantes').length }}</span>
          </button>
          <button type="button" class="aba-config-aviso" :class="{ ativa: abaAtiva === 'lidos' }"
            @click="abaAtiva = 'lidos'">
            Lidos
            <span class="badge-total">{{ getTodosPorTipo('lidos').length }}</span>
          </button>
        </div>

        <div class="section-aviso">
          <div v-if="getTodosPorTipo(abaAtiva).length === 0" class="aviso-card-vazio nenhum">
            {{ mensagensVazias[abaAtiva] }}
          </div>

          <div v-else>
            <div class="avisos-grid">
              <div v-for="aviso in getItensPagina(abaAtiva)" :key="aviso.id" class="card-aviso"
                :class="{ 'border-importante': abaAtiva === 'importantes', 'lido-opacity': abaAtiva === 'lidos' }">

                <div class="card-header">
                  <span class="tag-quadra">
                    {{ aviso.quadraNome || aviso.quadra?.nome || 'EQUIPE QUADRA LIVRE' }}
                  </span>
                  <div class="meta-right">
                    <svg v-if="aviso.fixado" xmlns="http://www.w3.org/2000/svg" class="icon-pin-mini"
                      viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 3v2h-2v7l2 2v2h-6v5l-1 1-1-1v-5H4v-2l2-2V5H4V3h14z" />
                    </svg>
                    <span class="data-aviso">{{ formatarData(aviso.data) }}</span>
                  </div>
                </div>

                <div class="card-body">
                  <div class="titulo-row">
                    <svg v-if="abaAtiva === 'importantes'" xmlns="http://www.w3.org/2000/svg" class="icon-pin"
                      viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 3v2h-2v7l2 2v2h-6v5l-1 1-1-1v-5H4v-2l2-2V5H4V3h14z" />
                    </svg>
                    <h4>{{ aviso.titulo }}</h4>
                  </div>
                  <p class="autor">Por: {{ aviso.autor?.nome }}</p>
                  <p class="descricao">{{ aviso.descricao }}</p>
                </div>

                <div class="card-footer">
                  <button v-if="abaAtiva !== 'lidos'" class="btn-ler" @click="marcarComoLido(aviso)">
                    Marcar como lido
                  </button>
                  <span v-else class="texto-lido">Visualizado ✓</span>
                </div>
              </div>
            </div>

            <div class="paginacao-controls" v-if="getTotalPaginas(abaAtiva) > 1">
              <button class="btn-paginacao" :disabled="paginasAtuais[abaAtiva] === 1" @click="mudarPagina(abaAtiva, -1)">
                &lt; Anterior
              </button>

              <span class="info-paginacao">
                Página <strong>{{ paginasAtuais[abaAtiva] }}</strong> de {{ getTotalPaginas(abaAtiva) }}
              </span>

              <button class="btn-paginacao" :disabled="paginasAtuais[abaAtiva] === getTotalPaginas(abaAtiva)"
                @click="mudarPagina(abaAtiva, 1)">
                Próxima &gt;
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/Usuario/NavBar.vue";
import api from "@/axios";
import { useAuthStore } from "@/store";
import Swal from 'sweetalert2';

export default {
  name: "MeusAvisosView",
  components: { NavBar },
  data() {
    return {
      todosAvisos: [],
      loading: true,
      abaAtiva: 'naoLidos', // Começa na aba Não Lidos

      mensagensVazias: {
        importantes: 'Nenhum aviso importante pendente.',
        naoLidos: 'Você está em dia com os avisos.',
        lidos: 'Nenhum aviso no histórico.'
      },

      ITENS_POR_PAGINA: 8,
      paginasAtuais: {
        importantes: 1,
        naoLidos: 1,
        lidos: 1
      }
    };
  },
  computed: {
    usuarioId() {
      const authStore = useAuthStore();
      const userLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
      return authStore.usuario?.id || userLocal.id;
    },
    listaImportantes() {
      return this.todosAvisos.filter(a => a.fixado && !this.verificarSeLi(a));
    },
    listaNaoLidos() {
      return this.todosAvisos.filter(a => !a.fixado && !this.verificarSeLi(a));
    },
    listaLidos() {
      return this.todosAvisos.filter(a => this.verificarSeLi(a));
    }
  },
  mounted() {
    this.carregarTodosAvisos()
    window.addEventListener('avisos-atualizados', this.carregarTodosAvisos)
  },
  beforeUnmount() {
    window.removeEventListener('avisos-atualizados', this.carregarTodosAvisos)
  },
  methods: {
    verificarSeLi(aviso) {
      if (!this.usuarioId || !aviso.leituras) return false;
      return aviso.leituras.some(leitura => String(leitura.usuarioId) === String(this.usuarioId));
    },

    getTodosPorTipo(tipo) {
      if (tipo === 'importantes') return this.listaImportantes;
      if (tipo === 'naoLidos') return this.listaNaoLidos;
      if (tipo === 'lidos') return this.listaLidos;
      return [];
    },

    getItensPagina(tipo) {
      const todos = this.getTodosPorTipo(tipo);
      const pagina = this.paginasAtuais[tipo];
      const inicio = (pagina - 1) * this.ITENS_POR_PAGINA;
      return todos.slice(inicio, inicio + this.ITENS_POR_PAGINA);
    },

    getTotalPaginas(tipo) {
      return Math.ceil(this.getTodosPorTipo(tipo).length / this.ITENS_POR_PAGINA) || 1;
    },

    mudarPagina(tipo, delta) {
      const novaPagina = this.paginasAtuais[tipo] + delta;
      const max = this.getTotalPaginas(tipo);
      if (novaPagina >= 1 && novaPagina <= max) {
        this.paginasAtuais[tipo] = novaPagina;
      }
    },

    async carregarTodosAvisos() {
      this.loading = true;
      let tempAvisos = [];

      try {
        try {
          const resGerais = await api.get("/quadras/geral/avisos");
          if (Array.isArray(resGerais.data)) {
            const geraisFormatados = resGerais.data.map(a => ({
              ...a,
              quadraNome: 'EQUIPE QUADRA LIVRE'
            }));
            tempAvisos.push(...geraisFormatados);
          }
        } catch (error) {
          console.warn("Não foi possível carregar avisos gerais:", error);
        }

        const { data: quadras } = await api.get("/quadra");

        if (quadras.length > 0) {
          const promessas = quadras.map(q => api.get(`/quadras/${q.id}/avisos`));
          const resultados = await Promise.allSettled(promessas);

          resultados.forEach((res, index) => {
            if (res.status === 'fulfilled' && Array.isArray(res.value.data)) {
              const avisosComNome = res.value.data.map(a => ({
                ...a,
                quadraNome: quadras[index].nome
              }));
              tempAvisos.push(...avisosComNome);
            }
          });
        }

        tempAvisos.sort((a, b) => new Date(b.data) - new Date(a.data));
        this.todosAvisos = tempAvisos;

      } catch (error) {
        console.error("Erro ao carregar avisos:", error);
        Swal.fire({
          icon: 'error',
          title: 'Oxe!',
          text: 'Erro ao conectar com o servidor.'
        });
      } finally {
        this.loading = false;
      }
    },

    async marcarComoLido(aviso) {
      if (!this.usuarioId) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Tente logar novamente.' });
        return;
      }
      try {
        await api.post(`/avisos/${aviso.id}/ler`, { usuarioId: this.usuarioId })
        if (!aviso.leituras) aviso.leituras = []
        aviso.leituras.push({ usuarioId: this.usuarioId })
        window.dispatchEvent(new Event('avisos-atualizados'))

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Lido',
          showConfirmButton: false,
          timer: 2000
        })
      } catch (error) {
        console.error("Erro ao marcar como lido", error)
      }
    },

    formatarData(data) {
      if (!data) return '';
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
  }
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9 !important;
}

.meus-avisos-container {
  font-family: "Montserrat", sans-serif;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 60px auto 0 auto;
  padding: 32px 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.titulo-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.titulo {
  text-align: left;
}

.title {
  font-size: 32px;
  font-weight: 900;
  color: #3B82F6;
  margin: 0 0 5px 0;
  letter-spacing: -0.2px;
}

.subtitulo {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.loader-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3B82F6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.abas-config-container-aviso {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
  margin-bottom: 16px;
}

.aba-config-aviso {
  flex: 1;
  border: 1px solid transparent;
  background: #F8FAFC;
  color: #64748b;
  font-size: 16px;
  font-weight: 900;
  padding: 12px 12px;
  cursor: pointer;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.15s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  user-select: none;
}

.aba-config-aviso:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.aba-config-aviso.ativa {
  background: #3B82F6;
  color: #fff;
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
  border-color: rgba(255, 255, 255, 0.18);
}

.badge-total {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  color: #2563eb;
  background: #dbeafe;
  border: 1px solid rgba(37, 99, 235, 0.18);
}

.aba-config-aviso.ativa .badge-total {
  color: #2563eb;
  background: #ffffff;
  border-color: rgba(255, 255, 255, 0.55);
}

.section-aviso {
  background-color: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.aviso-card-vazio.nenhum {
  grid-column: 1 / -1;
  color: #64748b;
  font-size: 15px;
  padding: 44px 22px;
  text-align: center;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 14px;
  border: 1px dashed rgba(100, 116, 139, 0.35);
}

.avisos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.card-aviso {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  background: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}

.card-aviso:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.border-importante {
  border-left: 4px solid #DC2626;
  background: #FEF2F2;
}

.lido-opacity {
  opacity: 0.7;
  background-color: #f8fafc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 12px;
}

.tag-quadra {
  font-weight: 800;
  color: #3B82F6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-aviso {
  color: #94a3b8;
  font-weight: 600;
}

.card-body {
  flex: 1;
}

.titulo-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.card-body h4 {
  margin: 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 800;
}

.icon-pin,
.icon-pin-mini {
  color: #DC2626;
}

.icon-pin {
  width: 20px;
  height: 20px;
}

.icon-pin-mini {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.border-importante .icon-pin-mini {
  color: #DC2626;
}

.autor {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 600;
}

.descricao {
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
  margin-bottom: 15px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
  margin-top: auto;
}

.btn-ler {
  background: transparent;
  border: none;
  color: #3B82F6;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-ler:hover {
  color: #1E3A8A;
  text-decoration: underline;
}

.texto-lido {
  font-size: 12px;
  color: #10B981;
  font-weight: 700;
}

.paginacao-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-top: 26px;
  padding-top: 18px;
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.info-paginacao {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.info-paginacao strong {
  color: #0f172a;
  font-weight: 900;
}

.btn-paginacao {
  background-color: #fff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: #334155;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-paginacao:hover:not(:disabled) {
  border-color: rgba(59, 130, 246, 0.55);
  color: #2563eb;
  background-color: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.10);
}

.btn-paginacao:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: #f8fafc;
  transform: none;
  box-shadow: none;
}

@media (max-width: 900px) {
  .avisos-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 24px 16px 16px;
  }

  .title {
    font-size: 26px;
  }

  .abas-config-container-aviso {
    overflow-x: visible;
    gap: 8px;
    padding: 8px;
  }

  .aba-config-aviso {
    flex: 1 1 0;
    min-width: 0;
    padding: 10px 4px;
    font-size: 12px;
    gap: 4px;
    flex-direction: column;
  }

  .badge-total {
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
  }

  .section-aviso {
    padding: 16px;
  }

  .paginacao-controls {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .btn-paginacao {
    width: 100%;
    justify-content: center;
  }

  .info-paginacao {
    text-align: center;
  }
}
</style>