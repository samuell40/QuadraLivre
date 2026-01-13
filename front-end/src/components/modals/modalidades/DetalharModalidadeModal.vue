<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">

      <div class="header-modal">
        <h2>Detalhes da Modalidade - {{ formatarNome(modalidade?.nome) }}</h2>
        <button class="btn-gerenciar" @click="abrirModalFuncoes">
          Gerenciar Funções
        </button>
      </div>

      <!-- ACCORDION QUADRAS -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion('quadras')">
          <span>Quadras</span>
          <span>{{ accordionAberto === 'quadras' ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionAberto === 'quadras'" class="accordion-body">
          <div v-if="quadras.length === 0" class="vazio">
            Nenhuma quadra associada.
          </div>

          <ul v-else>
            <li v-for="q in quadras" :key="q.id">{{ q.nome }}</li>
          </ul>
        </div>
      </div>

      <!-- ACCORDION TIMES -->
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion('times')">
          <span>Times</span>
          <span>{{ accordionAberto === 'times' ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionAberto === 'times'" class="accordion-body">
          <div v-if="times.length === 0" class="vazio">
            Nenhum time cadastrado.
          </div>
          <ul v-else>
            <li v-for="t in times" :key="t.id">{{ t.nome }}</li>
          </ul>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-cancel" @click="$emit('fechar')">Fechar</button>
      </div>

      <!-- MODAL de GERENCIAR FUNÇÕES -->
      <div v-if="modalFuncoes" class="modal-overlay" @click.self="modalFuncoes = false">
        <div class="modal-content modal-funcoes">

          <div class="header-modal">
            <h2>Funções - {{ formatarNome(modalidade?.nome) }}</h2>

            <button class="btn-add" @click="modalAddFuncao = true">
              Adicionar Função
            </button>
          </div>

          <div v-if="isLoadingFuncoes" class="loader-container-centralizado">
            <div class="loader"></div>
          </div>

          <div v-else>
            <div v-if="funcoes.length === 0" class="mensagem-placar">
              Nenhuma função cadastrada.
            </div>

            <div v-else class="lista-modalidades">
              <div class="card" v-for="f in funcoes" :key="f.id">
                <div class="card-conteudo">
                  <div class="info">
                    <h2>{{ formatarNome(f.nome) }}</h2>
                    <p>{{ f._count.jogadores }} jogador
                    </p>
                  </div>

                  <button class="btn-remover" @click="removerFuncao(f.id)">
                    Remover
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="botoes">
            <button class="btn-cancel" @click="modalFuncoes = false">
              Fechar
            </button>
          </div>

          <!-- MODAL DE ADICIONAR FUNÇÃO -->
          <div v-if="modalAddFuncao" class="modal-overlay" @click.self="modalAddFuncao = false">
            <div class="modal-content modal-add">

              <h2>Adicionar Função</h2>

              <form @submit.prevent="cadastrarFuncao">
                <div class="form-group">
                  <label for="novaFuncao">Nome da Função</label>
                  <input type="text" id="novaFuncao" v-model="novaFuncao" required />
                </div>

                <div class="botoes">
                  <button type="submit" class="btn-save">Cadastrar</button>
                  <button type="button" class="btn-cancel" @click="modalAddFuncao = false">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'DetalharModalidadeModal',

  props: {
    aberto: Boolean,
    modalidade: Object
  },

  data() {
    return {
      times: [],
      quadras: [],
      funcoes: [],
      accordionAberto: 'quadras',
      modalFuncoes: false,
      modalAddFuncao: false,
      isLoadingFuncoes: false,
      novaFuncao: ''
    }
  },

  watch: {
    async aberto(v) {
      if (v) {
        if (this.modalidade && this.modalidade.id) {
          await this.carregarTimes()
          await this.carregarQuadras()
        }
      } else {
        this.resetarEstado()
      }
    }
  },

  methods: {
    toggleAccordion(tipo) {
      if (this.accordionAberto === tipo) {
        this.accordionAberto = null
      } else {
        this.accordionAberto = tipo
      }
    },

    formatarNome(nome) {
      if (!nome) return ''

      return nome
        .split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ')
    },

    resetarEstado() {
      this.times = []
      this.quadras = []
      this.funcoes = []
      this.modalFuncoes = false
      this.modalAddFuncao = false
      this.accordionAberto = 'quadras'
      this.novaFuncao = ''
      this.isLoadingFuncoes = false
    },

    async carregarTimes() {
      try {
        const res = await api.get(`/times/modalidade/${this.modalidade.id}`)
        this.times = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar times', 'error')
      }
    },

    async carregarQuadras() {
      try {
        const res = await api.get(`/listar/quadras/${this.modalidade.id}`)
        this.quadras = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar quadras', 'error')
      }
    },

    abrirModalFuncoes() {
      this.modalFuncoes = true
      this.carregarFuncoes()
    },

    async carregarFuncoes() {
      this.isLoadingFuncoes = true

      try {
        const res = await api.get('/listar/funcoes', {
          params: { modalidadeId: this.modalidade.id }
        })
        this.funcoes = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar funções', 'error')
      } finally {
        this.isLoadingFuncoes = false
      }
    },

    async cadastrarFuncao() {
      if (!this.novaFuncao.trim()) {
        Swal.fire('Atenção', 'Informe o nome da função', 'warning')
        return
      }

      try {
        await api.post('/adicionar/funcao', {
          nome: this.novaFuncao.toLowerCase(),
          modalidadeId: this.modalidade.id
        })

        Swal.fire('Sucesso', 'Função cadastrada!', 'success')
        this.novaFuncao = ''
        this.modalAddFuncao = false
        this.carregarFuncoes()
      } catch {
        Swal.fire('Erro', 'Erro ao cadastrar função', 'error')
      }
    },

    async removerFuncao(id) {
      const ok = await Swal.fire({
        title: 'Tem certeza que deseja remover a função?',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Cancelar'
      })

      if (!ok.isConfirmed) return

      try {
        await api.delete('/remover/funcao', {
          data: { id, modalidadeId: this.modalidade.id }
        })

        this.carregarFuncoes()
      } catch {
        Swal.fire('Erro', 'Erro ao remover função', 'error')
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #f9fafb;
  padding: 32px;
  border-radius: 12px;
  width: 1000px;
  max-width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.header-modal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-modal h2 {
  font-size: 30px;
  color: #3b82f6;
}

.botoes {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.btn-gerenciar,
.btn-add {
  padding: 10px 16px;
  background-color: #3b82f6;
  border: none;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background-color: #3b82f6;
  color: white;
  font-size: 16px;
}

.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.accordion-header {
  background: #f1f5f9;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  color: #1f2937;
}

.accordion-body {
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
  display: block;
}

.accordion-body ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.accordion-body li {
  padding: 10px 0;
  border-bottom: 1px solid #7e7e7e;
  font-weight: 500;
  color: #7e7e7e;
}

.vazio {
  color: #7e7e7e;
  font-style: italic;
}

.lista-modalidades {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  margin-top: 20px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-conteudo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
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
}

.btn-remover {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  margin-top: 140px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.mensagem-placar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  font-size: 18px;
  color: #555;
}


.modal-add {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
}

.modal-add h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.form-group {
  margin-bottom: 20px;
}

input[type='text'] {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.btn-save {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 0;
  font-size: 16px;
  cursor: pointer;
  flex: 1;
}
</style>