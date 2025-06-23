<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos</h1>

      <div class="agendamentos">
        <AgendamentoCard
          v-for="ag in agendamentos"
          :key="ag.id"
          :agendamento="ag"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from '@/components/SideBar.vue'
import AgendamentoCard from '@/components/AgendamentoCard.vue'

// Dados mockados (somente para visualização)
const agendamentos = [
  {
    id: 1,
    quadra: 'Quadra de Areia Juarez Valdivino',
    usuario: 'João Silva',
    data: '23/06/2025',
    hora: '14:00',
  },
  {
    id: 2,
    quadra: 'Quadra de Areia Juarez Valdivino',
    usuario: 'Maria Oliveira',
    data: '24/06/2025',
    hora: '10:30',
  }
]
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
}
</style>
