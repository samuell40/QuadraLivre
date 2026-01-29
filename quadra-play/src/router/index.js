import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '@/views/DashboardView.vue';
import NaoAutorizado from '@/views/NaoAutorizado.vue';
import VisualizarPlacarView from '@/views/VisualizarPlacarView.vue';
import GerenciarPartidaView from '@/views/GerenciarPartidaView.vue';
import GoogleCallback from '@/views/GoogleCallback.vue';
import GerenciartimesView from '@/views/GerenciartimesView.vue';
import GerenciarModalidadesView from '@/views/GerenciarModalidadesView.vue';
import GerenicarCampeonatosView from '@/views/GerenciarCampeonatosView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/gerenciartimes',
    name: 'gerenciar_times',
    component: GerenciartimesView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/gerenciarpartida',
    name: 'gerenciar_partida',
    component: GerenciarPartidaView,
    meta: { requiresAuth: true, roles: [1, 2, 4] },
  },
  {
    path: '/partida',
    name: 'Partida',
    component: () => import('@/views/PartidaView.vue'),
    meta: { requiresAuth: true, roles: [1, 2, 4]}
  },
    {
    path: '/visualizarplacar',
    name: 'visualizar_placar',
    component: VisualizarPlacarView,
    meta: { requiresAuth: true, roles: [1, 2, 4] },
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
    path: '/modalidades',
    name: 'Modalidades',
    component: GerenciarModalidadesView,
    meta: { public: true },
  },
  {
    path: '/campeonatos',
    name: 'Campeonatos',
    component: GerenicarCampeonatosView,
    meta: { public: true },
  },
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