<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-conteudo modal-placar">
      <div class="header-placar">
        <h2 class="title_placar">Jogadores do {{ time?.nome }}</h2>
        <button class="btn-gerenciar" @click="$emit('gerenciar-jogadores')">
          Gerenciar Jogadores
        </button>
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div v-if="jogadores.length" class="placar-table">
          <table class="placar">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Função</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jogadores" :key="j.id">
                <td class="time-info">
                  <img :src="j.foto" alt="Foto" class="time-image time-image-click" @click.stop="gerenciarImagem(j)" />
                  {{ j.nome }}
                </td>
                <td>
                  <select v-model="j.funcaoId" @change="alterarFuncao(j.id, j.funcaoId)" class="select-funcao">
                    <option v-for="f in funcoes" :key="f.id" :value="f.id">
                      {{ f.nome }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="sem-dados-centralizado">
          Nenhum jogador encontrado para este time.
        </div>
      </div>

      <button class="btn-cancel-placar" @click="$emit('fechar')">Fechar</button>
    </div>
  </div>
  <input ref="inputTrocarImagem" type="file" accept=".jpg,.jpeg,.png" style="display: none"
    @change="handleTrocarImagem" />
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  props: {
    aberto: Boolean,
    time: Object,
    modalidadeSelecionada: String,
    modalidadesDisponiveis: Array
  },
  data() {
    return {
      jogadores: [],
      funcoes: [],
      isLoading: false,
      jogadorImagemAtual: null
    };
  },
  watch: {
    aberto(novo) {
      if (novo && this.time?.id) {
        console.log('Modal aberto, modalidade selecionada:', this.modalidadeSelecionada);
        this.carregarFuncoes();
        this.carregarJogadores(this.time.id);
      }
    },
    modalidadeSelecionada(novoValor) {
      console.log('modalidadeSelecionada mudou no filho:', novoValor);
      if (this.aberto) {
        this.carregarFuncoes();
      }
    }
  },
  computed: {
    modalidadeSelecionadaId() {
      return this.modalidadeSelecionada;
    }
  },
  methods: {
    async carregarFuncoes() {
      console.log('Carregando funções para modalidadeId:', this.modalidadeSelecionadaId);

      if (!this.modalidadeSelecionadaId) {
        this.funcoes = [];
        return;
      }

      try {
        const res = await api.get(`/listar/funcoes`, {
          params: { modalidadeId: this.modalidadeSelecionadaId }
        });
        this.funcoes = res.data || [];
      } catch (err) {
        console.error('Erro da API:', err);
        this.funcoes = [];
      }
    },

    async carregarJogadores(timeId) {
      this.isLoading = true;

      try {
        const res = await api.get(`/time/${timeId}`);

        const lista = [];

        res.data.forEach(j => {
          let funcaoId = '';
          if (j.funcao) {
            funcaoId = j.funcao.id;
          }

          lista.push({
            id: j.id,
            nome: j.nome,
            foto: j.foto,
            funcao: j.funcao,
            funcaoId: funcaoId
          });
        });

        this.jogadores = lista;

      } catch (err) {
        console.error(err);
        this.jogadores = [];
      } finally {
        this.isLoading = false;
      }
    },
    async alterarFuncao(jogadorId, funcaoId) {
      try {
        await api.put(`/funcao/${jogadorId}`, { funcaoId });
        console.log('Função atualizada com sucesso!');
      } catch (err) {
        console.error('Erro ao atualizar função:', err);
      }
    },
    gerenciarImagem(jogador) {
      Swal.fire({
        title: 'Imagem do jogador',
        text: 'O que você deseja fazer?',
        icon: 'question',
        showDenyButton: true,
        confirmButtonText: 'Trocar imagem',
        denyButtonText: 'Ver imagem',
        cancelButtonText: 'Cancelar',
        showCancelButton: true
      }).then(result => {
        // Trocar imagem
        if (result.isConfirmed) {
          this.jogadorImagemAtual = jogador;
          this.$refs.inputTrocarImagem.click();
        }

        // Ver imagem
        if (result.isDenied) {
          Swal.fire({
            imageUrl: jogador.foto,
            imageAlt: jogador.nome,
            showConfirmButton: false,
            width: 400
          });
        }
      });
    },

    handleTrocarImagem(event) {
      const file = event.target.files[0];
      if (!file || !this.jogadorImagemAtual) return;

      // aqui você decide se:
      // 1️⃣ faz upload direto
      // 2️⃣ só guarda o arquivo pra enviar depois

      console.log('Imagem escolhida:', file);
      console.log('Jogador:', this.jogadorImagemAtual);

      // exemplo:
      // this.uploadImagemJogador(this.jogadorImagemAtual.id, file);

      event.target.value = ''; // limpa o input
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-conteudo.modal-placar {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: fit-content;
  min-width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  box-sizing: border-box;
}

.title_placar {
  color: #3b82f6;
  font-size: 28px;
}

.placar-table {
  max-height: 55vh;
  overflow-y: auto;
  overflow-x: auto;

  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.placar {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
}

.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 14px 12px;
  font-size: 16px;
  text-align: left;
  border-right: 1px solid #e5e7eb;
}

.placar tbody td {
  color: #4b5563;
  padding: 12px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
}

.placar tbody tr:last-child td {
  border-bottom: none;
}

.placar tbody td:last-child,
.placar thead th:last-child {
  border-right: none;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.btn-cancel-placar {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}

.loader-container-centralizado,
.sem-dados-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 250px;
  font-size: 18px;
  color: #555;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.btn-gerenciar {
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.select-funcao {
  width: 250px;
  max-width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.select-funcao:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 16px 8px;
  }

  .modal-conteudo.modal-placar {
    width: 100%;
    max-width: 100%;
    max-height: 95vh;
    padding: 16px;
    border-radius: 10px;
  }

  .header-placar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .title_placar {
    text-align: center;
    font-size: 20px;
  }

  .btn-gerenciar {
    width: 100%;
    text-align: center;
  }

  .select-funcao {
    width: 100%;
  }

  .placar-table {
    max-height: 60vh;
    overflow-x: auto;
  }

  .placar {
    min-width: 700px;
  }

  .placar thead th {
    font-size: 14px;
    padding: 10px;
  }

  .placar tbody td {
    font-size: 13px;
    padding: 8px;
  }

  .time-info {
    gap: 6px;
  }

  .time-image {
    width: 32px;
    height: 32px;
  }

  .btn-cancel-placar {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .title_placar {
    font-size: 18px;
  }

  .placar {
    min-width: 650px;
  }

  .loader {
    width: 60px;
    height: 60px;
  }

  .loader-container-centralizado,
  .sem-dados-centralizado {
    font-size: 15px;
  }
}
</style>