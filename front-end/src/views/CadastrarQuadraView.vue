<template>
  <div class="cadastro_quadra">
    <SideBar />
    <div class="container">
      <h1>Cadastrar Quadra</h1>

      <form @submit.prevent="cadastrarQuadra">
        <div class="form-group">
          <label for="nome">Nome:</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>

        <div class="form-group">
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" v-model="form.endereco" required />
        </div>

        <div class="form-group">
          <label>Modalidades:</label>
          <div class="form-group modalidades-group">
            <div v-if="modalidades.length === 0" class="mensagem-modalidade-vazia">
              Nenhuma modalidade encontrada.
            </div>
            <div v-else class="checkbox-list">
              <div
                v-for="modalidade in modalidades"
                :key="modalidade.id"
                class="checkbox-item"
              >
                <input
                  type="checkbox"
                  :id="'modalidade-' + modalidade.id"
                  :value="modalidade.id"
                  v-model="form.modalidadesSelecionadas"
                  @change="erroModalidade = false"
                />
                <label :for="'modalidade-' + modalidade.id">
                  {{ formatarNomeModalidade(modalidade.nome) }}
                </label>
              </div>
            </div>
            <p v-if="erroModalidade" class="erro-modalidade">
              ⚠️ Selecione pelo menos uma modalidade!
            </p>
          </div>
        </div>

        <!-- Upload da imagem -->
        <div class="form-group" id="adicionar_imagem">
          <label for="imagem">Imagem:</label>
          <input type="file" id="imagem" @change="handleFileChange" accept=".jpg, .jpeg, .png" required />
        </div>

        <button type="submit" class="btn_cadastrarquadra">
          Cadastrar Quadra
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  components: {
    SideBar,
  },
  data() {
    return {
      modalidades: [],
      form: {
        nome: '',
        endereco: '',
        imagem: null,
        modalidadesSelecionadas: [],
      },
      erroModalidade: false,
      previewUrl: null,
    };
  },
  mounted() {
    this.carregarModalidades();
  },
  methods: {
    async carregarModalidades() {
      try {
        const res = await api.get('/modalidade');
        this.modalidades = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async cadastrarQuadra() {
      if (this.form.modalidadesSelecionadas.length === 0) {
        this.erroModalidade = true;
        return;
      }

      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          const uploadResponse = await api.post('/upload', formData);
          urlImagem = uploadResponse.data.fileUrl;
        }

        const modalidadesFormatadas = this.form.modalidadesSelecionadas.map(id => ({ id }));

        await api.post('/quadra', {
          nome: this.form.nome,
          endereco: this.form.endereco,
          foto: urlImagem,
          modalidades: modalidadesFormatadas,
        });

        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Quadra cadastrada com sucesso!',
          timer: 2000,
          showConfirmButton: false,
        });

        this.form = {
          nome: '',
          endereco: '',
          imagem: null,
          modalidadesSelecionadas: [],
        };
        document.getElementById('imagem').value = null;
        this.previewUrl = null;
        this.erroModalidade = false;
      } catch (error) {
        console.error('Erro ao cadastrar quadra:', error);

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.response?.data?.error || 'Erro ao cadastrar quadra. Tente novamente.',
        });
      }
    },

    handleFileChange(event) {
      this.form.imagem = event.target.files[0];
      this.previewUrl = this.form.imagem
        ? URL.createObjectURL(this.form.imagem)
        : null;
    },

    formatarNomeModalidade(nome) {
      return nome
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, letra => letra.toUpperCase());
    },
  },
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cadastro_quadra {
  margin-left: 250px;
  padding: 20px 55px;
  border-radius: 20px;
}

h1 {
  font-size: 30px;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  margin-bottom: 30px;
  margin-top: 20px;
  margin-left: 2px;
  color: #3b82f6;
}

form {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 10px;
}

.form-group input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: 'Montserrat', sans-serif;
  box-sizing: border-box;
  resize: none;
}

.btn_cadastrarquadra {
  padding: 10px;
  background-color: #3b82f6;
  border: none;
  border-radius: 4px;
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

input[type='file'] {
  font-size: 14px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

#adicionar_imagem {
  grid-column: 1 / -1;
  margin-top: -20px;
}

.checkbox-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px 15px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-direction: row-reverse;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 8px;
  cursor: pointer;
}

.checkbox-item label {
  width: 150px;
  display: inline-block;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  word-break: break-word;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
}

.erro-modalidade {
  color: #d9534f;
}

@media screen and (max-width: 768px) {
  .cadastro_quadra {
    margin-left: 0;
    padding: 15px;
  }

  .container {
    padding: 0;
  }

  h1 {
    font-size: 24px;
  }

  .checkbox-list {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
