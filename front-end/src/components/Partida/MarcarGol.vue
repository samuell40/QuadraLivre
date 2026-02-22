<template>
  <div v-if="aberto" class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <h2>Selecione o jogador</h2>

      <div v-if="carregando" class="loader">Carregando...</div>

      <div v-else>
        <ul class="lista-jogadores">
          <li
            v-for="jogador in jogadores"
            :key="jogador.id"
            @click="selecionarJogador(jogador)"
            class="jogador-item"
          >
            {{ jogador.nome }}
          </li>
        </ul>
      </div>

      <button class="botao-fechar" @click="$emit('fechar')">Cancelar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SelecionarJogadorGol",
  props: {
    aberto: Boolean,
    jogadores: Array,
    timeId: Number,
    partidaId: Number,
    acao: String, 
  },
  data() {
    return { carregando: false };
  },
  methods: {
    async selecionarJogador(jogador) {
      try {
        this.carregando = true;

        if (this.acao === "adicionar") {
          await this.$emit("adicionar-gol", jogador);
        } else {
          await this.$emit("remover-gol", jogador);
        }

        this.$emit("fechar");
      } catch (err) {
        console.error("Erro ao registrar gol:", err);
      } finally {
        this.carregando = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  z-index: 1200;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: min(420px, calc(100vw - 32px));
  max-height: min(80vh, 720px);
  overflow-y: auto;
  text-align: center;
}

.lista-jogadores {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.jogador-item {
  padding: 12px;
  margin: 6px 0;
  border-radius: 8px;
  background: #f3f3f3;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 16px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jogador-item:hover {
  background: #dbeafe;
}

.botao-fechar {
  background: #ef4444;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  min-height: 40px;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    width: 100vw;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }

  .modal-content h2 {
    font-size: 20px;
    margin: 0 0 8px;
  }

  .lista-jogadores {
    margin: 14px 0;
    flex: 1;
    overflow-y: auto;
  }

  .jogador-item {
    font-size: 15px;
    border-radius: 10px;
  }

  .botao-fechar {
    width: 100%;
    margin-top: auto;
    margin-bottom: 0;
    border-radius: 12px;
    min-height: 46px;
  }
}

@media (max-width: 420px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-content {
    padding: 14px 12px calc(14px + env(safe-area-inset-bottom));
  }

  .modal-content h2 {
    font-size: 18px;
  }

  .jogador-item {
    font-size: 14px;
    padding: 11px;
  }
}
</style>
