<template>
  <div class="meus-avisos-container">
    <NavBar />

    <div class="content-wrapper">
      <div class="titulo">
        <h1>Meus Avisos</h1>
        <p class="subtitulo">Acompanhe as atualizações das quadras</p>
      </div>

      <div v-if="loading" class="loader-container">
        <div class="loader"></div>
      </div>

      <div v-else class="accordions-container">

        <div class="accordion-item">
          <div class="accordion-header" @click="toggleSecao('importantes')" :class="{ 'aberto': secoes.importantes }">
            <div class="header-title">
              <h3>Importantes</h3>
              <span class="badge" v-if="listaImportantes.length">{{ listaImportantes.length }}</span>
            </div>
            <span class="seta">▼</span>
          </div>

          <div class="accordion-content" v-show="secoes.importantes">
            <div v-if="listaImportantes.length === 0" class="empty-state">
              Nenhum aviso importante pendente.
            </div>
            <div v-else class="lista-cards">
              <div v-for="aviso in listaImportantes" :key="aviso.id" class="card-aviso border-importante">
                <div class="card-header">
                  <span class="tag-quadra">
                    {{ aviso.quadra?.nome || 'EQUIPE QUADRA LIVRE' }}
                  </span>
                  <span class="data-aviso">{{ formatarData(aviso.data) }}</span>
                </div>
                <div class="card-body">
                  <div class="titulo-row">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-pin" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 3v2h-2v7l2 2v2h-6v5l-1 1-1-1v-5H4v-2l2-2V5H4V3h14z" />
                    </svg>
                    <h4>{{ aviso.titulo }}</h4>
                  </div>
                  <p class="autor">Por: {{ aviso.autor?.nome }}</p>
                  <p class="descricao">{{ aviso.descricao }}</p>
                </div>
                <div class="card-footer">
                  <button class="btn-ler" @click="marcarComoLido(aviso)">Marcar como lido</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <div class="accordion-header" @click="toggleSecao('naoLidos')" :class="{ 'aberto': secoes.naoLidos }">
            <div class="header-title">
              <h3>Não Lidos</h3>
              <span class="badge" v-if="listaNaoLidos.length">{{ listaNaoLidos.length }}</span>
            </div>
            <span class="seta">▼</span>
          </div>

          <div class="accordion-content" v-show="secoes.naoLidos">
            <div v-if="listaNaoLidos.length === 0" class="empty-state">
              Você está em dia com os avisos.
            </div>
            <div v-else class="lista-cards">
              <div v-for="aviso in listaNaoLidos" :key="aviso.id" class="card-aviso">
                <div class="card-header">
                  <span class="tag-quadra">{{ aviso.quadraNome }}</span>
                  <span class="data-aviso">{{ formatarData(aviso.data) }}</span>
                </div>
                <div class="card-body">
                  <h4>{{ aviso.titulo }}</h4>
                  <p class="autor">Por: {{ aviso.autor?.nome }}</p>
                  <p class="descricao">{{ aviso.descricao }}</p>
                </div>
                <div class="card-footer">
                  <button class="btn-ler" @click="marcarComoLido(aviso)">Marcar como lido</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <div class="accordion-header" @click="toggleSecao('lidos')" :class="{ 'aberto': secoes.lidos }">
            <div class="header-title">
              <h3>Lidos</h3>
            </div>
            <span class="seta">▼</span>
          </div>

          <div class="accordion-content" v-show="secoes.lidos">
            <div v-if="listaLidos.length === 0" class="empty-state">
              Nenhum aviso no histórico.
            </div>
            <div v-else class="lista-cards">
              <div v-for="aviso in listaLidos" :key="aviso.id" class="card-aviso lido-opacity">
                <div class="card-header">
                  <span class="tag-quadra">{{ aviso.quadraNome }}</span>
                  <div class="meta-right">
                    <svg v-if="aviso.fixado" xmlns="http://www.w3.org/2000/svg" class="icon-pin-mini"
                      viewBox="0 0 24 24" fill="currentColor" title="Este aviso estava fixado">
                      <path d="M18 3v2h-2v7l2 2v2h-6v5l-1 1-1-1v-5H4v-2l2-2V5H4V3h14z" />
                    </svg>
                    <span class="data-aviso">{{ formatarData(aviso.data) }}</span>
                  </div>
                </div>
                <div class="card-body">
                  <h4>{{ aviso.titulo }}</h4>
                  <p class="autor">Por: {{ aviso.autor?.nome }}</p>
                  <p class="descricao">{{ aviso.descricao }}</p>
                </div>
                <div class="card-footer-lido">
                  <span>Visualizado ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
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
      }
    };
  },
  computed: {
    usuarioId() {
      const authStore = useAuthStore();
      return authStore.usuario?.id;
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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

.titulo h1 {
  font-size: 32px;
  font-weight: bold;
  color: #3B82F6;
  margin-bottom: 5px;
}

.subtitulo {
  color: #666;
  font-size: 14px;
}

.accordions-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 100%;
}

.accordion-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.accordion-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #fff;
  transition: background 0.2s;
  user-select: none;
}

.accordion-header:hover {
  background-color: #f8fafc;
}

.accordion-header.aberto {
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
  font-weight: 700;
}

.badge {
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.seta {
  color: #94a3b8;
  font-size: 12px;
  transition: transform 0.3s;
}

.accordion-header.aberto .seta {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 20px;
  background-color: #fff;
  animation: slideDown 0.3s ease-out;
}

.lista-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-aviso {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  transition: all 0.2s;
}

.card-aviso:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.border-importante {
  border-left: 4px solid #DC2626;
  background: #FEF2F2;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 12px;
}

.tag-quadra {
  font-weight: 800;
  color: #3B82F6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-aviso {
  color: #94a3b8;
}

.card-body h4 {
  margin: 0 0 5px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 700;
}

.titulo-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.icon-pin {
  width: 20px;
  height: 20px;
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

.lido-opacity {
  opacity: 0.7;
  background-color: #f8fafc;
}

.card-footer-lido {
  text-align: right;
  font-size: 12px;
  color: #10B981;
  font-weight: 600;
  margin-top: 10px;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 10px;
}

.meta-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-pin-mini {
  width: 14px;
  height: 14px;
  color: #94a3b8;
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 20px;
  }

  .titulo {
    margin-top: 80px;
  }
}
</style>