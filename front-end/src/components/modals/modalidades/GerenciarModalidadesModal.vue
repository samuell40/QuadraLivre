<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Gerenciar Modalidades</h2>

      <div class="form-group">
        <label for="acaoGerenciarModalidade">Escolha a ação:</label>
        <select
          id="acaoGerenciarModalidade"
          v-model="acaoLocal"
          class="dropdown"
        >
          <option disabled value="">Selecione uma opção</option>
          <option value="adicionar">Adicionar Modalidade</option>
          <option value="remover">Remover Modalidade</option>
        </select>
      </div>

      <div class="botoes">
        <button
          :disabled="!acaoLocal"
          @click="confirmar"
          class="btn-save1"
        >
          Continuar
        </button>
        <button class="btn-cancel-placar" @click="$emit('fechar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GerenciarModalidadeModal',
  props: {
    aberto: {
      type: Boolean,
      required: true,
    },
    acao: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      acaoLocal: this.acao,
    };
  },
  watch: {
    acao(newVal) {
      this.acaoLocal = newVal;
    },
  },
  methods: {
    confirmar() {
      this.$emit('confirmar', this.acaoLocal);
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
