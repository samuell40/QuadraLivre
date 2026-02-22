import axios from 'axios';
import Swal from 'sweetalert2';
import router from './router';

const api = axios.create({
  baseURL: ' http://localhost:3000',
 // baseURL: 'https://quadra-livre-backend.onrender.com',
});

// Interceptor para adicionar o token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Token não encontrado. A requisição pode falhar.');
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg =
        error.response.data?.message ||
        error.response.data?.erro ||
        error.response.data?.detalhes ||
        'Ocorreu um erro inesperado.';
      if (status === 401) {
        console.error('Erro de autenticação:', msg);
        Swal.fire({ icon: 'error', title: 'Erro de autenticação', text: msg });
        const rotaAtual = router.currentRoute?.value?.fullPath;
        if (rotaAtual && rotaAtual !== '/NaoAutorizado') {
          router.push({ name: 'NaoAutorizado', query: { redirect: rotaAtual } });
        } else {
          router.push({ name: 'NaoAutorizado' });
        }
      } else if (status === 403) {
        console.error('Acesso negado:', msg);
        Swal.fire({ icon: 'error', title: 'Acesso negado', text: msg });
      } else if (status === 422) {
        console.error('Erro de validação:', msg);
        Swal.fire({ icon: 'warning', title: 'Erro de validação', text: msg });
      } else {
        console.error('Erro da API:', msg);
        Swal.fire({ icon: 'error', title: 'Erro', text: msg });
      }
    } else {
      console.error('Erro inesperado:', error.message);
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
