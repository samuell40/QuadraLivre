<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Adicionar Função</h2>

      <form @submit.prevent="cadastrarFuncao">
        <div class="form-group">
          <label for="modalidade">Modalidade</label>
          <select 
            id="modalidade" 
            v-model="modalidadeSelecionada" 
            required
          >
            <option value="" disabled>Selecione uma modalidade</option>
            <option 
              v-for="m in modalidades" 
              :key="m.id" 
              :value="m.id"
            >
              {{ m.nome }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="novaFuncao">Nome da Função</label>
          <input 
            type="text" 
            id="novaFuncao" 
            v-model="novaFuncao" 
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
import Swal from 'sweetalert2'
import api from '@/axios'

export default {
  name: 'AdicionarFuncaoModal',

  props: {
    aberto: Boolean
  },

  data() {
    return {
      novaFuncao: "",
      modalidades: [],
      modalidadeSelecionada: ""
    }
  },

  watch: {
    aberto(novo) {
      if (novo) {
        this.novaFuncao = ""
        this.modalidadeSelecionada = ""
        this.carregarModalidades()
      }
    }
  },

  methods: {
    async carregarModalidades() {
      try {
        const { data } = await api.get("/listar/modalidade");
        this.modalidades = data;
      } catch (err) {
        console.error("Erro ao carregar modalidades:", err);
      }
    },

    async cadastrarFuncao() {
      const nome = this.novaFuncao.trim().toLowerCase();

      if (!nome || !this.modalidadeSelecionada) {
        Swal.fire("Atenção", "Preencha todos os campos.", "warning");
        return;
      }

      try {
        await api.post("/adicionar/funcao", {
          nome,
          modalidadeId: this.modalidadeSelecionada
        });

        Swal.fire("Sucesso", "Função cadastrada!", "success");

        this.$emit("atualizar");
        this.$emit("fechar");

      } catch (error) {
        const erro = error.response?.data?.message;
        Swal.fire("Erro", erro, "error");
      }
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
}

input[type='text'],
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