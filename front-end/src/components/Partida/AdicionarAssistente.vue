<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-content">
      <h2>Adicionar Assistente</h2>

      <!-- Loader Centralizado -->
      <div v-if="carregando" class="loader-wrapper">
        <div class="loader"></div>
      </div>

      <!-- Dropdown só aparece depois que carregar -->
      <div v-else class="form-group">
        <label for="assistente">Selecione o Assistente:</label>
        <select id="assistente" v-model="assistenteSelecionado" class="dropdown">
          <option value="" disabled>Selecione</option>
          <option v-for="a in assistentes" :key="a.id" :value="a.id">
            {{ a.nome }}
          </option>
        </select>
      </div>

      <div class="buttons">
        <button class="btn-save" :disabled="!assistenteSelecionado" @click="salvar">
          Salvar
        </button>
        <button class="btn-cancel" @click="$emit('fechar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  props: {
    aberto: Boolean,
    partidaId: Number
  },
  data() {
    return {
      assistentes: [],
      assistenteSelecionado: '',
      carregando: false
    }
  },
  watch: {
    aberto(novo) {
      if (novo) this.carregarAssistentes()
    }
  },
  mounted() {
    if (this.aberto) this.carregarAssistentes()
  },
  methods: {
    async carregarAssistentes() {
      this.carregando = true
      try {
        const response = await api.get('/usuarios')
        this.assistentes = response.data
        console.log('Assistentes carregados:', this.assistentes)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao carregar usuários.' })
      } finally {
        this.carregando = false
      }
    },

    async salvar() {
      if (!this.partidaId || !this.assistenteSelecionado) {
        Swal.fire('Atenção', 'Selecione um assistente antes de salvar.', 'warning')
        return
      }

      const usuario = this.assistentes.find(u => u.id === this.assistenteSelecionado)

      if (!usuario) {
        Swal.fire('Erro', 'Usuário não encontrado.', 'error')
        return
      }

      try {
        await api.post('/vincular/partida', {
          partidaId: this.partidaId,
          usuarioId: usuario.id,
           permissaoId: usuario.permissaoId 
        })
        Swal.fire('Sucesso', 'Assistente vinculado à partida!', 'success')
        this.$emit('fechar')
      } catch (err) {
        console.error('Erro ao salvar assistente:', err)
        Swal.fire('Erro', err.response?.data?.message || 'Erro desconhecido', 'error')
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 600px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.form-group {
  margin-bottom: 20px;
}

select.dropdown {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
  transition: 0.2s;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #7e7e7e;
}

/* Loader */
.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 70px;
  height: 70px;
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
</style>