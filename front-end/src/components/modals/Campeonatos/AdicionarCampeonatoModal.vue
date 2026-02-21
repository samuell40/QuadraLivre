<template>
  <div v-if="mostrarModalTipo" class="modal-overlay" @click.self="cancelarCadastro">
    <div class="modal-content">
        <h2>Escolha o Tipo de Campeonato</h2>

      <div class="tipo-campeonato-lista">
        <button v-for="tipo in tiposCampeonato" :key="tipo" class="btn-tipo" @click="selecionarTipo(tipo)">
          {{ tipo.replaceAll('_', ' ') }}
        </button>
      </div>

      <div class="botoes">
        <button type="button" class="btn-save" @click="cancelarCadastro">Cancelar</button>
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
      tiposCampeonato: ['PONTOS_CORRIDOS', 'PONTOS_CORRIDOS_ELIMINATORIAS', 'ELIMINATORIAS'],
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
  .lista-times {
    grid-template-columns: 1fr;
  }
}
</style>
