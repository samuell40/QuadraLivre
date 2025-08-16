<template>
    <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
        <div class="modal-content">
            <h2>Adicionar Modalidade</h2>
            <form @submit.prevent="cadastrarModalidade">
                <div class="form-group">
                    <label for="novaModalidade">Nome da Modalidade</label>
                    <input type="text" id="novaModalidade" v-model="novaModalidade" required />
                </div>
                <div class="botoes">
                    <button type="submit" class="btn-save">Cadastrar</button>
                    <button type="button" class="btn-cancel" @click="$emit('fechar')">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import api from '@/axios'; 

export default {
  name: 'AdicionarModalidadeModal',
  props: {
    aberto: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      novaModalidade: '',
    };
  },
  methods: {
    async cadastrarModalidade() {
      const nome = this.novaModalidade.trim().toLowerCase();

      if (!nome) {
        Swal.fire('Atenção', 'Informe o nome da modalidade.', 'warning');
        return;
      }

      try {
        await api.post('/modalidade', { nome });
        Swal.fire('Sucesso', 'Modalidade cadastrada com sucesso!', 'success');
        this.novaModalidade = '';
        this.$emit('atualizar');
        this.$emit('fechar');
      } catch (error) {
        Swal.fire(
          'Erro',
          error.response?.data?.error || 'Erro ao cadastrar modalidade.',
          'error'
        );
      }
    }
  },
};
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
    width: 400px;
    max-width: 90%;
}

.modal-content h2 {
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

.botoes {
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
}

.btn-save {
    background-color: #3b82f6;
}

.btn-cancel {
    background-color: #7e7e7e;
}
</style>
