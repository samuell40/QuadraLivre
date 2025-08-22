<template>
  <div class="modal-overlay" v-if="aberto">
    <div class="modal-content">
      <h2>Controle de Visibilidade</h2>

        <div v-if="carregando" class="loading-wrapper">
        <div class="spinner"></div>
      </div>

      <div v-else>
         <p class="mensagem-alerta">
        ATENÇÃO: esta configuração altera a exibição dos placares na tela inicial (HOME).
      </p>
        <div class="form-group">
          <label for="visivel-dropdown" class="label-dropdown">Deixar Visível</label>
          <select
            id="visivel-dropdown"
            v-model="modalidadeParaExibir"
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

        <!-- Botões Fechar e Salvar -->
        <div class="buttons">
          <button class="btn-save" @click="salvar">Salvar</button>
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
      carregando: false,
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
      this.carregando = true;
      try {
        const res = await api.get("/visibilidade");
        this.modalidades = res.data;
        this.modalidadeParaExibir = "";
        this.modalidadeParaOcultar = "";
      } catch (error) {
        console.error("Erro ao carregar modalidades:", error);
        Swal.fire("Erro", "Não foi possível carregar as modalidades.", "error");
      } finally {
        this.carregando = false;
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
      }
    },

    salvar() {
      if (this.modalidadeParaExibir) this.alterarVisibilidade(this.modalidadeParaExibir, true);
      if (this.modalidadeParaOcultar) this.alterarVisibilidade(this.modalidadeParaOcultar, false);
      this.modalidadeParaExibir = "";
      this.modalidadeParaOcultar = "";
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
  padding: 15px;
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.modal-content h2 {
  margin-bottom: 15px;
  color: #3b82f6;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.label-dropdown {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.dropdown {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.mensagem-alerta {
  color: red;
  font-size: 13px;
  margin-bottom: 15px;
}

.buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-cancel,
.btn-save {
  flex: 1;
  min-width: 100px;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: white;
}

.btn-cancel {
  background-color: #7E7E7E ;
}

.btn-save {
  background-color: #3b82f6;
}

.loading-wrapper {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }

  .modal-content h2 {
    font-size: 1.4rem;
  }

  .dropdown {
    font-size: 14px;
    padding: 10px;
  }

  .btn-cancel,
  .btn-save {
    font-size: 15px;
    padding: 10px 0;
  }
}
</style>