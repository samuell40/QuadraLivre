<template>
  <div class="login">
    <div class="img-container">
      <img :src="backgroundLogin" class="background-img" alt="Imagem de fundo" />
    </div>

    <div class="form-container">
      <form class="form-menu" @submit.prevent>
        <div class="form-header">
          <label class="form-title">Quadra Livre</label>
        </div>

        <div class="form-body">
          <div class="input-group">
            <label>Login:</label>
          </div>
          <button type="button" class="google-button" @click="loginComGoogle">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-google"
              viewBox="0 0 16 16">
              <path
                d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
            </svg>
            <a>Google</a>
          </button>

          <div class="links-group">
            <a>Novo no Quadra Livre?</a>
            <a class="cadastra-se" href="/cadastro2">Cadastre-se!</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import router from '@/router';
import backgroundLogin from '@/assets/backgroundLogin.png';
import Swal from 'sweetalert2';

export default {
  name: 'LoginView',
  data() {
    return {
      backgroundLogin,
    };
  },
  methods: {
    loginComGoogle() {
      const isMobile = /Android/i.test(navigator.userAgent);

      // Se for mobile, redireciona diretamente
      if (isMobile) {
        window.location.href = 'https://quadra-livre-backend.onrender.com/auth/google';
        return;
      }

      // Caso contrário, usa o popup (desktop)
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      const popup = window.open(
        'https://quadra-livre-backend.onrender.com/auth/google',
        'Login com Google',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const listener = (event) => {
        if (event.origin !== 'https://quadra-livre.vercel.app') return;

        const { token, erro, email } = event.data;

        if (erro === 'usuario_nao_cadastrado') {
          Swal.fire({
            icon: 'error',
            title: 'Conta não encontrada!',
            text: 'Redirecionando para a tela de cadastro...',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
          }).then(() => {
            window.location.href = `/cadastro?email=${encodeURIComponent(email)}`;
          });
        }

        if (token) {
          localStorage.setItem('token', token);
          router.push('/agendarquadra');
        }

        window.removeEventListener('message', listener);
        if (popup) popup.close();
      };

      window.addEventListener('message', listener, false);
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
  width: 100%;
  height: 100vh;
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-container {
  width: 67%;
  height: 100vh;
  background-color: #0B132B;
  align-content: center;
  justify-items: center;
}

.form-menu {
  position: absolute;
  top: 50%;
  right: 5%;
  transform: translateY(-50%);
  width: 30%;
  height: 40vh;
  background-color: #0F1835;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.form-header {
  width: 100%;
  height: 66px;
  background-color: #152147;
  border-radius: 15px 15px 0 0;
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

.links-group a.cadastra-se {
  color: #3B82F6;
}

.google-button {
  background-color: #1E3A8A;
  color: #ffffff;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 80%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin: 1rem 0;
  cursor: pointer;
}

.alerta-sucesso {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #22c55e;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
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