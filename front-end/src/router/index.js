import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DashboardView from '@/views/DashboardView.vue';
import AgendamentosView from '../views/AgendamentosView.vue';
import NaoAutorizado from '@/views/NaoAutorizado.vue';
import CadastroView from '../views/CadastroView.vue';
import CadastrarQuadraView from '../views/CadastrarQuadraView.vue';
import GerenciarQuadrasView from '@/views/GerenciarQuadrasView.vue';
import VisualizarPlacarView from '@/views/quadra_play/VisualizarPlacarView.vue';
import GerenciarPartidaView from '@/views/quadra_play/GerenciarPartidaView.vue';
import UsuariosView from '../views/UsuariosView';
import MeusAgendamentosView from '../views/usuario/MeusAgendamentosView.vue';
import AgendarQuadrasView from '@/views/usuario/AgendarQuadrasView.vue';
import AgendarQuadrasAdmView from '@/views/AgendarQuadrasAdmView.vue';
import HorariosView from '@/views/HorariosView.vue';
import GoogleCallback from '@/views/GoogleCallback.vue';
import GerenciartimesView from '@/views/GerenciartimesView.vue';
import GerenciarModalidadesView from '@/views/GerenciarModalidadesView.vue';
import GerenicarCampeonatosView from '@/views/quadra_play/GerenciarCampeonatosView.vue';
import MeusAvisosView from '../views/usuario/MeusAvisosView.vue';

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
    path: '/agendamentos',
    name: 'Agendamentos',
    component: AgendamentosView,
    meta: { public: true, roles: [2] },
  },
  {
    path: '/agendarquadra',
    name: 'agendar_quadra',
    component: AgendarQuadrasView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/agendarquadrasadm',
    name: 'agendar_quadra_adm',
    component: AgendarQuadrasAdmView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/meusagendamentos',
    name: 'meus_agendamentos',
    component: MeusAgendamentosView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/meusavisos',
    name: 'meus_avisos',
    component: MeusAvisosView,
    meta: { requiresAuth: true, roles: [3] },
  },
  {
    path: '/cadastrarquadra',
    name: 'cadastrar_quadra',
    component: CadastrarQuadraView,
    meta: { requiresAuth: true, roles: [1, 2] },
  },
  {
    path: '/gerenciarquadras',
    name: 'gerenciar_quadras',
    component: GerenciarQuadrasView,
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
    component: () => import('@/views/quadra_play/PartidaView.vue'),
    meta: { requiresAuth: true, roles: [1, 2, 4]}
  },
    {
    path: '/visualizarplacar',
    name: 'visualizar_placar',
    component: VisualizarPlacarView,
    meta: { requiresAuth: true, roles: [1, 2, 4] },
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true, roles: [1, 2] },
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
  },
  {
    path: '/horarios',
    name: 'Horarios',
    component: HorariosView,
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