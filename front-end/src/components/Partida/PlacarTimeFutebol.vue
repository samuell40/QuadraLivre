<template>
  <div class="placar">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>

    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="abrirModalJogadores('gol')">−</button>
        <span class="valor">{{ timeData?.golspro ?? 0 }}</span>
        <button @click="abrirModalJogadores('gol')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Amarelo</p>
      <div class="controls">
        <button @click="abrirModalJogadores('amarelo')">−</button>
        <span class="valor">{{ timeData?.cartaoamarelo ?? 0 }}</span>
        <button @click="abrirModalJogadores('amarelo')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Vermelho</p>
      <div class="controls">
        <button @click="abrirModalJogadores('vermelho')">−</button>
        <span class="valor">{{ timeData?.cartaovermelho ?? 0 }}</span>
        <button @click="abrirModalJogadores('vermelho')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Faltas</p>
      <div class="controls">
        <button @click="emitDelta('faltas', -1)">−</button>
        <span class="valor">{{ timeData?.faltas ?? 0 }}</span>
        <button @click="emitDelta('faltas', +1)">+</button>
      </div>
    </div>

    <div class="box">
      <p>Substituições</p>
      <div class="controls">
        <button @click="abrirModalRemoverJogador">−</button>
        <span class="valor">{{ timeData?.substituicoes ?? 0 }}</span>
        <button @click="abrirModalSubstituicao">+</button>
      </div>
    </div>

    <!-- Modal eventos (gols/cartões) -->
    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <h2 class="modal-titulo">
          Selecione o Jogador – <span>{{ tituloEvento }}</span>
        </h2>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

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
              <span class="valor">{{ obterValorEvento(jogador) }}</span>
              <button @click="alterarEventoJogador(jogador, 'increment')">+</button>
            </div>
          </div>
        </div>

        <div class="botoes">
          <button class="btn-save1" @click="fecharModal">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Modal substituição -->
    <div v-if="substituicaoModal" class="modal-overlay" @click.self="fecharModalSubstituicao">
      <div class="modal-content">
        <h2 class="titulo-substituicao">Substituição de Jogadores</h2>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else class="colunas">
          <div class="coluna">
            <h3 class="subtitulo">Jogador que sai</h3>
            <div
              v-for="j in jogadoresEmCampo"
              :key="j.id"
              class="jogador-card"
              :class="{ selecionado: jogadorSai?.id === j.id }"
              @click="toggleJogadorSai(j)"
            >
              <div class="jogador-info">
                <img v-if="j.foto" :src="j.foto" class="foto-jogador" />
                <span class="nome">{{ j.nome }}</span>
              </div>
            </div>
          </div>

          <div class="coluna">
            <h3 class="subtitulo">Jogador que entra</h3>
            <div
              v-for="j in jogadoresBanco"
              :key="j.id"
              class="jogador-card"
              :class="{ selecionado: jogadorEntra?.id === j.id }"
              @click="toggleJogadorEntra(j)"
            >
              <div class="jogador-info">
                <img v-if="j.foto" :src="j.foto" class="foto-jogador" />
                <span class="nome">{{ j.nome }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="substituicoesPendentes.length" class="coluna coluna-substituicoes">
          <h3 class="subtitulo">Substituições selecionadas</h3>

          <div v-for="(s, index) in substituicoesPendentes" :key="index" class="jogador-card substituicao-card">
            <div class="jogador-info">
              <span class="nome">{{ s.sai.nome }}</span>
            </div>
            <span class="seta">→</span>
            <div class="jogador-info">
              <span class="nome">{{ s.entra.nome }}</span>
            </div>
          </div>
        </div>

        <div class="botoes">
          <button class="btn-save1" @click="adicionarSubstituicao">
            Adicionar Substituição
          </button>

          <button class="btn-save1" v-if="substituicoesPendentes.length > 0" @click="confirmarTodasSubstituicoes">
            Confirmar {{ substituicoesPendentes.length }}
          </button>

          <button class="btn-cancel" @click="fecharModalSubstituicao">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal remover -->
    <div v-if="modalRemoverAberto" class="modal-overlay" @click.self="fecharModalRemover">
      <div class="modal-content modal-remover">
        <h2 class="modal-titulo">Remover jogadores de campo</h2>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else class="lista-remover">
          <div
            v-for="j in jogadoresEmCampo"
            :key="j.id"
            class="jogador-card"
            :class="{ selecionado: jogadoresSelecionados.includes(j.id) }"
            @click="toggleSelecionado(j.id)"
          >
            <div class="jogador-info">
              <img v-if="j.foto" :src="j.foto" class="foto-jogador" />
              <span class="nome">{{ j.nome }}</span>
            </div>
          </div>
        </div>

        <div class="botoes">
          <button class="btn-save1" @click="confirmarRemocaoJogadores">
            Confirmar ({{ jogadoresSelecionados.length }})
          </button>

          <button class="btn-cancel" @click="fecharModalRemover">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'
import Swal from 'sweetalert2'

export default {
  name: 'PlacarTimeFutebol',

  props: {
    timeNome: String,
    timeData: Object,
    partidaId: [String, Number],
    lado: { type: String, required: true }
  },

  data() {
    return {
      modalAberto: false,
      tipoEvento: 'gol',
      jogadores: [],
      carregando: false,

      substituicaoModal: false,
      jogadoresEmCampo: [],
      jogadoresBanco: [],
      jogadorSai: null,
      jogadorEntra: null,
      substituicoesPendentes: [],

      modalRemoverAberto: false,
      jogadoresSelecionados: []
    }
  },

  computed: {
    tituloEvento() {
      if (this.tipoEvento === 'gol') return 'Gol'
      if (this.tipoEvento === 'amarelo') return 'Cartão Amarelo'
      if (this.tipoEvento === 'vermelho') return 'Cartão Vermelho'
      return ''
    },

    partidaIdNum() {
      const n = Number(this.partidaId)
      return Number.isFinite(n) ? n : null
    }
  },

  methods: {
    emitDelta(campo, delta) {
      this.$emit('parcial-delta', { lado: this.lado, campo, delta })
    },

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
      if (!this.partidaIdNum) return
      this.carregando = true
      try {
        const res = await api.get(`/partida/${this.partidaIdNum}`)
        this.jogadores = res.data
          .filter(j => j.timeId === this.timeData.id)
          .map(j => ({
            id: j.id,
            nome: j.nome,
            foto: j.foto,
            gols: j.gols,
            cartoesAmarelos: j.cartoesAmarelos,
            cartoesVermelhos: j.cartoesVermelhos
          }))
      } catch {
        Swal.fire('Erro', 'Erro ao carregar jogadores', 'error')
      } finally {
        this.carregando = false
      }
    },

    async alterarEventoJogador(jogador, acao) {
      if (!this.partidaIdNum) return

      const incremento = acao === 'increment' ? 1 : -1
      const payload = { jogadorId: jogador.id, partidaId: this.partidaIdNum }

      if (this.tipoEvento === 'gol') payload.gols = incremento
      if (this.tipoEvento === 'amarelo') payload.cartoesAmarelos = incremento
      if (this.tipoEvento === 'vermelho') payload.cartoesVermelhos = incremento

      try {
        const res = await api.post('/atuacao', payload)

        if (this.tipoEvento === 'gol') this.emitDelta('golspro', incremento)
        if (this.tipoEvento === 'amarelo') this.emitDelta('cartaoamarelo', incremento)
        if (this.tipoEvento === 'vermelho') this.emitDelta('cartaovermelho', incremento)

        if (res.data?.emCampo === false) {
          Swal.fire('Expulsão!', 'Jogador expulso automaticamente.', 'warning')
        }

        await this.carregarJogadores()
        this.$emit('refresh')
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.message || 'Erro ao salvar atuação', 'error')
        await this.carregarJogadores()
      }
    },

    toggleJogadorSai(jogador) {
      this.jogadorSai = this.jogadorSai?.id === jogador.id ? null : jogador
    },

    toggleJogadorEntra(jogador) {
      this.jogadorEntra = this.jogadorEntra?.id === jogador.id ? null : jogador
    },

    async abrirModalSubstituicao() {
      if (!this.partidaIdNum) return
      this.substituicaoModal = true
      this.jogadorSai = null
      this.jogadorEntra = null
      this.substituicoesPendentes = []
      await this.carregarJogadoresSubstituicao()
    },

    fecharModalSubstituicao() {
      this.substituicaoModal = false
      this.jogadorSai = null
      this.jogadorEntra = null
      this.substituicoesPendentes = []
    },

    async carregarJogadoresSubstituicao() {
      if (!this.partidaIdNum) return
      this.carregando = true
      try {
        const resEmCampo = await api.get(`/partida/${this.partidaIdNum}`)
        this.jogadoresEmCampo = resEmCampo.data.filter(j => j.timeId === this.timeData.id)

        const resBanco = await api.get(`/${this.partidaIdNum}/${this.timeData.id}/jogadores-fora-partida`)
        this.jogadoresBanco = resBanco.data
      } catch {
        Swal.fire('Erro', 'Erro ao carregar jogadores da substituição', 'error')
      } finally {
        this.carregando = false
      }
    },

    adicionarSubstituicao() {
      if (!this.jogadorSai || !this.jogadorEntra) return
      this.substituicoesPendentes.push({ sai: this.jogadorSai, entra: this.jogadorEntra })
      this.jogadorSai = null
      this.jogadorEntra = null
    },

    async confirmarTodasSubstituicoes() {
      if (!this.partidaIdNum) return

      try {
        for (const sub of this.substituicoesPendentes) {
          await api.put(`/partidas/${this.partidaIdNum}/substituir`, {
            jogadorSaiId: sub.sai.id,
            jogadorEntraId: sub.entra.id
          })
        }

        this.emitDelta('substituicoes', this.substituicoesPendentes.length)

        Swal.fire('Sucesso', `${this.substituicoesPendentes.length} substituição(ões) realizadas`, 'success')
        this.fecharModalSubstituicao()
        this.$emit('refresh')
      } catch {
        Swal.fire('Erro', 'Erro ao realizar substituições', 'error')
      }
    },

    async abrirModalRemoverJogador() {
      if (!this.partidaIdNum) return
      this.modalRemoverAberto = true
      this.jogadoresSelecionados = []
      await this.carregarJogadoresEmCampo()
    },

    fecharModalRemover() {
      this.modalRemoverAberto = false
      this.jogadoresSelecionados = []
    },

    toggleSelecionado(jogadorId) {
      if (this.jogadoresSelecionados.includes(jogadorId)) {
        this.jogadoresSelecionados = this.jogadoresSelecionados.filter(id => id !== jogadorId)
      } else {
        this.jogadoresSelecionados.push(jogadorId)
      }
    },

    async carregarJogadoresEmCampo() {
      if (!this.partidaIdNum) return
      this.carregando = true
      try {
        const res = await api.get(`/partida/${this.partidaIdNum}`)
        this.jogadoresEmCampo = res.data.filter(j => j.timeId === this.timeData.id)
      } catch {
        Swal.fire('Erro', 'Erro ao carregar jogadores em campo', 'error')
      } finally {
        this.carregando = false
      }
    },

    async confirmarRemocaoJogadores() {
      if (!this.partidaIdNum) return

      try {
        for (const jogadorId of this.jogadoresSelecionados) {
          await api.put(`/${this.partidaIdNum}/${jogadorId}/remover`)
        }

        Swal.fire('Sucesso', 'Jogador(es) removido(s) de campo', 'success')
        this.fecharModalRemover()
        this.$emit('refresh')
      } catch {
        Swal.fire('Erro', 'Erro ao remover jogadores', 'error')
      }
    }
  }
}
</script>

<style scoped>
.placar {
  width: 100%;
  max-width: 580px;
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
  border: 2px solid #3b82f6;
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
  width: 100%;
  max-width: 900px;
  height: 85vh;
  display: flex;
  flex-direction: column;
}

.modal-titulo {
  border-bottom: none;
  padding: 0 0 12px 0;
  text-align: left;
  color: #3b82f6;
  font-size: 30px;
  font-weight: bold;
}

.titulo-substituicao {
  margin-bottom: 30px;
  color: #3b82f6;
  text-align: left;
  font-weight: bold;
}

.subtitulo {
  color: #3b82f6;
  font-size: 20px;
  text-align: center;
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
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-save1,
.btn-cancel {
  flex: 1;
  padding: 12px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save1 {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #7e7e7e;
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

.selecionado {
  background: #dbeafe;
  border: 2px solid #2563eb;
}

.colunas {
  display: flex;
  gap: 20px;
  flex: 1;
  overflow: hidden;
}

.coluna-substituicoes {
  margin-top: 20px;
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 10px 15px;
}

.substituicao-card {
  justify-content: space-between;
  align-items: center;
}

.substituicao-card .nome {
  font-size: 14px;
  font-weight: 600;
}

.seta {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
}

.modal-remover {
  width: 900px;
  max-height: 80vh;
}

.lista-remover {
  flex: 1;
  overflow-y: auto;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .placar {
    padding: 20px;
  }

  .nome-time {
    font-size: 20px;
    padding: 10px;
    flex-direction: column;
    gap: 6px;
  }

  .foto-time {
    width: 48px;
    height: 48px;
  }

  .box .controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .box .controls button {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  .controls span {
    font-size: 16px;
  }

  .modal-content {
    height: 95vh;
    padding: 16px;
  }

  .modal-titulo {
    font-size: 22px;
    text-align: center;
  }

  .titulo-substituicao {
    font-size: 18px;
    text-align: center;
  }

  .subtitulo {
    font-size: 16px;
  }

  .colunas {
    flex-direction: column;
    gap: 12px;
  }

  .coluna {
    max-height: 35vh;
  }

  .jogador-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .foto-jogador {
    width: 36px;
    height: 36px;
  }

  .botoes {
    flex-direction: column;
  }

  .btn-save1,
  .btn-cancel {
    width: 100%;
    font-size: 15px;
  }

  .coluna-substituicoes {
    max-height: 120px;
  }
}
</style>