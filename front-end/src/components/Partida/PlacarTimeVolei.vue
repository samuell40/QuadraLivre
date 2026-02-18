<template>
  <div class="placar">
    <h2 class="nome-time">
      <img v-if="timeData?.foto" :src="timeData.foto" alt="Escudo do time" class="foto-time" />
      <span>{{ timeNome }}</span>
    </h2>

    <!-- SETS -->
    <div class="box">
      <p>Sets Vencidos</p>
      <div class="controls">
        <button @click="decrement('setsVencidos')" :disabled="!podeDiminuirSets || partidaEncerradaGlobal">
          −
        </button>

        <span class="valor">{{ localTime.setsVencidos }}</span>

        <button @click="increment('setsVencidos')" :disabled="partidaEncerradaGlobal">
          +
        </button>
      </div>
    </div>

    <!-- PONTOS -->
    <div class="box">
      <p>Pontos do Set</p>
      <div class="controls">
        <button @click="decrement('pontosSet')" :disabled="partidaEncerradaGlobal || !podeDiminuirPontos">
          −
        </button>

        <span class="valor">{{ localTime.pontosSet }}</span>

        <button @click="increment('pontosSet')" :disabled="partidaEncerradaGlobal">
          +
        </button>
      </div>
    </div>

    <!-- WO -->
    <div class="box">
      <p>W.O</p>
      <div class="controls">
        <button @click="decrement('wo')" :disabled="localTime.wo <= 0 || partidaEncerradaGlobal">
          −
        </button>

        <span class="valor">{{ localTime.wo }}</span>

        <button @click="increment('wo')" :disabled="localTime.wo >= 1 || partidaEncerradaGlobal">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'PlacarTimeVolei',

  props: {
    timeKey: { type: String, required: true },
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true },
    setsAdversario: { type: Number, default: 0 },
    woAdversario: { type: Number, default: 0 },
    partidaEncerradaGlobal: { type: Boolean, default: false }
  },

  data() {
    return {
      localTime: {
        setsVencidos: this.timeData.setsVencidos || 0,
        pontosSet: this.timeData.pontosSet || 0,
        wo: this.timeData.wo ? 1 : 0,
        setsJogados: Array.isArray(this.timeData.setsJogados)
          ? [...this.timeData.setsJogados]
          : []
      }
    }
  },

  computed: {
    podeDiminuirSets() {
      if (this.localTime.setsVencidos < 3 && this.setsAdversario < 3) return true
      return this.localTime.setsVencidos === 3
    },

    limitePontosSet() {
      const totalSets = this.localTime.setsVencidos + this.setsAdversario
      return totalSets === 4 ? 15 : 25
    },

    podeDiminuirPontos() {
      return this.localTime.pontosSet > 0
    }
  },

  watch: {
    timeData: {
      handler(newVal) {
        this.localTime.setsVencidos = newVal.setsVencidos || 0
        this.localTime.pontosSet = newVal.pontosSet || 0
        this.localTime.wo = newVal.wo ? 1 : 0
        this.localTime.setsJogados = Array.isArray(newVal.setsJogados)
          ? [...newVal.setsJogados]
          : []
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    verificarFechamentoSet() {
      if (
        this.localTime.pontosSet >= this.limitePontosSet &&
        this.localTime.setsVencidos < 3 &&
        this.localTime.wo === 0
      ) {
        const numeroSet = this.localTime.setsVencidos + 1

        this.localTime.setsJogados.push({
          numero: numeroSet,
          pontos: this.localTime.pontosSet,
          time: this.timeKey
        })

        this.localTime.setsVencidos++
        this.localTime.pontosSet = 0
      }
    },

    increment(campo) {
      if (this.partidaEncerradaGlobal) return

      // 🏐 SE O ADVERSÁRIO DEU WO, ESTE TIME GANHA 3 SETS AUTOMATICAMENTE
      if (this.woAdversario === 1 && this.localTime.wo === 0) {
        this.localTime.setsVencidos = 3
        this.localTime.pontosSet = 0
        this.localTime.setsJogados = []
        this.emitUpdate()
        return
      }

      if (campo === 'setsVencidos') {
        if (
          this.localTime.wo === 0 &&
          this.woAdversario === 0 &&
          this.localTime.setsVencidos < 3 &&
          this.setsAdversario < 3
        ) {
          this.localTime.setsVencidos++
        }
      } else if (campo === 'pontosSet') {
        if (
          this.localTime.setsVencidos < 3 &&
          this.setsAdversario < 3 &&
          this.localTime.wo === 0 &&
          this.woAdversario === 0
        ) {
          this.localTime.pontosSet++
          this.verificarFechamentoSet()
        }
      } else if (campo === 'wo') {
        if (this.localTime.wo < 1) {
          this.localTime.wo = 1
          this.localTime.setsVencidos = 0
          this.localTime.pontosSet = 0
          this.localTime.setsJogados = []

          this.emitUpdate()
          this.$emit('wo')
          return
        }
      } else {
        this.localTime[campo]++
      }

      this.emitUpdate()
    },

    decrement(campo) {
      if (this.partidaEncerradaGlobal) return
      if (this.woAdversario === 1) return

      if (campo === 'setsVencidos' && !this.podeDiminuirSets) return
      if (campo === 'pontosSet' && !this.podeDiminuirPontos) return

      if (this.localTime[campo] > 0) {
        this.localTime[campo]--

        if (campo === 'wo' && this.localTime.wo === 0) {
          this.localTime.setsVencidos = 0
          this.localTime.pontosSet = 0
          this.localTime.setsJogados = []

          this.emitUpdate()
          this.$emit('wo-removido')
          return
        }
      }

      this.emitUpdate()
    },

    emitUpdate() {
      this.$emit('update', {
        setsVencidos: this.localTime.setsVencidos,
        pontosSet: this.localTime.pontosSet,
        wo: this.localTime.wo,
        setsJogados: this.localTime.setsJogados
      })
    },

    async salvarPlacar() {
      if (!this.partidaId) return

      try {
        await api.put(`/partida/${this.partidaId}`, {
          pontosTimeA: this.localTime.setsVencidos || 0,
          pontosTimeB: this.$parent.time2?.setsVencidos || 0,
          tempoSegundos: this.$parent.tempoSegundos || 0,
          woTimeA: this.localTime.wo === 1,
          woTimeB: this.$parent.time2?.wo === 1
        })
      } catch (e) {
        console.error('Erro ao atualizar no backend:', e)
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