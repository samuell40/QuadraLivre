<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <h1>Agendamentos da Minha Quadra</h1>

      <div v-if="isLoading">Carregando...</div>

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

<script setup>
import SideBar from '@/components/SideBar.vue'
import { ref, watch } from 'vue'
import AgendamentoCard from '@/components/cards/AgendamentoCard.vue'
import { useAuthStore } from '@/store'
import api from '@/axios'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const agendamentos = ref([])
const isLoading = ref(false)

// Observa authStore.user e carrega os agendamentos quando estiver definido
watch(
  () => authStore.user,
  (user) => {
    console.log('Usuário logado:', user)
    if (user) {
      const quadraId = user.quadraId
      console.log('quadraId do admin:', quadraId)

      carregarAgendamentos(quadraId)
    }
  },
  { immediate: true }
)

const carregarAgendamentos = async (quadraId) => {
  isLoading.value = true
  try {
    console.log('Chamando API com quadraId:', quadraId)
    const { data } = await api.get(`/agendamentos/quadra/${quadraId}`)
    console.log('Dados recebidos da API:', data)

    agendamentos.value = data.map(a => ({
      id: a.id,
      quadra: a.quadra?.nome || 'Não informado',
      usuario: a.usuario?.nome || 'Não informado',
      data: `${a.dia.toString().padStart(2, '0')}/${a.mes
        .toString()
        .padStart(2, '0')}/${a.ano}`,
      hora: `${a.hora.toString().padStart(2, '0')}:00`,
      status: a.status.toLowerCase()
    }))

    console.log('Agendamentos processados:', agendamentos.value)
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err)
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: err.response?.data?.message || err.message || 'Não foi possível carregar os agendamentos da quadra.',
      confirmButtonColor: '#1E3A8A'
    })
  } finally {
    isLoading.value = false
  }
}
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
