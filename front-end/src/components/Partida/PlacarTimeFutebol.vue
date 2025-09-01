<template>
  <div class="placar">
    <h2>{{ timeNome }}</h2>

    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="decrement('golspro')">−</button>
        <span>{{ localTime.golspro }}</span>
        <button @click="increment('golspro')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Amarelo</p>
      <div class="controls">
        <button @click="decrement('cartaoamarelo')">−</button>
        <span>{{ localTime.cartaoamarelo }}</span>
        <button @click="increment('cartaoamarelo')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Cartão Vermelho</p>
      <div class="controls">
        <button @click="decrement('cartaovermelho')">−</button>
        <span>{{ localTime.cartaovermelho }}</span>
        <button @click="increment('cartaovermelho')">+</button>
      </div>
    </div>

    <div class="box">
      <p>Faltas</p>
      <div class="controls">
        <button @click="decrement('faltas')">−</button>
        <span>{{ localTime.faltas }}</span>
        <button @click="increment('faltas')">+</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'PlacarTime',
  props: {
    timeNome: { type: String, default: 'Time' },
    timeData: { type: Object, required: true },
    partidaId: { type: [String, Number], required: true } 
  },
  data() {
    return {
      localTime: {
        golspro: 0,
        cartaoamarelo: 0,
        cartaovermelho: 0,
        faltas: 0,
        ...this.timeData
      }
    }
  },
  watch: {
    timeData: {
      handler(newVal) {
        this.localTime = {
          golspro: 0,
          cartaoamarelo: 0,
          cartaovermelho: 0,
          faltas: 0,
          ...newVal
        }
      },
      deep: true
    }
  },
  methods: {
    async increment(campo) {
      this.localTime[campo]++
      this.$emit('update', { ...this.localTime })

      if (this.partidaId) {
        try {
          const pontosA = this.$parent.time1.golspro || 0
          const pontosB = this.$parent.time2.golspro || 0

          await api.put(`/partida/${this.partidaId}`, {
            pontosTimeA: pontosA,
            pontosTimeB: pontosB,
            tempoSegundos: this.$parent.tempoSegundos
          })
        } catch (e) {
          console.error("Erro ao atualizar no backend:", e)
        }
      }
    },

    async decrement(campo) {
      if (this.localTime[campo] > 0) {
        this.localTime[campo]--
        this.$emit('update', { ...this.localTime })

        if (this.partidaId) {
          try {
            const pontosA = this.$parent.time1.golspro || 0
            const pontosB = this.$parent.time2.golspro || 0

            await api.put(`/partida/${this.partidaId}`, {
              pontosTimeA: pontosA,
              pontosTimeB: pontosB,
              tempoSegundos: this.$parent.tempoSegundos
            })
          } catch (e) {
            console.error("Erro ao atualizar no backend:", e)
          }
        }
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