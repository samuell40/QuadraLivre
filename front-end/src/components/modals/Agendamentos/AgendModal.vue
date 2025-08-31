<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <!-- Escolha da data com Datepicker -->
      <label for="data"><strong>Escolha a data:</strong></label>
      <Datepicker
        v-model="data"
        :min-date="minDateObj"
        :max-date="maxDateObj"
        :day-class="getDayClass"
        :enable-time-picker="false"
        @update:model-value="gerarHorariosDisponiveis"
        :format="formatDate"
        placeholder="Escolha um dia"
      />

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

      <!-- Exibe duração dependendo da modalidade -->
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
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

export default {
  name: 'AgendamentoModal',
  components: { Datepicker },
  props: {
    quadra: Object,
    modalidade: Object
  },
  data() {
    const agora = new Date()
    const tresMeses = new Date()
    tresMeses.setMonth(agora.getMonth() + 3)

    return {
      data: '',
      hora: '',
      duracao: '',
      tipo: '',
      minDateObj: agora,
      maxDateObj: tresMeses,
      authStore: useAuthStore(),
      horariosDisponiveis: [],
      horariosIndisponiveis: [],
      datasDisponiveis: []
    }
  },
  computed: {
    modalidadeSelecionadaPadronizada() {
      if (!this.modalidade?.nome) return ''
      return this.modalidade.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
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
    formatDate(date) {
      const d = new Date(date)
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },

    getDayClass(date) {
      const dStr = this.formatDateAPI(date)
      return this.datasDisponiveis.includes(dStr) ? 'dia-disponivel' : ''
    },

    // Converte Date para YYYY-MM-DD para API
    formatDateAPI(date) {
      const d = new Date(date)
      const ano = d.getFullYear()
      const mes = String(d.getMonth() + 1).padStart(2, '0')
      const dia = String(d.getDate()).padStart(2, '0')
      return `${ano}-${mes}-${dia}`
    },

    async gerarHorariosDisponiveis() {
      if (!this.data) return
      this.hora = ''
      this.horariosDisponiveis = []
      this.horariosIndisponiveis = []

      for (let h = 7; h <= 23; h++) {
        this.horariosDisponiveis.push(`${h.toString().padStart(2,'0')}:00`)
      }

      try {
        const dataStr = this.formatDateAPI(this.data)
        const [ano, mes, dia] = dataStr.split('-')

        const { data: agendamentos } = await api.get(
          `/agendamentos/quadra/${this.quadra.id}/confirmados?ano=${ano}&mes=${mes}&dia=${dia}`
        )

        agendamentos.forEach(a => {
          for (let i = 0; i < a.duracao; i++) {
            const hString = String(a.hora + i).padStart(2, '0') + ':00'
            this.horariosIndisponiveis.push(hString)
          }
        })
        this.horariosIndisponiveis = [...new Set(this.horariosIndisponiveis)]

        this.horariosDisponiveis = this.horariosDisponiveis.filter(h => !this.horariosIndisponiveis.includes(h))

        if (this.horariosDisponiveis.length > 0 && !this.datasDisponiveis.includes(dataStr)) {
          this.datasDisponiveis.push(dataStr)
        }
      } catch (err) {
        console.error(err)
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar os horários desta quadra.',
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

      if (!this.modalidade?.id) {
        Swal.fire({
          icon: 'warning',
          title: 'Modalidade não selecionada',
          text: 'Selecione uma modalidade antes de confirmar.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const horaSelecionada = parseInt(this.hora.split(':')[0])
      const dataStr = this.formatDateAPI(this.data)
      const [ano, mes, dia] = dataStr.split('-').map(n => parseInt(n))
      const agendamento = new Date(ano, mes - 1, dia, horaSelecionada, 0, 0, 0)

      const limite24h = new Date(Date.now() + 24 * 60 * 60 * 1000)
      if (agendamento < limite24h) {
        Swal.fire({
          icon: 'warning',
          title: 'Data/hora inválida',
          text: 'O agendamento deve ser feito com pelo menos 24h de antecedência.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const limiteTresMeses = new Date()
      limiteTresMeses.setMonth(limiteTresMeses.getMonth() + 3)
      if (agendamento > limiteTresMeses) {
        Swal.fire({
          icon: 'warning',
          title: 'Data inválida',
          text: 'O agendamento não pode ser feito para mais de 3 meses à frente.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const duracaoFinal = this.exibirDuracao ? parseInt(this.duracao) : 1
      for (let i = 0; i < duracaoFinal; i++) {
        const hString = String(horaSelecionada + i).padStart(2, '0') + ':00'
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

      this.$emit('confirmar', {
        usuarioId: this.authStore.usuario.id,
        quadraId: this.quadra.id,
        modalidadeId: this.modalidade.id,
        dia: dia,
        mes: mes,
        ano: ano,
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
  max-height: 90vh;
  overflow-y: visible;
  position: relative;
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

select:hover, input:hover {
  border-color: #3b82f6;
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
  border-color: #7f7f7f;
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

.btn-cancelar:hover,
.btn-confirmar:hover {
  opacity: 0.8;
}

/* Destaque de datas disponíveis */
:deep(.dia-disponivel) {
  background-color: #3B82F6 !important;
  color: white !important;
  border-radius: 50% !important;
}

:deep(.dp__input_wrap) {
  display: flex;
  align-items: center;
}

:deep(.dp__input_icon) {
  width: 18px;
  height: 18px;
  margin-left: 4px; 
}

:deep(.dp__menu) {
  width: auto;
  max-width: 280px;
  font-size: 0.85rem;
  padding: 8px;
  border-radius: 8px;
  z-index: 1100 !important;
}

:deep(.dp__calendar) {
  min-width: 250px;
}

.vue-datepicker {
  width: 160px;
  font-size: 0.85rem;
}

.vue-datepicker input {
  padding: 4px 8px;      
  font-size: 0.85rem;
}

.vue-datepicker__calendar {
  font-size: 0.8rem;
  width: 240px;
}

.vue-datepicker__calendar-trigger {
  padding: 2px 4px !important;
  font-size: 0.8rem !important; 
  width: 20px !important;
  height: 20px !important;
}
</style>
