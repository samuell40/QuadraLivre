<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos da Minha Quadra</h1>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else-if="agendamentos.length === 0">
        Nenhum agendamento encontrado para sua quadra.
      </div>

      <div v-else class="agendamentos">
        <AgendamentoCard
          v-for="ag in agendamentos"
          :key="ag.id"
          :agendamento="ag"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import AgendamentoCard from '@/components/cards/AgendamentoCard.vue';
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'AgendamentosView',
  components: { SideBar, AgendamentoCard },
  data() {
    return {
      agendamentos: [],
      isLoading: true,
    };
  },
  mounted() {
    this.carregarAgendamentos();
  },
  methods: {
    async carregarAgendamentos() {
      this.isLoading = true;
      try {
        // Chama endpoint que retorna agendamentos da quadra do usuário logado
        const response = await api.get('/agendamentos/minha-quadra');
        this.agendamentos = response.data;
      } catch (err) {
        console.error('Erro ao carregar agendamentos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao carregar agendamentos da quadra.'
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  background-color: #f2f2f2;
  margin-left: 250px;
}

.agendamentos {
  margin-top: 20px;
}

h1 {
  color: #3B82F6;
  font-weight: bold;
  font-size: 30px;
}
</style>
