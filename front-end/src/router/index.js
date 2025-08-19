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
    meta: { public: true },
  },
  {
    path: '/agendamentos',
    name: 'Agendamentos', 
    component: AgendamentosView,
    meta: { requiresAuth: true, roles: [43, 44] }, 
  },
  {
    path: '/agendarquadra',
    name: 'agendar_quadra',
    component: AgendarQuadrasView,
    meta: { requiresAuth: true, roles: [45] }, 
  },
  {
    path: '/meusagendamentos',
    name: 'meus_agendamentos',
    component: MeusAgendamentosView,
    meta: { requiresAuth: true, roles: [45] }, 
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
    meta: { requiresAuth: true, roles: [43, 44] }, 
  },
  {
    path: '/controleplacar',
    name: 'controle_placar',
    component: ControlePlacarView,
    meta: { requiresAuth: true, roles: [43, 44] }, 
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true, roles: [43, 44] }, 
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
    meta: { public: true },
  },
  {
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroView,
    meta: { public: true },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  if (to.meta.requiresAuth && !token) {
    return next({ name: 'NaoAutorizado' });
  }

  if (to.meta.roles && usuario) {
    if (!to.meta.roles.includes(usuario.permissaoId)) {
      return next({ name: 'NaoAutorizado' });
    }
  }

  next();
});

export default router;