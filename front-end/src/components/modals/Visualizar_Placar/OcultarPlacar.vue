<template>
  <div class="modal-overlay" v-if="aberto">
    <div class="modal-content">
      <h2>Controle de Visibilidade</h2>
      <p class="mensagem-alerta">
        ATENÇÃO: esta configuração altera a exibição dos placares na tela inicial (HOME).
      </p>

      <!-- Loader -->
      <div v-if="carregando" class="loading-wrapper">
        <div class="spinner"></div>
        <p>Carregando modalidades...</p>
      </div>

      <!-- Dropdowns só aparecem quando não está carregando -->
      <div v-else>
        <!-- Dropdown para deixar visível -->
        <div class="form-group">
          <label for="visivel-dropdown" class="label-dropdown">Deixar Visível</label>
          <select
            id="visivel-dropdown"
            v-model="modalidadeParaExibir"
            @change="deixarVisivel(modalidadeParaExibir)"
            class="dropdown"
          >
            <option disabled value="">Selecione uma modalidade</option>
            <option value="todos">Todos Visíveis</option>
            <option
              v-for="(modalidade, i) in modalidadesOcultas"
              :key="`exibir-${i}`"
              :value="modalidade.modalidadeId"
            >
              {{ capitalizar(modalidade.nome) }}
            </option>
          </select>
        </div>

        <!-- Dropdown para ocultar -->
        <div class="form-group">
          <label for="ocultar-dropdown" class="label-dropdown">Ocultar</label>
          <select
            id="ocultar-dropdown"
            v-model="modalidadeParaOcultar"
            @change="ocultar(modalidadeParaOcultar)"
            class="dropdown"
          >
            <option disabled value="">Selecione uma modalidade</option>
            <option value="todos">Ocultar Todos</option>
            <option
              v-for="(modalidade, i) in modalidadesVisiveis"
              :key="`ocultar-${i}`"
              :value="modalidade.modalidadeId"
            >
              {{ capitalizar(modalidade.nome) }}
            </option>
          </select>
        </div>

        <div class="buttons">
          <button class="btn-cancel" @click="$emit('fechar')">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios";
import Swal from "sweetalert2";

export default {
  name: "OcultarPlacar",
  props: { aberto: Boolean },
  data() {
    return {
      modalidades: [],
      modalidadeParaExibir: "",
      modalidadeParaOcultar: "",
      carregando: false, // <- estado de loading
    };
  },
  computed: {
    modalidadesVisiveis() {
      return this.modalidades.filter((m) => m.visivel);
    },
    modalidadesOcultas() {
      return this.modalidades.filter((m) => !m.visivel);
    },
  },
  watch: {
    aberto(novoValor) {
      if (novoValor) this.carregarModalidades();
    },
  },
  methods: {
    async carregarModalidades() {
      this.carregando = true; // começa a carregar
      try {
        const res = await api.get("/visibilidade");
        this.modalidades = res.data;
        this.modalidadeParaExibir = "";
        this.modalidadeParaOcultar = "";
      } catch (error) {
        console.error("Erro ao carregar modalidades:", error);
        Swal.fire("Erro", "Não foi possível carregar as modalidades.", "error");
      } finally {
        this.carregando = false; // terminou de carregar
      }
    },

    async alterarVisibilidade(modalidadeId, visivel) {
      if (!modalidadeId) return;
      try {
        let url = "";
        if (modalidadeId === "todos") {
          url = visivel ? "/mostrar" : "/ocultar";
          await api.put(url);
          this.modalidades.forEach((m) => (m.visivel = visivel));
          Swal.fire(
            "Sucesso!",
            visivel ? "Todos os placares estão visíveis." : "Todos os placares foram ocultados.",
            visivel ? "success" : "info"
          );
        } else {
          url = visivel ? `/mostrar/${modalidadeId}` : `/ocultar/${modalidadeId}`;
          await api.put(url);
          const modalidade = this.modalidades.find((m) => m.modalidadeId === modalidadeId);
          if (modalidade) modalidade.visivel = visivel;
          Swal.fire(
            visivel ? "Visível" : "Ocultado",
            `O placar de "${this.capitalizar(modalidade?.nome)}" está agora ${visivel ? "visível" : "oculto"}.`,
            visivel ? "success" : "info"
          );
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Erro", "Não foi possível atualizar visibilidade.", "error");
      } finally {
        this.modalidadeParaExibir = "";
        this.modalidadeParaOcultar = "";
      }
    },

    deixarVisivel(modalidadeId) {
      this.alterarVisibilidade(modalidadeId, true);
    },

    ocultar(modalidadeId) {
      this.alterarVisibilidade(modalidadeId, false);
    },

    capitalizar(str) {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
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
  display: flex;
  flex-direction: column;
}

.label-dropdown {
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.dropdown {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.mensagem-alerta {
  color: red;
  font-size: 13px;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
  background-color: #3b82f6;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color:  #152147;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
