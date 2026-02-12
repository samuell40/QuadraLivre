<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">

      <h2 class="modal-title">{{ quadra?.nome }}</h2>

      <div class="tabs-container" v-if="podeAgendarFixo">
        <div class="tabs-list">
          <button class="tab-item separator-right" :class="{ active: modoAgendamento === 'avulso' }"
            @click="modoAgendamento = 'avulso'">
            Agendamento Avulso
          </button>
          <button class="tab-item" :class="{ active: modoAgendamento === 'fixo' }" @click="modoAgendamento = 'fixo'">
            Agendamento Fixo (Mensal)
          </button>
        </div>
      </div>

      <div class="modal-body">

        <div class="linha-selects">
          <div class="campo">
            <label><strong>Time:</strong></label>
            <div class="select-wrapper">
              <select v-model="timeSelecionado" class="form-select">
                <option :value="null">(Nenhum, casual)</option>
                <option v-for="t in times" :key="t.id" :value="Number(t.id)">
                  {{ t.nome }}
                </option>
              </select>
            </div>
          </div>

          <div class="campo">
            <label><strong>Modalidade:</strong></label>
            <div class="select-wrapper">
              <div v-if="isLoadingModalidades" class="loader"></div>
              <select v-else v-model="modalidadeSelecionada" class="form-select">
                <option disabled :value="null">Selecione</option>
                <option v-for="m in modalidades" :key="m.id" :value="Number(m.id)">
                  {{ m.nome }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="modoAgendamento === 'avulso'">
          <div class="linha-selects">
            <div class="campo">
              <label><strong>Data:</strong></label>
              <Datepicker v-model="data" teleport="body" locale="pt-BR" cancelText="Cancelar" selectText="Selecionar"
                :day-names="diaNomesCurto" :min-date="minDateObj" :max-date="maxDateObj" :day-class="getDayClass"
                :enable-time-picker="false" @update:model-value="gerarHorariosDisponiveis" :format="formatDate"
                placeholder="Escolha um dia" :alt-position="calcularPosicao"
                input-class-name="form-select dp-custom-input" />
            </div>

            <div class="campo" v-if="exibirDuracao">
              <label><strong>Duração:</strong></label>
              <select v-model="duracao" class="form-select">
                <option disabled value="">Duração</option>
                <option value="1">1 hora</option>
                <option value="2">2 horas</option>
              </select>
            </div>
          </div>

          <div class="campo mb-3">
            <label><strong>Tipo de agendamento:</strong></label>
            <select v-model="tipo" class="form-select">
              <option disabled value="">Selecione</option>
              <option value="TREINO">Treino</option>
              <option value="AMISTOSO">Amistoso</option>
              <option value="EVENTO">Evento</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <label><strong>Horários Disponíveis:</strong></label>
          <div class="horarios-grid">
            <button v-for="h in horariosDisponiveis" :key="h" :class="{ selecionado: h === hora }"
              :disabled="horariosIndisponiveis.includes(h)" @click="hora = h" class="btn-horario">
              {{ h }}
            </button>
          </div>
        </div>

        <div v-else class="modo-fixo-container">

          <div class="info-box">
            <p><strong>Treino Fixo:</strong> Selecione até <strong>2 dias</strong> da semana. O sistema agendará
              automaticamente para as próximas 5 semanas.</p>
          </div>

          <div class="campo mb-3" v-if="exibirDuracao">
            <label><strong>Duração dos treinos:</strong></label>
            <select v-model="duracao" class="form-select">
              <option disabled value="">Duração</option>
              <option value="1">1 hora</option>
              <option value="2">2 horas</option>
            </select>
          </div>

          <label><strong>Dias da Semana (Máx. 2):</strong></label>
          <div class="dias-semana-grid">
            <button v-for="(dia, index) in diasSemanaCompleto" :key="index" class="btn-dia-semana"
              :class="{ active: diasFixosSelecionados.includes(index) }"
              :disabled="!diasFixosSelecionados.includes(index) && diasFixosSelecionados.length >= 2"
              @click="toggleDiaFixo(index)">
              {{ dia }}
            </button>
          </div>

          <div v-if="diasFixosSelecionados.length > 0" class="config-horarios-fixos">
            <label><strong>Defina o horário (07:00 às 23:00):</strong></label>

            <div v-for="diaIndex in diasFixosSelecionados.sort()" :key="diaIndex" class="linha-horario-fixo">
              <span class="dia-label">{{ diasSemanaCompleto[diaIndex] }}:</span>

              <div class="input-time-wrapper" :ref="'timeWrapper_' + diaIndex">

                <input type="text" v-model="horariosFixos[diaIndex]" class="form-select input-time-fixo"
                  placeholder="--:--" maxlength="5" @input="aplicarMascaraHora($event, diaIndex)"
                  @focus="abrirDropdown(diaIndex)" @click="abrirDropdown(diaIndex)" />

                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  class="clock-icon">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>

                <div v-if="dropdownAberto === diaIndex" class="custom-time-dropdown">
                  <div v-for="h in listaHorariosFixos" :key="h" class="time-option"
                    @click="selecionarHorarioLista(h, diaIndex)">
                    {{ h }}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="confirmarGeral" class="btn-confirmar" :disabled="!validarFormulario()">
            {{ modoAgendamento === 'fixo' ? 'Gerar Agendamentos' : 'Confirmar' }}
          </button>
          <button @click="$emit('fechar')" class="btn-cancelar">Cancelar</button>
        </div>
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
    times: { type: Array, default: () => [] }
  },
  emits: ['confirmar', 'fechar'],

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    const agora = new Date()
    const umMes = new Date()
    umMes.setMonth(agora.getMonth() + 1)

    const listaHorariosFixos = Array.from({ length: 17 }, (_, i) => {
      const h = i + 7;
      return `${String(h).padStart(2, '0')}:00`;
    });

    return {
      modoAgendamento: 'avulso',
      timeSelecionado: null,
      modalidades: [],
      modalidadeSelecionada: null,
      isLoadingModalidades: true,
      tipo: "",
      duracao: "",
      data: "",
      hora: "",
      minDateObj: agora,
      maxDateObj: umMes,
      horariosDisponiveis: [],
      horariosIndisponiveis: [],
      datasDisponiveis: [],
      diaNomesCurto: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      diasSemanaCompleto: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      diasFixosSelecionados: [],
      horariosFixos: {},
      listaHorariosFixos,
      dropdownAberto: null,
    }
  },

  computed: {
    podeAgendarFixo() {
      const p = this.authStore.usuario?.permissaoId;
      return p === 2 || p === 3;
    },
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
    document.body.style.overflow = 'hidden';
    window.addEventListener('click', this.handleClickOutside);

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
  },

  unmounted() {
    document.body.style.overflow = '';
    window.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    formatDateAPI(date) {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },

    abrirDropdown(diaIndex) {
      this.dropdownAberto = diaIndex;
    },

    selecionarHorarioLista(horario, diaIndex) {
      this.horariosFixos[diaIndex] = horario;
      this.dropdownAberto = null;
    },

    handleClickOutside(event) {
      if (this.dropdownAberto === null) return;

      const diaIndex = this.dropdownAberto;
      const refName = 'timeWrapper_' + diaIndex;
      const el = this.$refs[refName];

      if (el && el[0] && !el[0].contains(event.target)) {
        this.dropdownAberto = null;
      }
    },

    aplicarMascaraHora(event, diaIndex) {
      let valor = event.target.value;
      valor = valor.replace(/\D/g, "");

      if (valor.length > 4) valor = valor.slice(0, 4);

      if (valor.length > 2) {
        valor = valor.slice(0, 2) + ":" + valor.slice(2);
      }

      this.horariosFixos[diaIndex] = valor;
      event.target.value = valor;
    },

    validarFormulario() {
      if (!this.modalidadeSelecionada) return false;

      if (this.modoAgendamento === 'avulso') {
        if (!this.data || !this.hora || !this.tipo) return false;
        if (this.exibirDuracao && !this.duracao) return false;
        return true;
      }

      else if (this.modoAgendamento === 'fixo') {
        if (this.diasFixosSelecionados.length === 0) return false;

        const todosHorariosPreenchidos = this.diasFixosSelecionados.every(dia => {
          const val = this.horariosFixos[dia];
          return val && val.length === 5;
        });

        if (!todosHorariosPreenchidos) return false;
        if (this.exibirDuracao && !this.duracao) return false;
        return true;
      }

      return false;
    },

    confirmarGeral() {
      if (!this.authStore.usuario?.id) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Usuário não logado.', confirmButtonColor: '#1E3A8A' });
        return;
      }
      if (this.modoAgendamento === 'avulso') {
        this.confirmarAvulso();
      } else {
        this.confirmarFixo();
      }
    },

    formatDate(date) {
      const d = new Date(date)
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
    },
    getDayClass(date) {
      const dStr = this.formatDateAPI(date)
      return this.datasDisponiveis.includes(dStr) ? 'dia-disponivel' : ''
    },
    calcularPosicao() {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    },
    async gerarHorariosDisponiveis() {
      if (!this.data) return
      this.hora = ""
      this.horariosDisponiveis = []
      this.horariosIndisponiveis = []
      for (let h = 7; h <= 23; h++) {
        this.horariosDisponiveis.push(`${h.toString().padStart(2, '0')}:00`)
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
            const hString = String(h).padStart(2, '0') + ':00'
            this.horariosIndisponiveis.push(hString)
          }
        })
        this.horariosIndisponiveis = [...new Set(this.horariosIndisponiveis)]
        this.horariosDisponiveis = this.horariosDisponiveis.filter(h => !this.horariosIndisponiveis.includes(h))
      } catch (err) {
        console.error(err)
      }
    },
    confirmarAvulso() {
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
        dia, mes, ano,
        hora: horaSelecionada,
        datahora,
        duracao: duracaoFinal,
        tipo: this.tipo,
        fixo: false
      })
    },

    toggleDiaFixo(index) {
      if (this.diasFixosSelecionados.includes(index)) {
        this.diasFixosSelecionados = this.diasFixosSelecionados.filter(i => i !== index);
        delete this.horariosFixos[index];
      } else {
        if (this.diasFixosSelecionados.length < 2) {
          this.diasFixosSelecionados.push(index);
        } else {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Limite de 2 dias fixos por semana.',
            showConfirmButton: false,
            timer: 3000
          });
        }
      }
    },

    confirmarFixo() {
      const agora = new Date();
      const agendamentosParaCriar = [];
      const duracaoFinal = this.exibirDuracao ? parseInt(this.duracao) : 1;

      const diasInvalidos = this.diasFixosSelecionados.filter(dia => {
        const h = this.horariosFixos[dia];
        if (!h || h.length !== 5) return true;
        const horaInt = parseInt(h.split(':')[0]);
        return horaInt < 7 || horaInt > 23;
      });

      if (diasInvalidos.length > 0) {
        Swal.fire('Horário Inválido', 'Os horários devem estar entre 07:00 e 23:00.', 'warning');
        return;
      }

      for (let i = 1; i <= 35; i++) {
        const dataFutura = new Date();
        dataFutura.setDate(agora.getDate() + i);
        const diaSemana = dataFutura.getDay();

        if (this.diasFixosSelecionados.includes(diaSemana)) {
          const horaString = this.horariosFixos[diaSemana];
          if (!horaString) continue;

          const [horaStr] = horaString.split(':');
          const horaInt = parseInt(horaStr);

          if (horaInt < 7 || horaInt > 23) continue;

          const diffMs = dataFutura.setHours(horaInt, 0, 0, 0) - new Date().getTime();
          const diffHoras = diffMs / (1000 * 60 * 60);

          if (diffHoras < 24) continue;

          agendamentosParaCriar.push({
            usuarioId: this.authStore.usuario.id,
            quadraId: this.quadra.id,
            modalidadeId: Number(this.modalidadeSelecionada),
            timeId: this.timeSelecionado ? Number(this.timeSelecionado) : null,
            dia: dataFutura.getDate(),
            mes: dataFutura.getMonth() + 1,
            ano: dataFutura.getFullYear(),
            hora: horaInt,
            duracao: duracaoFinal,
            tipo: 'TREINO',
            fixo: true
          });
        }
      }

      if (agendamentosParaCriar.length === 0) {
        Swal.fire('Ops!', 'Não foi possível encontrar datas válidas com antecedência mínima de 24h.', 'warning');
        return;
      }

      this.$emit('confirmar', {
        lote: agendamentosParaCriar,
        fixo: true
      });
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
  color: #4b5563;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.modal-title {
  margin: 0;
  padding: 20px 24px;
  color: #3F85F6;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.tabs-container {
  background-color: #fff;
}

.tabs-list {
  display: flex;
  width: 100%;
}

.tab-item {
  flex: 1;
  background: #fff;
  border: none;
  border-bottom: 3px solid transparent;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  position: relative;
}

.separator-right {
  border-right: 1px solid #3F85F6;
}

.tab-item:hover {
  color: #3F85F6;
}

.tab-item.active {
  color: #3F85F6;
  border-bottom-color: #3F85F6;
}

.form-select,
.input-time-fixo {
  color: #374151;
  height: 42px !important;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 100%;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-select:focus,
.input-time-fixo:focus {
  border-color: #1E3A8A;
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1);
}

.input-time-wrapper {
  position: relative;
  width: 100%;
}

.clock-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
  background: white;
}

.custom-time-dropdown {
  position: absolute;
  top: 105%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #3F85F6;
  border-radius: 6px;
  z-index: 999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.time-option {
  padding: 10px 15px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.time-option:last-child {
  border-bottom: none;
}

.time-option:hover {
  background-color: #eff6ff;
  color: #1E3A8A;
}

.custom-time-dropdown::-webkit-scrollbar {
  width: 6px;
}

.custom-time-dropdown::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

:deep(.dp-custom-input) {
  height: 42px !important;
  border-radius: 6px !important;
  border: 1px solid #d1d5db !important;
  color: #374151 !important;
}

.linha-selects {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.campo {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.mb-3 {
  margin-bottom: 16px;
}

.info-box {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
}

.dias-semana-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.btn-dia-semana {
  border: 1px solid #d1d5db;
  background-color: #fff;
  color: #6b7280;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-dia-semana:hover:not(:disabled) {
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.btn-dia-semana.active {
  background-color: #1E3A8A;
  border-color: #1E3A8A;
  color: white;
  box-shadow: 0 2px 4px rgba(30, 58, 138, 0.2);
}

.btn-dia-semana:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #f3f4f6;
}

.config-horarios-fixos {
  background-color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.linha-horario-fixo {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.linha-horario-fixo:last-child {
  margin-bottom: 0;
}

.dia-label {
  width: 90px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
}

.horarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.btn-horario {
  height: 36px;
  font-size: 13px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: #fff;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-horario:hover:not(:disabled) {
  border-color: #1E3A8A;
  color: #1E3A8A;
}

.btn-horario.selecionado {
  background-color: #1E3A8A;
  color: #fff;
  border-color: #1E3A8A;
}

.btn-horario:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.modal-actions button {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn-confirmar {
  background-color: #1E3A8A;
  color: #fff;
}

.btn-confirmar:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.btn-cancelar {
  background-color: #f3f4f6;
  color: #4b5563;
}

.btn-confirmar:hover:not(:disabled),
.btn-cancelar:hover {
  opacity: 0.9;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1E3A8A;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>