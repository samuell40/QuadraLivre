<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-content">
      <h2>Limpar Partidas</h2>
      <label for="modalidade-limpar">Escolha a modalidade:</label>
      <select
        id="modalidade-limpar"
        v-model="modalidadeSelecionada"
        class="dropdown"
      >
        <option disabled value="">Selecione</option>
        <option
          v-for="modalidade in modalidadesDisponiveis"
          :key="modalidade.id"
          :value="modalidade.id"
        >
          {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
        </option>
      </select>

      <div class="botoes">
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
import Swal from "sweetalert2";
import api from "@/axios";

export default {
  name: "LimparPartidasModal",
  props: {
    aberto: { type: Boolean, required: true },
    modalidadesDisponiveis: { type: Array, required: true },
  },
  data() {
    return {
      modalidadeSelecionada: "",
    };
  },
  methods: {
    async confirmar() {
      if (!this.modalidadeSelecionada) return;

      try {
        await api.delete(`/limpar/${this.modalidadeSelecionada}`);

        this.$emit("confirmar", this.modalidadeSelecionada);

        this.$emit("fechar");
        this.modalidadeSelecionada = "";
      } catch (error) {
        console.error("Erro ao limpar partidas:", error);
        Swal.fire("Erro", "Erro ao limpar partidas.", "error");
      }
    },
    fechar() {
      this.$emit("fechar");
      this.modalidadeSelecionada = "";
    },
  },
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