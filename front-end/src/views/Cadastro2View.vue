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
            <input type="email" v-model="form.email" placeholder="Digite seu Email" required />
          </div>

          <div class="input-group">
            <label>Nome</label>
            <input type="text" v-model="form.nome" placeholder="Digite seu nome" required />
          </div>

          <div class="input-group">
            <label>Telefone</label>
            <input type="tel" v-model="form.telefone" placeholder="Digite seu telefone" />
          </div>

          <div class="input-group">
            <label>Foto</label>
            <input type="file" id="imagem" @change="handleFileChange" />
          </div>

          <button type="submit" class="cadastro-button">Realizar Cadastro</button>

          <div class="links-group">
            <a href="/login">Já tem uma conta?</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

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
  methods: {
    async cadastrarUsuario() {
      try {
        let urlImagem = null;

        if (this.form.imagem) {
          const formData = new FormData();
          formData.append('file', this.form.imagem);

          const uploadResponse = await fetch('https://quadra-livre-backend.onrender.com/upload', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Erro ao enviar imagem');
          }

          const uploadData = await uploadResponse.json();
          urlImagem = uploadData.fileUrl;
        } else {
          urlImagem = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';
        }

        const response = await fetch('https://quadra-livre-backend.onrender.com/cadastrar/usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: this.form.nome,
            email: this.form.email, // envia o email preenchido automaticamente
            telefone: this.form.telefone,
            foto: urlImagem,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar usuário');
        }

        Swal.fire({
          icon: 'success',
          title: 'Sucesso!',
          text: 'Usuário cadastrado com sucesso!',
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          this.$router.push('/controleplacar'); 
        });

        this.form = {
          nome: '',
          email: '',
          telefone: '',
          imagem: null,
        };

        document.getElementById('imagem').value = null;
        localStorage.removeItem('emailCadastro'); // limpa o email após cadastro

      } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);

        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Erro ao cadastrar usuário. Tente novamente.',
        });
      }
    },

    handleFileChange(event) {
      this.form.imagem = event.target.files[0];
    },
  },
};
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

.email {
  background-color: #0F1835;
  padding: 10px;
  border-radius: 5px !important;
  border: 1px solid #3B82F6;
  color: white;
  width: 100%;
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


.data-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  width: 90%;
  margin-bottom: 2rem;
}

.data-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.data-group label {
  font-weight: bold;
  margin-bottom: 5px;
  box-sizing: border-box;
}

.data-group input {
  background-color: #0F1835;
  padding: 10px;
  border-radius: 5px !important;
  border: 1px solid #3B82F6;
  color: white;
  width: 100%;
  box-sizing: border-box;
}

.data-group input:hover {
  background-color: #172144;
}

.data-group input::placeholder {
  color: white;
  opacity: 1;
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

.links-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
}

.links-group a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.links-group:hover {
  text-decoration: underline;
}

.links-group span {
  color: white;
}
</style>