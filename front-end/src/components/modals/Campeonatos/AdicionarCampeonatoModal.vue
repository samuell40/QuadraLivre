<template>
  <div v-if="aberto" class="modal-overlay" @click.self="cancelarCadastro">
    <div class="modal-content">
      <h2>Adicionar Campeonato</h2>

      <form @submit.prevent="abrirModalTimes">
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

        <div class="form-group">
          <label for="nomeCampeonato">Nome do Campeonato</label>
          <input type="text" id="nomeCampeonato" v-model="nomeCampeonato" required />
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
          <button type="submit" class="btn-save">
            Continuar
          </button>
          <button type="button" class="btn-cancel" @click="cancelarCadastro">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>

  <div v-if="mostrarModalTimes" class="modal-overlay" @click.self="mostrarModalTimes = false">
    <div class="modal-content modal-times">
      <h2>Selecione os Times</h2>

      <div class="contador">
        {{ timesSelecionados.length }} selecionado(s)
      </div>

      <div class="lista-times">
        <div v-for="time in times" :key="time.id" class="time-card"
          :class="{ selecionado: timesSelecionados.includes(time.id) }" @click="toggleTime(time.id)">
          <div class="time-info">
            <h3>{{ time.nome }}</h3>
            <span>{{ time._count?.jogadores || 0 }} jogadores</span>
          </div>
        </div>
      </div>

      <div class="botoes">
        <button class="btn-save" @click="finalizarCadastro">
          Criar Campeonato
        </button>

        <button class="btn-cancel" @click="mostrarModalTimes = false">
          Voltar
        </button>
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
      if (
        !this.modalidadeSelecionada ||
        !this.quadraSelecionada ||
        !this.nomeCampeonato.trim() ||
        !this.dataInicio ||
        !this.dataFim
      ) {
        Swal.fire('Atenção', 'Preencha todos os campos obrigatórios.', 'warning')
        return
      }

      try {
        let urlImagem = null

        if (this.arquivoFoto) {
          const formData = new FormData()
          formData.append('file', this.arquivoFoto)

          const upload = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          urlImagem = upload.data.fileUrl || upload.data.url || null
        }

        this.campeonatoTemp = {
          nome: this.nomeCampeonato.trim(),
          modalidadeId: this.modalidadeSelecionada,
          quadraId: this.quadraSelecionada,
          dataInicio: this.dataInicio,
          dataFim: this.dataFim,
          status: 'EM_ANDAMENTO',
          foto: urlImagem
        }

        const res = await api.get(
          `/times/modalidade/${this.modalidadeSelecionada}`
        )

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

    async nomeCampeonatoJaExiste() {
      try {
        const res = await api.get('/listar/campeonatos')

        const nomeDigitado = this.nomeCampeonato.trim().toLowerCase()

        return res.data.some(
          campeonato =>
            campeonato.nome.trim().toLowerCase() === nomeDigitado
        )
      } catch (error) {
        console.error('Erro ao verificar nome do campeonato', error)
        return false
      }
    },

    async finalizarCadastro() {
      if (this.timesSelecionados.length < 2) {
        Swal.fire('Atenção', 'Selecione pelo menos 2 times.', 'warning')
        return
      }

      if (this.dataFim < this.dataInicio) {
        Swal.fire(
          'Atenção',
          'Data de fim não pode ser menor que a de início.',
          'warning'
        )
        return
      }

      const jaExiste = await this.nomeCampeonatoJaExiste()
      if (jaExiste) {
        Swal.fire(
          'Atenção',
          'Já existe um campeonato cadastrado com esse nome.',
          'warning'
        )
        return
      }

      try {
        await api.post('/criar/campeonato', {
          nome: this.nomeCampeonato.trim(),
          modalidadeId: Number(this.modalidadeSelecionada),
          quadraId: Number(this.quadraSelecionada),
          dataInicio: new Date(this.dataInicio).toISOString(),
          dataFim: new Date(this.dataFim).toISOString(),
          times: this.timesSelecionados,
          datasJogos: [],
          foto: this.campeonatoTemp?.foto,
          status: 'EM_ANDAMENTO'
        })

        Swal.fire('Sucesso', 'Campeonato cadastrado com sucesso!', 'success')
        this.$emit('atualizar')
        this.$emit('fechar')
        this.limparCampos()
      } catch (error) {
        Swal.fire(
          'Erro',
          error.response?.data?.erro,
          'error'
        )
      }
    },

    cancelarCadastro() {
      this.limparCampos()
      this.$emit('fechar')
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
  width: 900px;
  max-width: 95%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
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

.select-all {
  margin-bottom: 10px;
  font-size: 14px;
}

.select-all label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.select-all input[type="checkbox"] {
  margin: 0;
}

.horarios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 8px;
}

.horarios button {
  height: 40px;
  font-size: 14px;
  border: 1px solid #1E3A8A;
  border-radius: 6px;
  background-color: #fff;
  cursor: pointer;
}

.horarios button:hover {
  background-color: #3b82f6;
  color: #fff;
}

.horarios button.selecionado {
  background-color: #1E3A8A;
  color: #fff;
}

.dias {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 5px;
}

.dia-label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.texto-ajuda {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280; 
}

/* ===== MODAL DE TIMES ===== */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-times {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;

  display: flex;
  flex-direction: column;
}

.modal-times h2 {
  margin-bottom: 12px;
  color: #3b82f6;
}

/* contador fixo */
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

/* lista com scroll */
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

/* card do time */
.time-card {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 14px 16px;
  cursor: pointer;
  transition: 0.2s;
  background: #fff;
}

.time-card:hover {
  background: #eff6ff;
}

.time-card.selecionado {
  background: #3b82f6;
  color: white;
  border-color: #1e40af;
}

.time-info h3 {
  font-size: 16px;
  margin-bottom: 4px;
}

.time-info span {
  font-size: 13px;
  opacity: 0.9;
}

/* responsivo */
@media (max-width: 768px) {
  .lista-times {
    grid-template-columns: 1fr;
  }
}
</style>