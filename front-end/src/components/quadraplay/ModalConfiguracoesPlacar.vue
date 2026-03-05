<template>
  <div v-if="modelValue && !mostrarModalFase && !mostrarModalCriterios && !mostrarModalColunas" class="modal-overlay"
    @click.self="fechar">
    <div class="modal-content modal-escolha-config">
      <div class="modal-header">
        <span class="title">Configurações de Classificação</span>
        <button type="button" class="btn-close-x" @click="fechar">x</button>
      </div>

      <div class="tipo-campeonato-lista">
        <button class="btn-tipo btn-tipo-card" :disabled="carregandoAcaoEscolha" @click="onEscolherConfiguracao('FASE')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stack"
              viewBox="0 0 16 16">
              <path
                d="m14.12 10.163 1.715.858c.22.11.22.424 0 .534L8.267 15.34a.6.6 0 0 1-.534 0L.165 11.555a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0l5.317-2.66zM7.733.063a.6.6 0 0 1 .534 0l7.568 3.784a.3.3 0 0 1 0 .535L8.267 8.165a.6.6 0 0 1-.534 0L.165 4.382a.299.299 0 0 1 0-.535z" />
              <path
                d="m14.12 6.576 1.715.858c.22.11.22.424 0 .534l-7.568 3.784a.6.6 0 0 1-.534 0L.165 7.968a.299.299 0 0 1 0-.534l1.716-.858 5.317 2.659c.505.252 1.1.252 1.604 0z" />
            </svg>
            <span class="titulo-acao-modal">Adicionar fase</span>
            <span v-if="carregandoAcaoEscolha && acaoSelecionada === 'FASE'" class="acao-loading-spinner"
              aria-hidden="true"></span>
          </span>
          <small class="btn-tipo-sub">Cria uma nova fase e seleciona os times participantes</small>
        </button>

        <button class="btn-tipo btn-tipo-card" :disabled="carregandoAcaoEscolha"
          @click="onEscolherConfiguracao('GRUPOS')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill"
              viewBox="0 0 16 16">
              <path
                d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
            </svg>
            <span class="titulo-acao-modal">Grupos</span>
            <span v-if="carregandoAcaoEscolha && acaoSelecionada === 'GRUPOS'" class="acao-loading-spinner"
              aria-hidden="true"></span>
          </span>
          <small class="btn-tipo-sub">Organiza os grupos do campeonato</small>
        </button>

        <button class="btn-tipo btn-tipo-card" :disabled="carregandoAcaoEscolha"
          @click="onEscolherConfiguracao('CRITERIOS')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list-ol"
              viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5" />
              <path
                d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z" />
            </svg>
            <span class="titulo-acao-modal">Critérios de Classificação</span>
            <span v-if="carregandoAcaoEscolha && acaoSelecionada === 'CRITERIOS'" class="acao-loading-spinner"
              aria-hidden="true"></span>
          </span>
          <small class="btn-tipo-sub">Define a ordem dos critérios usados na classificação</small>
        </button>

        <button class="btn-tipo btn-tipo-card" :disabled="carregandoAcaoEscolha"
          @click="onEscolherConfiguracao('COLUNAS')">
          <span class="btn-tipo-titulo btn-tipo-titulo-com-icone">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-layout-text-window-reverse" viewBox="0 0 16 16">
              <path
                d="M13.5 1a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 13.5 15h-11A1.5 1.5 0 0 1 1 13.5v-11A1.5 1.5 0 0 1 2.5 1h11zm-11 1A.5.5 0 0 0 2 2.5v2h12v-2a.5.5 0 0 0-.5-.5h-11zM14 5.5H2v8a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-8z" />
              <path d="M3 7h2v2H3V7zm0 3h2v2H3v-2zm3-3h7v1H6V7zm0 3h7v1H6v-1z" />
            </svg>
            <span class="titulo-acao-modal">Colunas da Tabela</span>
            <span v-if="carregandoAcaoEscolha && acaoSelecionada === 'COLUNAS'" class="acao-loading-spinner"
              aria-hidden="true"></span>
          </span>
          <small class="btn-tipo-sub">Seleciona quais colunas devem aparecer no placar</small>
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
        <div class="modal-header-copy">
          <span class="title">Criar nova fase</span>
        </div>
        <button type="button" class="btn-close-x" @click="fecharModalFase">x</button>
      </div>

      <section class="fase-form-card">
        <div class="campo-fase">
          <span class="campo-fase-label">Nome da fase</span>
        <input v-model="nomeFase" type="text" placeholder="Ex: Eliminatórias" />
      </div>

      </section>

      <section class="fase-times-card">
        <div class="fase-times-head">
          <div>
            <h3>Selecionar times</h3>
          </div>
          <span class="fase-total">{{ timesSelecionados.length }} selecionado(s)</span>
        </div>

      <div v-if="times.length" class="lista-times">
        <div
          v-for="time in times"
          :key="time.id"
          class="time-card"
          :class="{ selecionado: timesSelecionados.includes(time.id) }"
          @click="toggleTime(time.id)"
        >
          <div class="time-card-top">
            <div v-if="time.foto" class="time-foto">
              <img :src="time.foto" :alt="time.nome" />
            </div>

            <div class="time-card-copy">
              <h3 class="time-nome">
                {{ time.nome }}
              </h3>
              <span class="time-card-meta">
                {{ time._count?.jogadores || 0 }} jogadores
              </span>
            </div>

            <span v-if="timesSelecionados.includes(time.id)" class="time-card-badge">
              Selecionado
            </span>
          </div>
        </div>
      </div>

      <div v-else class="estado-vazio-times">
        Nenhum time disponivel para esta fase.
      </div>

      </section>

      <div class="botoes botoes-modal-times">
        <button class="btn-save" :disabled="salvandoFase" @click="criarFase">
          <span class="btn-save-content">
            <span v-if="salvandoFase" class="btn-save-spinner" aria-hidden="true"></span>
            <span>{{ salvandoFase ? 'Salvando...' : 'Criar Fase' }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>

  <div v-if="mostrarModalCriterios" class="modal-overlay" @click.self="fecharModalCriterios">
    <div class="modal-content modal-criterios">
      <div class="modal-header">
        <h2>Critérios de Classificação</h2>
        <button type="button" class="btn-close-x" @click="fecharModalCriterios">x</button>
      </div>

      <p class="descricao">
        Arraste para definir a ordem de classificação
      </p>

      <div class="lista-criterios">
        <div v-for="(criterio, indice) in criterios" :key="criterio.value" class="criterio-item" draggable="true"
          @dragstart="iniciarArraste(indice)" @dragover.prevent @drop="soltar(indice)">
          <span class="ordem">{{ indice + 1 }}</span>
          <span class="nome">{{ criterio.label }}</span>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" :disabled="salvandoOrdem" @click="salvarOrdem">
          <span class="btn-save-content">
            <span v-if="salvandoOrdem" class="btn-save-spinner" aria-hidden="true"></span>
            <span>{{ salvandoOrdem ? 'Salvando...' : 'Salvar ordem' }}</span>
          </span>
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

  <div v-if="mostrarModalColunas" class="modal-overlay" @click.self="fecharModalColunas">
    <div class="modal-content modal-criterios modal-colunas">
      <div class="modal-header">
        <h2>Colunas da Tabela</h2>
        <button type="button" class="btn-close-x" @click="fecharModalColunas">x</button>
      </div>

      <p class="descricao">
        Arraste para ordenar e marque as colunas que devem aparecer na tabela de classificação
      </p>

      <div class="lista-criterios lista-colunas">
        <label class="coluna-item coluna-item-fixa">
          <input type="checkbox" checked disabled />
          <span class="nome">Time</span>
          <span class="sigla-coluna">TIME</span>
        </label>

        <label v-for="(coluna, indice) in colunasOrdenadas" :key="coluna.key" class="coluna-item"
          :class="{ 'coluna-item-ativa': colunaSelecionada(coluna.key), dragging: indiceArrasteColuna === indice }"
          draggable="true" @dragstart="iniciarArrasteColuna($event, indice)" @dragover.prevent
          @drop="soltarColuna(indice)" @dragend="finalizarArrasteColuna">
          <span class="drag-handle" aria-hidden="true">::</span>
          <input v-model="colunasSelecionadas" type="checkbox" :value="coluna.key" />
          <span class="nome">{{ coluna.label }}</span>
          <span class="sigla-coluna">{{ coluna.abbr }}</span>
        </label>
      </div>

      <div class="botoes">
        <button class="btn-save" :disabled="salvandoColunas" @click="salvarColunas">
          <span class="btn-save-content">
            <span v-if="salvandoColunas" class="btn-save-spinner" aria-hidden="true"></span>
            <span>{{ salvandoColunas ? 'Salvando...' : 'Salvar colunas' }}</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/axios"
import Swal from "sweetalert2"
import {
  getColunasClassificacaoPorModalidade,
  getChavesPadraoColunasClassificacao,
  resolverColunasVisiveisClassificacao
} from "@/utils/classificacaoColunas"

export default {
  name: "ModalConfiguracoesCampeonato",

  props: {
    modelValue: Boolean,
    campeonato: Object
  },

  emits: ["update:modelValue", "faseCriada", "criterios", "colunas", "grupos"],

  data() {
    return {
      mostrarModalFase: false,
      mostrarModalCriterios: false,
      mostrarModalColunas: false,
      nomeFase: "",
      times: [],
      timesSelecionados: [],
      criterios: [],
      colunasSelecionadas: [],
      ordemColunas: [],
      classificacao: [],
      indiceArraste: null,
      indiceArrasteColuna: null,
      salvandoFase: false,
      salvandoOrdem: false,
      salvandoColunas: false,
      carregandoAcaoEscolha: false,
      acaoSelecionada: ''
    }
  },

  computed: {
    colunasDisponiveis() {
      return getColunasClassificacaoPorModalidade(this.campeonato?.modalidade?.nome)
    },
    colunasOrdenadas() {
      return this.ordemColunas.length ? this.ordemColunas : this.colunasDisponiveis
    }
  },

  methods: {
    fechar() {
      this.$emit("update:modelValue", false)
    },

    async onEscolherConfiguracao(acao) {
      if (this.carregandoAcaoEscolha) return
      this.carregandoAcaoEscolha = true
      this.acaoSelecionada = acao

      try {
        if (acao === 'FASE') {
          await this.abrirModalFase()
          return
        }

        if (acao === 'GRUPOS') {
          this.grupos()
          return
        }

        if (acao === 'CRITERIOS') {
          await this.criteriosClassificacao()
          return
        }

        if (acao === 'COLUNAS') {
          await this.colunasClassificacao()
        }
      } finally {
        this.carregandoAcaoEscolha = false
        this.acaoSelecionada = ''
      }
    },

    async abrirModalFase() {
      await this.listarTimes()
      this.mostrarModalFase = true
    },

    fecharModalFase() {
      this.mostrarModalFase = false
      this.nomeFase = ""
      this.timesSelecionados = []
    },

    async carregarConfiguracoesClassificacao() {
      const resp = await api.get(`/ordem/classificacao/${this.campeonato.id}`)
      const data = resp.data || {}

      const ordem = Array.isArray(data?.ordem) ? data.ordem : []
      const colunasApi = Array.isArray(data?.colunas) ? data.colunas : []

      this.criterios = ordem.slice()
      this.colunasSelecionadas = resolverColunasVisiveisClassificacao(
        this.campeonato?.modalidade?.nome,
        colunasApi
      )
      this.montarOrdemColunas(this.colunasSelecionadas)
      this.classificacao = Array.isArray(data?.classificacao) ? data.classificacao : []
    },

    async criteriosClassificacao() {
      this.mostrarModalCriterios = true
      try {
        await this.carregarConfiguracoesClassificacao()
      } catch (err) {
        console.error("Erro ao carregar critérios:", err)
        this.criterios = []
      }
    },

    fecharModalCriterios() {
      this.mostrarModalCriterios = false
    },

    async colunasClassificacao() {
      this.mostrarModalColunas = true
      try {
        await this.carregarConfiguracoesClassificacao()
      } catch (err) {
        console.error("Erro ao carregar colunas da classificação:", err)
        this.colunasSelecionadas = getChavesPadraoColunasClassificacao(this.campeonato?.modalidade?.nome)
        this.montarOrdemColunas(this.colunasSelecionadas)
      }
    },

    fecharModalColunas() {
      this.mostrarModalColunas = false
    },

    iniciarArraste(indice) {
      this.indiceArraste = indice
    },

    soltar(indiceDestino) {
      if (this.indiceArraste === null || this.indiceArraste === indiceDestino) return
      const criterioMovido = this.criterios[this.indiceArraste]
      if (!criterioMovido) {
        this.indiceArraste = null
        return
      }
      this.criterios.splice(this.indiceArraste, 1)
      this.criterios.splice(indiceDestino, 0, criterioMovido)
      this.indiceArraste = null
    },

    colunaSelecionada(chave) {
      return this.colunasSelecionadas.includes(chave)
    },

    montarOrdemColunas(colunasSelecionadas = []) {
      const selecionadasNormalizadas = resolverColunasVisiveisClassificacao(
        this.campeonato?.modalidade?.nome,
        colunasSelecionadas
      )
      const disponiveis = this.colunasDisponiveis
      const mapa = new Map(disponiveis.map(coluna => [coluna.key, coluna]))
      const adicionadas = new Set()
      const ordem = []

      for (const chave of selecionadasNormalizadas) {
        if (!mapa.has(chave) || adicionadas.has(chave)) continue
        ordem.push(mapa.get(chave))
        adicionadas.add(chave)
      }

      for (const coluna of disponiveis) {
        if (adicionadas.has(coluna.key)) continue
        ordem.push(coluna)
        adicionadas.add(coluna.key)
      }

      this.ordemColunas = ordem
    },

    iniciarArrasteColuna(event, indice) {
      this.indiceArrasteColuna = indice
      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(indice))
      }
    },

    soltarColuna(indiceDestino) {
      if (this.indiceArrasteColuna === null || this.indiceArrasteColuna === indiceDestino) return

      const ordemAtual = this.colunasOrdenadas.slice()
      const colunaMovida = ordemAtual[this.indiceArrasteColuna]
      if (!colunaMovida) {
        this.indiceArrasteColuna = null
        return
      }

      ordemAtual.splice(this.indiceArrasteColuna, 1)
      ordemAtual.splice(indiceDestino, 0, colunaMovida)

      this.ordemColunas = ordemAtual
      this.indiceArrasteColuna = null
    },

    finalizarArrasteColuna() {
      this.indiceArrasteColuna = null
    },

    async salvarOrdem() {
      if (this.salvandoOrdem) return
      this.salvandoOrdem = true

      try {
        const ordem = this.criterios.map(c => ({ label: c.label, value: c.value }))
        await api.put(`/campeonatos/${this.campeonato.id}/classificacao/ordem`, { ordem })

        await Swal.fire({
          title: "Sucesso",
          text: "Ordem salva com sucesso",
          icon: "success",
          target: ".modal-criterios"
        })

        this.$emit("criterios", ordem)
        this.fecharModalCriterios()
      } catch {
        Swal.fire({
          title: "Erro",
          text: "Erro ao salvar ordem",
          icon: "error",
          target: ".modal-criterios"
        })
      } finally {
        this.salvandoOrdem = false
      }
    },

    async salvarColunas() {
      if (this.salvandoColunas) return

      const selecionadas = new Set(this.colunasSelecionadas)
      const ordemSelecionada = this.colunasOrdenadas
        .map(coluna => coluna.key)
        .filter(chave => selecionadas.has(chave))

      const colunas = resolverColunasVisiveisClassificacao(
        this.campeonato?.modalidade?.nome,
        ordemSelecionada
      )

      if (!Array.isArray(colunas) || !colunas.length) {
        await Swal.fire({
          title: "Atenção",
          text: "Selecione ao menos uma coluna.",
          icon: "warning",
          target: ".modal-colunas"
        })
        return
      }

      this.salvandoColunas = true

      try {
        await api.put(`/campeonatos/${this.campeonato.id}/classificacao/ordem`, { colunas })

        this.colunasSelecionadas = colunas
        this.montarOrdemColunas(colunas)
        this.$emit("colunas", colunas)

        await Swal.fire({
          title: "Sucesso",
          text: "Colunas salvas com sucesso",
          icon: "success",
          target: ".modal-colunas"
        })

        this.fecharModalColunas()
      } catch {
        await Swal.fire({
          title: "Erro",
          text: "Erro ao salvar colunas",
          icon: "error",
          target: ".modal-colunas"
        })
      } finally {
        this.salvandoColunas = false
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
      if (this.salvandoFase) return

      if (!this.nomeFase) {
        Swal.fire("Erro", "Informe o nome da fase.", "error")
        return
      }

      if (this.timesSelecionados.length === 0) {
        Swal.fire("Erro", "Selecione pelo menos um time.", "error")
        return
      }

      this.salvandoFase = true

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
      } finally {
        this.salvandoFase = false
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
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
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

.title {
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

.btn-tipo:disabled {
  cursor: wait;
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

.btn-tipo-card:disabled {
  opacity: 0.78;
  transform: none;
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

.titulo-acao-modal {
  min-width: 0;
}

.acao-loading-spinner {
  width: 16px;
  height: 16px;
  margin-left: auto;
  border-radius: 999px;
  border: 2px solid rgba(59, 130, 246, 0.24);
  border-top-color: #3b82f6;
  animation: acaoSpin 0.75s linear infinite;
  flex: 0 0 16px;
}

@keyframes acaoSpin {
  to {
    transform: rotate(360deg);
  }
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

.btn-save-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-save-spinner {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  animation: acaoSpin 0.75s linear infinite;
  flex: 0 0 14px;
}

.btn-cancel {
  background-color: #3b82f6;
}

.modal-escolha-config .btn-cancel {
  background: transparent;
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.35);
}

.modal-header-copy {
  min-width: 0;
}

.section-kicker {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modal-times {
  width: min(720px, 92vw);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 24px 28px;
  border-radius: 18px;
  text-align: left;
}

.modal-times .modal-header {
  align-items: flex-start;
  margin-bottom: 18px;
}

.modal-times .title {
  display: block;
  line-height: 1.08;
}

.modal-times-descricao {
  margin: 10px 0 0;
  line-height: 1.55;
}

.fase-form-card,
.fase-times-card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.fase-form-card {
  padding: 18px;
  margin-bottom: 16px;
}

.campo-fase {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo-fase-label {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.campo-fase input {
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: #fff;
  color: #0f172a;
  font: inherit;
}

.campo-fase input:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.58);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14);
}

.fase-times-card {
  padding: 18px;
}

.fase-times-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.fase-times-head h3 {
  margin: 8px 0 0;
  color: #0f172a;
  font-size: 23px;
}

.fase-total {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 8px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.modal-times .lista-times {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.time-card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  padding: 14px;
  background: #fff;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.time-card:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.34);
  box-shadow: 0 18px 36px rgba(59, 130, 246, 0.1);
}

.time-card.selecionado {
  border-color: rgba(37, 99, 235, 0.42);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 20px 40px rgba(37, 99, 235, 0.14);
}

.time-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-card-copy {
  flex: 1;
  min-width: 0;
}

.time-foto {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
}

.time-foto img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.time-nome {
  margin: 0;
  font-weight: 800;
  color: #0f172a;
  font-size: 17px;
}

.time-card-meta {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.time-card-badge {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(37, 99, 235, 0.14);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.estado-vazio-times {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  border-radius: 18px;
  color: #64748b;
  text-align: center;
  padding: 18px;
}

.botoes-modal-times {
  margin-top: 18px;
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 10px;
  }

  .modal-content {
    width: min(100%, 100vw - 20px);
    max-height: calc(100dvh - 20px);
    padding: 16px 14px;
    border-radius: 14px;
  }

  .modal-escolha-config {
    width: min(100%, 100vw - 20px);
    padding: 16px 14px;
    border-radius: 14px;
  }

  .modal-escolha-config .modal-header {
    margin-bottom: 8px;
  }

  .modal-escolha-config .title {
    font-size: 22px;
    line-height: 1.12;
  }

  .modal-escolha-config .tipo-campeonato-lista {
    gap: 10px;
    margin: 8px 0 14px;
  }

  .modal-escolha-config .btn-tipo-card {
    padding: 11px 12px;
    border-radius: 10px;
    gap: 4px;
  }

  .modal-escolha-config .btn-tipo-titulo {
    font-size: 15px;
  }

  .modal-escolha-config .btn-tipo-sub {
    font-size: 12px;
    line-height: 1.3;
  }

  .modal-times {
    width: min(100%, 100vw - 20px);
    max-height: calc(100dvh - 20px);
    padding: 16px 14px;
    border-radius: 14px;
  }

  .modal-times .modal-header {
    position: relative;
    padding-right: 46px;
    gap: 10px;
    margin-bottom: 14px;
  }

  .modal-times .title {
    font-size: 26px;
  }

  .modal-times .btn-close-x {
    position: absolute;
    top: 0;
    right: 0;
  }

  .modal-times-descricao {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.45;
  }

  .fase-form-card,
  .fase-times-card {
    padding: 14px;
    border-radius: 16px;
  }

  .campo-fase input {
    min-height: 44px;
    padding: 10px 12px;
  }

  .fase-times-head {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
  }

  .fase-times-head h3 {
    font-size: 19px;
  }

  .fase-total {
    align-self: auto;
    padding: 6px 10px;
    font-size: 11px;
  }

  .modal-times .lista-times {
    grid-template-columns: 1fr;
    gap: 10px;
    max-height: 300px;
  }

  .time-card {
    padding: 12px;
    border-radius: 16px;
  }

  .time-card-top {
    gap: 10px;
  }

  .time-foto {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .time-nome {
    font-size: 15px;
  }

  .time-card-meta {
    font-size: 12px;
  }

  .time-card-badge {
    padding: 5px 8px;
    font-size: 10px;
  }

  .estado-vazio-times {
    min-height: 110px;
    border-radius: 16px;
    padding: 14px;
    font-size: 13px;
  }
}

.modal-criterios {
  width: 900px;
}

.descricao {
  margin-bottom: 15px;
  color: #6b7280;
}

.modal-times .modal-times-descricao {
  margin: 10px 0 0;
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

.modal-colunas {
  width: 900px;
}

.lista-colunas {
  max-height: 380px;
}

.coluna-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  cursor: grab;
  background: white;
  user-select: none;
}

.coluna-item:last-child {
  border-bottom: none;
}

.coluna-item:hover {
  background: #f9fafb;
}

.coluna-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
  flex: 0 0 auto;
}

.coluna-item-ativa {
  background: #f8fbff;
}

.coluna-item.dragging {
  opacity: 0.6;
}

.drag-handle {
  color: #94a3b8;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  flex: 0 0 auto;
}

.coluna-item-fixa {
  background: #f8fafc;
  cursor: not-allowed;
  user-select: auto;
}

.coluna-item-fixa input[type="checkbox"] {
  cursor: not-allowed;
}

.sigla-coluna {
  margin-left: auto;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .modal-criterios,
  .modal-colunas {
    width: min(100%, 100vw - 20px);
  }

  .modal-criterios .lista-criterios,
  .modal-colunas .lista-criterios {
    max-height: calc(100dvh - 260px);
  }
}
</style>
