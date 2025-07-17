<template>
  <div class="layout">
    <NavBar />

    <div class="conteudo">
      <div class="topo">
        <h1 class="title">Meus Agendamentos</h1>
      </div>

      <div class="agendamentos">
        <MeusAgendamentoCard
          v-for="ag in agendamentos"
          :key="ag.id"
          :agendamento="ag"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import MeusAgendamentoCard from '@/components/cards/MeusAgendamentosCard.vue'

const agendamentos = [
  {
    id: 1,
    quadra: 'Quadra Poliesportiva A',
    data: '25/06/2025',
    hora: '15:00',
    status: 'pendente',
  },
  {
    id: 2,
    quadra: 'Quadra de Areia',
    data: '26/06/2025',
    hora: '18:30',
    status: 'confirmado',
  },
  {
    id: 3,
    quadra: 'Quadra B',
    data: '27/06/2025',
    hora: '20:00',
    status: 'negado',
  },
]
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
 padding: 32px 75px;
  background-color: #f2f2f2;
  margin-top: 60px;
}

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
