<template>
  <div v-if="mostrarModalTipo" class="modal-overlay" @click.self="cancelarCadastro">
    <div class="modal-content modal-escolha-tipo-campeonato">
      <div class="modal-header header-escolha-tipo">
        <h2 class="titulo-escolha-tipo">Escolha o Tipo de Campeonato</h2>
        <button type="button" class="btn-close-x" @click="cancelarCadastro">x</button>
      </div>

      <div class="tipo-campeonato-lista">
        <button
          v-for="tipo in tiposCampeonatoCards"
          :key="tipo.value"
          class="btn-tipo btn-tipo-card"
          :class="{ 'tipo-card-principal': tipoSelecionado === tipo.value }"
          @click="selecionarTipo(tipo.value)"
        >
          <span class="btn-tipo-icone" aria-hidden="true">
            <svg
              v-if="tipo.value === 'PONTOS_CORRIDOS'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-trophy-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935"
              />
            </svg>

            <svg
              v-else-if="tipo.value === 'PONTOS_CORRIDOS_ELIMINATORIAS'"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-diagram-3-fill"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zm-6 8A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm6 0A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5z"
              />
            </svg>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-lightning-charge-fill"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"
              />
            </svg>
          </span>

          <span class="btn-tipo-conteudo">
            <span class="btn-tipo-titulo">{{ tipo.titulo }}</span>
            <small class="btn-tipo-sub">{{ tipo.descricao }}</small>
          </span>
        </button>
      </div>

      <div class="botoes botoes-escolha-tipo">
        <button type="button" class="btn-cancelar-escolha-tipo" @click="cancelarCadastro">Cancelar</button>
      </div>
    </div>
  </div>

  <!--MODAL DE CADASTRO -->
  <div v-if="aberto && !mostrarModalTipo" class="modal-overlay" @click.self="cancelarCadastro">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Campeonato</h2>
        <button type="button" class="btn-close-x" @click="cancelarCadastro">x</button>
      </div>

      <form @submit.prevent="abrirModalTimes">
        <div class="form-group">
          <label for="nomeCampeonato">Nome do Campeonato</label>
          <input type="text" id="nomeCampeonato" v-model="nomeCampeonato" placeholder="Ex: Campeonato de Futebol"
            required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="modalidade">Modalidade</label>
            <select id="modalidade" v-model="modalidadeSelecionada" required>
              <option value="" disabled>Selecione a modalidade</option>
              <option v-for="m in modalidades" :key="m.id" :value="m.id">
                {{ m.nome }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="quadra">Quadra</label>
            <select id="quadra" v-model="quadraSelecionada" :disabled="!modalidadeSelecionada" required>
              <option value="" disabled v-if="!modalidadeSelecionada">
                Selecione uma modalidade primeiro
              </option>
              <option value="" disabled v-else>
                Selecione a quadra
              </option>
              <option v-for="q in quadras" :key="q.id" :value="q.id">
                {{ q.nome }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dataInicio">Data de Início</label>
            <input type="date" id="dataInicio" v-model="dataInicio" required />
          </div>

          <div class="form-group">
            <label for="dataFim">Data de Fim</label>
            <input type="date" id="dataFim" v-model="dataFim" required />
          </div>
        </div>

        <div class="form-group">
          <label for="fotoCampeonato">Foto (opcional)</label>
          <input type="file" id="fotoCampeonato" accept=".jpg,.jpeg,.png" @change="handleImagemUpload" />
          <small class="texto-ajuda">
            Recomendado: imagem horizontal (1920 × 600 px). <br />
            Tamanho mínimo: 1280 × 400 px.
          </small>
        </div>

        <div class="botoes">
          <button type="submit" class="btn-save">Continuar</button>
        </div>
      </form>
    </div>
  </div>

  <!--MODAL DE TIMES -->
  <div v-if="mostrarModalTimes" class="modal-overlay" @click.self="mostrarModalTimes = false">
    <div class="modal-content modal-times">
      <div class="modal-header">
        <h2>Selecione os Times</h2>
        <button type="button" class="btn-close-x" @click="mostrarModalTimes = false">x</button>
      </div>

      <div class="contador">{{ timesSelecionados.length }} selecionado(s)</div>

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
        <button class="btn-save" @click="finalizarCadastro">Criar Campeonato</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import api from '@/axios'

export default {
  name: 'AdicionarCampeonatoModal',
  props: {
    aberto: { type: Boolean, default: false }
  },

  data() {
    return {
      mostrarModalTipo: false,
      tipoSelecionado: '',

      modalidades: [],
      quadras: [],
      modalidadeSelecionada: '',
      quadraSelecionada: '',
      nomeCampeonato: '',
      dataInicio: '',
      dataFim: '',
      arquivoFoto: null,
      mostrarModalTimes: false,
      times: [],
      timesSelecionados: [],
      campeonatoTemp: null
    }
  },

  watch: {
    aberto(valor) {
      if (valor) {
        this.limparCampos()
        this.mostrarModalTipo = true
        this.carregarModalidades()
      }
    },
    modalidadeSelecionada(valor) {
      this.quadraSelecionada = ''
      if (valor) this.carregarQuadras(valor)
      else this.quadras = []
    }
  },

  computed: {
    tiposCampeonatoCards() {
      return [
        {
          value: 'PONTOS_CORRIDOS',
          titulo: 'Pontos Corridos',
          descricao: 'Tabela única com classificação geral'
        },
        {
          value: 'PONTOS_CORRIDOS_ELIMINATORIAS',
          titulo: 'Pontos Corridos Eliminatórias',
          descricao: 'Pontos corridos seguido de eliminatórias'
        },
        {
          value: 'ELIMINATORIAS',
          titulo: 'Eliminatórias',
          descricao: 'Estilo mata-mata de competição'
        }
      ]
    }
  },

  methods: {
    limparCampos() {
      this.modalidadeSelecionada = ''
      this.quadraSelecionada = ''
      this.nomeCampeonato = ''
      this.dataInicio = ''
      this.dataFim = ''
      this.arquivoFoto = null
      this.quadras = []
      this.campeonatoTemp = null
      this.tipoSelecionado = ''
    },

    selecionarTipo(tipo) {
      this.tipoSelecionado = tipo
      this.mostrarModalTipo = false
    },

    async carregarModalidades() {
      try {
        const { data } = await api.get('/listar/modalidade')
        this.modalidades = data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar modalidades.', 'error')
      }
    },

    async carregarQuadras(modalidadeId) {
      try {
        const res = await api.get(`/listar/quadras/${modalidadeId}`)
        this.quadras = res.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar quadras.', 'error')
      }
    },

    handleImagemUpload(event) {
      const file = event.target.files[0]
      if (file) this.arquivoFoto = file
    },

    async abrirModalTimes() {
      if (!this.modalidadeSelecionada || !this.quadraSelecionada || !this.nomeCampeonato.trim() || !this.dataInicio || !this.dataFim) {
        Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning')
        return
      }

      try {
        let urlImagem = null
        if (this.arquivoFoto) {
          const formData = new FormData()
          formData.append('file', this.arquivoFoto)
          const upload = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          urlImagem = upload.data.fileUrl || upload.data.url || null
        }

        this.campeonatoTemp = {
          tipo: this.tipoSelecionado,
          nome: this.nomeCampeonato.trim(),
          modalidadeId: this.modalidadeSelecionada,
          quadraId: this.quadraSelecionada,
          dataInicio: this.dataInicio,
          dataFim: this.dataFim,
          status: 'EM_ANDAMENTO',
          foto: urlImagem
        }

        const res = await api.get(`/times/modalidade/${this.modalidadeSelecionada}`)
        this.times = res.data
        this.timesSelecionados = []

        this.$emit('fechar')
        this.mostrarModalTimes = true
      } catch {
        Swal.fire('Erro', 'Erro ao carregar os times.', 'error')
      }
    },

    toggleTime(id) {
      const index = this.timesSelecionados.indexOf(id)
      if (index >= 0) this.timesSelecionados.splice(index, 1)
      else this.timesSelecionados.push(id)
    },

    async finalizarCadastro() {
      if (this.timesSelecionados.length < 2) {
        Swal.fire('Atenção', 'Selecione pelo menos 2 times.', 'warning')
        return
      }

      if (this.dataFim < this.dataInicio) {
        Swal.fire('Atenção', 'Data de fim não pode ser menor que a de início.', 'warning')
        return
      }

      try {
        await api.post('/criar/campeonato', {
          tipo: this.campeonatoTemp.tipo,
          nome: this.campeonatoTemp.nome,
          modalidadeId: this.campeonatoTemp.modalidadeId,
          quadraId: this.campeonatoTemp.quadraId,
          dataInicio: this.campeonatoTemp.dataInicio,
          dataFim: this.campeonatoTemp.dataFim,
          status: this.campeonatoTemp.status,
          foto: this.campeonatoTemp.foto,
          times: this.timesSelecionados,
          datasJogos: []
        })

        Swal.fire('Sucesso', 'Campeonato cadastrado com sucesso!', 'success')
        this.$emit('atualizar')
        this.$emit('fechar')
        this.mostrarModalTimes = false
        this.limparCampos()
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.erro || 'Erro ao criar campeonato', 'error')
      }
    },

    cancelarCadastro() {
      this.limparCampos()
      if (this.mostrarModalTipo) {
        this.mostrarModalTipo = false
      }
      if (this.aberto && !this.mostrarModalTipo) {
        this.$emit('fechar')
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
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
  max-height: 90vh;
  overflow-y: auto;
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

.modal-escolha-tipo-campeonato {
  width: min(720px, 92vw);
  border-radius: 18px;
  padding: 26px 28px;
  overflow: visible;
}

.header-escolha-tipo {
  margin-bottom: 12px;
}

.titulo-escolha-tipo {
  margin: 0;
  color: #3b82f6;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
}

.modal-escolha-tipo-campeonato .btn-close-x {
  width: 34px;
  height: 34px;
  border-color: #3b82f6;
  font-size: 20px;
}

.modal-escolha-tipo-campeonato .btn-close-x:hover {
  background: rgba(59, 130, 246, 0.08);
}

.tipo-campeonato-lista {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 10px 0 18px;
}

.btn-tipo {
  width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.btn-tipo-card {
  border: 1px solid rgba(59, 130, 246, 0.65);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  background: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.btn-tipo-card.tipo-card-principal {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.08) 100%);
}

.btn-tipo-card:hover {
  transform: translateY(-1px);
  border-color: #3b82f6;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.12);
}

.btn-tipo-icone {
  color: #3b82f6;
  width: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-tipo-icone svg {
  width: 24px;
  height: 24px;
}

.btn-tipo-conteudo {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.btn-tipo-titulo {
  color: #111827;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
}

.btn-tipo-sub {
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
}

.botoes-escolha-tipo {
  margin-top: 12px;
}

.btn-cancelar-escolha-tipo {
  width: 100%;
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 999px;
  padding: 12px 0;
  color: #3b82f6;
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  background: transparent;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.btn-cancelar-escolha-tipo:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.55);
  transform: translateY(-1px);
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

.form-group {
  margin-bottom: 16px;
}

input,
select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.texto-ajuda {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

.modal-times {
  display: flex;
  flex-direction: column;
  padding: 24px 32px;
  border-radius: 12px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  background-color: #fff;
  overflow-y: hidden;
}

.modal-times h2 {
  margin-bottom: 12px;
  color: #3b82f6;
  font-weight: bold;
}

.contador {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  padding: 8px 0;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
  border-bottom: 1px solid #e5e7eb;
}

.lista-times {
  flex: 1;
  overflow-y: auto;
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.lista-times::-webkit-scrollbar {
  width: 6px;
}

.lista-times::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

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

.time-card:hover {
  background: #eff6ff;
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

.time-info span {
  font-size: 13px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .modal-escolha-tipo-campeonato {
    width: 96vw;
    padding: 20px 16px;
    border-radius: 16px;
  }

  .titulo-escolha-tipo {
    font-size: 34px;
  }

  .modal-escolha-tipo-campeonato .btn-close-x {
    width: 44px;
    height: 44px;
    font-size: 30px;
  }

  .btn-tipo-card {
    padding: 14px;
    gap: 12px;
    border-radius: 14px;
  }

  .btn-tipo-icone {
    width: 36px;
    flex-basis: 36px;
  }

  .btn-tipo-icone svg {
    width: 30px;
    height: 30px;
  }

  .btn-tipo-titulo {
    font-size: 17px;
  }

  .btn-tipo-sub {
    font-size: 12px;
  }

  .btn-cancelar-escolha-tipo {
    font-size: 18px;
    padding: 14px 0;
  }

  .lista-times {
    grid-template-columns: 1fr;
  }
}
</style>
