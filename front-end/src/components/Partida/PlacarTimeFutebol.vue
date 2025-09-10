<template>
  <div class="placar">
    <h2>{{ timeNome }}</h2>

    <div class="box">
      <p>Gols Marcados</p>
      <div class="controls">
        <button @click="decrement('golspro')" :disabled="!temporizadorAtivo">−</button>
        <span>{{ localTime.golspro }}</span>
        <button @click="increment('golspro')" :disabled="!temporizadorAtivo">+</button>
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
        golspro: this.timeData.golspro || 0,
        cartaoamarelo: this.timeData.cartaoamarelo || 0,
        cartaovermelho: this.timeData.cartaovermelho || 0,
        faltas: this.timeData.faltas || 0,
        substituicoes: this.timeData.substituicoes || 0,
        nome: this.timeData.nome || '',
        foto: this.timeData.foto || '',
        ...this.timeData
      }
    }
  },
  watch: {
    timeData: {
      handler(newVal) {
        this.localTime = {
          golspro: newVal.golspro || 0,
          cartaoamarelo: newVal.cartaoamarelo || 0,
          cartaovermelho: newVal.cartaovermelho || 0,
          faltas: newVal.faltas || 0,
          substituicoes: newVal.substituicoes || 0,
          nome: newVal.nome || '',
          foto: newVal.foto || '',
          ...newVal
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    increment(campo) {
      if (campo === 'substituicoes' && this.localTime.substituicoes >= 3) return;

      this.localTime[campo]++;
      this.emitUpdate();
    },

    decrement(campo) {
      if (this.localTime[campo] > 0) {
        this.localTime[campo]--;
        this.emitUpdate();
      }
    },

    emitUpdate() {
      this.$emit('update', { ...this.localTime });
    },

    async salvarPlacar() {
      if (!this.partidaId) return;

      try {
        await api.put(`/partida/${this.partidaId}`, {
          pontosTimeA: this.localTime.golspro,
          pontosTimeB: this.localTime.golspro,
          tempoSegundos: this.$parent?.tempoSegundos,
          substituicoesTimeA: this.localTime.substituicoes,
          substituicoesTimeB: this.localTime.substituicoes,
          faltasTimeA: this.localTime.faltas,
          faltasTimeB: this.localTime.faltas,
          cartoesAmarelosTimeA: this.localTime.cartaoamarelo,
          cartoesAmarelosTimeB: this.localTime.cartaoamarelo,
          cartoesVermelhosTimeA: this.localTime.cartaovermelho,
          cartoesVermelhosTimeB: this.localTime.cartaovermelho
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