<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <div class="header-modal">
        <h2>Detalhes da Modalidade - {{ formatarNome(modalidade?.nome) }}</h2>
        <butoon>Gerenciar Modalidades</butoon>
      </div>
      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion('quadras')">
          <span>Quadras</span>
          <span>{{ accordionAberto === 'quadras' ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionAberto === 'quadras'" class="accordion-body">
          <div v-if="quadras.length === 0" class="vazio">
            Nenhuma quadra associada.
          </div>

          <ul v-else>
            <li v-for="quadra in quadras" :key="quadra.id">
              {{ quadra.nome }}
            </li>
          </ul>
        </div>
      </div>

      <div class="accordion">
        <div class="accordion-header" @click="toggleAccordion('times')">
          <span>Times</span>
          <span>{{ accordionAberto === 'times' ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionAberto === 'times'" class="accordion-body">
          <div v-if="times.length === 0" class="vazio">
            Nenhum time cadastrado.
          </div>

          <ul v-else>
            <li v-for="time in times" :key="time.id">
              {{ time.nome }}
            </li>
          </ul>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-cancel" @click="$emit('fechar')">
          Fechar
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'DetalharModalidadeModal',

  props: {
    aberto: Boolean,
    modalidade: Object
  },

  data() {
    return {
      times: [],
      quadras: [],
      accordionAberto: 'quadras'
    }
  },

  watch: {
    aberto(valor) {
      if (valor && this.modalidade?.id) {
        this.accordionAberto = 'quadras'
        this.carregarDados()
      }
    }
  },

  methods: {
    toggleAccordion(tipo) {
      this.accordionAberto =
        this.accordionAberto === tipo ? null : tipo
    },

    formatarNome(nome) {
      if (!nome) return ''
      return nome
        .split(' ')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ')
    },

   async carregarDados() {
  try {
    const [timesRes, quadrasRes] = await Promise.all([
      api.get(`/times/modalidade/${this.modalidade.id}`),
      api.get(`/quadra?modalidadeId=${this.modalidade.id}`) 
    ]);

    this.times = timesRes.data;
    this.quadras = quadrasRes.data;
  } catch (err) {
    console.error('Erro ao carregar detalhes da modalidade', err);
  }
}
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 1000px;
  max-width: 95%;
  height: auto;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #3b82f6;
  margin-bottom: 5px;
}

.subtitulo {
  margin-bottom: 20px;
  color: #555;
  font-weight: 500;
}

.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.accordion-header {
  background: #f9fafb;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}

.accordion-body {
  padding: 12px 16px;
}

.accordion-body ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.accordion-body li {
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}

.accordion-body li:last-child {
  border-bottom: none;
}

.vazio {
  color: #7e7e7e;
  font-style: italic;
}

.botoes {
  margin-top: 20px;
}

.btn-cancel {
  width: 100%;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background-color: #3b82f6;
  color: white;
  font-size: 16px;
}

</style>