<template>
  <div class="layout">
    <NavBarQuadras />
    <SidebarCampeonato @sidebar-toggle="sidebarCollapsed = $event" />

    <div class="conteudo" :class="{ collapsed: sidebarCollapsed }">
      <div class="header">
        <h1 class="title">Campeonato {{ campeonato?.nome }}</h1>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else-if="campeonato" class="card-quadra">
        <img :src="campeonato.foto" alt="Foto do campeonato" class="imagem-quadra">
      </div>

      <div v-if="campeonato" class="card-edicao">
        <h2>Informacoes do campeonato</h2>

        <div class="regras-grid">
          <div class="regra-item">
            <label class="regra-label">Nome do campeonato</label>
            <input v-model="formEdicao.nome" class="regra-select" type="text" />
          </div>

          <div class="regra-item">
            <label class="regra-label">Alterar imagem</label>
            <input ref="inputImagem" class="input-file" type="file" accept="image/*" @change="onImagemSelecionada" />
            <button v-if="formEdicao.foto !== imagemOriginal" type="button" class="btn-cancel-file"
              :disabled="uploadingImagem" @click="cancelarImagemSelecionada">
              Cancelar imagem selecionada
            </button>
            <small v-if="uploadingImagem" class="hint-upload">Enviando imagem...</small>
          </div>

          <div class="regra-item">
            <label class="regra-label">Quadra</label>
            <select v-model="formEdicao.quadraId" class="regra-select">
              <option :value="null">Sem quadra</option>
              <option v-for="q in quadras" :key="q.id" :value="q.id">
                {{ q.nome }}
              </option>
            </select>
          </div>

          <div class="regra-item">
            <label class="regra-label">Data de finalizacao</label>
            <input v-model="formEdicao.dataFim" class="regra-select" type="date" />
          </div>
        </div>

        <div class="actions">
          <button class="btn-save" :disabled="salvandoEdicao" @click="salvarEdicao">
            {{ salvandoEdicao ? 'Salvando...' : 'Salvar informacoes' }}
          </button>
        </div>
      </div>

      <div v-if="campeonato" class="card-regras">
        <h2>{{ tituloConfiguracoes }}</h2>

        <div class="abas-config-container">
          <button
            type="button"
            class="aba-config"
            :class="{ ativa: abaConfigAtiva === 'regras' }"
            @click="abaConfigAtiva = 'regras'"
          >
            Regras do campeonato
          </button>
          <button
            type="button"
            class="aba-config"
            :class="{ ativa: abaConfigAtiva === 'criterios' }"
            @click="abrirAbaCriterios"
          >
            Criterios de seleção
          </button>
        </div>

        <div v-if="abaConfigAtiva === 'regras'">
          <div class="regras-grid">
            <div class="regra-item" v-for="campo in camposRegras" :key="campo.key">
              <label class="regra-label">{{ campo.label }}</label>

              <select v-model="formRegras[campo.key]" class="regra-select">
                <option v-for="opcao in campo.options" :key="`${campo.key}-${String(opcao.value)}`" :value="opcao.value">
                  {{ opcao.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="actions">
            <button class="btn-save" :disabled="salvandoRegras" @click="salvarRegras">
              {{ salvandoRegras ? 'Salvando...' : 'Salvar regras' }}
            </button>
          </div>
        </div>

        <div v-else class="criterios-wrapper">
          <p class="descricao-criterios">
            Arraste para definir a ordem de classificacao.
          </p>

          <div v-if="!criteriosClassificacao.length" class="vazio-criterios">
            Nenhum criterio encontrado para este campeonato.
          </div>

          <div v-else class="lista-criterios">
            <div
              v-for="(criterio, indice) in criteriosClassificacao"
              :key="`${criterio.value}-${indice}`"
              class="criterio-item"
              draggable="true"
              @dragstart="iniciarArrasteCriterio(indice)"
              @dragover.prevent
              @drop="soltarCriterio(indice)"
            >
              <span class="ordem-criterio">{{ indice + 1 }}</span>
              <span class="nome-criterio">{{ criterio.label }}</span>
              <span class="drag-criterio">&#9776;</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn-save" :disabled="salvandoCriterios" @click="salvarCriteriosClassificacao">
              {{ salvandoCriterios ? 'Salvando...' : 'Salvar criterios' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="campeonato" class="actions-finish">
        <button class="btn-finish" :disabled="removendoCampeonato" @click="removerCampeonato">
          {{ removendoCampeonato ? 'Removendo...' : 'Remover campeonato' }}
        </button>
      </div>

      <div v-else>
        <p>Nenhum campeonato encontrado.</p>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import api from '@/axios'
import NavBarQuadras from '@/components/quadraplay/NavBarQuadras.vue'
import SidebarCampeonato from '@/components/quadraplay/SidebarCampeonato.vue'
import { carregarCampeonato } from '@/utils/persistirCampeonato'
import { useCampeonatoStore } from '@/storecampeonato'
import { grupoModalidade, opcoesNumericas, opcoesSuspensao, regrasPadrao} from '@/utils/campeonatoRegras'

export default {
  name: 'GerenciarCampeonatosView',
  components: { SidebarCampeonato, NavBarQuadras },

  data() {
    return {
      sidebarCollapsed: false,
      campeonato: null,
      isLoading: true,
      salvandoRegras: false,
      salvandoCriterios: false,
      formRegras: {},
      criteriosClassificacao: [],
      abaConfigAtiva: 'regras',
      indiceArrasteCriterio: null,
      salvandoEdicao: false,
      removendoCampeonato: false,
      uploadingImagem: false,
      imagemOriginal: '',
      quadras: [],
      formEdicao: {
        nome: '',
        foto: '',
        quadraId: null,
        dataFim: ''
      }
    }
  },

  computed: {
    grupoAtual() {
      return grupoModalidade(this.campeonato?.modalidade?.nome)
    },
    tituloConfiguracoes() {
      const modalidade = String(this.campeonato?.modalidade?.nome || 'esporte').toLowerCase()
      return `Configuracoes do ${modalidade}`
    },

    camposRegras() {
      const comuns = [
        {
          key: 'suspensaoAmarelos',
          label: 'Suspensao automatica por amarelos',
          options: opcoesSuspensao(2, 10)
        },
        {
          key: 'suspensaoVermelhos',
          label: 'Suspensao automatica por vermelhos',
          options: opcoesSuspensao(1, 10)
        },
        {
          key: 'separarCartoesPorFase',
          label: 'Separar cartoes de cada fase',
          options: [
            { label: 'Nao', value: false },
            { label: 'Sim', value: true }
          ]
        },
        {
          key: 'resetarCartoesCadaFase',
          label: 'Resetar cartoes ao trocar de fase',
          options: [
            { label: 'Nao', value: false },
            { label: 'Sim', value: true }
          ]
        }
      ]

      if (this.grupoAtual === 'VOLEI') {
        return [
          {
            key: 'regraPontosVitoria',
            label: 'Pontos por vitoria',
            options: [
              { label: '2 pontos sempre', value: 'VITORIA_2_SEMPRE' },
              { label: '3 pontos sempre', value: 'VITORIA_3_SEMPRE' },
              { label: '3 pontos para diferenca de sets maior que 1', value: 'VITORIA_3_DIF_SETS_MAIOR_1' }
            ]
          },
          {
            key: 'regraPontosDerrota',
            label: 'Pontos por derrota',
            options: [
              { label: '0 pontos sempre', value: 'DERROTA_0_SEMPRE' },
              { label: '1 ponto sempre', value: 'DERROTA_1_SEMPRE' },
              { label: '1 ponto para diferenca de sets menor que 2', value: 'DERROTA_1_DIF_SETS_MENOR_2' }
            ]
          },
          {
            key: 'pontosEmpate',
            label: 'Pontos por empate',
            options: opcoesNumericas(0, 10)
          }
        ]
      }

      return [
        {
          key: 'pontosVitoria',
          label: 'Pontos por vitoria',
          options: opcoesNumericas(0, 10)
        },
        {
          key: 'pontosEmpate',
          label: 'Pontos por empate',
          options: opcoesNumericas(0, 10)
        },
        {
          key: 'pontosDerrota',
          label: 'Pontos por derrota',
          options: opcoesNumericas(0, 10)
        },
        ...comuns
      ]
    }
  },

  async mounted() {
    try {
      this.campeonato = await carregarCampeonato(this.$route)
      if (this.campeonato) {
        const padrao = regrasPadrao(this.grupoAtual)
        this.formRegras = {
          ...padrao,
          ...(this.campeonato.regras || {})
        }
        await this.carregarQuadras()
        await this.carregarCriteriosClassificacao()
        this.preencherFormularioEdicao()
      }
    } catch (err) {
      console.error('Erro ao carregar campeonato:', err)
      this.campeonato = null
    } finally {
      this.isLoading = false
    }
  },

  methods: {
    formatarDataParaInput(data) {
      if (!data) return ''
      return new Date(data).toISOString().slice(0, 10)
    },

    preencherFormularioEdicao() {
      this.formEdicao = {
        nome: this.campeonato?.nome || '',
        foto: this.campeonato?.foto || '',
        quadraId: this.campeonato?.quadraId || null,
        dataFim: this.formatarDataParaInput(this.campeonato?.dataFim)
      }
      this.imagemOriginal = this.formEdicao.foto
      this.$nextTick(() => {
        if (this.$refs.inputImagem) this.$refs.inputImagem.value = ''
      })
    },

    async carregarQuadras() {
      if (!this.campeonato?.modalidadeId) {
        this.quadras = []
        return
      }

      try {
        const { data } = await api.get(`/listar/quadras/${this.campeonato.modalidadeId}`)
        this.quadras = Array.isArray(data) ? data : []
      } catch (err) {
        console.error('Erro ao carregar quadras:', err)
        this.quadras = []
      }
    },

    async onImagemSelecionada(event) {
      const file = event?.target?.files?.[0]
      if (!file) return

      this.uploadingImagem = true
      try {
        const formData = new FormData()
        formData.append('file', file)

        const { data } = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        this.formEdicao.foto = data?.fileUrl || ''
      } catch (err) {
        console.error('Erro ao enviar imagem:', err)
        await Swal.fire('Erro', 'Nao foi possivel enviar a imagem.', 'error')
      } finally {
        this.uploadingImagem = false
      }
    },

    cancelarImagemSelecionada() {
      this.formEdicao.foto = this.imagemOriginal || ''
      if (this.$refs.inputImagem) this.$refs.inputImagem.value = ''
    },

    async salvarEdicao() {
      if (!this.campeonato?.id) return

      this.salvandoEdicao = true
      try {
        const payload = {
          nome: this.formEdicao.nome,
          foto: this.formEdicao.foto,
          quadraId: this.formEdicao.quadraId,
          dataFim: this.formEdicao.dataFim || null
        }

        const { data } = await api.put(`/campeonato/${this.campeonato.id}`, payload)
        this.campeonato = data
        this.preencherFormularioEdicao()
        await Swal.fire('Sucesso', 'Informacoes atualizadas com sucesso.', 'success')
      } catch (err) {
        console.error('Erro ao salvar edicao:', err)
        await Swal.fire('Erro', 'Nao foi possivel salvar as informacoes.', 'error')
      } finally {
        this.salvandoEdicao = false
      }
    },

    async salvarRegras() {
      if (!this.campeonato?.id) return

      this.salvandoRegras = true

      try {
        const payload = {
          ...this.formRegras,
          grupoRegras: this.grupoAtual
        }

        const { data } = await api.put(`/campeonato/${this.campeonato.id}/regras`, {
          regras: payload
        })

        this.campeonato.regras = data?.regras || payload
        await Swal.fire('Sucesso', 'Regras atualizadas com sucesso.', 'success')
      } catch (err) {
        console.error('Erro ao salvar regras:', err)
        await Swal.fire('Erro', 'Nao foi possivel salvar as regras.', 'error')
      } finally {
        this.salvandoRegras = false
      }
    },
    abrirAbaCriterios() {
      this.abaConfigAtiva = 'criterios'
      if (!this.criteriosClassificacao.length) {
        this.carregarCriteriosClassificacao()
      }
    },
    async carregarCriteriosClassificacao() {
      if (!this.campeonato?.id) return

      try {
        const { data } = await api.get(`/ordem/classificacao/${this.campeonato.id}`)
        const ordemApi = Array.isArray(data?.ordem) ? data.ordem : []
        const ordemCampeonato = Array.isArray(this.campeonato?.ordemClassificacao) ? this.campeonato.ordemClassificacao : []
        const ordem = ordemApi.length ? ordemApi : ordemCampeonato

        this.criteriosClassificacao = ordem
          .filter(c => c && typeof c.value === 'string' && typeof c.label === 'string')
          .map(c => ({ value: c.value, label: c.label }))
      } catch (err) {
        console.error('Erro ao carregar criterios de classificacao:', err)
        this.criteriosClassificacao = []
      }
    },
    iniciarArrasteCriterio(indice) {
      this.indiceArrasteCriterio = indice
    },
    soltarCriterio(indiceDestino) {
      if (this.indiceArrasteCriterio === null) return
      const criterioMovido = this.criteriosClassificacao[this.indiceArrasteCriterio]
      this.criteriosClassificacao.splice(this.indiceArrasteCriterio, 1)
      this.criteriosClassificacao.splice(indiceDestino, 0, criterioMovido)
      this.indiceArrasteCriterio = null
    },
    async salvarCriteriosClassificacao() {
      if (!this.campeonato?.id || !this.criteriosClassificacao.length) return

      this.salvandoCriterios = true
      try {
        const ordem = this.criteriosClassificacao.map(c => ({ value: c.value, label: c.label }))
        await api.put(`/campeonatos/${this.campeonato.id}/classificacao/ordem`, { ordem })
        this.campeonato.ordemClassificacao = ordem
        await Swal.fire('Sucesso', 'Criterios atualizados com sucesso.', 'success')
      } catch (err) {
        console.error('Erro ao salvar criterios de classificacao:', err)
        await Swal.fire('Erro', 'Nao foi possivel salvar os criterios.', 'error')
      } finally {
        this.salvandoCriterios = false
      }
    },

    async removerCampeonato() {
      if (!this.campeonato?.id) return

      const confirmacao = await Swal.fire({
        title: 'Remover campeonato?',
        text: 'Essa acao remove o campeonato com soft delete e ele nao aparece mais na lista.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
      })

      if (!confirmacao.isConfirmed) return

      this.removendoCampeonato = true
      try {
        await api.delete(`/removerCampeonato/${this.campeonato.id}`)
        const store = useCampeonatoStore()
        store.limparCampeonato()
        await Swal.fire('Sucesso', 'Campeonato removido com sucesso.', 'success')
        this.$router.push({ name: 'TelaInicial' })
      } catch (err) {
        console.error('Erro ao remover campeonato:', err)
        await Swal.fire('Erro', 'Nao foi possivel remover o campeonato.', 'error')
      } finally {
        this.removendoCampeonato = false
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-top: 70px;
  margin-left: 250px;
  transition: margin-left 0.3s ease, padding 0.3s ease;
}

.conteudo.collapsed {
  margin-left: 70px;
}

.title {
  color: #3b82f6;
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 20px;
  line-height: 1.1;
}

.card-quadra {
  position: relative;
  width: 100%;
  height: 360px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.imagem-quadra {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card-regras {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.card-edicao {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.card-edicao h2 {
  color: #3b82f6;
  margin-bottom: 14px;
  font-size: 22px;
}

.card-regras h2 {
  color: #3b82f6;
  margin-bottom: 14px;
  font-size: 22px;
}

.abas-config-container {
  display: flex;
  border-bottom: 1px solid #cbd5e1;
  margin-bottom: 16px;
}

.aba-config {
  flex: 1;
  border: none;
  border-bottom: 3px solid transparent;
  background: #fff;
  color: #64748b;
  font-size: 21px;
  font-weight: 600;
  padding: 12px 10px;
  cursor: pointer;
}

.aba-config.ativa {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.regras-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.criterios-wrapper {
  margin-top: 4px;
}

.descricao-criterios {
  margin: 0 0 10px;
  color: #64748b;
}

.vazio-criterios {
  color: #6b7280;
  font-style: italic;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 14px;
}

.lista-criterios {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  max-height: 360px;
  overflow-y: auto;
  margin-bottom: 4px;
}

.criterio-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  cursor: grab;
  transition: background-color 0.2s ease;
}

.criterio-item:last-child {
  border-bottom: none;
}

.criterio-item:hover {
  background: #eff6ff;
}

.ordem-criterio {
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

.nome-criterio {
  flex: 1;
  color: #0f172a;
  font-weight: 600;
}

.drag-criterio {
  color: #64748b;
  font-size: 18px;
}

.regra-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.regra-label {
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.regra-select {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 16px;
  background: #fff;
}

.actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-save {
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-finish {
  background-color: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  width: 100%;
}

.btn-finish:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.actions-finish {
  margin-top: 14px;
  display: block;
  width: 100%;
}

.input-file {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fff;
}

.hint-upload {
  font-size: 12px;
  color: #64748b;
}

.btn-cancel-file {
  width: fit-content;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel-file:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  margin-top: 140px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {

  .conteudo,
  .conteudo.collapsed {
    margin-left: 0;
    padding: 16px;
  }

  .title {
    font-size: 35px;
    margin-bottom: 14px;
  }

  .card-quadra {
    height: 220px;
    border-radius: 12px;
  }

  .regras-grid {
    grid-template-columns: 1fr;
  }

  .aba-config {
    font-size: 15px;
    padding: 10px 6px;
  }

  .loader-container-centralizado {
    margin-top: 90px;
  }

  .loader {
    width: 64px;
    height: 64px;
    border-width: 5px;
  }
}
</style>
