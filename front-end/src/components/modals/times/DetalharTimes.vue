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

    async handleTrocarImagem(event) {
      const file = event.target.files[0];
      if (!file || !this.jogadorImagemAtual) return;

      try {
        // 1️⃣ upload da imagem
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const fotoUrl = uploadRes.data.fileUrl || uploadRes.data.url;

        // 2️⃣ chama a rota de alterar foto
        await api.put('/alterar/foto', {
          jogadorId: this.jogadorImagemAtual.id,
          foto: fotoUrl
        });

        // 3️⃣ atualiza no front
        this.jogadorImagemAtual.foto = fotoUrl;

        Swal.fire('Sucesso', 'Imagem alterada com sucesso!', 'success');

      } catch (err) {
        console.error(err);
        Swal.fire('Erro', 'Erro ao alterar imagem do jogador', 'error');
      } finally {
        event.target.value = '';
        this.jogadorImagemAtual = null;
      }
    }
  }
};
</script>

<style scoped>
/* Modal Overlay */
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
  padding: 16px; /* adiciona espaçamento em mobile */
}

/* Modal Conteúdo */
.modal-conteudo.modal-placar {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 900px;
  max-width: 100%;
  max-height: 95vh;
  overflow: hidden;
  box-sizing: border-box;
}

/* Header */
.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* Título */
.title_placar {
  color: #3b82f6;
  font-size: 28px;
}

/* Botão Gerenciar */
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

/* Loader */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.placar-table {
  max-height: 55vh;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.placar {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  min-width: 700px;
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

.placar tbody td:nth-child(2),
.placar thead th:nth-child(2) {
  text-align: center;
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
  padding: 16px;
}

.modal-conteudo.modal-placar {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 900px;
  max-width: 100%;
  max-height: 95vh;
  overflow: hidden;
  box-sizing: border-box;
}

.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.title_placar {
  color: #3b82f6;
  font-size: 28px;
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.placar-table {
  max-height: 55vh;
  overflow-y: auto;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
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

.placar tbody td:nth-child(2),
.placar thead th:nth-child(2) {
  text-align: center;
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

@media (max-width: 768px) {
  .modal-conteudo.modal-placar {
    width: 100%;
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

  /* tabela menor, mantendo layout original */
  .placar {
    min-width: 0; /* remove scroll horizontal */
    width: 100%;
  }

  .placar thead th {
    font-size: 14px;
    padding: 8px 6px;
  }

  .placar tbody td {
    font-size: 13px;
    padding: 6px 8px;
  }

  .time-info {
    gap: 6px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .select-funcao {
    font-size: 12px;
    padding: 4px 6px;
  }

  .btn-cancel-placar {
    font-size: 14px;
    padding: 8px 12px;
  }

  .placar-table {
    max-height: 50vh;
  }
}

/* Mobile muito pequeno */
@media (max-width: 480px) {
  .title_placar {
    font-size: 18px;
  }

  .placar thead th {
    font-size: 13px;
    padding: 6px 4px;
  }

  .placar tbody td {
    font-size: 12px;
    padding: 4px 6px;
  }

  .time-image {
    width: 24px;
    height: 24px;
  }

  .select-funcao {
    font-size: 11px;
    padding: 2px 4px;
  }

  .btn-cancel-placar {
    font-size: 13px;
    padding: 6px 10px;
  }

  .placar-table {
    max-height: 45vh;
  }
}

</style>