import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AgendamentosView from '../views/AgendamentosView.vue';
import NaoAutorizado from '@/views/NaoAutorizado.vue';
import CadastroView from '../views/CadastroView.vue';
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
    meta: { requiresAuth: true }, 
  },
  {
    path: '/agendarquadra',
    name: 'agendar_quadra',
    component: AgendarQuadrasView,
    meta: { requiresAuth: true }, 
  },
   {
    path: '/NaoAutorizado',
    name: 'NaoAutorizado',
    component: NaoAutorizado,
    meta: { public: true }, 
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
    meta: { public: true }, 
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
    meta: { requiresAuth: true },
  },
  {
    path: '/controleplacar',
    name: 'controle_placar',
    component: ControlePlacarView,
    meta: { requiresAuth: true }, 
  },
  {
    path: '/meusagendamentos',
    name: 'meus_agendamentos',
    component: MeusAgendamentosView,
    meta: { requiresAuth: true }, 
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'NaoAutorizado' });
  }

  next();
});

export default router;
