<template>
  <div class="layout">
    <SideBar />

    <div class="conteudo">
      <div class="header">
        <h1 class="title">Gerenciar Partidas</h1>
        <router-link to="/partida" class="criarpartidas">
          Criar Partida
        </router-link>
      </div>

      <div class="dropdowns">
        <div class="dropdown-row">
          <div class="dropdown-container">
            <label class="dropdown-label">Selecione a modalidade</label>
            <select class="dropdown" v-model="modalidadeSelecionada" @change="onModalidadeChange">
              <option value="">Selecione</option>
              <option v-for="modalidade in modalidades" :key="modalidade.id" :value="modalidade.id">
                {{ modalidade.nome }}
              </option>
            </select>
          </div>

          <div class="dropdown-container">
            <label class="dropdown-label">Selecione o campeonato</label>
            <select class="dropdown" v-model="campeonatoSelecionado" @change="onCampeonatoChange"
              :disabled="!modalidadeSelecionada">
              <option value="">Selecione</option>
              <option v-for="campeonato in campeonatos" :key="campeonato.id" :value="campeonato.id">
                {{ campeonato.nome }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="!modalidadeSelecionada || !campeonatoSelecionado" class="mensagem-orientacao">
        Para retomar ou excluir uma partida, selecione primeiramente a modalidade
        e, em seguida, o campeonato correspondente.
      </div>

      <!-- ACCORDION PARTIDAS ATIVAS -->
      <div v-if="modalidadeSelecionada && campeonatoSelecionado" class="accordion">
        <div class="accordion-header" @click="accordionAtivas = !accordionAtivas">
          <span>Partidas Ativas</span>
          <span>{{ accordionAtivas ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionAtivas" class="accordion-body">
          <div v-if="partidas.length === 0" class="vazio">
            Nenhuma partida ativa encontrada
          </div>

          <div v-else class="partidas-lista">
            <div v-for="partida in partidas" :key="partida.id" class="card-partida">
              <div class="card-info">
                <div class="times">
                  <div class="time">
                    <img v-if="partida.timeA.foto" :src="partida.timeA.foto" class="time-foto" />
                    <span class="time-nome">{{ partida.timeA.nome }}</span>
                  </div>

                  <div class="placar">
                    {{ partida.pontosTimeA }} : {{ partida.pontosTimeB }}
                  </div>

                  <div class="time">
                    <img v-if="partida.timeB.foto" :src="partida.timeB.foto" class="time-foto" />
                    <span class="time-nome">{{ partida.timeB.nome }}</span>
                  </div>
                </div>

                <p class="quadra">Quadra: {{ partida.quadra.nome }}</p>
              </div>

              <div class="card-acoes">
                <button class="btn-retomar">Retomar</button>
                <button class="btn-excluir" @click="excluirPartida(partida.id)">
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCORDION PARTIDAS ENCERRADAS -->
      <div v-if="modalidadeSelecionada && campeonatoSelecionado" class="accordion">
        <div class="accordion-header encerradas" @click="accordionEncerradas = !accordionEncerradas">
          <span>Partidas Encerradas</span>
          <span>{{ accordionEncerradas ? '−' : '+' }}</span>
        </div>

        <div v-if="accordionEncerradas" class="accordion-body">
          <div v-if="partidasEncerradas.length === 0" class="vazio">
            Nenhuma partida encerrada encontrada
          </div>

          <div v-else class="partidas-lista">
            <div v-for="partida in partidasEncerradas" :key="partida.id" class="card-partida encerrada">
              <div class="card-info">
                <div class="times">
                  <div class="time">
                    <img v-if="partida.timeA.foto" :src="partida.timeA.foto" class="time-foto" />
                    <span class="time-nome">{{ partida.timeA.nome }}</span>
                  </div>

                  <div class="placar">
                    {{ partida.pontosTimeA }} : {{ partida.pontosTimeB }}
                  </div>

                  <div class="time">
                    <img v-if="partida.timeB.foto" :src="partida.timeB.foto" class="time-foto" />
                    <span class="time-nome">{{ partida.timeB.nome }}</span>
                  </div>
                </div>

                <p class="quadra">Quadra: {{ partida.quadra.nome }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'GerenciarPartidaView',
  components: { SideBar },

  data() {
    return {
      modalidades: [],
      campeonatos: [],
      partidas: [],
      partidasEncerradas: [],
      modalidadeSelecionada: '',
      campeonatoSelecionado: '',
      accordionAtivas: false,
      accordionEncerradas: false
    }
  },

  mounted() {
    this.buscarModalidades()
  },

  methods: {
    toggleAccordionAtivas() {
      this.accordionAtivasAberto = !this.accordionAtivasAberto
    },

    toggleAccordionEncerradas() {
      this.accordionEncerradasAberto = !this.accordionEncerradasAberto
    },
    async buscarModalidades() {
      try {
        const response = await api.get('/listar/modalidade')
        this.modalidades = response.data
      } catch (error) {
        console.error('Erro ao buscar modalidades:', error)
      }
    },

    async buscarCampeonatos() {
      this.campeonatos = []
      this.campeonatoSelecionado = ''
      this.partidas = []
      this.accordionAberto = false

      if (!this.modalidadeSelecionada) return

      try {
        const response = await api.get(`/listar/${this.modalidadeSelecionada}`)
        this.campeonatos = response.data
      } catch (error) {
        console.error('Erro ao buscar campeonatos:', error)
      }
    },

    onModalidadeChange() {
      this.buscarCampeonatos()
    },

    async onCampeonatoChange() {
      this.partidas = []
      this.partidasEncerradas = []
      this.accordionAtivas = false
      this.accordionEncerradas = false

      if (!this.campeonatoSelecionado) return
      await this.buscarPartidasAtivas()
      await this.buscarPartidasEncerradas()
      this.accordionAtivas = true
    },

    async buscarPartidasAtivas() {
      if (!this.modalidadeSelecionada || !this.campeonatoSelecionado) return

      try {
        const response = await api.get(
          `/partidas/ativas/${this.modalidadeSelecionada}/${this.campeonatoSelecionado}`
        )
        this.partidas = response.data
      } catch (error) {
        console.error('Erro ao buscar partidas ativas:', error)
      }
    },
    async buscarPartidasEncerradas() {
      if (!this.modalidadeSelecionada || !this.campeonatoSelecionado) return

      try {
        const response = await api.get(
          `/partidas/encerradas/${this.modalidadeSelecionada}/${this.campeonatoSelecionado}`
        )

        this.partidasEncerradas = response.data
      } catch (error) {
        console.error('Erro ao buscar partidas encerradas:', error)
      }
    },
    async excluirPartida(partidaId) {
  const resultado = await Swal.fire({
    title: 'Tem certeza?',
    text: 'Essa ação não poderá ser desfeita!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, excluir',
    cancelButtonText: 'Cancelar'
  })

  if (!resultado.isConfirmed) return

  try {
    await api.delete(`/partidas/${partidaId}`)

    await Swal.fire({
      title: 'Excluída!',
      text: 'A partida foi excluída com sucesso.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    })

    // Atualiza a lista após excluir
    await this.buscarPartidasAtivas()
    await this.buscarPartidasEncerradas()

  } catch (error) {
    console.error(error)

    Swal.fire({
      title: 'Erro',
      text: 'Não foi possível excluir a partida.',
      icon: 'error'
    })
  }
}

  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
}

.criarpartidas {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.dropdowns {
  width: 100%;
}

.dropdown-row {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.dropdown-container {
  width: 100%;
}

.dropdown {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-top: 20px;
}

.accordion-header {
  background: #f1f5f9;
  padding: 14px 18px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}

.accordion-body {
  padding: 16px;
}

.partidas-lista {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.card-partida {
  width: 100%;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 16px;
  background: #fff;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.card-info h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: bold;
}

.card-info p {
  margin: 2px 0;
  color: #555;
}

/* AÇÕES */
.card-acoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
}

.btn-retomar {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-excluir {
  background-color: #7E7E7E;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.times {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.time {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.time-foto {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #3b82f6;
}

.time-nome {
  font-weight: bold;
  font-size: 14px;
}

.placar {
  font-size: 30px;
  font-weight: bold;
  padding: 6px 14px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #1f2937;
  min-width: 70px;
  text-align: center;
}

.quadra {
  margin-top: 8px;
  color: #555;
  font-size: 14px;
}

.vs {
  font-weight: bold;
  font-size: 16px;
}

.vazio {
  color: #6b7280;
  font-style: italic;
}

.mensagem-orientacao {
  margin-top: 24px;
  margin-bottom: 32px;
  padding: 35px;
  background-color: #f1f5f9;
  border-left: 4px solid #3b82f6;
  /*color: #3b82f6;*/
  border-radius: 6px;
  font-size: 20px;
}
</style>