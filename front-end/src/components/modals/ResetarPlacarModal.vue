<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-content modal-placar">
      <h2>Resetar Placar</h2>
      <label for="modalidade-resetar">Escolha a modalidade:</label>
      <select
        id="modalidade-resetar"
        v-model="modalidadeSelecionada"
        class="dropdown"
      >
        <option disabled value="">Selecione</option>
        <option
          v-for="modalidade in modalidadesDisponiveis"
          :key="modalidade.id"
          :value="modalidade.nome"
        >
          {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
        </option>
      </select>

      <div class="botoes" style="margin-top: 1rem;">
        <button
          class="btn-save1"
          :disabled="!modalidadeSelecionada"
          @click="confirmar"
        >
          Confirmar
        </button>
        <button class="btn-cancel-placar" @click="fechar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'ResetarPlacarModal',
  props: {
    aberto: {
      type: Boolean,
      required: true,
    },
    modalidadesDisponiveis: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      modalidadeSelecionada: '',
    };
  },
  methods: {
    async confirmar() {
      if (!this.modalidadeSelecionada) return;

      try {
        await axios.put('http://localhost:3000/reset', {
          modalidade: this.modalidadeSelecionada,
        });
        Swal.fire('Sucesso', 'Placar resetado com sucesso!', 'success');
        this.$emit('fechar');
        this.modalidadeSelecionada = '';
      } catch (error) {
        console.error('Erro ao resetar placar:', error);
        Swal.fire('Erro', 'Erro ao resetar placar.', 'error');
      }
    },
    fechar() {
      this.$emit('fechar');
      this.modalidadeSelecionada = '';
    },
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

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save1,
.btn-cancel-placar {
  flex: 1;             
  padding: 10px 0;     
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save1 {
  background-color: #3b82f6;
}

.btn-cancel-placar {
  background-color: #7e7e7e;
}
</style>
