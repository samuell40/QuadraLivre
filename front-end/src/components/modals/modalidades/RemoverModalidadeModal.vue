<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2>Remover Modalidade</h2>
      <div class="form-group">
        <label for="modalidadeRemover">Selecione a Modalidade:</label>
        <select id="modalidadeRemover" v-model="modalidadeParaRemover" class="dropdown">
          <option disabled value="">Selecione uma modalidade</option>
          <option v-for="(modalidade, i) in modalidadesDisponiveis" :key="i" :value="modalidade.nome">
            {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
          </option>
        </select>
      </div>
      <div class="buttons">
        <button class="btn-save" @click="removerModalidade" :disabled="!modalidadeParaRemover">Remover</button>
        <button class="btn-cancel" @click="fecharModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'RemoverModalidadeModal',
  props: {
    aberto: {
      type: Boolean,
      default: false
    },
    modalidadesDisponiveis: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modalidadeParaRemover: ''
    };
  },
  methods: {
    fecharModal() {
      this.modalidadeParaRemover = '';
      this.$emit('fechar');
    },
    async removerModalidade() {
      if (!this.modalidadeParaRemover) {
        Swal.fire('Atenção', 'Selecione uma modalidade para remover.', 'warning');
        return;
      }

      try {
        await api.delete(`/modalidade/${this.modalidadeParaRemover}`);
        Swal.fire('Sucesso', 'Modalidade removida com sucesso!', 'success');
        this.$emit('atualizar');
        this.fecharModal();
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao remover modalidade.', 'error');
      }
    }
  }
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

.buttons {
  display: flex;
  gap: 10px;
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

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.dropdown-row {
  display: flex;
  gap: 20px;
  width: 90%;
  margin-left: 15%;
}

.dropdown-row .team {
  flex: 1;
}
</style>
