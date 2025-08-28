<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <!-- Escolha da data -->
      <label for="data"><strong>Escolha a data:</strong></label>
      <input type="date" v-model="data" :min="minDate" :max="maxDate" @change="gerarHorariosDisponiveis" />

      <!-- Lista de horários -->
      <label for="hora"><strong>Escolha o horário {{ exibirDuracao ? 'e duração' : '' }}:</strong></label>
      <div class="horarios">
        <button
          v-for="h in horariosDisponiveis"
          :key="h"
          :class="{ selecionado: h === hora }"
          :disabled="horariosIndisponiveis.includes(h)"
          @click="hora = h"
        >
          {{ h }}
        </button>
      </div>

      <!-- Só exibe a duração se for modalidade que permite -->
      <select v-if="exibirDuracao" v-model="duracao" class="select-tempo">
        <option disabled value="">Duração</option>
        <option value="1">1 hora</option>
        <option value="2">2 horas</option>
      </select>

      <!-- Tipo de agendamento -->
      <label for="tipo"><strong>Tipo de agendamento:</strong></label>
      <select v-model="tipo">
        <option disabled value="">Selecione</option>
        <option value="PARTIDA">Partida</option>
        <option value="TREINO">Treino</option>
        <option value="EVENTO">Evento</option>
        <option value="OUTRO">Outro</option>
      </select>

      <!-- Ações -->
      <div class="modal-actions">
        <button
          @click="confirmar"
          class="btn-confirmar"
          :disabled="!data || !hora || (exibirDuracao && !duracao) || !tipo"
        >
          Confirmar
        </button>
        <button @click="$emit('fechar')" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import { useAuthStore } from '@/store'
import api from '@/axios'

export default {
  name: 'AgendamentoModal',
  props: { 
    quadra: Object,
    modalidade: Object
  },
  data() {
    const hoje = new Date()
    const umAno = new Date()
    umAno.setFullYear(hoje.getFullYear() + 1)

    return {
      data: '',
      hora: '',
      duracao: '',
      tipo: '',
      minDate: hoje.toISOString().split('T')[0],
      maxDate: umAno.toISOString().split('T')[0],
      authStore: useAuthStore(),
      horariosDisponiveis: [],
      horariosIndisponiveis: []
    }
  },
  computed: {
    modalidadeSelecionadaPadronizada() {
      if (!this.modalidade?.nome) return ''
      return this.modalidade.nome.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
    },
    isFutebol() {
      const modalidadesFutebol = ['futebol', 'futsal', 'futebol de areia', 'futevolei']
      return modalidadesFutebol.includes(this.modalidadeSelecionadaPadronizada)
    },
    exibirDuracao() {
      const modalidadesDuracao = ['volei', 'volei de areia', 'futevolei']
      return modalidadesDuracao.includes(this.modalidadeSelecionadaPadronizada)
    }
  },
  methods: {
    async gerarHorariosDisponiveis() {
      this.hora = ''
      this.horariosDisponiveis = []
      this.horariosIndisponiveis = []

      // gera horários base
      for (let h = 7; h <= 23; h++) {
        this.horariosDisponiveis.push(`${h.toString().padStart(2,'0')}:00`)
      }

      try {
        const { data: agendamentos } = await api.get(
          `/agendamentos/quadra/${this.quadra.id}?data=${this.data}`
        )
        console.log('Agendamentos recebidos:', agendamentos)

        agendamentos.forEach(a => {
          for (let i = 0; i < a.duracao; i++) {
            const hString = String(a.hora + i).padStart(2,'0') + ':00'
            this.horariosIndisponiveis.push(hString)
          }
        })

        // remove duplicados
        this.horariosIndisponiveis = [...new Set(this.horariosIndisponiveis)]
        console.log('Horários indisponíveis:', this.horariosIndisponiveis)
      } catch (err) {
        console.error('Erro ao buscar horários ocupados:', err)
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os horários dessa quadra.',
          confirmButtonColor: '#1E3A8A',
        })
      }
    },

    confirmar() {
      if (!this.data || !this.hora || (this.exibirDuracao && !this.duracao) || !this.tipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obrigatórios',
          text: 'Preencha todos os campos necessários.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const [h] = this.hora.split(':')
      const duracaoFinal = this.exibirDuracao ? parseInt(this.duracao) : 1
      const horaSelecionada = parseInt(h)

      // valida se o intervalo escolhido invade horários ocupados
      for (let i = 0; i < duracaoFinal; i++) {
        const hString = String(horaSelecionada + i).padStart(2,'0') + ':00'
        if (this.horariosIndisponiveis.includes(hString)) {
          Swal.fire({
            icon: 'error',
            title: 'Horário indisponível',
            text: `O horário das ${hString} já está ocupado.`,
            confirmButtonColor: '#1E3A8A'
          })
          return
        }
      }

      // emite para o pai salvar
      this.$emit('confirmar', {
        usuarioId: this.authStore.usuario.id,
        quadraId: this.quadra.id,
        modalidadeId: this.modalidade?.id,
        dia: parseInt(this.data.split('-')[2]),
        mes: parseInt(this.data.split('-')[1]),
        ano: parseInt(this.data.split('-')[0]),
        hora: horaSelecionada,
        duracao: duracaoFinal,
        tipo: this.tipo,
        status: 'Pendente'
      })
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  color: #7E7E7E;
  padding: 18px 56px;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-content input,
.select-tempo,
select {
  color: #7E7E7E;
  height: 50px;
  padding: 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 18px;
}
.modal-content label {
  margin-bottom: 6px;
  display: block;
}
.title {
  margin-bottom: 32px;
  color: #3b82f6;
  text-align: center;
}
.horarios {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.horarios button {
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid #1E3A8A;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
}
.horarios button:hover {
  background-color: #3b82f6;
  color: #fff;
}
.horarios button.selecionado {
  background-color: #1E3A8A;
  color: #fff;
}
.horarios button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}
.modal-actions button {
  width: 48%;
  height: 42px;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.btn-confirmar {
  background-color: #1E3A8A;
  color: #fff;
}
.btn-confirmar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
.btn-cancelar {
  background-color: #F7F9FC;
  color: #7E7E7E;
}
.btn-cancelar:hover, .btn-confirmar:hover {
  opacity: 0.8;
}
</style>
