<template>
  <div class="placar">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>

    <div class="box">
      <p>Sets Vencidos</p>
      <div class="controls">
        <button @click="emitDelta('setsVencidos', -1)" :disabled="!podeDiminuirSets">
          −
        </button>

        <span class="valor">{{ timeData?.setsVencidos ?? 0 }}</span>

        <button @click="emitDelta('setsVencidos', +1)" :disabled="!podeAumentarSets">
          +
        </button>
      </div>
    </div>

    <div class="box">
      <p>Pontos do Tie-break</p>
      <div class="controls">
        <button @click="emitDelta('pontosTieBreak', -1)" :disabled="!podeDiminuirTieBreak">
          −
        </button>

        <span class="valor">{{ pontosTieBreakAtual }}</span>

        <button @click="emitDelta('pontosTieBreak', +1)" :disabled="!podeAumentarTieBreak">
          +
        </button>
      </div>
    </div>

    <div class="box">
      <p>W.O</p>
      <div class="controls">
        <button @click="emitDelta('wo', -1)" :disabled="!podeDiminuirWo">
          −
        </button>

        <span class="valor">{{ timeData?.wo ? 1 : 0 }}</span>

        <button @click="emitDelta('wo', +1)" :disabled="!podeAumentarWo">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlacarTimeBeachTenis',

  props: {
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true },
    lado: { type: String, required: true },
    podeEditar: { type: Boolean, default: true },
    setsAdversario: { type: Number, default: 0 },
    woAdversario: { type: Number, default: 0 },
    partidaEncerradaGlobal: { type: Boolean, default: false },
    maxSetsPartida: { type: Number, default: 5 },
    maxPontosSet: { type: Number, default: 25 },
  },

  computed: {
    setsVencidosAtual() {
      return Number(this.timeData?.setsVencidos ?? 0)
    },

    pontosTieBreakAtual() {
      return Number(this.timeData?.pontosTieBreak ?? 0)
    },

    woAtual() {
      return this.timeData?.wo ? 1 : 0
    },

    podeDiminuirSets() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.woAtual === 0 &&
        this.woAdversario === 0
      )
    },

    podeAumentarSets() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.woAtual === 0 &&
        this.woAdversario === 0 &&
        (this.setsVencidosAtual + this.setsAdversario) < this.maxSetsPartida
      )
    },

    podeDiminuirTieBreak() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.pontosTieBreakAtual > 0 &&
        this.woAtual === 0 &&
        this.woAdversario === 0
      )
    },

    podeAumentarTieBreak() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.woAtual === 0 &&
        this.woAdversario === 0
      )
    },

    podeAumentarWo() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.woAtual === 0 &&
        this.woAdversario === 0
      )
    },

    podeDiminuirWo() {
      return (
        this.podeEditar &&
        !this.partidaEncerradaGlobal &&
        this.woAtual === 1 &&
        this.woAdversario === 0
      )
    }
  },

  methods: {
    emitDelta(campo, delta) {
      if (!this.podeEditar) return
      if (this.partidaEncerradaGlobal) return
      this.$emit('parcial-delta', { lado: this.lado, campo, delta })
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

.foto-time {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 50%;
  background-color: #f1f5f9;
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
  color: #333;
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
  flex-shrink: 0;
}

.controls button:last-child {
  background-color: #3b82f6;
}

.controls button:hover {
  opacity: 0.85;
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

  .controls {
    flex-direction: column;
    gap: 8px;
  }

  .box .controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .controls span {
    font-size: 16px;
  }

  .controls button {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
</style>
