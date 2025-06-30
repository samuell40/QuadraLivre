<template>
  <div class="layout">
    <SideBar />

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
import SideBar from '@/components/SideBar.vue'
import MeusAgendamentoCard from '@/components/cards/MeusAgendamentosCard.vue'

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

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title{
   color: #3b82f6;
  font-size: 28px;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
