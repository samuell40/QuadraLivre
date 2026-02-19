<template>
  <div class="placar">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>

    <div class="box">
      <p>Sets Vencidos</p>
      <div class="controls">
        <button @click="decrement('setsVencidos')" :disabled="partidaEncerradaGlobal || !podeDiminuirSets">
          −
        </button>

        <span class="valor">{{ localTime.setsVencidos }}</span>

        <button @click="increment('setsVencidos')" :disabled="partidaEncerradaGlobal || !podeAumentarSets">
          +
        </button>
      </div>
    </div>

    <div class="box">
      <p>Pontos do Set</p>
      <div class="controls">
        <button @click="decrement('pontosSet')" :disabled="partidaEncerradaGlobal || !podeDiminuirPontos">
          −
        </button>

        <span class="valor">{{ localTime.pontosSet }}</span>

        <button @click="increment('pontosSet')" :disabled="partidaEncerradaGlobal || !podeAumentarPontos">
          +
        </button>
      </div>
    </div>

    <div class="box">
      <p>W.O</p>
      <div class="controls">
        <button @click="decrement('wo')" :disabled="partidaEncerradaGlobal || localTime.wo <= 0 || woAdversario === 1">
          −
        </button>

        <span class="valor">{{ localTime.wo }}</span>

        <button @click="increment('wo')" :disabled="partidaEncerradaGlobal || localTime.wo >= 1">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlacarTimeVolei',

  props: {
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true },
    lado: { type: String, required: true }, // 'A' | 'B'
    podeEditar: { type: Boolean, default: true },
    setsAdversario: { type: Number, default: 0 },
    woAdversario: { type: Number, default: 0 },
    partidaEncerradaGlobal: { type: Boolean, default: false }
  },

  data() {
    return {
      localTime: {
        setsVencidos: this.timeData?.setsVencidos ?? 0,
        pontosSet: this.timeData?.pontosSet ?? 0,
        wo: this.timeData?.wo ? 1 : 0
      }
    }
  },

  computed: {
    podeDiminuirSets() {
      return this.localTime.setsVencidos > 0
    },

    podeAumentarSets() {
      return (
        this.localTime.setsVencidos < 3 &&
        this.setsAdversario < 3 &&
        this.localTime.wo === 0 &&
        this.woAdversario === 0
      )
    },

    podeDiminuirPontos() {
      return this.localTime.pontosSet > 0
    },

    podeAumentarPontos() {
      return (
        this.localTime.setsVencidos < 3 &&
        this.setsAdversario < 3 &&
        this.localTime.wo === 0 &&
        this.woAdversario === 0
      )
    }
  },

  watch: {
    timeData: {
      handler(n) {
        this.localTime.setsVencidos = n?.setsVencidos ?? 0
        this.localTime.pontosSet = n?.pontosSet ?? 0
        this.localTime.wo = n?.wo ? 1 : 0
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    emitDelta(campo, delta) {
      this.$emit('parcial-delta', { lado: this.lado, campo, delta })
    },

    increment(campo) {
      if (this.partidaEncerradaGlobal) return

      if (campo === 'setsVencidos') {
        if (!this.podeAumentarSets) return
        this.localTime.setsVencidos++
        this.emitDelta('setsVencidos', +1)
        return
      }

      if (campo === 'pontosSet') {
        if (!this.podeAumentarPontos) return
        this.localTime.pontosSet++
        this.emitDelta('pontosSet', +1)
        return
      }

      if (campo === 'wo') {
        if (this.localTime.wo >= 1) return
        this.localTime.wo = 1
        this.emitDelta('wo', +1)
      }
    },

    decrement(campo) {
      if (this.partidaEncerradaGlobal) return
      if (this.woAdversario === 1) return

      if (campo === 'setsVencidos') {
        if (!this.podeDiminuirSets) return
        this.localTime.setsVencidos--
        this.emitDelta('setsVencidos', -1)
        return
      }

      if (campo === 'pontosSet') {
        if (!this.podeDiminuirPontos) return
        this.localTime.pontosSet--
        this.emitDelta('pontosSet', -1)
        return
      }

      if (campo === 'wo') {
        if (this.localTime.wo <= 0) return
        this.localTime.wo = 0
        this.emitDelta('wo', -1)
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