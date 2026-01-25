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
        <button @click="decrementSet" :disabled="!temporizadorAtivo || partidaEncerrada">
          −
        </button>

        <span class="valor">{{ localTime.setsVencidos }}</span>

        <button @click="incrementSet" :disabled="!temporizadorAtivo || partidaEncerrada">
          +
        </button>
      </div>
    </div>

    <!-- PONTOS -->
    <div class="box">
      <p>Pontos do Set</p>
      <div class="controls">
        <button @click="decrementPonto" :disabled="!temporizadorAtivo || partidaEncerrada">
          −
        </button>

        <span class="valor">{{ localTime.pontosSet }}</span>

        <button @click="incrementPonto" :disabled="!temporizadorAtivo || partidaEncerrada">
          +
        </button>
      </div>
    </div>

    <!-- WO -->
    <div class="box">
      <p>W.O</p>
      <div class="controls">
        <button @click="decrementWO" :disabled="!temporizadorAtivo || localTime.wo <= 0">
          −
        </button>

        <span class="valor">{{ localTime.wo }}</span>

        <button @click="incrementWO" :disabled="!temporizadorAtivo || localTime.wo >= 1 || partidaEncerrada">
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
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true },
    setsAdversario: { type: Number, default: 0 },
    temporizadorAtivo: { type: Boolean, default: false },
    woAdversario: { type: Number, default: 0 }
  },
  data() {
    const wo = this.timeData.wo !== undefined
      ? this.timeData.wo
      : 0

    return {
      localTime: {
        setsVencidos: this.timeData.setsVencidos || 0,
        wo,
        ...this.timeData
      }
    }
  },
  watch: {
    timeData: {
      handler(newVal) {
        const wo = newVal.wo !== undefined ? newVal.wo : 0
        this.localTime = {
          setsVencidos: newVal.setsVencidos || 0,
          wo,
          ...newVal
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    increment(campo) {
      if (campo === 'setsVencidos') {
        if (this.localTime.wo === 0 && this.woAdversario === 0 && this.localTime.setsVencidos < 3 && this.setsAdversario < 3) {
          this.localTime.setsVencidos++
        }
      } else if (campo === 'wo') {
        if (this.localTime.wo < 1) {
          this.localTime.wo = 1
          this.localTime.setsVencidos = 0
        }
      } else {
        this.localTime[campo]++
      }

      this.emitUpdate()
    },

    decrement(campo) {
      if (this.localTime[campo] > 0) {
        this.localTime[campo]--
        if (campo === 'wo' && this.localTime.wo === 0) this.localTime.setsVencidos = 0
      }

      this.emitUpdate()
    },

    emitUpdate() {
      this.$emit('update', { ...this.localTime })
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
        console.error("Erro ao atualizar no backend:", e)
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

/* TOPO COM NOME + FOTO DO TIME (IGUAL FUTEBOL) */
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

/* BOXES */
.box {
  background: #fafafa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
}

/* CONTROLES */
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

/* RESPONSIVO */
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