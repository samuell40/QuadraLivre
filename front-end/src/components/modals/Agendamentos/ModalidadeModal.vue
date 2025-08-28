<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title">Escolha a modalidade</h2>

      <div v-if="isLoading" class="loader-container">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="modalidades.length === 0">
          <p class="mensagem-nenhuma">Nenhuma modalidade disponível nesta quadra.</p>
        </div>
        <div v-else class="modal-lista">
          <button
            v-for="m in modalidades"
            :key="m.id"
            class="btn-modalidade"
            @click="selecionar(m)"
          >
            {{ m.nome }}
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancelar" @click="$emit('fechar')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/axios";

export default {
  name: "ModalidadeModal",
  props: { quadraId: { type: Number, required: true } },
  emits: ["fechar", "confirmar"],
  setup(props, { emit }) {
    const modalidades = ref([]);
    const isLoading = ref(true);

    onMounted(async () => {
      try {
        const { data } = await api.get(`/quadra/${props.quadraId}/modalidades`);
        modalidades.value = data;
      } catch (err) {
        console.error("Erro ao buscar modalidades:", err);
      } finally {
        isLoading.value = false;
      }
    });

    function selecionar(modalidade) {
      emit("confirmar", modalidade);
    }

    return { modalidades, isLoading, selecionar };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  color: #7E7E7E;
  padding: 24px 40px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80%;
  overflow-y: auto;
  text-align: center;
}

.title {
  color: #3b82f6;
  margin-bottom: 24px;
}

.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-modalidade {
  background-color: #1E3A8A;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px;
  cursor: pointer;
  width: 100%;
  font-size: 16px;
}

.btn-modalidade:hover {
  opacity: 0.9;
}

.mensagem-nenhuma {
  color: #7E7E7E;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancelar {
  background-color: #F7F9FC;
  color: #7E7E7E;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
}

.btn-cancelar:hover {
  opacity: 0.8;
}
</style>
