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
          <label for="descricao">Descrição:</label>
          <input type="text" id="descricao" v-model="form.descricao" required />
        </div>

        <div class="form-group">
          <label for="endereco">Endereço:</label>
          <input type="text" id="endereco" v-model="form.endereco" required />
        </div>

        <!-- Upload da imagem -->
        <div class="form-group" id="adicionar_imagem">
          <label for="imagem">Imagem:</label>
          <input type="file" id="imagem" @change="handleFileChange" />
        </div>


        <button type="submit" class="btn_cadastrarquadra" :disabled="!form.imagem">Cadastrar Quadra</button>
      </form>

      <img v-if="previewUrl" :src="previewUrl" alt="Prévia da imagem" style="max-width: 200px; margin-top: 10px;" />
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import Swal from 'sweetalert2';

export default {
  components: {
    SideBar,
  },
  data() {
    return {
      form: {
        nome: '',
        descricao: '',
        endereco: '',
        imagem: null,
      },
    };
  },
  methods: {
    async cadastrarQuadra() {
      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          // Faz upload da imagem primeiro
          const uploadResponse = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Erro ao enviar imagem');
          }

          const uploadData = await uploadResponse.json();
          urlImagem = uploadData.fileUrl;
        }

        // Agora cadastra a quadra com a URL da imagem
        const response = await fetch('http://localhost:3000/quadra', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: this.form.nome,
            descricao: this.form.descricao,
            endereco: this.form.endereco,
            foto: urlImagem,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar quadra');
        }

        const data = await response.json();

        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Quadra cadastrada com sucesso!',
          timer: 2000,
          showConfirmButton: false,
        });

        console.log(data);

        this.form = {
          nome: '',
          descricao: '',
          endereco: '',
          imagem: null,
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

    }
  }
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

@media (max-width: 768px) {
  .cadastro_quadra {
    padding: 10px;
  }

  h1 {
    font-size: 24px;
    text-align: center;
  }

  .btn_cadastrarquadra {
    font-size: 14px;
  }
}
</style>
