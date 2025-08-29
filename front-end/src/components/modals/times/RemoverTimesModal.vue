<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Remover Time</h2>

      <div class="form-group">
        <label for="modalidade-remover-time">Modalidade:</label>
        <select id="modalidade-remover-time" v-model="modalidadeSelecionadaLocal" @change="carregarTimes"
          class="dropdown">
          <option disabled value="">Selecione uma modalidade</option>
          <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.id">
            {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="removerTime">Selecione o Time:</label>
        <select id="removerTime" v-model="timeParaRemover" class="dropdown" :disabled="isLoadingTimes || !times.length">
          <option disabled value="">
            {{ isLoadingTimes ? 'Carregando...' : 'Selecione' }}
          </option>
          <option v-for="time in times" :key="time.id" :value="time.id">
            {{ time.nome }}
          </option>
        </select>
      </div>

      <div class="buttons">
        <button class="btn-save" @click="removerTime">Remover</button>
        <button class="btn-cancel" @click="$emit('fechar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'RemoverTimeModal',
  props: {
    aberto: { type: Boolean, default: false },
    modalidadesDisponiveis: { type: Array, default: () => [] },
  },
  data() {
    return {
      modalidadeSelecionadaLocal: '',
      times: [],
      timeParaRemover: '', 
      isLoadingTimes: false,
    };
  },
  watch: {
    modalidadeSelecionadaLocal() {
      this.times = [];
      this.timeParaRemover = '';
      this.carregarTimes();
    },
  },
  methods: {
    async carregarTimes() {
      if (!this.modalidadeSelecionadaLocal) return;
      this.isLoadingTimes = true;
      try {
        const modalidade = this.modalidadesDisponiveis.find(
          m => m.id === this.modalidadeSelecionadaLocal
        );
        if (!modalidade) return;

        const res = await api.get(`/times/modalidade/${modalidade.id}`);
        this.times = Array.isArray(res.data) ? res.data : [];

        // Se não houver times, exibe alerta
        if (!this.times.length) {
          Swal.fire('Aviso', 'Não há nenhum time cadastrado para esta modalidade.', 'info');
        }

      } catch (error) {
        console.error('Erro ao carregar times:', error);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      } finally {
        this.isLoadingTimes = false;
      }
    },

    async removerTime() {
      if (!this.timeParaRemover) {
        Swal.fire('Aviso', 'Selecione um time.', 'warning');
        return;
      }

      try {
        await api.delete(`/time/${this.timeParaRemover}`);

        Swal.fire('Sucesso', 'Time removido com sucesso!', 'success');
        this.timeParaRemover = '';

        await this.carregarTimes();

        this.$emit('fechar');
        this.$emit('atualizar');
      } catch (error) {
        console.error('Erro ao remover time:', error);
        Swal.fire(
          'Erro',
          error.response?.data?.erro || 'Erro ao remover time.',
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

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
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
</style>
