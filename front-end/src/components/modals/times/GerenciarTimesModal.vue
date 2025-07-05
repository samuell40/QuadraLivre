<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2>Gerenciar Times</h2>
      <div class="form-group">
        <label for="acaoGerenciarTime">Escolha a ação:</label>
        <select id="acaoGerenciarTime" v-model="acaoGerenciarTime" class="dropdown">
          <option disabled value="">Selecione uma opção</option>
          <option value="adicionar">Adicionar Time</option>
          <option value="remover">Remover Time</option>
        </select>
      </div>
      <div class="buttons">
        <button :disabled="!acaoGerenciarTime" @click="confirmarAcao" class="btn-save">
          Continuar
        </button>
        <button class="btn-cancel" @click="fecharModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GerenciarTimesModal',
  props: {
    aberto: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      acaoGerenciarTime: ''
    };
  },
  methods: {
    confirmarAcao() {
      if (this.acaoGerenciarTime === 'adicionar') {
        this.$emit('abrir-adicionar-time');
      } else if (this.acaoGerenciarTime === 'remover') {
        this.$emit('abrir-remover-time');
        this.$emit('carregar-times');
      }
      this.fecharModal();
    },
    fecharModal() {
      this.acaoGerenciarTime = '';
      this.$emit('fechar');
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

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
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
