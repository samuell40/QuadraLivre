<template>
  <div class="cadastro">
    <div class="form-container">
      <form class="form-menu" @submit.prevent="cadastrarUsuario">
        <div class="form-header">
          <label class="header-title">Quadra Livre</label>
        </div>

        <div class="title-container">
          <label class="form-title">Cadastrar-se</label>
        </div>

        <div class="form-body">
          <div class="input-group">
            <label>Email</label>
            <input type="email" v-model="form.email" readonly />
          </div>

          <div class="input-group">
            <label>Nome</label>
            <input type="text" v-model="form.nome" placeholder="Digite seu nome" required />
          </div>

          <div class="input-group">
            <label>Telefone</label>
            <input type="tel" v-model="form.telefone" placeholder="Digite seu telefone" @input="formatarTelefone" />
          </div>

          <div class="input-group">
            <label>Foto</label>
            <input type="file" id="imagem" @change="handleFileChange" accept=".jpg, .jpeg, .png">
          </div>

          <button type="submit" class="cadastro-button">Realizar Cadastro</button>

        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  data() {
    return {
      form: {
        nome: '',
        email: '',
        telefone: '',
        imagem: null,
      },
    };
  },
  mounted() {
    const emailFromQuery = this.$route.query.email;

    if (emailFromQuery) {
      this.form.email = emailFromQuery;
      localStorage.setItem('emailCadastro', emailFromQuery);
    } else {
      const emailSalvo = localStorage.getItem('emailCadastro');
      if (emailSalvo) {
        this.form.email = emailSalvo;
      }
    }
  },
  methods: {
    async cadastrarUsuario() {
      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          const uploadResponse = await api.post('/upload', formData);
          urlImagem = uploadResponse.data.fileUrl;
        } else {
          urlImagem = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';
        }

        await api.post('/cadastrar/usuario', {
          nome: this.form.nome,
          email: this.form.email,
          telefone: this.form.telefone,
          foto: urlImagem,
        });

        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Usuário cadastrado com sucesso!',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.$router.push('/');
        });

        this.form = {
          nome: '',
          email: '',
          telefone: '',
          imagem: null,
        };
        document.getElementById('imagem').value = null;
        localStorage.removeItem('emailCadastro');

      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.response?.data?.error || 'Erro ao cadastrar usuário. Tente novamente.',
        });
      }
    },

    handleFileChange(event) {
      this.form.imagem = event.target.files[0];
    },

    formatarTelefone(event) {
      let input = event.target;
      let valor = input.value.replace(/\D/g, '');

      if (!valor) {
        this.form.telefone = '';
        return;
      }

      if (valor.length > 11) valor = valor.slice(0, 11);

      let telefoneFormatado = '';
      if (valor.length <= 2) {
        telefoneFormatado = `(${valor}`;
      } else if (valor.length <= 6) {
        telefoneFormatado = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
      } else if (valor.length <= 10) {
        telefoneFormatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 6)}-${valor.slice(6)}`;
      } else {
        telefoneFormatado = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
      }

      this.form.telefone = telefoneFormatado;
    }
  }
}  
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.cadastro {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #0B132B;
  font-family: 'Montserrat', sans-serif;
  color: white;
}

.form-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  background-color: #0B132B;
  align-content: center;
  justify-items: center;
}

.form-menu {
  width: 90%;
  height: 95vh;
  background-color: #0F1835;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form-header {
  width: 100%;
  height: 66px;
  background-color: #152147;
  border-radius: 15px 15px 0 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.header-title {
  font-size: 28px;
  font-weight: bold;
}

.form-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-container {
  width: 90%;
  display: flex;
  justify-content: flex-start;
  padding-left: 5%;
  box-sizing: border-box;
  margin-top: -20px;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-bottom: 2rem;
}

.input-group label {
  font-weight: bold;
  margin-bottom: 5px;
  box-sizing: border-box;
}

.input-group input {
  background-color: #0F1835;
  padding: 10px;
  border-radius: 5px !important;
  border: 1px solid #3B82F6;
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.input-group input:hover {
  background-color: #172144;
}

.input-group input::placeholder {
  color: white;
  opacity: 1;
}

.input-group input[type="file"] {
  text-align: right;
  width: 100%;
  box-sizing: border-box;
}

.cadastro-button {
  background-color: #1E3A8A;
  padding: 10px;
  width: 90%;
  color: white;
  font-weight: bold;
  border: 0;
  border-radius: 5px;
  margin-bottom: 1rem;
}

.cadastro-button:hover {
  background-color: #2C4FAA;
}
</style>