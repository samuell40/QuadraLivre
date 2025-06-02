<template>
  <div class="login">

    <div class="img-container">
      <img :src="backgroundLogin" class="background-img" alt="Imagem de fundo">
    </div>

    <div class="form-container">
      <form class="form-menu" @submit.prevent="loginUsuario">
        <div class="form-header">
          <label class="form-title">Quadra Livre</label>
        </div>

        <div class="form-body">
          <div class="input-group">
            <label>E-mail</label>
            <input type="email" id="email" v-model="email" placeholder="Digite seu e-mail" required />
          </div>

          <div class="input-group">
            <label>Senha</label>
            <input type="password" id="password" v-model="password" placeholder="Digite sua senha" required />
          </div>

          <button type="submit" class="login-button">Entrar</button>

          <div class="links-group">
            <a href="/recuperar-senha">Esqueceu a senha?</a>
            <span>|</span>
            <a href="/cadastro">Criar conta</a>
          </div>
        </div>
      </form>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import backgroundLogin from '@/assets/backgroundLogin.png';

export default {
  name: 'LoginView',
  data() {
    return {
      backgroundLogin,
      email: '',
      password: '',
      errorMessage: '',
    };
  },
  methods: {
    async loginUsuario() {
      try {
        this.errorMessage = '';

        const response = await axios.post('http://localhost:3000/login', {
          email: this.email,
          senha: this.password,
        });

        const usuario = response.data.usuario;

        console.log('Usuário logado:', usuario);

        localStorage.setItem('usuario', JSON.stringify(usuario));

        this.$router.push('/dashboard');
      } catch (error) {
        this.errorMessage = error.response?.data?.erro || 'Erro ao fazer login';
        console.error('Erro no login:', error);
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.login {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #0B132B;
  font-family: 'Montserrat', sans-serif;
  color: white;
}

.img-container {
  width: 50%;
  margin: 0;
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-container {
  width: 50%;
  height: 100vh;
  margin: 0;
  background-color: #0B132B;
  align-content: center;
  justify-items: center;
}

.form-menu {
  width: 80%;
  height: 70vh;
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
}

.form-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
}   

.input-group {
  display: flex;
  flex-direction: column;
  width: 80%;
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
  margin-bottom: 2rem;
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

.login-button {
  background-color: #1E3A8A;
  padding: 10px;
  width: 80%;
  color: white;
  font-weight: bold;
  border: 0;
  border-radius: 5px;
  margin-bottom: 2rem;
}

.login-button:hover {
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

.links-group a:hover {
  text-decoration: underline;
}

.links-group span {
  color: white;
}

@media (max-width: 768px) {
  .login {
    flex-direction: column;
  }

  .img-container {
    width: 100%;
    height: 200px;
  }

  .form-container {
    width: 100%;
    height: auto;
    padding: 2rem 0;
  }

  .form-menu {
    width: 90%;
  }
}

</style>
