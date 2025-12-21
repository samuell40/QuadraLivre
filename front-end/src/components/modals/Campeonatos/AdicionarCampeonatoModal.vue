<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Adicionar Campeonato</h2>

      <form @submit.prevent="cadastrarCampeonato">

        <!-- MODALIDADE -->
        <div class="form-group">
          <label for="modalidade">Modalidade</label>
          <select id="modalidade" v-model="modalidadeSelecionada" required>
            <option value="" disabled>Selecione a modalidade</option>
            <option
              v-for="m in modalidades"
              :key="m.id"
              :value="m.id"
            >
              {{ m.nome }}
            </option>
          </select>
        </div>

        <!-- NOME -->
        <div class="form-group">
          <label for="nomeCampeonato">Nome do Campeonato</label>
          <input
            type="text"
            id="nomeCampeonato"
            v-model="nomeCampeonato"
            required
          />
        </div>

        <!-- DATA INÍCIO -->
        <div class="form-group">
          <label for="dataInicio">Data de Início</label>
          <input
            type="date"
            id="dataInicio"
            v-model="dataInicio"
            required
          />
        </div>

        <!-- DATA FIM -->
        <div class="form-group">
          <label for="dataFim">Data de Fim</label>
          <input
            type="date"
            id="dataFim"
            v-model="dataFim"
            required
          />
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
  name: 'AdicionarCampeonatoModal',
  props: {
    aberto: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalidades: [],
      modalidadeSelecionada: '',
      nomeCampeonato: '',
      dataInicio: '',
      dataFim: ''
    };
  },
  watch: {
    aberto(valor) {
      if (valor) {
        this.limparCampos();
        this.carregarModalidades();
      }
    }
  },
  methods: {
    limparCampos() {
      this.modalidadeSelecionada = '';
      this.nomeCampeonato = '';
      this.dataInicio = '';
      this.dataFim = '';
    },

    async carregarModalidades() {
      try {
        const res = await api.get('/listar/modalidade');
        this.modalidades = res.data || [];
      } catch {
        Swal.fire('Erro', 'Erro ao carregar modalidades.', 'error');
      }
    },

    async cadastrarCampeonato() {
      if (!this.modalidadeSelecionada) {
        Swal.fire('Atenção', 'Selecione uma modalidade.', 'warning');
        return;
      }

      if (!this.nomeCampeonato.trim()) {
        Swal.fire('Atenção', 'Informe o nome do campeonato.', 'warning');
        return;
      }

      if (this.dataFim < this.dataInicio) {
        Swal.fire('Atenção', 'Data de fim não pode ser menor que a de início.', 'warning');
        return;
      }

      try {
        await api.post('/criar/campeonato', {
          nome: this.nomeCampeonato.trim(),
          modalidadeId: this.modalidadeSelecionada,
          dataInicio: this.dataInicio,
          dataFim: this.dataFim
        });

        Swal.fire('Sucesso', 'Campeonato cadastrado com sucesso!', 'success');
        this.$emit('atualizar');
        this.$emit('fechar');

      } catch (error) {
        const msg = error.response?.data?.erro || 'Erro ao cadastrar campeonato.';
        Swal.fire('Erro', msg, 'error');
      }
    }
  }
};
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
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 420px;
  max-width: 95%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.form-group {
  margin-bottom: 16px;
}

input,
select {
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