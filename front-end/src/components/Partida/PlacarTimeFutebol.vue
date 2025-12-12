<template>
  <div class="placar">
    <h2>{{ timeNome }}</h2>

    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="abrirModalJogadores('decrement')" :disabled="!temporizadorAtivo">−</button>
        <span>{{ localTime.golspro }}</span>
        <button @click="abrirModalJogadores('increment')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Amarelo</p>
      <div class="controls">
        <button @click="decrement('cartaoamarelo')" :disabled="!temporizadorAtivo">−</button>
        <span>{{ localTime.cartaoamarelo }}</span>
        <button @click="increment('cartaoamarelo')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Vermelho</p>
      <div class="controls">
        <button @click="decrement('cartaovermelho')" :disabled="!temporizadorAtivo">−</button>
        <span>{{ localTime.cartaovermelho }}</span>
        <button @click="increment('cartaovermelho')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Faltas</p>
      <div class="controls">
        <button @click="decrement('faltas')" :disabled="!temporizadorAtivo">−</button>
        <span>{{ localTime.faltas }}</span>
        <button @click="increment('faltas')" :disabled="!temporizadorAtivo">+</button>
      </div>
    </div>

    <div class="box">
      <p>Substituições</p>
      <div class="controls">
        <button @click="decrement('substituicoes')"
          :disabled="!temporizadorAtivo || localTime.substituicoes <= 0">−</button>
        <span>{{ localTime.substituicoes }}</span>
        <button @click="increment('substituicoes')"
          :disabled="!temporizadorAtivo || localTime.substituicoes >= 3">+</button>
      </div>
    </div>

    <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
      <div class="modal-content">
        <h2> Selecione o jogador</h2>

        <div v-if="carregando" class="loader">Carregando jogadores...</div>

        <div v-else>
          <div v-for="jogador in jogadores" :key="jogador.id" class="jogador-item">
            <div class="jogador-info">
              <img v-if="jogador.foto" :src="jogador.foto" class="foto-jogador" alt="foto" />
              <span>{{ jogador.nome }}</span>
            </div>
            <div class="controls">
              <button @click="alterarGolJogador(jogador, 'decrement')">−</button>
              <span>{{ jogador.gols || 0 }}</span>
              <button @click="alterarGolJogador(jogador, 'increment')">+</button>
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
import Swal from 'sweetalert2';

export default {
  name: 'PlacarTime',
  props: {
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true },
    temporizadorAtivo: { type: Boolean, default: false }
  },
  data() {
    return {
      localTime: {
        golspro: this.timeData?.golspro || 0,
        cartaoamarelo: this.timeData?.cartaoamarelo || 0,
        cartaovermelho: this.timeData?.cartaovermelho || 0,
        faltas: this.timeData?.faltas || 0,
        substituicoes: this.timeData?.substituicoes || 0
      },
      modalAberto: false,
      acaoModal: null,
      jogadores: [],
      carregando: false
    }
  },
  methods: {
    async abrirModalJogadores(acao) {
      this.acaoModal = acao;
      this.modalAberto = true;
      await this.carregarJogadores();
    },

    fecharModal() {
      this.modalAberto = false;
    },

    async carregarJogadores() {
      this.carregando = true;
      try {
        const timeId = this.timeData?.id;

        if (!timeId || !this.partidaId) {
          this.jogadores = [];
          return;
        }

        const res = await api.get(`/partida/${this.partidaId}/time/${timeId}/jogadores`);

        this.jogadores = res.data.map(j => ({
          ...j,
          gols: j.gols || 0,
          cartoesAmarelos: j.cartoesAmarelos || 0,
          cartoesVermelhos: j.cartoesVermelhos || 0
        }));

      } catch (err) {
        console.error("Erro ao carregar jogadores:", err);
        Swal.fire("Erro", "Não foi possível carregar os jogadores deste time.", "error");
      } finally {
        this.carregando = false;
      }
    },

    async alterarGolJogador(jogador, acao) {
      try {
        let gols = 0;

        if (acao === 'increment') {
          jogador.gols = (jogador.gols || 0) + 1;
          this.localTime.golspro++;
          gols = 1; // jogador marcou 1 gol
        } else if (acao === 'decrement' && jogador.gols > 0) {
          jogador.gols--;
          this.localTime.golspro = Math.max(0, this.localTime.golspro - 1);
          gols = -1; // remove 1 gol da contagem
        }

        this.emitUpdate();
        await this.salvarPlacar();
        await api.post('/atuacao', {
          jogadorId: jogador.id,
          partidaId: this.partidaId,
          gols: gols > 0 ? 1 : 0 // apenas incrementa no backend se for gol marcado
        });

      } catch (err) {
        console.error(err);
        Swal.fire("Erro", "Falha ao atualizar gols do jogador.", "error");
      }
    },

    increment(campo) {
      if (campo === 'golspro') {
        this.abrirModalJogadores('increment');
      } else {
        this.localTime[campo]++;
        this.emitUpdate();
        this.salvarPlacar();
      }
    },

    decrement(campo) {
      if (campo === 'golspro') {
        this.abrirModalJogadores('decrement');
      } else if (this.localTime[campo] > 0) {
        this.localTime[campo]--;
        this.emitUpdate();
        this.salvarPlacar();
      }
    },

    emitUpdate() {
      this.$emit('update', { ...this.localTime });
    },

    async salvarPlacar() {
      if (!this.partidaId) return;
      try {
        await api.put(`/partida/${this.partidaId}/parcial`, {
          golspro: this.localTime.golspro,
          cartaoamarelo: this.localTime.cartaoamarelo,
          cartaovermelho: this.localTime.cartaovermelho,
          faltas: this.localTime.faltas,
          substituicoes: this.localTime.substituicoes
        });
      } catch (e) {
        console.error("Erro ao atualizar no backend:", e);
        Swal.fire("Erro", "Não foi possível salvar o placar.", "error");
      }
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

.placar h2 {
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  color: #3b82f6;
  font-weight: bold;
  font-size: 20px;
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

/* ======== MODAL ======== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 10px;
  width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.jogador-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.jogador-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.foto-jogador {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  object-fit: cover;
}

.botoes {
  margin-top: 20px;
  text-align: center;
}

.btn-save1 {
  background: #3b82f6;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}
</style>