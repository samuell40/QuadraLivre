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

        <!-- Campo para selecionar modalidades -->
        <div class="form-group">
          <label>Modalidades:</label>
          <div class="checkbox-list">
            <div v-for="modalidade in modalidades" :key="modalidade.id" class="checkbox-item">
              <input type="checkbox" :id="'modalidade-' + modalidade.id" :value="modalidade.id"
                v-model="form.modalidadesSelecionadas" />
              <label :for="'modalidade-' + modalidade.id">
                {{ modalidade.nome }}
              </label>
            </div>
          </div>
        </div>

        <!-- Upload da imagem -->
        <div class="form-group" id="adicionar_imagem">
          <label for="imagem">Imagem:</label>
          <input type="file" id="imagem" @change="handleFileChange" />
        </div>

        <button type="submit" class="btn_cadastrarquadra"
          :disabled="!form.imagem || form.modalidadesSelecionadas.length === 0">
          Cadastrar Quadra
        </button>
      </form>

      <img v-if="previewUrl" :src="previewUrl" alt="Prévia da imagem" style="max-width: 200px; margin-top: 10px;" />
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';
import axios from 'axios';

export default {
  components: {
    SideBar,
  },
  data() {
    return {
      modalidades: [], // Modalidades carregadas da API
      form: {
        nome: '',
        endereco: '',
        imagem: null,
        modalidadesSelecionadas: [], // Array com ids das modalidades selecionadas
      },
      previewUrl: null,
    };
  },
  mounted() {
    this.carregarModalidades();
  },
  methods: {

    async carregarModalidades() {
      try {
        const res = await axios.get('https://quadra-livre-backend.onrender.com/modalidade');
        this.modalidadesDisponiveis = res.data;
      } catch (error) {
        console.error('Erro ao carregar modalidades:', error);
        Swal.fire('Erro', 'Não foi possível carregar as modalidades.', 'error');
      }
    },

    async cadastrarQuadra() {
      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          const uploadResponse = await fetch(
            'https://quadra-livre-backend.onrender.com/upload',
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!uploadResponse.ok) {
            throw new Error('Erro ao enviar imagem');
          }

          const uploadData = await uploadResponse.json();
          urlImagem = uploadData.fileUrl;
        }

        const response = await fetch(
          'https://quadra-livre-backend.onrender.com/quadra',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome: this.form.nome,
              endereco: this.form.endereco,
              foto: urlImagem,
              modalidades: this.form.modalidadesSelecionadas,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Erro ao cadastrar quadra');
        }

        await response.json();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Quadra cadastrada com sucesso!',
          timer: 2000,
          showConfirmButton: false,
        });

        // Resetar formulário
        this.form = {
          nome: '',
          endereco: '',
          imagem: null,
          modalidadesSelecionadas: [],
        };
        document.getElementById('imagem').value = null;
        this.previewUrl = null;
      } catch (error) {
        console.error('Erro ao cadastrar quadra:', error);

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao cadastrar quadra. Tente novamente.',
        });
      }
    },

    handleFileChange(event) {
      this.form.imagem = event.target.files[0];
      this.previewUrl = this.form.imagem
        ? URL.createObjectURL(this.form.imagem)
        : null;
    },
  },
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cadastro_quadra {
  margin-left: 250px;
  padding: 20px 55px;
  border-radius: 20px;
}

h1 {
  font-size: 30px;
  font-family: "Montserrat", sans-serif;
  font-weight: bold;
  margin-bottom: 50px;
  margin-top: 20px;
  margin-left: 2px;
  color: #3B82F6;
}

form {
  display: grid;
  gap: 25px;
  margin-top: 20px;
  align-items: start;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
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
  background-color: #3B82F6;
  border: none;
  border-radius: 4px;
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  cursor: pointer;
  width: 100%;
  margin-top: 10px;
}

input[type="file"] {
  font-size: 14px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

#adicionar_imagem {
  grid-column: 1 / -1;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  @media (max-width: 768px) {
    .cadastro_quadra {
      margin-left: 0;
      padding: 20px 15px;
    }

    form {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      font-size: 14px;
    }

    .form-group input,
    select,
    textarea {
      font-size: 14px;
      padding: 6px 8px;
    }

    .btn_cadastrarquadra {
      font-size: 14px;
      padding: 10px;
    }

    #adicionar_imagem {
      grid-column: auto;
    }

    img {
      max-width: 100%;
      height: auto;
    }
  }

}
</style>
