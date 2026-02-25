import api from '@/axios';

const STATUS_EM_ANDAMENTO = 'EM_ANDAMENTO';

function filtrarCampeonatosEmAndamento(campeonatos) {
  if (!Array.isArray(campeonatos)) return [];
  return campeonatos.filter(campeonato => campeonato?.status === STATUS_EM_ANDAMENTO);
}

export async function redirecionarMesarioPosLogin(router) {
  try {
    const { data } = await api.get('/campeonatos/mesario/andamento');
    const campeonatos = filtrarCampeonatosEmAndamento(data);

    if (campeonatos.length === 1 && campeonatos[0]?.id) {
      await router.push({
        name: 'Detalhar_Campeonatos',
        query: { id: campeonatos[0].id }
      });
      return;
    }
  } catch (error) {
    console.error('Erro ao resolver redirecionamento do mesario:', error);
  }

  await router.push({ name: 'TelaInicial' });
}
