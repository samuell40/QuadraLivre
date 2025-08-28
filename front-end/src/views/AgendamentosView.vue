<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos da Minha Quadra</h1>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="agendamentosPendentes.length === 0">
          Nenhum agendamento pendente.
        </div>
        <div v-else class="agendamentos">
          <h2>Agendamentos Pendentes</h2>
          <AgendamentoCard
            v-for="ag in agendamentosPendentes"
            :key="ag.id"
            :agendamento="ag"
            @atualizar="carregarAgendamentos"
          />
        </div>

        <div v-if="agendamentosProcessados.length > 0" class="agendamentos-processados">
          <h2>Agendamentos Processados</h2>
          <AgendamentoCard
            v-for="ag in agendamentosProcessados"
            :key="ag.id"
            :agendamento="ag"
            :readonly="true"
          />
        </div>
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
  computed: {
    agendamentosPendentes() {
      return this.agendamentos.filter(a => a.status === 'Pendente');
    },
    agendamentosProcessados() {
      return this.agendamentos.filter(a => a.status !== 'Pendente');
    }
  },
  mounted() {
    this.carregarAgendamentos();
  },
  methods: {
    async carregarAgendamentos() {
      this.isLoading = true;
      try {
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

.agendamentos-processados {
  margin-top: 40px;
}

h1 {
  color: #3B82F6;
  font-weight: bold;
  font-size: 30px;
}

h2 {
  color: #3B82F6;
  margin-bottom: 16px;
}
</style>
