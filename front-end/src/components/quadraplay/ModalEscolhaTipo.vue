<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content">
      <h2>Escolha a ação</h2>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo" @click="abrirModalPartida">
          Adicionar Partida
        </button>
        <button class="btn-tipo" @click="abrirModalFase">
          Adicionar Fase
        </button>
        <button class="btn-tipo" @click="abrirModalRodada">
          Adicionar Rodada
        </button>
      </div>

      <div class="botoes">
        <button type="button" class="btn-cancel" @click="fechar">
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL DE CRIAR PARTIDA -->
  <div v-if="mostrarModalPartida" class="modal-overlay" @click.self="mostrarModalPartida = false">
    <div class="modal-content modal-times">
      <h2>Criar Partida</h2>

      <!-- FASE -->
      <div class="filtros-topo">
        <label>Selecione a fase:</label>
        <select v-model="partida.faseId" @change="listarRodadas">
          <option disabled value="">Escolha uma fase</option>
          <option v-for="fase in fases" :key="fase.id" :value="fase.id">
            {{ fase.nome }}
          </option>
        </select>
      </div>

      <!-- RODADA -->
      <div class="filtros-topo">
        <label>Selecione a rodada:</label>
        <select v-model="partida.rodadaId" :disabled="!rodadas.length">
          <option disabled value="">Escolha uma rodada</option>
          <option v-for="rodada in rodadas" :key="rodada.id" :value="rodada.id">
            {{ rodada.nome }}
          </option>
        </select>
      </div>

      <!-- TIME A -->
      <div class="filtros-topo">
        <label>Time 1:</label>
        <select v-model="partida.timeAId">
          <option disabled value="">Selecione o time</option>
          <option v-for="time in times" :key="time.id" :value="time.id">
            {{ time.nome }}
          </option>
        </select>
      </div>

      <!-- TIME B -->
      <div class="filtros-topo">
        <label>Time 2:</label>
        <select v-model="partida.timeBId">
          <option disabled value="">Selecione o time</option>
          <option v-for="time in times" :key="time.id" :value="time.id" :disabled="time.id === partida.timeAId">
            {{ time.nome }}
          </option>
        </select>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="criarPartida">Criar Partida</button>
        <button class="btn-cancel" @click="mostrarModalPartida = false">Voltar</button>
      </div>
    </div>
  </div>

  <!-- MODAL DE CRIAR FASE -->
  <div v-if="mostrarModalFase" class="modal-overlay" @click.self="mostrarModalFase = false">
    <div class="modal-content modal-times">
      <h2>Criar Nova Fase</h2>

      <div class="filtros-topo">
        <label for="nomeFase">Digite o nome da fase:</label>
        <input id="nomeFase" v-model="nomeFase" type="text" placeholder="Ex: Eliminatórias" />
      </div>

      <label for="nomeFase">Selecione os times: {{ timesSelecionados.length }} selecionado(s)</label>

      <div class="lista-times">
        <div v-for="time in times" :key="time.id" class="time-card"
          :class="{ selecionado: timesSelecionados.includes(time.id) }" @click="toggleTime(time.id)">
          <div class="time-card-top">
            <div class="time-foto" v-if="time.foto">
              <img :src="time.foto" :alt="time.nome" />
            </div>
            <h3 class="time-nome">{{ time.nome }}</h3>
          </div>
          <span>{{ time._count?.jogadores }} jogadores</span>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="criarFase">Criar Fase</button>
        <button class="btn-cancel" @click="mostrarModalFase = false">Voltar</button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalRodada" class="modal-overlay" @click.self="mostrarModalRodada = false">
    <div class="modal-content modal-times">
      <h2>Criar Nova Rodada</h2>
      <div class="filtros-topo">
        <label for="faseSelect">Selecione a fase:</label>
        <select id="faseSelect" v-model="faseIdSelecionada">
          <option value="" disabled>Escolha uma fase</option>
          <option v-for="fase in fases" :key="fase.id" :value="fase.id">
            {{ fase.nome }}
          </option>
        </select>
      </div>

      <div class="filtros-topo">
        <label for="nomeRodada">Digite o nome da rodada:</label>
        <input id="nomeRodada" v-model="nomeRodada" type="text" placeholder="Ex: Rodada 1" />
      </div>

      <div class="botoes">
        <button class="btn-save" @click="criarRodada">Criar Rodada</button>
        <button class="btn-cancel" @click="mostrarModalRodada = false">Voltar</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'ModalEscolherTipo',
  props: {
    modelValue: { type: Boolean, required: true },
    campeonatoId: { type: String, required: true }
  },
  data() {
    return {
      usuario: null,
      mostrarModalFase: false,
      mostrarModalPartida: false,
      nomeFase: '',
      times: [],
      timesSelecionados: [],
      mostrarModalRodada: false,
      nomeRodada: '',
      fases: [],
      faseIdSelecionada: null,
      modalidadeId: null,
      quadraId: null,
      rodadas: [],
      partida: {
        faseId: '',
        rodadaId: '',
        timeAId: '',
        timeBId: ''
      }

    };
  },
  emits: ['update:modelValue', 'selecionar', 'rodadaCriada'],

  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log('USUÁRIO LOGADO (Modal):', this.usuario);
  },

  methods: {
    fechar() {
      this.$emit('update:modelValue', false);
    },
    selecionar(tipo) {
      this.$emit('selecionar', tipo);
      this.fechar();
    },

    async abrirModalPartida() {
      await this.carregarModalidadeCampeonato();
      await this.listarFases();
      await this.listarTimes();
      this.rodadas = [];

      this.partida = {
        faseId: '',
        rodadaId: '',
        timeAId: '',
        timeBId: ''
      };

      this.mostrarModalPartida = true;
    },

    abrirModalFase() {
      this.mostrarModalFase = true;
      this.listarTimes();
    },

    async abrirModalRodada() {
      await this.listarFases();
      this.faseIdSelecionada = "";
      this.mostrarModalRodada = true;
    },

    async listarFases() {
      try {
        const { data } = await api.get(`/fases/${this.campeonatoId}/`);
        this.fases = data || [];
      } catch (err) {
        console.error('Erro ao listar fases:', err);
        Swal.fire('Erro', 'Não foi possível carregar as fases.', 'error');
      }
    },

    async listarTimes() {
      try {
        const { data } = await api.get(`/${this.campeonatoId}/times`);
        this.times = data || [];
        this.timesSelecionados = [];
      } catch (err) {
        console.error('Erro ao listar times:', err);
        Swal.fire('Erro', 'Não foi possível carregar os times.', 'error');
      }
    },

    toggleTime(timeId) {
      const index = this.timesSelecionados.indexOf(timeId);
      if (index > -1) {
        this.timesSelecionados.splice(index, 1);
      } else {
        this.timesSelecionados.push(timeId);
      }
    },

    async criarFase() {
      if (!this.nomeFase) {
        Swal.fire('Erro', 'Informe o nome da fase.', 'error');
        return;
      }
      if (this.timesSelecionados.length === 0) {
        Swal.fire('Erro', 'Selecione pelo menos um time.', 'error');
        return;
      }

      try {
        const { data } = await api.post(`/campeonatos/${this.campeonatoId}/fases`, {
          nome: this.nomeFase,
          times: this.timesSelecionados
        });
        console.log('API resposta fase:', data);
        Swal.fire('Sucesso', 'Fase criada com sucesso!', 'success');
        this.$emit('faseCriada', data.fase);

        this.mostrarModalFase = false;
        this.nomeFase = '';
        this.timesSelecionados = [];
        this.times = [];
      } catch (err) {
        console.error('Erro ao criar fase:', err);
        Swal.fire('Erro', 'Não foi possível criar a fase.', 'error');
      }
    },

    async criarRodada() {
      if (!this.nomeRodada) {
        Swal.fire('Erro', 'Informe o nome da rodada.', 'error');
        return;
      }
      if (!this.faseIdSelecionada) {
        Swal.fire('Erro', 'Selecione uma fase.', 'error');
        return;
      }

      try {
        const { data } = await api.post(`/rodada/${this.campeonatoId}/${this.faseIdSelecionada}`, {
          nome: this.nomeRodada
        });
        Swal.fire('Sucesso', 'Rodada criada com sucesso!', 'success');
        this.nomeRodada = '';
        this.faseIdSelecionada = null;
        this.mostrarModalRodada = false;
        this.$emit('rodadaCriada', data.rodada);
      } catch (err) {
        console.error('Erro ao criar rodada:', err);
        Swal.fire('Erro', 'Não foi possível criar a rodada.', 'error');
      }
    },

    listarRodadas() {
      const faseSelecionada = this.fases.find(
        f => f.id === Number(this.partida.faseId)
      );

      this.rodadas = faseSelecionada?.rodadas || [];
      this.partida.rodadaId = '';
    },

    async criarPartida() {
      const { faseId, rodadaId, timeAId, timeBId } = this.partida;

      if (!faseId || !rodadaId || !timeAId || !timeBId) {
        Swal.fire('Erro', 'Preencha todos os campos.', 'error');
        return;
      }

      if (!this.modalidadeId) {
        Swal.fire('Erro', 'Modalidade não encontrada para este campeonato.', 'error');
        return;
      }

      if (timeAId === timeBId) {
        Swal.fire('Erro', 'Os times não podem ser iguais.', 'error');
        return;
      }

      try {
        const payload = {
          campeonatoId: Number(this.campeonatoId),
          modalidadeId: Number(this.modalidadeId),
          faseId: Number(faseId),
          rodadaId: Number(rodadaId),
          timeAId: Number(timeAId),
          timeBId: Number(timeBId),
          quadraId: Number(this.quadraId)
        };

        const { data } = await api.post('/partida', payload);

        Swal.fire('Sucesso', 'Partida criada com sucesso!', 'success');
        this.mostrarModalPartida = false;

        this.$emit('partidaCriada', data);
      } catch (err) {
        console.error('Erro ao criar partida:', err);
        Swal.fire(
          'Erro',
          err.response?.data?.message || 'Erro ao criar partida.',
          'error'
        );
      }
    },

    async carregarModalidadeCampeonato() {
      try {
        const { data } = await api.get(`/campeonato/${this.campeonatoId}`);
        this.modalidadeId = data.modalidadeId;
        this.quadraId = data.quadraId; // 👈 IMPORTANTE
      } catch (err) {
        console.error('Erro ao carregar campeonato:', err);
      }
    }
  }
};
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
  width: 900px;
  max-width: 95%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
  font-weight: bold;
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-tipo {
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.btn-tipo:hover {
  background-color: #3b82f6;
  color: #fff;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #7e7e7e;
}

.modal-times .lista-times {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
  background-color: #fff;
}

.modal-times label {
  font-size: 17px;
  margin-bottom: 6px;
}

/* CARD DO TIME */
.time-card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: 0.2s;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.time-card.selecionado {
  background: #3b82f6;
  color: white;
  border-color: #1e40af;
}

.time-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-foto {
  width: 50px;
  height: 50px;
}

.time-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #3b82f6;
}

.time-nome {
  font-size: 16px;
  font-weight: bold;
}

.time-jogadores {
  font-size: 14px;
  color: #555;
}

.filtros-topo select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.filtros-topo select:hover {
  border-color: #3b82f6;
}

.filtros-topo select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filtros-topo select option[disabled] {
  color: #9ca3af;
}

.filtros-topo input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  color: #111827;
  background-color: #fff;
  outline: none;
}
</style>