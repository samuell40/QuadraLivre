<template>
  <div class="placar" :class="{ 'placar-finalizada': partidaEncerradaGlobal, 'placar-andamento': partidaEmAndamentoGlobal }">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>

    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="abrirModalJogadores('gol')">-</button>
        <span class="valor">{{ timeData?.golspro ?? 0 }}</span>
        <button @click="abrirModalJogadores('gol')">+</button>
      </div>
    </div>

    <!-- LINHA: Amarelo + Vermelho -->
    <div class="row-2">
      <div class="box">
        <p>Cartao Amarelo</p>
        <div class="controls">
          <button @click="abrirModalJogadores('amarelo')">-</button>
          <span class="valor">{{ timeData?.cartaoamarelo ?? 0 }}</span>
          <button @click="abrirModalJogadores('amarelo')">+</button>
        </div>
      </div>

      <div class="box">
        <p>Cartao Vermelho</p>
        <div class="controls">
          <button @click="abrirModalJogadores('vermelho')">-</button>
          <span class="valor">{{ timeData?.cartaovermelho ?? 0 }}</span>
          <button @click="abrirModalJogadores('vermelho')">+</button>
        </div>
      </div>
    </div>

    <!-- LINHA: Faltas + Substituicoes -->
    <div class="row-2">
      <div class="box">
        <p>Faltas</p>
        <div class="controls">
          <button @click="emitDelta('faltas', -1)">-</button>
          <span class="valor">{{ timeData?.faltas ?? 0 }}</span>
          <button @click="emitDelta('faltas', +1)">+</button>
        </div>
      </div>

      <div class="box">
        <p>Substituicoes</p>
        <div class="controls">
          <button @click="abrirModalRemoverJogador" :disabled="partidaEncerradaGlobal">-</button>
          <span class="valor">{{ timeData?.substituicoes ?? 0 }}</span>
          <button @click="abrirModalSubstituicao" :disabled="partidaEncerradaGlobal">+</button>
        </div>
      </div>
    </div>

    <!-- Modal eventos (gols/cartoes) -->
        <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content modal-evento" :class="modalStatusClass">
        <div class="modal-header">
          <div class="modal-header-copy">
            <h2 class="modal-titulo" :class="{ 'modal-titulo-finalizada': partidaEncerradaGlobal, 'modal-titulo-andamento': partidaEmAndamentoGlobal }">
              Selecione o jogador
            </h2>
            <p class="modal-subtitulo">Ajuste os registros de {{ tituloEvento }} para este time.</p>
          </div>
          <button type="button" class="btn-close-x" @click="fecharModal">x</button>
        </div>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else-if="jogadores.length" class="coluna coluna-evento">
          <div v-for="jogador in jogadores" :key="jogador.id" class="jogador-card">
            <div class="jogador-info">
              <img v-if="jogador.foto" :src="jogador.foto" class="foto-jogador" />
              <div class="dados-jogador">
                <span class="nome">{{ jogador.nome }}</span>
              </div>
            </div>

            <div class="controls">
              <button @click="alterarEventoJogador(jogador, 'decrement')">-</button>
              <span class="valor">{{ obterValorEvento(jogador) }}</span>
              <button @click="alterarEventoJogador(jogador, 'increment')">+</button>
            </div>
          </div>
        </div>

        <div v-else class="coluna coluna-evento estado-vazio-modal">
          <p>Nao ha jogadores cadastrados para este time.</p>
        </div>
      </div>
    </div>

    <!-- Modal substituicao -->
        <div v-if="substituicaoModal" class="modal-overlay" @click.self="fecharModalSubstituicao">
      <div class="modal-content modal-substituicao" :class="modalStatusClass">
        <div class="modal-header">
          <div class="modal-header-copy">
            <h2 class="titulo-substituicao">Substituicao de jogadores</h2>
            <p class="modal-subtitulo">Escolha quem sai, quem entra e confirme as trocas pendentes.</p>
          </div>
          <button type="button" class="btn-close-x" @click="fecharModalSubstituicao">x</button>
        </div>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else class="colunas">
          <div class="coluna">
            <h3 class="subtitulo">Jogador que sai</h3>
            <div v-for="j in jogadoresEmCampo" :key="j.id" class="jogador-card"
              :class="{ selecionado: jogadorSai?.id === j.id }" @click="toggleJogadorSai(j)">
              <div class="jogador-info">
                <img v-if="j.foto" :src="j.foto" class="foto-jogador" />
                <span class="nome">{{ j.nome }}</span>
              </div>
            </div>
          </div>

          <div class="coluna">
            <h3 class="subtitulo">Jogador que entra</h3>
            <div v-for="j in jogadoresBanco" :key="j.id" class="jogador-card"
              :class="{ selecionado: jogadorEntra?.id === j.id }" @click="toggleJogadorEntra(j)">
              <div class="jogador-info">
                <img v-if="j.foto" :src="j.foto" class="foto-jogador" />
                <span class="nome">{{ j.nome }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="substituicoesPendentes.length" class="coluna coluna-substituicoes">
          <h3 class="subtitulo">Substituicoes selecionadas</h3>

          <div v-for="(s, index) in substituicoesPendentes" :key="index" class="jogador-card substituicao-card">
            <div class="jogador-info">
              <span class="nome">{{ s.sai.nome }}</span>
            </div>
            <span class="seta">-></span>
            <div class="jogador-info">
              <span class="nome">{{ s.entra.nome }}</span>
            </div>
          </div>
        </div>

        <div class="botoes">
          <button class="btn-save1" @click="adicionarSubstituicao">
            Adicionar substituicao
          </button>

          <button class="btn-save1" v-if="substituicoesPendentes.length > 0" @click="confirmarTodasSubstituicoes">
            Confirmar {{ substituicoesPendentes.length }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal remover -->
        <div v-if="modalRemoverAberto" class="modal-overlay" @click.self="fecharModalRemover">
      <div class="modal-content modal-remover" :class="modalStatusClass">
        <div class="modal-header">
          <div class="modal-header-copy">
            <h2 class="modal-titulo">Remover jogadores de campo</h2>
            <p class="modal-subtitulo">Selecione os jogadores que devem sair da partida.</p>
          </div>
          <button type="button" class="btn-close-x" @click="fecharModalRemover">x</button>
        </div>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else class="lista-remover">
          <div v-for="j in jogadoresEmCampo" :key="j.id" class="jogador-card"
            :class="{ selecionado: jogadoresSelecionados.includes(j.id) }" @click="toggleSelecionado(j.id)">
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
    lado: { type: String, required: true },
    partidaEncerradaGlobal: { type: Boolean, default: false },
    partidaStatus: { type: String, default: '' }
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
      if (this.tipoEvento === 'amarelo') return 'Cartao Amarelo'
      if (this.tipoEvento === 'vermelho') return 'Cartao Vermelho'
      return ''
    },

    partidaIdNum() {
      const n = Number(this.partidaId)
      return Number.isFinite(n) ? n : null
    },

    partidaEmAndamentoGlobal() {
      return this.partidaStatus === 'EM_ANDAMENTO'
    },

    modalStatusClass() {
      return {
        'modal-finalizada': this.partidaEncerradaGlobal,
        'modal-andamento': this.partidaEmAndamentoGlobal
      }
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
          Swal.fire('Expulsao!', 'Jogador expulso automaticamente.', 'warning')
        }

        await this.carregarJogadores()
        this.$emit('refresh')
      } catch (error) {
        Swal.fire('Erro', error.response?.data?.message || 'Erro ao salvar atuacao', 'error')
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
      if (this.partidaEncerradaGlobal) {
        Swal.fire('Partida encerrada', 'Nao e possivel editar substituicoes.', 'info')
        return
      }
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
        Swal.fire('Erro', 'Erro ao carregar jogadores da substituicao', 'error')
      } finally {
        this.carregando = false
      }
    },

    adicionarSubstituicao() {
      if (this.partidaEncerradaGlobal) return
      if (!this.jogadorSai || !this.jogadorEntra) return
      this.substituicoesPendentes.push({ sai: this.jogadorSai, entra: this.jogadorEntra })
      this.jogadorSai = null
      this.jogadorEntra = null
    },

    async confirmarTodasSubstituicoes() {
      if (!this.partidaIdNum) return
      if (this.partidaEncerradaGlobal) {
        Swal.fire('Partida encerrada', 'Nao e possivel editar substituicoes.', 'info')
        return
      }

      try {
        for (const sub of this.substituicoesPendentes) {
          await api.put(`/partidas/${this.partidaIdNum}/substituir`, {
            jogadorSaiId: sub.sai.id,
            jogadorEntraId: sub.entra.id
          })
        }

        this.emitDelta('substituicoes', this.substituicoesPendentes.length)

        Swal.fire('Sucesso', `${this.substituicoesPendentes.length} substituicao(oes) realizadas`, 'success')
        this.fecharModalSubstituicao()
        this.$emit('refresh')
      } catch {
        Swal.fire('Erro', 'Erro ao realizar substituicoes', 'error')
      }
    },

    async abrirModalRemoverJogador() {
      if (!this.partidaIdNum) return
      if (this.partidaEncerradaGlobal) {
        Swal.fire('Partida encerrada', 'Nao e possivel editar substituicoes.', 'info')
        return
      }
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
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --accent-soft: rgba(37, 99, 235, 0.1);
  --accent-border: rgba(59, 130, 246, 0.22);
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 19px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 23px;
  box-shadow: 0 13px 24px rgba(15, 23, 42, 0.065);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  position: relative;
}
.placar::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  border-radius: 23px 23px 0 0;
  background: linear-gradient(90deg, var(--accent), var(--accent-strong));
}
.placar.placar-finalizada {
  --accent: #dc2626;
  --accent-strong: #b91c1c;
  --accent-soft: rgba(220, 38, 38, 0.1);
  --accent-border: rgba(220, 38, 38, 0.22);
}
.placar.placar-andamento {
  --accent: #16a34a;
  --accent-strong: #15803d;
  --accent-soft: rgba(34, 197, 94, 0.1);
  --accent-border: rgba(34, 197, 94, 0.22);
}
.nome-time {
  margin: 0;
  grid-column: 1 / -1;
  padding: 12px 15px;
  border-radius: 17px;
  border: 1px solid var(--accent-border);
  background: linear-gradient(180deg, var(--accent-soft), rgba(255, 255, 255, 0.98));
  color: #0f172a;
  font-weight: 800;
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 9px;
  text-align: left;
  letter-spacing: -0.03em;
  overflow: hidden;
}
.nome-time span {
  min-width: 0;
}
.foto-time {
  display: block;
  width: 46px;
  min-width: 46px;
  max-width: 46px;
  height: 46px;
  min-height: 46px;
  max-height: 46px;
  object-fit: contain;
  border-radius: 50%;
  background-color: #f1f5f9;
  border: 1px solid rgba(148, 163, 184, 0.24);
  flex: 0 0 auto;
}
.placar > .box:first-of-type,
.placar > .row-2 > .box {
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 17px;
}
.placar > .box:first-of-type {
  grid-column: 1 / -1;
  padding: 15px;
  border-color: var(--accent-border);
  background: linear-gradient(180deg, var(--accent-soft), rgba(255, 255, 255, 0.98));
}
.placar > .row-2 > .box {
  padding: 13px;
}
.placar > .box:first-of-type > p,
.placar > .row-2 > .box > p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}
.placar > .box:first-of-type > p {
  color: var(--accent);
}
.placar > .box:first-of-type .controls,
.placar > .row-2 > .box .controls {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 9px;
  margin-top: 12px;
}
.placar > .box:first-of-type .controls {
  margin-top: 12px;
}
.placar > .box:first-of-type .controls .valor,
.placar > .row-2 > .box .controls .valor {
  display: block;
  color: #0f172a;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
}
.placar > .box:first-of-type .controls .valor {
  font-size: 36px;
  color: var(--accent-strong);
}
.placar > .row-2 > .box .controls .valor {
  font-size: 23px;
}
.placar > .box:first-of-type .controls button,
.placar > .row-2 > .box .controls button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1px solid var(--accent-border);
  border-radius: 13px;
  background: #eff6ff;
  color: var(--accent);
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}
.placar > .box:first-of-type .controls button:last-child,
.placar > .row-2 > .box .controls button:last-child {
  border-color: transparent;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #fff;
  box-shadow: 0 7px 13px rgba(15, 23, 42, 0.09);
}
.placar > .box:first-of-type .controls button:hover:not(:disabled),
.placar > .row-2 > .box .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
}
.placar > .box:first-of-type .controls button:disabled,
.placar > .row-2 > .box .controls button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
.row-2 {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}
.row-2 .box {
  height: 100%;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.56);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.modal-content {
  --modal-accent: #2563eb;
  --modal-accent-strong: #1d4ed8;
  --modal-accent-soft: rgba(37, 99, 235, 0.1);
  width: min(960px, 100%);
  max-height: min(88vh, 920px);
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
}

.modal-content.modal-evento {
  width: min(760px, 100%);
}

.modal-content.modal-remover {
  width: min(820px, 100%);
}

.modal-content.modal-finalizada {
  --modal-accent: #dc2626;
  --modal-accent-strong: #b91c1c;
  --modal-accent-soft: rgba(220, 38, 38, 0.1);
}

.modal-content.modal-andamento {
  --modal-accent: #16a34a;
  --modal-accent-strong: #15803d;
  --modal-accent-soft: rgba(34, 197, 94, 0.1);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.modal-header-copy {
  min-width: 0;
}

.modal-titulo,
.titulo-substituicao {
  margin: 0;
  color: #0f172a;
  font-size: 30px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.modal-titulo.modal-titulo-finalizada,
.modal-content.modal-finalizada .titulo-substituicao {
  color: #b91c1c;
}

.modal-titulo.modal-titulo-andamento,
.modal-content.modal-andamento .titulo-substituicao {
  color: #15803d;
}

.modal-subtitulo {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.55;
}

.btn-close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 999px;
  background: #fff;
  color: #334155;
  font-size: 21px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
  transition: transform 0.15s ease, border-color 0.18s ease, color 0.18s ease, background-color 0.18s ease;
}

.btn-close-x:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.28);
  color: #2563eb;
  background: #f8fbff;
}

.coluna,
.lista-remover {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 15px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: linear-gradient(180deg, var(--modal-accent-soft), rgba(255, 255, 255, 0.98));
}

.coluna-evento {
  max-height: 56vh;
}

.estado-vazio-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  text-align: center;
}

.estado-vazio-modal p {
  margin: 0;
  max-width: 280px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.55;
}

.coluna::-webkit-scrollbar,
.lista-remover::-webkit-scrollbar,
.coluna-substituicoes::-webkit-scrollbar {
  width: 6px;
}

.coluna::-webkit-scrollbar-thumb,
.lista-remover::-webkit-scrollbar-thumb,
.coluna-substituicoes::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.subtitulo {
  margin: 0 0 12px;
  color: var(--modal-accent-strong);
  font-size: 16px;
  text-align: left;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.jogador-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
  transition: transform 0.15s ease, border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.jogador-card:hover {
  transform: translateY(-1px);
  border-color: rgba(59, 130, 246, 0.24);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.08);
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.dados-jogador {
  min-width: 0;
}

.foto-jogador {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
  flex: 0 0 auto;
}

.nome {
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}

.jogador-card .controls {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 10px;
  margin-top: 0;
}

.jogador-card .controls .valor {
  display: block;
  min-width: 22px;
  text-align: center;
  color: #0f172a;
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
}

.jogador-card .controls button {
  width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  background: #eff6ff;
  color: var(--modal-accent);
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.jogador-card .controls button:last-child {
  border-color: transparent;
  background: linear-gradient(135deg, var(--modal-accent), var(--modal-accent-strong));
  color: #fff;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.1);
}

.jogador-card .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.jogador-card .controls button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.botoes {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: auto;
}

.btn-save1 {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 17px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--modal-accent), var(--modal-accent-strong));
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.12);
  transition: transform 0.15s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.btn-save1:hover {
  transform: translateY(-1px);
}

.loader {
  text-align: center;
  padding: 24px;
  color: #64748b;
}

.selecionado {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.12), rgba(255, 255, 255, 0.98));
  border-color: rgba(37, 99, 235, 0.38);
  box-shadow: 0 14px 24px rgba(59, 130, 246, 0.12);
}

.colunas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.coluna-substituicoes {
  margin-top: 0;
  max-height: 180px;
}

.substituicao-card {
  justify-content: space-between;
  align-items: center;
}

.substituicao-card .nome {
  font-size: 14px;
  font-weight: 700;
}

.seta {
  font-size: 18px;
  font-weight: 800;
  color: var(--modal-accent);
}

.modal-remover {
  max-height: min(82vh, 760px);
}

.lista-remover {
  margin: 0;
}

@media (max-width: 768px) {
  .placar {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 16px 14px;
    border-radius: 20px;
  }

  .modal-overlay {
    align-items: stretch;
    justify-content: stretch;
    padding: 0;
  }

  .modal-content {
    width: 100vw;
    max-width: 100vw;
    max-height: 100dvh;
    border-radius: 0;
    padding: 16px 12px calc(12px + env(safe-area-inset-bottom));
    gap: 14px;
  }

  .modal-content.modal-evento {
    width: calc(100vw - 20px);
    max-width: 720px;
    max-height: calc(100dvh - 20px);
    border-radius: 18px;
    margin: 10px auto;
    align-self: flex-start;
  }

  .modal-remover {
    width: 100vw;
    max-height: 100dvh;
  }

  .modal-header {
    gap: 12px;
  }

  .modal-titulo,
  .titulo-substituicao {
    font-size: 23px;
  }

  .modal-subtitulo {
    font-size: 13px;
    line-height: 1.45;
  }

  .btn-close-x {
    width: 34px;
    height: 34px;
    font-size: 18px;
  }

  .nome-time {
    font-size: 23px;
    padding: 15px;
    gap: 10px;
  }

  .foto-time {
    width: 46px;
    min-width: 46px;
    max-width: 46px;
    height: 46px;
    min-height: 46px;
    max-height: 46px;
  }

  .colunas {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .coluna,
  .lista-remover,
  .coluna-substituicoes {
    padding: 13px;
    border-radius: 17px;
  }

  .coluna-evento {
    max-height: calc(100dvh - 210px);
  }

  .estado-vazio-modal {
    min-height: 180px;
  }

  .estado-vazio-modal p {
    font-size: 13px;
    line-height: 1.45;
  }

  .jogador-card {
    padding: 10px 12px;
    border-radius: 17px;
  }

  .foto-jogador {
    width: 40px;
  height: 40px;
  padding: 0;
  display: grid;
  place-items: center;
  }

  .jogador-card .controls {
    grid-template-columns: 34px minmax(0, 1fr) 34px;
    gap: 9px;
  }

  .jogador-card .controls .valor {
    font-size: 18px;
  }

  .jogador-card .controls button {
    width: 34px;
    height: 34px;
    border-radius: 13px;
    font-size: 18px;
  }

  .botoes {
    flex-direction: column;
    margin-top: 4px;
  }

  .btn-save1 {
    width: 100%;
    min-height: 46px;
    font-size: 14px;
  }

  .lista-remover {
    min-height: 0;
  }
}
</style>










