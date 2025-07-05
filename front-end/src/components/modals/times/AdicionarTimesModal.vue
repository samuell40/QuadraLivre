<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModalAdicionarTime">
    <div class="modal-content">
      <h2>Adicionar Time</h2>
      <form @submit.prevent="adicionarTime">
        <div class="form-group">
          <label for="modalidade-add-time">Modalidade:</label>
          <select id="modalidade-add-time" v-model="modalidadeSelecionada" required class="dropdown">
            <option disabled value="">Selecione uma modalidade</option>
            <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
              {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="novoTime">Nome do Time:</label>
          <input type="text" id="novoTime" v-model="timeParaAdicionar" required />
        </div>

        <div class="form-group">
          <label for="fotoTime">Foto (opcional):</label>
          <input type="file" id="fotoTime" @change="handleImagemUpload" accept="image/*" />
        </div>

        <div class="buttons">
          <button type="submit" class="btn-save">Cadastrar</button>
          <button type="button" class="btn-cancel" @click="fecharModalAdicionarTime">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'AdicionarTimeModal',
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
      modalidadeSelecionada: '',
      timeParaAdicionar: '',
      fotoTime: ''
    };
  },
  methods: {
    fecharModalAdicionarTime() {
      this.modalidadeSelecionada = '';
      this.timeParaAdicionar = '';
      this.fotoTime = '';
      this.$emit('fechar');
    },
    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.fotoTime = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async adicionarTime() {
      try {
        const payload = {
          modalidade: this.modalidadeSelecionada,
          time: this.timeParaAdicionar.trim(),
          foto: this.fotoTime || null,
        };
        await axios.post('http://localhost:3000/times', payload);
        Swal.fire('Sucesso', 'Time adicionado com sucesso!', 'success');
        this.fecharModalAdicionarTime();
        this.$emit('atualizar'); 
      } catch (error) {
        console.error('Erro ao adicionar time:', error);
        Swal.fire('Erro', error.response?.data?.error || 'Erro ao adicionar time.', 'error');
      }
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

.form-group {
  margin-bottom: 20px;
}

input[type='text'],
select.dropdown,
input[type='file'] {
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
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #7e7e7e;
}
</style>
