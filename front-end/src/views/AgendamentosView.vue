<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos</h1>
           <NavBarUse />

      <div class="agendamentos">
        <AgendamentoCard v-for="ag in agendamentos" :key="ag.id" :agendamento="ag" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
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

.SideBar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px; 
  transition: margin-left 0.3s ease;
}

h1 {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

.agendamentos {
  margin-top: 20px;
  display: grid;
  gap: 20px;
}

@media (max-width: 768px) {
  .SideBar {
    transform: translateX(-100%);
    width: 250px;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    background: #fff;
    box-shadow: 2px 0 12px rgba(0,0,0,0.2);
  }

  .SideBar.open {
    transform: translateX(0);
  }

  .conteudo {
    margin-left: 0;
    padding: 20px;
  }

  h1 {
    font-size: 24px;
  }

  .agendamentos {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}
</style>
