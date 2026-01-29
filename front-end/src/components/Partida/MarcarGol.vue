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
    acao: String, // 'adicionar' ou 'remover'
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
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  text-align: center;
}

.lista-jogadores {
  list-style: none;
  padding: 0;
  margin: 20px 0;
}

.jogador-item {
  padding: 10px;
  margin: 5px 0;
  border-radius: 8px;
  background: #f3f3f3;
  cursor: pointer;
  transition: background 0.2s;
}

.jogador-item:hover {
  background: #dbeafe;
}

.botao-fechar {
  background: #ef4444;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
</style>