<template>
  <div class="meus-avisos-container">
    <NavBar />

    <div class="content-wrapper">
      <div class="titulo">
        <h1 class="title">Meus Avisos</h1>
        <p class="subtitulo">Acompanhe as atualizações das quadras</p>
      </div>

      <div v-if="loading" class="loader-container">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="accordion-aviso" v-for="tipo in ['importantes', 'naoLidos', 'lidos']" :key="tipo">

          <div class="accordion-header-aviso" @click="toggleSecao(tipo)">
            <div class="header-info">
              <h3>{{ titulos[tipo] }}</h3>

              <span class="badge-total" v-if="getTodosPorTipo(tipo).length">
                {{ getTodosPorTipo(tipo).length }}
              </span>
            </div>
            <span class="seta-accordion" :class="{ 'rotacionada': secoes[tipo] }">▼</span>
          </div>+

          <div class="accordion-body-aviso" v-show="secoes[tipo]">

            <div v-if="getTodosPorTipo(tipo).length === 0" class="mensagem-vazia">
              {{ mensagensVazias[tipo] }}
            </div>

            <div v-else>
              <div class="avisos-grid">
                <div v-for="aviso in getItensPagina(tipo)" :key="aviso.id" class="card-aviso"
                  :class="{ 'border-importante': tipo === 'importantes', 'lido-opacity': tipo === 'lidos' }">

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
                      <svg v-if="tipo === 'importantes'" xmlns="http://www.w3.org/2000/svg" class="icon-pin"
                        viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 3v2h-2v7l2 2v2h-6v5l-1 1-1-1v-5H4v-2l2-2V5H4V3h14z" />
                      </svg>
                      <h4>{{ aviso.titulo }}</h4>
                    </div>
                    <p class="autor">Por: {{ aviso.autor?.nome }}</p>
                    <p class="descricao">{{ aviso.descricao }}</p>
                  </div>

                  <div class="card-footer">
                    <button v-if="tipo !== 'lidos'" class="btn-ler" @click="marcarComoLido(aviso)">
                      Marcar como lido
                    </button>
                    <span v-else class="texto-lido">Visualizado ✓</span>
                  </div>
                </div>
              </div>

              <div class="paginacao-controls" v-if="getTotalPaginas(tipo) > 1">
                <button class="btn-paginacao" :disabled="paginasAtuais[tipo] === 1" @click="mudarPagina(tipo, -1)">
                  &lt; Anterior
                </button>

                <span class="info-paginacao">
                  Página <strong>{{ paginasAtuais[tipo] }}</strong> de {{ getTotalPaginas(tipo) }}
                </span>

                <button class="btn-paginacao" :disabled="paginasAtuais[tipo] === getTotalPaginas(tipo)"
                  @click="mudarPagina(tipo, 1)">
                  Próxima &gt;
                </button>
              </div>

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

      secoes: {
        importantes: true,
        naoLidos: true,
        lidos: false
      },

      titulos: {
        importantes: 'Importantes',
        naoLidos: 'Não Lidos',
        lidos: 'Lidos'
      },
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
    toggleSecao(secao) {
      this.secoes[secao] = !this.secoes[secao];
    },

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
  padding: 24px 80px;
  flex: 1;
  width: 100%;
  box-sizing: border-box;
}

.titulo {
  margin-top: 80px;
  margin-bottom: 30px;
  text-align: left;
}

.title {
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
  margin-bottom: 5px;
}

.subtitulo {
  color: #666;
  font-size: 14px;
}

.loader-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3B82F6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
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

.accordion-aviso {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.accordion-header-aviso {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #fff;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  user-select: none;
}

.accordion-header-aviso:hover {
  background-color: #f8fafc;
}

.header-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.header-info h3 {
  margin: 0;
  font-size: 18px;
  color: #4b5563;
  font-weight: 700;
}

.badge-total {
  color: #3B82F6;
  font-size: 16px;
  font-weight: 600;
}

.seta-accordion {
  color: #94a3b8;
  font-size: 14px;
  transition: transform 0.3s;
}

.seta-accordion.rotacionada {
  transform: rotate(180deg);
  color: #3B82F6;
}

.accordion-body-aviso {
  padding: 24px;
  background-color: #fff;
}

.mensagem-vazia {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 10px;
}

.avisos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .avisos-grid {
    grid-template-columns: 1fr;
  }

  .content-wrapper {
    padding: 20px;
  }
}

.card-aviso {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.card-aviso:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  font-weight: 700;
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
  font-style: italic;
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
  padding-top: 10px;
  margin-top: auto;
}

.btn-ler {
  background: transparent;
  border: none;
  color: #3B82F6;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;
}

.btn-ler:hover {
  color: #1E3A8A;
}

.texto-lido {
  font-size: 12px;
  color: #10B981;
  font-weight: 600;
}

.paginacao-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
  width: 100%;
}

.info-paginacao {
  color: #6b7280;
  font-size: 14px;
}

.btn-paginacao {
  background-color: #fff;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-paginacao:hover:not(:disabled) {
  border-color: #3B82F6;
  color: #3B82F6;
  background-color: #eff6ff;
}

.btn-paginacao:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f9fafb;
}
</style>