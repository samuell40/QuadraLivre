<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content">
      <h2>Configurações do campeonato</h2>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo" @click="abrirModalFase">
          Adicionar fase
        </button>

        <button class="btn-tipo" @click="criteriosClassificacao">
          Critérios de classificação
        </button>

        <button class="btn-tipo" @click="grupos">
          Grupos
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

      <h2>Criar Nova Fase</h2>

      <div class="filtros-topo">
        <label>Digite o nome da fase:</label>
        <input v-model="nomeFase" type="text" placeholder="Ex: Eliminatórias" />
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

  <!-- Modal de critérios de classificação -->
  <div v-if="mostrarModalCriterios" class="modal-overlay" @click.self="fecharModalCriterios">
    <div class="modal-content modal-criterios">
      <h2>Critérios de classificação</h2>

      <p class="descricao">
        Arraste para definir a ordem de classificação
      </p>

      <div class="lista-criterios">
        <div v-for="(criterio, indice) in criterios" :key="criterio.value" class="criterio-item" draggable="true"
          @dragstart="iniciarArraste(indice)" @dragover.prevent @drop="soltar(indice)">
          <span class="ordem">{{ indice + 1 }}</span>
          <span class="nome">{{ criterio.label }}</span>
          <span class="drag">☰</span>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="salvarOrdem">
          Salvar ordem
        </button>
      </div>

      <div v-if="classificacao.length" class="classificacao-atual">
        <h3>Classificação atual:</h3>
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
        console.error("Erro ao carregar critérios:", err)
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
        Swal.fire("Erro", "Não foi possível carregar os times.", "error")
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

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn-tipo {
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #3b82f6;
  background-color: #fff;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
}

.btn-tipo:hover {
  background-color: #3b82f6;
  color: white;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: white;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #3b82f6;
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
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: grab;
  background: white;
}

.criterio-item:hover {
  background: #f9fafb;
}

.ordem {
  font-weight: bold;
  width: 30px;
  color: #3b82f6;
}

.nome {
  flex: 1;
}

.drag {
  cursor: grab;
  color: #6b7280;
}
</style>
