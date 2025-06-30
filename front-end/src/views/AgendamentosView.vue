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
import AgendamentoCard from '@/components/cards/AgendamentoCard.vue'

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
