<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
       <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>
       
       <label for="data"><strong>Escolha a data:</strong></label>
        <input type="date" v-model="data" />

        <label for="hora"><strong>Escolha a hora:</strong></label>
        <input type="time" v-model="hora" />
      
      <div class="modal-actions">
        <button @click="confirmar" class="btn-confirmar" :disabled="!data || !hora">Confirmar</button>
        <button @click="$emit('fechar')" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AgendamentoModal',
  props: {
    quadra: Object
  },
  data() {
    return {
      data: '',
      hora: ''
    }
  },
  methods: {
    confirmar() {
      this.$emit('confirmar', {
        quadra: this.quadra,
        data: this.data,
        hora: this.hora
      })
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
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: #7E7E7E;
  padding: 24px 56px;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 500px;
  height: 55%;
}

.modal-content input {
  color: #7E7E7E;
  height: 50px;
  padding: 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
}

.modal-content input:first-of-type {
  margin-bottom: 20px;
}

.modal-content input:nth-of-type(2) {
  margin-bottom: 24px;
}

.modal-content label {
  margin-bottom: 6px;
}

.title {
 margin-bottom: 32px;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.modal-actions button {
  width: 48%;
  height: 42px;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-confirmar {
  background-color: #1E3A8A;
  color: #fff;
}

.btn-confirmar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-cancelar {
  background-color: #F7F9FC;
  color: #7E7E7E;
}

h2 {
  text-align: center;
}
</style>
