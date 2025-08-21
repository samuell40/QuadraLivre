<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos</h1>

      <div class="agendamentos">
        <AgendamentoCard v-for="ag in agendamentos" :key="ag.id" :agendamento="ag" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from '@/components/SideBar.vue'
import { ref } from 'vue'
import AgendamentoCard from '@/components/cards/AgendamentoCard.vue'

const agendamentos = ref([
  {
    id: 1,
    quadra: 'Metodão',
    usuario: 'João Silva',
    data: '31/12/2025',
    hora: '23:00',
  },
  {
    id: 2,
    quadra: 'Quadra de Areia',
    usuario: 'Maria Oliveira',
    data: '25/12/2025',
    hora: '10:00',
  }
])
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
