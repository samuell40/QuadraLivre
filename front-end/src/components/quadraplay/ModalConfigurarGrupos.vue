<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fechar">
    <div class="modal-content modal-grupos">
      <div class="modal-header">
        <div>
          <span class="section-kicker">Classificacao</span>
          <h2>Organizar grupos</h2>
          <p class="descricao">
            Defina a quantidade de grupos, ajuste os nomes e distribua os times do campeonato.
          </p>
        </div>
        <button type="button" class="btn-close-x" @click="fechar">x</button>
      </div>

      <div v-if="carregando" class="estado-box">
        Carregando configuracao de grupos...
      </div>

      <template v-else>
        <div class="toolbar">
          <label class="toolbar-field">
            <span>Quantidade de grupos</span>
            <select v-model.number="quantidadeGrupos" @change="atualizarQuantidadeGrupos">
              <option v-for="quantidade in opcoesQuantidade" :key="quantidade" :value="quantidade">
                {{ quantidade }}
              </option>
            </select>
          </label>

          <div class="toolbar-resumo">
            <span>{{ times.length }} time(s) no campeonato</span>
            <span>{{ totalSemGrupo }} sem grupo</span>
          </div>
        </div>

        <div class="grupos-grid">
          <section v-for="(grupo, indice) in grupos" :key="grupo.id" class="grupo-card">
            <div class="grupo-card-top">
              <input
                v-model="grupo.nome"
                type="text"
                maxlength="40"
                :placeholder="gerarNomeGrupoPadrao(indice)"
              />
              <span class="grupo-badge">
                {{ timesDoGrupo(grupo.id).length }} time(s)
              </span>
            </div>

            <div class="grupo-lista">
              <div
                v-for="time in timesDoGrupo(grupo.id)"
                :key="`${grupo.id}-${time.id}`"
                class="grupo-time-chip"
              >
                <img v-if="time.foto" :src="time.foto" :alt="time.nome" />
                <span>{{ time.nome }}</span>
              </div>

              <p v-if="!timesDoGrupo(grupo.id).length" class="grupo-vazio">
                Nenhum time atribuido.
              </p>
            </div>
          </section>
        </div>

        <section class="times-card">
          <div class="times-card-head">
            <div>
              <span class="section-kicker">Distribuicao</span>
              <h3>Times do campeonato</h3>
            </div>
          </div>

          <div v-if="times.length" class="times-lista">
            <div v-for="time in times" :key="time.id" class="time-row">
              <div class="time-info">
                <img v-if="time.foto" :src="time.foto" :alt="time.nome" class="time-avatar" />
                <div>
                  <strong>{{ time.nome }}</strong>
                  <small>{{ time._count?.jogadores || 0 }} jogador(es)</small>
                </div>
              </div>

              <select :value="atribuicoes[time.id] || ''" @change="atualizarGrupoTime(time.id, $event.target.value)">
                <option value="">Sem grupo</option>
                <option v-for="(grupo, indice) in grupos" :key="`${time.id}-${grupo.id}`" :value="grupo.id">
                  {{ nomeGrupoExibicao(grupo, indice) }}
                </option>
              </select>
            </div>
          </div>

          <div v-else class="estado-box estado-box-secundario">
            Nenhum time encontrado para este campeonato.
          </div>
        </section>

        <div class="botoes">
          <button class="btn-danger" :disabled="salvando" @click="removerGrupos">
            Remover grupos
          </button>
          <button class="btn-cancel" :disabled="salvando" @click="fechar">
            Cancelar
          </button>
          <button class="btn-save" :disabled="salvando || !times.length" @click="salvar">
            <span v-if="salvando">Salvando...</span>
            <span v-else>Salvar grupos</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'ModalConfigurarGrupos',
  props: {
    modelValue: { type: Boolean, default: false },
    campeonatoId: { type: [String, Number], required: true }
  },
  emits: ['update:modelValue', 'salvo'],
  data() {
    return {
      carregando: false,
      salvando: false,
      times: [],
      quantidadeGrupos: 2,
      grupos: [],
      atribuicoes: {}
    }
  },
  computed: {
    opcoesQuantidade() {
      return Array.from({ length: 15 }, (_, indice) => indice + 2)
    },
    totalSemGrupo() {
      return this.times.filter(time => !this.atribuicoes[time.id]).length
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(valor) {
        if (valor) {
          this.carregarDados()
        }
      }
    }
  },
  methods: {
    gerarNomeGrupoPadrao(indice) {
      const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (indice >= 0 && indice < alfabeto.length) {
        return `Grupo ${alfabeto[indice]}`
      }
      return `Grupo ${indice + 1}`
    },
    nomeGrupoExibicao(grupo, indice) {
      return String(grupo?.nome || '').trim() || this.gerarNomeGrupoPadrao(indice)
    },
    normalizarQuantidade(valor) {
      const numero = Number(valor)
      if (!Number.isInteger(numero) || numero < 2) return 2
      return Math.min(numero, 16)
    },
    construirGrupos(quantidade, gruposBase = []) {
      const gruposAtuais = Array.isArray(gruposBase) ? gruposBase : []

      return Array.from({ length: quantidade }, (_, indice) => {
        const grupoAtual = gruposAtuais[indice] || {}
        return {
          id: `grupo-${indice + 1}`,
          nome: String(grupoAtual.nome || '').trim()
        }
      })
    },
    aplicarConfiguracao(gruposConfig) {
      const quantidade = this.normalizarQuantidade(
        gruposConfig?.quantidade ?? gruposConfig?.grupos?.length ?? 2
      )

      this.quantidadeGrupos = quantidade
      this.grupos = this.construirGrupos(quantidade, gruposConfig?.grupos)

      const atribuicoes = {}
      for (const time of this.times) {
        atribuicoes[time.id] = ''
      }

      const gruposAtuais = Array.isArray(gruposConfig?.grupos) ? gruposConfig.grupos : []
      gruposAtuais.slice(0, quantidade).forEach((grupoAtual, indice) => {
        const grupoId = `grupo-${indice + 1}`
        const timeIds = Array.isArray(grupoAtual?.timeIds) ? grupoAtual.timeIds : []
        timeIds.forEach(timeId => {
          const timeIdNum = Number(timeId)
          if (!Number.isInteger(timeIdNum) || !Object.prototype.hasOwnProperty.call(atribuicoes, timeIdNum)) return
          atribuicoes[timeIdNum] = grupoId
        })
      })

      this.atribuicoes = atribuicoes
    },
    async carregarDados() {
      if (!this.campeonatoId) return

      this.carregando = true

      try {
        const [timesResponse, configuracaoResponse] = await Promise.all([
          api.get(`/${this.campeonatoId}/times`),
          api.get(`/ordem/classificacao/${this.campeonatoId}`)
        ])

        this.times = Array.isArray(timesResponse.data) ? timesResponse.data : []
        this.aplicarConfiguracao(configuracaoResponse.data?.grupos || null)
      } catch (error) {
        console.error('Erro ao carregar configuracao de grupos:', error)
        this.times = []
        this.aplicarConfiguracao(null)
        await Swal.fire('Erro', 'Nao foi possivel carregar os grupos do campeonato.', 'error')
      } finally {
        this.carregando = false
      }
    },
    fechar() {
      this.$emit('update:modelValue', false)
    },
    atualizarQuantidadeGrupos() {
      const quantidade = this.normalizarQuantidade(this.quantidadeGrupos)
      const gruposAnteriores = this.grupos.slice()
      const gruposPermitidos = new Set(
        Array.from({ length: quantidade }, (_, indice) => `grupo-${indice + 1}`)
      )

      this.quantidadeGrupos = quantidade
      this.grupos = this.construirGrupos(quantidade, gruposAnteriores)

      const atribuicoes = { ...this.atribuicoes }
      Object.keys(atribuicoes).forEach(timeId => {
        if (atribuicoes[timeId] && !gruposPermitidos.has(atribuicoes[timeId])) {
          atribuicoes[timeId] = ''
        }
      })
      this.atribuicoes = atribuicoes
    },
    atualizarGrupoTime(timeId, grupoId) {
      this.atribuicoes = {
        ...this.atribuicoes,
        [timeId]: grupoId || ''
      }
    },
    timesDoGrupo(grupoId) {
      return this.times.filter(time => this.atribuicoes[time.id] === grupoId)
    },
    montarPayloadGrupos() {
      return {
        quantidade: this.quantidadeGrupos,
        grupos: this.grupos.map((grupo, indice) => ({
          id: grupo.id,
          nome: String(grupo.nome || '').trim() || this.gerarNomeGrupoPadrao(indice),
          timeIds: this.timesDoGrupo(grupo.id).map(time => Number(time.id))
        }))
      }
    },
    async removerGrupos() {
      const confirmacao = await Swal.fire({
        title: 'Remover agrupamento?',
        text: 'A classificacao volta a aparecer em uma tabela unica.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar'
      })

      if (!confirmacao.isConfirmed) return

      this.salvando = true

      try {
        const { data } = await api.put(`/campeonatos/${this.campeonatoId}/classificacao/ordem`, {
          grupos: null
        })

        this.$emit('salvo', data?.data?.grupos || null)
        await Swal.fire('Sucesso', 'Agrupamento removido com sucesso.', 'success')
        this.fechar()
      } catch (error) {
        console.error('Erro ao remover grupos:', error)
        await Swal.fire('Erro', 'Nao foi possivel remover os grupos.', 'error')
      } finally {
        this.salvando = false
      }
    },
    async salvar() {
      this.salvando = true

      try {
        const payload = this.montarPayloadGrupos()
        const { data } = await api.put(`/campeonatos/${this.campeonatoId}/classificacao/ordem`, {
          grupos: payload
        })

        this.$emit('salvo', data?.data?.grupos || payload)
        await Swal.fire('Sucesso', 'Grupos salvos com sucesso.', 'success')
        this.fechar()
      } catch (error) {
        console.error('Erro ao salvar grupos:', error)
        await Swal.fire('Erro', 'Nao foi possivel salvar os grupos.', 'error')
      } finally {
        this.salvando = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.56);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2100;
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 24px;
  width: min(1080px, 100%);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: 28px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.modal-header h2 {
  margin: 6px 0 10px;
  font-size: 32px;
  color: #0f172a;
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

.descricao {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.btn-close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(59, 130, 246, 0.45);
  border-radius: 999px;
  background: #fff;
  color: #2563eb;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
}

.toolbar {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.toolbar-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #0f172a;
  font-weight: 600;
}

.toolbar-field select {
  min-width: 180px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 15px;
}

.toolbar-resumo {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-resumo span {
  border-radius: 999px;
  padding: 8px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  font-weight: 700;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.grupo-card,
.times-card {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.grupo-card {
  padding: 18px;
}

.grupo-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.grupo-card-top input {
  flex: 1;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 15px;
}

.grupo-badge {
  border-radius: 999px;
  padding: 8px 10px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.grupo-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 96px;
}

.grupo-time-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 14px;
  padding: 10px 12px;
  background: #fff;
  color: #0f172a;
  font-weight: 600;
}

.grupo-time-chip img,
.time-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.grupo-vazio {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.times-card {
  padding: 20px;
}

.times-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.times-card-head h3 {
  margin: 6px 0 0;
  color: #0f172a;
  font-size: 24px;
}

.times-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  padding: 12px 14px;
  background: #fff;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.time-info strong,
.time-info small {
  display: block;
}

.time-info strong {
  color: #0f172a;
}

.time-info small {
  color: #64748b;
  margin-top: 4px;
}

.time-row select {
  min-width: 180px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 15px;
  background: #fff;
}

.estado-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  border-radius: 18px;
  color: #64748b;
  text-align: center;
  padding: 18px;
}

.estado-box-secundario {
  min-height: 120px;
}

.botoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-save,
.btn-cancel,
.btn-danger {
  min-height: 44px;
  border-radius: 999px;
  padding: 0 18px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
}

.btn-save {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
}

.btn-cancel {
  background: transparent;
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.35);
}

.btn-danger {
  background: #fff1f2;
  color: #be123c;
  border: 1px solid rgba(244, 63, 94, 0.22);
}

.btn-save:disabled,
.btn-cancel:disabled,
.btn-danger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }

  .modal-header {
    flex-direction: column;
  }

  .modal-header h2 {
    font-size: 26px;
  }

  .toolbar,
  .time-row,
  .botoes {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-field select,
  .time-row select {
    width: 100%;
    min-width: 0;
  }
}
</style>
