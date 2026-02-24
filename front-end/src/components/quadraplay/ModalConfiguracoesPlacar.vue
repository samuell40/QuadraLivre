<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content modal-escolha-config">
      <div class="modal-header">
        <span class="title">Configurações de Classificacao</span>
        <button type="button" class="btn-close-x" @click="fechar">x</button>
      </div>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo btn-tipo-card" @click="abrirModalFase">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stack"
              viewBox="0 0 16 16">
              <path
                d="m14.12 10.163 1.715.858c.22.11.22.424 0 .534L8.267 15.34a.6.6 0 0 1-.534 0L.165 11.555a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0l5.317-2.66zM7.733.063a.6.6 0 0 1 .534 0l7.568 3.784a.3.3 0 0 1 0 .535L8.267 8.165a.6.6 0 0 1-.534 0L.165 4.382a.299.299 0 0 1 0-.535z" />
              <path
                d="m14.12 6.576 1.715.858c.22.11.22.424 0 .534l-7.568 3.784a.6.6 0 0 1-.534 0L.165 7.968a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0z" />
            </svg>
            <span class="titulo-acao-modal">Adicionar fase</span>
          </span>
          <small class="btn-tipo-sub">Cria uma nova fase e seleciona os times participantes</small>
        </button>

        <button class="btn-tipo btn-tipo-card" @click="criteriosClassificacao">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list-ol"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5" />
              <path
                d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z" />
            </svg>
            <span class="titulo-acao-modal">Criterios de Classificacao</span>
          </span>
          <small class="btn-tipo-sub">Define a ordem dos criterios usados na classificacao</small>
        </button>

        <button class="btn-tipo btn-tipo-card" @click="grupos">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill"
              viewBox="0 0 16 16">
              <path
                d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
            </svg>
            <span class="titulo-acao-modal">Grupos</span>
          </span>
          <small class="btn-tipo-sub">Organiza os grupos do campeonato</small>
        </button>
      </div>

      <div class="botoes">
        <button class="btn-cancel" @click="fechar">
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal para criar fase -->
  <div v-if="mostrarModalFase" class="modal-overlay" @click.self="fecharModalFase">
    <div class="modal-content modal-times">
      <div class="modal-header">
        <h2>Criar Nova Fase</h2>
        <button type="button" class="btn-close-x" @click="fecharModalFase">x</button>
      </div>

      <div class="filtros-topo">
        <label>Digite o nome da fase:</label>
        <input v-model="nomeFase" type="text" placeholder="Ex: Eliminatatorias" />
      </div>

      <label>
        Selecione os times:
        {{ timesSelecionados.length }} selecionado(s)
      </label>

      <div class="lista-times">
        <div v-for="time in times" :key="time.id" class="time-card"
          :class="{ selecionado: timesSelecionados.includes(time.id) }" @click="toggleTime(time.id)">
          <div class="time-card-top">
            <div v-if="time.foto" class="time-foto">
              <img :src="time.foto" :alt="time.nome" />
            </div>

            <h3 class="time-nome">
              {{ time.nome }}
            </h3>
          </div>

          <span>
            {{ time._count?.jogadores || 0 }} jogadores
          </span>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="criarFase">
          Criar Fase
        </button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalCriterios" class="modal-overlay" @click.self="fecharModalCriterios">
    <div class="modal-content modal-criterios">
      <div class="modal-header">
        <h2>Criterios de Classificação</h2>
        <button type="button" class="btn-close-x" @click="fecharModalCriterios">x</button>
      </div>

      <p class="descricao">
        Arraste para definir a ordem de classificaÃ§Ã£o
      </p>

      <div class="lista-criterios">
        <div v-for="(criterio, indice) in criterios" :key="criterio.value" class="criterio-item" draggable="true"
          @dragstart="iniciarArraste(indice)" @dragover.prevent @drop="soltar(indice)">
          <span class="ordem">{{ indice + 1 }}</span>
          <span class="nome">{{ criterio.label }}</span>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="salvarOrdem">
          Salvar ordem
        </button>
      </div>

      <div v-if="classificacao.length" class="classificacao-atual">
        <h3>ClassificaÃ§Ã£o atual:</h3>
        <div v-for="(time, index) in classificacao" :key="time.timeId">
          {{ index + 1 }} - {{ time.time.nome }} - {{ time.pontuacao }} pts
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios"
import Swal from "sweetalert2"

export default {
  name: "ModalConfiguracoesCampeonato",

  props: {
    modelValue: Boolean,
    campeonato: Object
  },

  emits: ["update:modelValue", "faseCriada", "criterios", "grupos"],

  data() {
    return {
      mostrarModalFase: false,
      mostrarModalCriterios: false,
      nomeFase: "",
      times: [],
      timesSelecionados: [],
      criterios: [],
      classificacao: [],
      indiceArraste: null
    }
  },

  methods: {
    fechar() {
      this.$emit("update:modelValue", false)
    },

    abrirModalFase() {
      this.mostrarModalFase = true
      this.listarTimes()
    },

    fecharModalFase() {
      this.mostrarModalFase = false
      this.nomeFase = ""
      this.timesSelecionados = []
    },

    async criteriosClassificacao() {
      this.mostrarModalCriterios = true
      try {
        const resp = await api.get(`/ordem/classificacao/${this.campeonato.id}`)
        const data = resp.data

        if (data?.ordem?.length) {
          this.criterios = data.ordem.slice()
        } else {
          this.criterios = []
        }
        if (data && data.classificacao) {
          this.classificacao = data.classificacao
        } else {
          this.classificacao = []
        }

      } catch (err) {
        console.error("Erro ao carregar critÃ©rios:", err)
        this.criterios = []
      }
    },

    fecharModalCriterios() {
      this.mostrarModalCriterios = false
    },

    iniciarArraste(indice) {
      this.indiceArraste = indice
    },

    soltar(indiceDestino) {
      const criterioMovido = this.criterios[this.indiceArraste]
      this.criterios.splice(this.indiceArraste, 1)
      this.criterios.splice(indiceDestino, 0, criterioMovido)
    },

    async salvarOrdem() {
      try {
        const ordem = this.criterios.map(c => ({ label: c.label, value: c.value }))
        await api.put(`/campeonatos/${this.campeonato.id}/classificacao/ordem`, { ordem })

        await Swal.fire({
          title: "Sucesso",
          text: "Ordem salva com sucesso",
          icon: "success",
          target: ".modal-criterios"
        })

        this.fecharModalCriterios()
      } catch {
        Swal.fire({
          title: "Erro",
          text: "Erro ao salvar ordem",
          icon: "error",
          target: ".modal-criterios"
        })
      }
    },

    grupos() {
      this.$emit("grupos")
      this.fechar()
    },

    async listarTimes() {
      try {
        const { data } = await api.get(`/${this.campeonato.id}/times`)
        this.times = data
      } catch (err) {
        console.error(err)
        Swal.fire("Erro", "NÃ£o foi possÃ­vel carregar os times.", "error")
      }
    },

    toggleTime(timeId) {
      const index = this.timesSelecionados.indexOf(timeId)
      if (index > -1) this.timesSelecionados.splice(index, 1)
      else this.timesSelecionados.push(timeId)
    },

    async criarFase() {
      if (!this.nomeFase) {
        Swal.fire("Erro", "Informe o nome da fase.", "error")
        return
      }

      if (this.timesSelecionados.length === 0) {
        Swal.fire("Erro", "Selecione pelo menos um time.", "error")
        return
      }

      try {
        const { data } = await api.post(`/campeonatos/${this.campeonato.id}/fases`, {
          nome: this.nomeFase,
          times: this.timesSelecionados
        })

        Swal.fire("Sucesso", "Fase criada com sucesso!", "success")
        this.$emit("faseCriada", data.fase)
        this.fecharModalFase()
      } catch (err) {
        console.error(err)
        Swal.fire("Erro", "Erro ao criar fase.", "error")
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
  z-index: 2000;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header h2 {
  margin-bottom: 0;
}

.btn-close-x {
  width: 34px;
  height: 34px;
  border: 1px solid #3b82f6;
  border-radius: 999px;
  background: #fff;
  color: #3b82f6;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
}

.modal-escolha-config {
  width: min(720px, 92vw);
  padding: 26px 28px;
  border-radius: 18px;
  text-align: left;
}

.modal-escolha-config .modal-header {
  margin-bottom: 10px;
}

.title{
  color: #3b82f6;
  font-size: 34px;
  font-weight: bold;
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 10px 0 18px;
}

.btn-tipo {
  width: 100%;
  cursor: pointer;
  transition: 0.2s ease;
  border: none;
  background: transparent;
  padding: 0;
}

.btn-tipo-card {
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;
  text-align: left;
  color: #0f172a;
}

.btn-tipo-card:hover {
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.45);
  transform: translateY(-1px);
}

.btn-tipo-card:active {
  transform: translateY(0);
}

.btn-tipo-titulo {
  font-weight: 800;
  color: #000;
  font-size: 18px;
  letter-spacing: -0.1px;
  width: 100%;
  text-align: left;
}

.btn-tipo-titulo-com-icone {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-tipo-titulo-com-icone svg {
  color: #3b82f6;
  width: 20px;
  height: 20px;
  flex: 0 0 20px;
}

.btn-tipo-sub {
  font-size: 13px;
  font-weight: 600;
  color: #777;
  line-height: 1.25;
  width: 100%;
  text-align: left;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: white;
  font-weight: 700;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #3b82f6;
}

.modal-escolha-config .btn-cancel {
  background: transparent;
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.35);
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
}

.time-card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.time-card.selecionado {
  background-color: #3b82f6;
  color: white;

}

.time-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-foto {
  width: 50px;
  height: 50px;
}

.time-foto img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.time-nome {
  font-weight: bold;
}

.filtros-topo {
  margin-bottom: 15px;
}

.filtros-topo input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.modal-criterios {
  width: 900px;
}

.descricao {
  margin-bottom: 15px;
  color: #6b7280;
}

.lista-criterios {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
}

.lista-criterios::-webkit-scrollbar {
  width: 6px;
}

.lista-criterios::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 10px;
}

.lista-criterios::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.criterio-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  cursor: grab;
  background: white;
}

.criterio-item:last-child {
  border-bottom: none;
}

.criterio-item:hover {
  background: #f9fafb;
}

.ordem {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex: 0 0 auto;
}

.nome {
  flex: 1;
  color: #0f172a;
  font-weight: 600;
}

.drag {
  cursor: grab;
  color: #6b7280;
  font-size: 18px;
}
</style>
