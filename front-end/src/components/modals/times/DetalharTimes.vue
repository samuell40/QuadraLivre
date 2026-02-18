<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-conteudo modal-placar">
      <div class="header-placar">
        <h2 class="title_placar">Jogadores do {{ time?.nome }}</h2>
        <button class="btn-gerenciar" @click="$emit('gerenciar-jogadores')" aria-label="Gerenciar Jogadores">
          <span class="btn-gerenciar-texto">Gerenciar Jogadores</span>

          <svg class="btn-gerenciar-icone" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
          </svg>
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
                <th>Posição</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jogadores" :key="j.id">
                <td class="time-info">
                  <img :src="j.foto" alt="Foto" class="time-image time-image-click" @click.stop="gerenciarImagem(j)" />
                  {{ j.nome }}
                </td>
                <td>
                  <div class="select-wrap">
                    <select v-model="j.funcaoId" @change="alterarFuncao(j.id, j.funcaoId)" class="select-funcao">
                      <option v-for="f in funcoes" :key="f.id" :value="f.id">
                        {{ f.nome }}
                      </option>
                    </select>

                    <span class="select-arrow">▾</span>
                  </div>

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
        if (result.isConfirmed) {
          this.jogadorImagemAtual = jogador;
          this.$refs.inputTrocarImagem.click();
        }

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
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const fotoUrl = uploadRes.data.fileUrl || uploadRes.data.url;
        await api.put('/alterar/foto', {
          jogadorId: this.jogadorImagemAtual.id,
          foto: fotoUrl
        });

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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.placar-table {
  max-height: 55vh;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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

.select-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 220px;
  max-width: 100%;
}

.select-funcao {
  width: 100%;
  appearance: none;
  background: #ffffff;
  border: 1px solid #d1d5db;
  color: #4b5563;
  border-radius: 10px;
  padding: 10px 38px 10px 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.select-funcao:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.select-funcao:hover {
  border-color: #9ca3af;
}

.select-arrow {
  position: absolute;
  right: 12px;
  pointer-events: none;
  font-size: 14px;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.placar-table {
  max-height: 55vh;
  overflow-y: auto;
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

.btn-gerenciar-icone {
  display: none;
}

@media (max-width: 768px) {
  .modal-conteudo.modal-placar {
    width: 100%;
    padding: 16px;
    border-radius: 10px;
  }

  .header-placar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .title_placar {
    text-align: left;
    font-size: 18px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .btn-gerenciar {
    flex-shrink: 0;
    width: auto;
    padding: 10px 12px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-gerenciar-texto {
    display: none;
  }

  .btn-gerenciar-icone {
    display: inline-block;
    width: 18px;
    height: 18px;
  }

  .placar {
    min-width: 0;
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
</style>