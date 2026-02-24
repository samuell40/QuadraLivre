<template>
  <div v-if="aberto" class="modal-overlay">
    <div class="modal-conteudo modal-placar">
      <div class="header-placar">
        <h2 class="title_placar">Jogadores do {{ formatarInicialMaiuscula(time?.nome) }}</h2>
        <button class="btn-gerenciar" @click="abrirModalGerenciarJogadores" aria-label="Gerenciar Jogadores">
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
                  <span v-if="temNumeroJogador(j.numero)" class="numero-jogador">#{{ j.numero }}</span>
                  {{ formatarInicialMaiuscula(j.nome) }}
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
  <GerenciarJogadores :aberto="modalGerenciarJogadoresAberto" :time="time"
    @fechar="fecharModalGerenciarJogadores" @atualizar-lista="onAtualizarJogadores" />
</template>

<script>
import api from '@/axios';
import GerenciarJogadores from '@/components/modals/times/GerenciarJogadores.vue';
import Swal from 'sweetalert2';

export default {
  components: {
    GerenciarJogadores
  },
  emits: ['fechar', 'atualizar-lista'],
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
      jogadorImagemAtual: null,
      modalGerenciarJogadoresAberto: false
    };
  },
  watch: {
    aberto(novo) {
      if (novo && this.time?.id) {
        console.log('Modal aberto, modalidade selecionada:', this.modalidadeSelecionada);
        this.carregarFuncoes();
        this.carregarJogadores(this.time.id);
      } else {
        this.modalGerenciarJogadoresAberto = false;
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
    abrirModalGerenciarJogadores() {
      this.modalGerenciarJogadoresAberto = true;
    },
    fecharModalGerenciarJogadores() {
      this.modalGerenciarJogadoresAberto = false;
    },
    async onAtualizarJogadores() {
      this.modalGerenciarJogadoresAberto = false;
      if (this.time?.id) {
        await this.carregarJogadores(this.time.id);
      }
      this.$emit('atualizar-lista');
    },
    formatarInicialMaiuscula(texto) {
      if (!texto) return '';
      return String(texto).replace(/(^|\s)\S/g, letra => letra.toUpperCase());
    },
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
            numero: j.numero,
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
    temNumeroJogador(numero) {
      const numeroNormalizado = Number(numero)
      return Number.isInteger(numeroNormalizado) && numeroNormalizado > 0
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
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
}

.modal-conteudo.modal-placar {
  background: #fff;
  border-radius: 16px;
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: min(960px, 100%);
  max-height: 92vh;
  overflow: hidden;
  box-sizing: border-box;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.title_placar {
  color: #3b82f6;
  font-size: 24px;
  font-weight: bold;
}

.btn-gerenciar {
  background: #3b82f6;
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.35);
  cursor: pointer;
  font-weight: 800;
  transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 18px rgba(59, 130, 246, 0.22);
}

.btn-gerenciar:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(59, 130, 246, 0.28);
}

.loader-container-centralizado,
.sem-dados-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 240px;
  font-size: 16px;
  font-weight: 700;
  color: #475569;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 78px;
  height: 78px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.placar-table {
  max-height: 58vh;
  overflow: auto;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  position: relative;
  isolation: isolate;
}

.placar-table::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.placar-table::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.35);
  border-radius: 999px;
}

.placar-table::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.55);
}

.placar {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 720px;
}

.placar thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #1e3a8a;
  color: #fff;
  font-weight: 900;
  padding: 12px 12px;
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.placar tbody td:first-child {
  position: sticky;
  left: 0;
  background: #fff;
  z-index: 3;
}

.placar thead th:first-child {
  position: sticky;
  left: 0;
  background: #1e3a8a;
  z-index: 4;
}

.placar tbody td {
  color: #334155;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  background: #fff;
}

.placar tbody tr:hover td {
  background: #f8fafc;
}

.placar tbody td:nth-child(2),
.placar thead th:nth-child(2) {
  text-align: center;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.numero-jogador {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.time-image {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid rgba(59, 130, 246, 0.35);
  background: #fff;
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
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.14);
  color: #0f172a;
  border-radius: 12px;
  padding: 10px 38px 10px 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.select-funcao:hover {
  border-color: rgba(59, 130, 246, 0.55);
}

.select-funcao:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.select-arrow {
  position: absolute;
  right: 12px;
  pointer-events: none;
  font-size: 14px;
  color: #334155;
}

.btn-cancel-placar {
  background: transparent;
  color: #3b82f6;
  padding: 12px 16px;
  border: 1px solid rgba(37, 99, 235, 0.35);
  border-radius: 999px;
  cursor: pointer;
  width: 100%;
  font-weight: 900;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.btn-cancel-placar:hover {
  background: rgba(37, 99, 235, 0.06);
  border-color: rgba(37, 99, 235, 0.55);
  transform: translateY(-1px);
}

.btn-gerenciar-icone {
  display: none;
}

@media (max-width: 768px) {
  .modal-conteudo.modal-placar {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
  }

  .header-placar {
    gap: 10px;
  }

  .title_placar {
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
    font-size: 13px;
    padding: 9px 8px;
  }

  .placar tbody td {
    font-size: 13px;
    padding: 8px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .select-wrap {
    width: 170px;
  }

  .select-funcao {
    font-size: 12px;
    padding: 8px 34px 8px 10px;
    border-radius: 10px;
  }

  .placar-table {
    max-height: 52vh;
  }

  .btn-cancel-placar {
    font-size: 14px;
    padding: 10px 12px;
  }
}
</style>
