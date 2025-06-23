<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="topo">
        <h1>Meus Agendamentos</h1>
        <div class="usuario">
          <img class="foto" src="@/assets/Logo1.jpg" alt="Foto de Perfil" />
          <span class="nome">João Silva</span>
        </div>
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
import MeusAgendamentoCard from '@/components/MeusAgendamentosCard.vue'

const agendamentos = [
  {
    id: 1,
    quadra: 'Ginásio de Esportes Metodão',
    data: '25/06/2025',
    hora: '15:00',
    status: 'pendente',
  },
  {
    id: 2,
    quadra: 'Ginásio de Esportes Metodão',
    data: '26/06/2025',
    hora: '18:30',
    status: 'confirmado',
  },
  {
    id: 3,
    quadra: 'Ginásio de Esportes Metodão',
    data: '27/06/2025',
    hora: '20:00',
    status: 'negado',
  },
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

.topo {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: #3b82f6;
  font-weight: bold;
}

.usuario {
  display: flex;
  align-items: center;
  gap: 12px;
}

.usuario .foto {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.usuario .nome {
  font-weight: 500;
  color: #333;
}

.agendamentos {
  margin-top: 24px;
}
</style>
