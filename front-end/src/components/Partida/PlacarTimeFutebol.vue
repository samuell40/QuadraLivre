<template>
  <div class="placar">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>


    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="abrirModalJogadores('gol')" :disabled="!temporizadorAtivo">−</button>
        <span class="valor">{{ localTime.golspro }}</span>
        <button @click="abrirModalJogadores('gol')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Amarelo</p>
      <div class="controls">
        <button @click="abrirModalJogadores('amarelo')" :disabled="!temporizadorAtivo">−</button>
        <span class="valor">{{ localTime.cartaoamarelo }}</span>
        <button @click="abrirModalJogadores('amarelo')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Vermelho</p>
      <div class="controls">
        <button @click="abrirModalJogadores('vermelho')" :disabled="!temporizadorAtivo">−</button>
        <span class="valor">{{ localTime.cartaovermelho }}</span>
        <button @click="abrirModalJogadores('vermelho')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Faltas</p>
      <div class="controls">
        <button @click="decrementSimples('faltas')" :disabled="!temporizadorAtivo">−</button>
        <span class="valor">{{ localTime.faltas }}</span>
        <button @click="incrementSimples('faltas')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Substituições</p>
      <div class="controls">
        <button @click="decrementSimples('substituicoes')"
          :disabled="!temporizadorAtivo || localTime.substituicoes <= 0">−</button>

        <span class="valor">{{ localTime.substituicoes }}</span>

        <button @click="incrementSimples('substituicoes')"
          :disabled="!temporizadorAtivo || localTime.substituicoes >= 3">+</button>
      </div>
    </div>

    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <h2 class="modal-titulo">
          Selecione o Jogador – <span>{{ tituloEvento }}</span>
        </h2>

        <div v-if="carregando" class="loader">
          Carregando jogadores...
        </div>

        <div v-else class="coluna">
          <div v-for="jogador in jogadores" :key="jogador.id" class="jogador-card">
            <div class="jogador-info">
              <img v-if="jogador.foto" :src="jogador.foto" class="foto-jogador" />
              <div class="dados-jogador">
                <span class="nome">{{ jogador.nome }}</span>
              </div>
            </div>

            <div class="controls">
              <button @click="alterarEventoJogador(jogador, 'decrement')">−</button>

              <span class="valor">
                {{ obterValorEvento(jogador) }}
              </span>

              <button @click="alterarEventoJogador(jogador, 'increment')">+</button>
            </div>
          </div>
        </div>

        <div class="botoes">
          <button class="btn-save1" @click="fecharModal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'PlacarTime',

  props: {
    timeNome: String,
    timeData: Object,
    partidaId: [String, Number],
    temporizadorAtivo: Boolean
  },

  data() {
    return {
      localTime: {
        golspro: this.timeData?.golspro,
        cartaoamarelo: this.timeData?.cartaoamarelo,
        cartaovermelho: this.timeData?.cartaovermelho,
        faltas: this.timeData?.faltas,
        substituicoes: this.timeData?.substituicoes
      },
      modalAberto: false,
      tipoEvento: 'gol',
      jogadores: [],
      carregando: false
    }
  },

  computed: {
    tituloEvento() {
      if (this.tipoEvento === 'gol') return 'Gol'
      if (this.tipoEvento === 'amarelo') return 'Cartão Amarelo'
      if (this.tipoEvento === 'vermelho') return 'Cartão Vermelho'
      return ''
    }
  },

  methods: {
    obterValorEvento(jogador) {
      if (this.tipoEvento === 'gol') return jogador.gols
      if (this.tipoEvento === 'amarelo') return jogador.cartoesAmarelos
      if (this.tipoEvento === 'vermelho') return jogador.cartoesVermelhos
      return 0
    },

    async abrirModalJogadores(tipo) {
      this.tipoEvento = tipo
      this.modalAberto = true
      await this.carregarJogadores()
    },

    fecharModal() {
      this.modalAberto = false
    },

    async carregarJogadores() {
      this.carregando = true
      try {
        const res = await api.get(`/partida/${this.partidaId}`)

        const jogadores = []

        res.data.forEach(j => {
          if (j.timeId !== this.timeData.id) return

          jogadores.push({
            id: j.id,
            nome: j.nome,
            timeId: j.timeId,
            gols: j.gols,
            cartoesAmarelos: j.cartoesAmarelos,
            cartoesVermelhos: j.cartoesVermelhos
          })
        })

        this.jogadores = jogadores
      } catch {
        Swal.fire('Erro', 'Erro ao carregar jogadores', 'error')
      } finally {
        this.carregando = false
      }
    },

    async alterarEventoJogador(jogador, acao) {
      const incremento = acao === 'increment' ? 1 : -1
      const payload = {
        jogadorId: jogador.id,
        partidaId: this.partidaId
      }

      if (this.tipoEvento === 'gol') {
        if (jogador.gols + incremento < 0) return
        jogador.gols += incremento
        this.localTime.golspro += incremento
        payload.gols = incremento
      }

      if (this.tipoEvento === 'amarelo') {
        if (jogador.cartoesAmarelos + incremento < 0) return

        jogador.cartoesAmarelos += incremento
        this.localTime.cartaoamarelo += incremento
        payload.cartoesAmarelos = incremento

        if (incremento === 1 && jogador.cartoesAmarelos % 2 === 0) {
          jogador.cartoesVermelhos++
          this.localTime.cartaovermelho++
          payload.cartoesVermelhos = 1

          Swal.fire(
            'Cartão Vermelho!',
            'Jogador recebeu cartão vermelho após 2 amarelos.',
            'info'
          )
        }
      }

      if (this.tipoEvento === 'vermelho') {
        if (jogador.cartoesVermelhos + incremento < 0) return
        jogador.cartoesVermelhos += incremento
        this.localTime.cartaovermelho += incremento
        payload.cartoesVermelhos = incremento
      }

      this.emitUpdate()
      await api.post('/atuacao', payload)
      await this.salvarPlacar()
    },

    incrementSimples(campo) {
      this.localTime[campo]++
      this.emitUpdate()
      this.salvarPlacar()
    },

    decrementSimples(campo) {
      if (this.localTime[campo] > 0) {
        this.localTime[campo]--
        this.emitUpdate()
        this.salvarPlacar()
      }
    },

    emitUpdate() {
      this.$emit('update', this.localTime)
    },

    async salvarPlacar() {
      await api.put(`/partida/${this.partidaId}/parcial`, this.localTime)
    }
  }
}
</script>

<style scoped>
.placar {
  width: 580px;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 auto;
}

.nome-time {
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  padding: 12px;
  color: #3b82f6;
  font-weight: bold;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 2px solid #3b82f6; /* Borda a volta do nome dos times */
}

.box {
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  gap: 10px;
}

.controls span {
  font-size: 18px;
  font-weight: bold;
}

.controls button {
  background-color: #1e3a8a;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s;
}

.controls button:last-child {
  background-color: #3b82f6;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px 32px;
  border-radius: 12px;
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-titulo {
  border-bottom: none;
  padding: 0 0 12px 0;
  text-align: left;
  color: #3b82f6;
  font-size: 22px;
  font-weight: bold;
}

.coluna {
  flex: 1;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 10px 15px;
  overflow-y: auto;
}

.coluna::-webkit-scrollbar {
  width: 6px;
}

.coluna::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.jogador-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  border: 2px solid #3b82f6;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.foto-jogador {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.nome {
  font-weight: 600;
  font-size: 14px;
}

.botoes {
  margin-top: 16px;
}

.btn-save1 {
  width: 100%;
  padding: 12px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
  background-color: #3b82f6;
}

.loader {
  text-align: center;
  padding: 20px;
  color: #555;
}

.foto-time {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 50%;
  background-color: #f1f5f9;
}
</style>