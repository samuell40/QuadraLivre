<template>
  <div class="modal-overlay" v-if="aberto">
    <div class="modal-content">
      <h2>Controle de Visibilidade</h2>
      <p class="mensagem-alerta">ATENÇÃO: esta configuração altera a exibição dos placares na tela inicial (HOME).</p>

      <!-- Dropdown para deixar visível -->
      <div class="form-group">
        <label for="visivel-dropdown" class="label-dropdown">Deixar Visível</label>
        <select id="visivel-dropdown" v-model="modalidadeParaExibir" @change="deixarVisivel(modalidadeParaExibir)"
          class="dropdown">
          <option disabled value="">Selecione uma modalidade</option>
          <option value="todos">Todos Visíveis</option>
          <option v-for="(modalidade, i) in modalidadesOcultas" :key="`exibir-${i}`" :value="modalidade">
            {{ capitalizar(modalidade) }}
          </option>
        </select>
      </div>

      <!-- Dropdown para ocultar -->
      <div class="form-group">
        <label for="ocultar-dropdown" class="label-dropdown">Ocultar</label>
        <select id="ocultar-dropdown" v-model="modalidadeParaOcultar" @change="ocultar(modalidadeParaOcultar)"
          class="dropdown">
          <option disabled value="">Selecione uma modalidade</option>
          <option value="todos">Ocultar Todos</option>
          <option v-for="(modalidade, i) in modalidadesVisiveis" :key="`ocultar-${i}`" :value="modalidade">
            {{ capitalizar(modalidade) }}
          </option>
        </select>
      </div>

      <!-- Botão Fechar -->
      <div class="buttons">
        <button class="btn-cancel" @click="$emit('fechar')">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Swal from "sweetalert2";

export default {
  name: "OcultarPlacar",
  props: {
    aberto: Boolean,
  },
  data() {
    return {
      modalidadesDisponiveis: [],
      visibilidade: {},
      modalidadeParaExibir: "",
      modalidadeParaOcultar: "",
    };
  },
  computed: {
    modalidadesVisiveis() {
      return Object.entries(this.visibilidade)
        .filter(([, vis]) => vis)
        .map(([nome]) => nome);
    },
    modalidadesOcultas() {
      return Object.entries(this.visibilidade)
        .filter(([, vis]) => !vis)
        .map(([nome]) => nome);
    },
  },
  watch: {
    aberto(novoValor) {
      if (novoValor) {
        this.carregarModalidades();
      }
    },
  },
  methods: {
    async carregarModalidades() {
      try {
        const res = await axios.get("https://quadra-livre-backend.onrender.com/modalidade");
        this.modalidadesDisponiveis = res.data;

        this.modalidadesDisponiveis.forEach(({ nome }) => {
          if (!(nome in this.visibilidade)) {
            const vis = JSON.parse(localStorage.getItem(`exibirPlacar_${nome}`) ?? "true");
            this.visibilidade[nome] = vis;
          }
        });
        this.modalidadeParaExibir = "";
        this.modalidadeParaOcultar = "";
      } catch (error) {
        console.error("Erro ao carregar modalidades:", error);
      }
    },
    deixarVisivel(modalidade) {
      if (!modalidade) return;

      if (modalidade === "todos") {
        Object.keys(this.visibilidade).forEach((nome) => {
          this.visibilidade[nome] = true;
          localStorage.setItem(`exibirPlacar_${nome}`, "true");
        });
        Swal.fire("Sucesso!", "Todos os placares estão visíveis.", "success");
      } else {
        this.visibilidade[modalidade] = true;
        localStorage.setItem(`exibirPlacar_${modalidade}`, "true");
        Swal.fire("Visível", `O placar de "${this.capitalizar(modalidade)}" está agora visível.`, "success");
      }

      this.modalidadeParaExibir = "";
    },
    ocultar(modalidade) {
      if (!modalidade) return;

      if (modalidade === "todos") {
        Object.keys(this.visibilidade).forEach((nome) => {
          this.visibilidade[nome] = false;
          localStorage.setItem(`exibirPlacar_${nome}`, "false");
        });
        Swal.fire("Ocultado", "Todos os placares foram ocultados.", "info");
      } else {
        this.visibilidade[modalidade] = false;
        localStorage.setItem(`exibirPlacar_${modalidade}`, "false");
        Swal.fire("Ocultado", `O placar de "${this.capitalizar(modalidade)}" foi ocultado.`, "info");
      }

      this.modalidadeParaOcultar = "";
    },
    capitalizar(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
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
</style>
