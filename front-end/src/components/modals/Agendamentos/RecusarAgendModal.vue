<template>
  <div class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2 class="modal-titulo">Motivo da Recusa</h2>
      <p class="modal-descricao">Explique porque o agendamento não pode ser aceito:</p>

      <textarea 
        v-model="motivo" 
        class="modal-textarea-fixo" 
        placeholder="Ex: A quadra passará por manutenção neste horário, por favor escolha outro dia..."
        @input="erro = false"
      ></textarea>
      
      <span v-if="erro" class="mensagem-erro">Por favor, informe o motivo da recusa.</span>

      <div class="modal-actions-container">
        <button class="modal-btn-confirmar" @click="confirmarRecusa" :disabled="loading">
          <span v-if="loading" class="loader-btn"></span>
          <span v-else>Confirmar Recusa</span>
        </button>
        <button class="modal-btn-cancelar" @click="fecharModal" :disabled="loading">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  agendamentoId: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['fechar', 'confirmar']);

const motivo = ref('');
const erro = ref(false);

const fecharModal = () => {
  if (!props.loading) {
    emit('fechar');
  }
};

const confirmarRecusa = () => {
  if (!motivo.value.trim()) {
    erro.value = true;
    return;
  }
  emit('confirmar', { id: props.agendamentoId, motivo: motivo.value });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  font-family: 'Montserrat', sans-serif;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-titulo {
  font-size: 26px;
  font-weight: 800;
  color: #3B82F6;
  margin: 0 0 12px 0;
  text-align: center;
}

.modal-descricao {
  font-size: 15px;
  color: #6b7280;
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.5;
}

.modal-textarea-fixo {
  resize: none;
  width: 100%;
  box-sizing: border-box;
  min-height: 150px;
  font-family: inherit;
  font-size: 15px;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  outline: none;
  transition: all 0.2s;
  background-color: #f9fafb;
}

.modal-textarea-fixo:focus {
  border-color: #3b82f6;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.mensagem-erro {
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
  display: block;
}

.modal-actions-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  margin-top: 24px;
}

.modal-btn-confirmar,
.modal-btn-cancelar {
  flex: 1;
  padding: 14px 0;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-btn-confirmar {
  background-color: #1e3a8a;
  color: white;
}

.modal-btn-cancelar {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-btn-confirmar:hover:not(:disabled) {
  background-color: #1e3a8a;
  transform: translateY(-2px);
}

.modal-btn-cancelar:hover:not(:disabled) {
  background-color: #e5e7eb;
  color: #1f2937;
  transform: translateY(-2px);
}

.modal-btn-confirmar:disabled,
.modal-btn-cancelar:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loader-btn {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .modal-content {
    padding: 24px;
  }
  .modal-titulo {
    font-size: 22px;
  }
  .modal-actions-container {
    flex-direction: column-reverse;
    gap: 12px;
  }
  .modal-btn-confirmar, .modal-btn-cancelar {
    width: 100%;
  }
}
</style>