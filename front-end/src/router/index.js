import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentosView from '../views/AgendamentosView.vue';
import LoginView from '../views/LoginView.vue';
import CadastroView from '../views/CadastroView.vue';
import Cadastro2View from '../views/Cadastro2View.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue';
import ControlePlacarView from '../views/ControlePlacarView';
import UsuariosView from '../views/UsuariosView';
import MeusAgendamentosView from '../views/MeusAgendamentosView';
import AgendarQuadrasView from '@/views/AgendarQuadrasView.vue';
import GoogleCallback from '@/views/GoogleCallback.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/agendamentos',
    name: 'Agendamentos',
    component: AgendamentosView,
    meta: { requiresAuth: true }, // rota protegida
  },
  {
    path: '/agendarquadra',
    name: 'agendar_quadra',
    component: AgendarQuadrasView,
    meta: { requiresAuth: true }, // rota protegida
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }, // rota pública
  },
  {
    path: '/google-callback',
    name: 'GoogleCallback',
    component: GoogleCallback,
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView,
    meta: { public: true }, // rota pública
  },
  {
    path: '/cadastro2',
    name: 'Cadastro2',
    component: Cadastro2View,
    meta: { public: true }, // rota pública
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
    meta: { requiresAuth: true }, // rota protegida
  },
  {
    path: '/controleplacar',
    name: 'controle_placar',
    component: ControlePlacarView,
    meta: { requiresAuth: true }, // rota protegida
  },
  {
    path: '/meusagendamentos',
    name: 'meus_agendamentos',
    component: MeusAgendamentosView,
    meta: { requiresAuth: true }, // rota protegida
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true }, // rota protegida
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard global para checar autenticação
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'Login' });
  }

  next();
});

export default router;
