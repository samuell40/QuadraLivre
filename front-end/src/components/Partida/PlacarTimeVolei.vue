<template>
  <div class="placar">
    <h2>{{ timeNome }}</h2>

    <div class="box">
      <p>Sets Vencidos</p>
      <div class="controls">
        <button @click="decrement('setsVencidos')" :disabled="!temporizadorAtivo || localTime.wo === 1">−</button>

        <span>{{ localTime.setsVencidos }}</span>

        <button @click="increment('setsVencidos')"
          :disabled="!temporizadorAtivo || localTime.setsVencidos >= 3 || setsAdversario >= 3 || localTime.wo === 1">+</button>
      </div>
    </div>

    <div class="box">
      <p>W.O</p>
      <div class="controls">
        <button @click="decrement('wo')" :disabled="!temporizadorAtivo || localTime.wo <= 0">−</button>

        <span>{{ localTime.wo }}</span>

        <button @click="increment('wo')" :disabled="!temporizadorAtivo || localTime.wo >= 1">+</button>
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
  flex: none;
  width: 580px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 15px;
  margin: 0 auto;
}

.placar h2 {
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  margin: -30px -30px 20px -30px;
  border-radius: 8px 8px 0 0;
  color: #3b82f6;
  font-size: 20px;
  font-weight: bold;
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

.controls button:hover {
  opacity: 0.85;
}

.controls button:last-child {
  background-color: #3b82f6;
}

.btn-remove {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: auto;
}

@media (max-width: 768px) {
  .placar {
    width: 100%;
    padding: 20px;
  }

  .placar h2 {
    font-size: 18px;
    padding: 8px;
  }

  .controls {
    flex-direction: row;
    justify-content: center;
    gap: 20px;
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