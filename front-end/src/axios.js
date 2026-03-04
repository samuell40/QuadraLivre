import axios from 'axios';
import Swal from 'sweetalert2';
import router from './router';

const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: 'https://quadra-livre-backend.onrender.com',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.requiresAuth && isDev) {
      console.warn('Token nao encontrado. A requisicao autenticada pode falhar.');
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const silent = Boolean(error.config?.silent);

    if (error.response) {
      const status = error.response.status;
      const msg =
        error.response.data?.message ||
        error.response.data?.erro ||
        error.response.data?.error ||
        error.response.data?.detalhes ||
        'Ocorreu um erro inesperado.';

      if (silent) {
        if (isDev) {
          console.warn('Requisicao silenciosa falhou:', status, msg);
        }
        return Promise.reject(error);
      }

      if (status === 401) {
        console.error('Erro de autenticacao:', msg);
        Swal.fire({ icon: 'error', title: 'Erro de autenticacao', text: msg });
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
        console.error('Erro de validacao:', msg);
        Swal.fire({ icon: 'warning', title: 'Erro de validacao', text: msg });
      } else {
        console.error('Erro da API:', msg);
        Swal.fire({ icon: 'error', title: 'Erro', text: msg });
      }
    } else {
      if (silent) {
        if (isDev) {
          console.warn('Requisicao silenciosa sem resposta:', error.message);
        }
        return Promise.reject(error);
      }

      console.error('Erro inesperado:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Erro de conexao',
        text: 'Verifique sua internet e tente novamente.'
      });
    }

    return Promise.reject(error);
  }
);

export default api;
