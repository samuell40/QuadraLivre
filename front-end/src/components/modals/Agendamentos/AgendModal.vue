<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2 class="title"><strong>{{ quadra?.nome }}</strong></h2>

      <!-- Escolha de Time e Modalidade -->
      <div class="linha-selects">
        <!-- Time -->
        <div class="campo">
          <label for="time"><strong>Time:</strong></label>
          <div class="select-wrapper">
            <div v-if="isLoadingTimes" class="loader"></div>
            <select v-else v-model="timeSelecionado" class="select-tempo">
              <option :value="null">(Nenhum, casual)</option>
              <option v-for="t in times" :key="t.id" :value="Number(t.id)">
                {{ t.nome }}
              </option>
            </select>
          </div>
        </div>

        <!-- Modalidade -->
        <div class="campo">
          <label for="modalidade"><strong>Modalidade:</strong></label>
          <div class="select-wrapper">
            <div v-if="isLoadingModalidades" class="loader"></div>
            <select v-else v-model="modalidadeSelecionada" class="select-tempo">
              <option disabled :value="null">Selecione</option>
              <option v-for="m in modalidades" :key="m.id" :value="Number(m.id)">
                {{ m.nome }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Escolha da Data e Duração -->
      <div class="linha-selects">
        <div class="campo">
          <label for="data"><strong>Data:</strong></label>
          <Datepicker
            v-model="data"
            teleport="body"
            locale="pt-BR" 
            cancelText="Cancelar"
            selectText="Selecionar"
            :day-names="diasSemana"
            :min-date="minDateObj"
            :max-date="maxDateObj"
            :day-class="getDayClass"
            :enable-time-picker="false"
            @update:model-value="gerarHorariosDisponiveis"
            :format="formatDate"
            placeholder="Escolha um dia"
            :alt-position="calcularPosicao" 
          />
        </div>

        <div class="campo" v-if="exibirDuracao">
          <label for="duracao"><strong>Duração:</strong></label>
          <select v-model="duracao" class="select-tempo">
            <option disabled value="">Duração</option>
            <option value="1">1 hora</option>
            <option value="2">2 horas</option>
          </select>
        </div>
      </div>

      <!-- Lista de horários -->
      <label for="hora"><strong>Escolha o horário:</strong></label>
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

      <!-- Tipo de agendamento -->
      <label for="tipo"><strong>Tipo de agendamento:</strong></label>
      <select v-model="tipo" class="select-tempo">
        <option disabled value="">Selecione</option>
        <option value="TREINO">Treino</option>
        <option value="AMISTOSO">Amistoso</option>
        <!-- <option value="CAMPEONATO">Campeonato</option> -->
        <option value="EVENTO">Evento</option>
        <option value="OUTRO">Outro</option>
      </select>

      <!-- Ações -->
      <div class="modal-actions">
        <button
          @click="confirmar"
          class="btn-confirmar"
          :disabled="!data || !hora || !modalidadeSelecionada || (exibirDuracao && !duracao) || !tipo"
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
  props: { quadra: Object },
  emits: ['confirmar', 'fechar'],
  data() {
    const agora = new Date()
    const umMes = new Date()
    umMes.setMonth(agora.getMonth() + 1)

    return {
      times: [],
      timeSelecionado: null,
      isLoadingTimes: true,
      modalidades: [],
      modalidadeSelecionada: null,
      isLoadingModalidades: true,
      data: "",
      hora: "",
      duracao: "",
      tipo: "",
      minDateObj: agora,
      maxDateObj: umMes,
      authStore: useAuthStore(),
      horariosDisponiveis: [],
      horariosIndisponiveis: [],
      datasDisponiveis: [],
      diasSemana: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    }
  },

  created() {
    document.body.style.overflow = 'hidden';
  },

  unmounted() {
    document.body.style.overflow = '';
  },

  computed: {
    modalidadePadronizada() {
      if (!this.modalidadeSelecionada) return ""
      const m = this.modalidades.find(m => m.id === this.modalidadeSelecionada)
      return m?.nome
        ? m.nome.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
        : ""
    },
    exibirDuracao() {
      const modalidadesDuracao = ['volei', 'volei de areia', 'futevolei']
      return modalidadesDuracao.includes(this.modalidadePadronizada)
    }
  },
  async mounted() {
    try {
      if (this.quadra?.id) {
        const { data } = await api.get(`/quadra/${this.quadra.id}/modalidades`)
        this.modalidades = data
      }
    } catch (err) {
      console.error("Erro ao buscar modalidades:", err)
    } finally {
      this.isLoadingModalidades = false
    }

    try {
      const { data } = await api.get(`/usuarios/${this.authStore.usuario.id}/times`)
      this.times = data
    } catch (err) {
      console.error("Erro ao carregar times:", err)
    } finally {
      this.isLoadingTimes = false
    }
  },
  methods: {
    formatDate(date) {
      const d = new Date(date)
      return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
    },
    formatDateAPI(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    getDayClass(date) {
      const dStr = this.formatDateAPI(date)
      return this.datasDisponiveis.includes(dStr) ? 'dia-disponivel' : ''
    },
    calcularPosicao() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const dpWidth = 260; 
      const dpHeight = -40;

      const top = (windowHeight / 2) - (dpHeight / 2);
      const left = (windowWidth / 2) - (dpWidth / 2);

      return { 
        top: `${top}px`, 
        left: `${left}px` 
      };
    },
    async gerarHorariosDisponiveis() {
      if (!this.data) return
      this.hora = ""
      this.horariosDisponiveis = []
      this.horariosIndisponiveis = []

      for (let h = 7; h <= 23; h++) {
        this.horariosDisponiveis.push(`${h.toString().padStart(2,'0')}:00`)
      }

      try {
        const dataStr = this.formatDateAPI(this.data)
        const [ano, mes, dia] = dataStr.split('-')

        const { data: agendamentos } = await api.get(
          `/agendamentos/quadra/${this.quadra.id}/confirmados`,
          { params: { ano, mes, dia } }
        )

        agendamentos.forEach(a => {
          for (let i = 0; i < (a.duracao ?? 1); i++) {
            const h = a.hora + i
            if (h > 23) continue
            const hString = String(h).padStart(2,'0') + ':00'
            this.horariosIndisponiveis.push(hString)
          }
        })

        this.horariosIndisponiveis = [...new Set(this.horariosIndisponiveis)]
        this.horariosDisponiveis = this.horariosDisponiveis.filter(h => !this.horariosIndisponiveis.includes(h))

        if (agendamentos.length > 0 && !this.datasDisponiveis.includes(dataStr)) {
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
      if (!this.data || !this.hora || !this.modalidadeSelecionada || (this.exibirDuracao && !this.duracao) || !this.tipo) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos obrigatórios',
          text: 'Preencha todos os campos necessários.',
          confirmButtonColor: '#1E3A8A'
        })
        return
      }

      const horaSelecionada = parseInt(this.hora.split(':')[0])
      const dataStr = this.formatDateAPI(this.data)
      const [ano, mes, dia] = dataStr.split('-').map(n => parseInt(n))
      const duracaoFinal = this.exibirDuracao ? parseInt(this.duracao) : 1
      const datahora = new Date(ano, mes - 1, dia, horaSelecionada, 0, 0);

      this.$emit('confirmar', {
        usuarioId: this.authStore.usuario.id,
        quadraId: this.quadra.id,
        modalidadeId: Number(this.modalidadeSelecionada),
        timeId: this.timeSelecionado ? Number(this.timeSelecionado) : null,
        dia,
        mes,
        ano,
        hora: horaSelecionada,
        datahora,
        duracao: duracaoFinal,
        tipo: this.tipo
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
  overflow: visible;
  position: relative;
}

.modal-content input,
.select-tempo,
select,
:deep(.dp__input),
:deep(.dp__input_wrap input) {
  color: #7E7E7E;
  height: 42px !important;
  padding: 8px 10px;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 14px;
  font-size: 14px;
}

select:hover, input:hover {
  border-color: #3b82f6;
}

.modal-content label {
  margin-bottom: 6px;
  display: block;
}

.title {
  margin-bottom: 24px;
  color: #3b82f6;
  text-align: center;
}

.linha-selects {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.linha-selects .campo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.select-wrapper {
  position: relative;
  width: 100%;
  height: 42px;
  margin-bottom: 14px;
}

.select-wrapper .loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Horários grid */
.horarios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.horarios button {
  height: 40px;
  width: 100%;
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

/* Datepicker */
:deep(.dp__arrow_top), :deep(.dp__arrow_bottom) {
  display: none !important;
}

:deep(.dp__calendar_header_item) {
  font-weight: bold;
  font-size: 14px;
  text-transform: uppercase;
}

:deep(.dia-disponivel) {
  background-color: #3B82F6 !important;
  color: white !important;
  border-radius: 50% !important;
}

:deep(.dp__input_wrap) {
  display: flex;
  align-items: center;
  position: relative;
}

:deep(.dp__input_icon) {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  pointer-events: none;
}

:deep(.dp__input) {
  height: 40 !important;
  padding-left: 42px !important;
  padding-right: 10px !important;
  border-radius: 4px !important;
  border-color: #D9D9D9 !important;
  color: #7E7E7E !important;
}

:deep(.dp__menu) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border: 1px solid #e5e7eb;
  font-family: inherit;
  margin-top: -10px;
}

:deep(.dp__outer_menu_wrap) {
  padding: 10px 0;
}

:deep(.dp__action_row) {
  padding: 10px 15px;
  border-top: 1px solid #eee;
}

:deep(.dp__action_select) {
  background-color: #1E3A8A !important;
  border: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 6px;
  text-transform: none;
  height: 36px;
}

:deep(.dp__action_select:hover) {
  background-color: #152c6e !important;
}

:deep(.dp__action_cancel) {
  color: #7E7E7E !important;
  font-weight: 500;
  border: 1px solid transparent;
  background: transparent;
  padding: 8px 16px;
}

:deep(.dp__action_cancel:hover) {
  text-decoration: underline;
  color: #555 !important;
}

:deep(.dp__cell_inner.dp__active_date),
:deep(.dp__main.dp__theme_light) {
    --dp-primary-color: #1E3A8A;
}
</style>
