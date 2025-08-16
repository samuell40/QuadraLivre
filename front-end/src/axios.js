import axios from 'axios';
import Swal from 'sweetalert2';
import router from './router';

const api = axios.create({
  baseURL: 'https://quadra-livre-backend.onrender.com',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.error("Erro de autenticação:", error.response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Erro de autenticação',
          text: error.response.data.message || 'Sua autenticação falhou, refaça seu login.'
        });
        router.push('/login');
      } else if (status === 403) {
        console.error("Acesso negado:", error.response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Acesso negado',
          text: error.response.data.message || 'Você não tem permissão para acessar este recurso.'
        });
      } else {
        console.error("Erro da API:", error.response.data.message);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: error.response.data.message || 'Ocorreu um erro inesperado.'
        });
      }
    } else {
      console.error("Erro inesperado:", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erro de conexão',
        text: 'Verifique sua internet e tente novamente.'
      });
    }
    return Promise.reject(error);
  }
);

export default api;
