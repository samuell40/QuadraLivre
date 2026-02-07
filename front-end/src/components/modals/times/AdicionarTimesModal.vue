<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModalAdicionarTime">
    <div class="modal-content">
      <h2>Adicionar Time</h2>
      <form @submit.prevent="adicionarTime">
        <div class="form-group">
          <label>Modalidade:</label>

          <div class="abas-container">
            <div class="aba" v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id"
              :class="{ ativa: modalidadeSelecionada === modalidade.id }" @click="selecionarModalidade(modalidade.id)">
              {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="novoTime">Nome do Time:</label>
          <input type="text" id="novoTime" v-model="timeParaAdicionar" required />
        </div>

        <div class="campo">
          <label>Treinador:</label>

          <div class="dropdown-custom" @click.stop>
            <div class="dropdown-selected" @click="abrirDropdownTreinador = !abrirDropdownTreinador">
              <img v-if="treinadorSelecionado?.foto" :src="treinadorSelecionado.foto" class="avatar" />
              <span>
                {{ treinadorSelecionado?.nome || 'Selecione o treinador' }}
              </span>
              <span class="seta">▼</span>
            </div>

            <div v-if="abrirDropdownTreinador" class="dropdown-list">
              <input type="text" v-model="buscaTreinador" placeholder="Buscar treinador..."
                class="input-busca-jogador" />

              <ul>
                <li v-for="u in treinadoresFiltrados" :key="u.id" @click="selecionarTreinador(u)">
                  <img :src="u.foto" class="avatar" />
                  <span>{{ u.nome }}</span>
                </li>

                <li v-if="treinadoresFiltrados.length === 0" class="sem-jogador">
                  Nenhum treinador encontrado
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="fotoTime">Foto (opcional):</label>
          <input type="file" id="fotoTime" @change="handleImagemUpload" accept=".jpg, .jpeg, .png" />
        </div>

        <div class="buttons">
          <button type="submit" class="btn-save">Cadastrar</button>
          <button type="button" class="btn-cancel" @click="fecharModalAdicionarTime">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';
import api from '@/axios';

export default {
  name: 'AdicionarTimeModal',
  props: {
    aberto: { type: Boolean, default: false },
    modalidadesDisponiveis: { type: Array, default: () => [] }
  },
  data() {
    return {
      modalidadeSelecionada: null,
      timeParaAdicionar: '',
      arquivoFoto: null,
      treinadores: [],
      treinadorSelecionado: null,
      abrirDropdownTreinador: false,
      buscaTreinador: ''
    };
  },
  computed: {
    treinadoresFiltrados() {
      return this.treinadores
        .filter(u => u.permissaoId !== 1 && u.permissaoId !== 2)
        .filter(u =>
          u.nome.toLowerCase().includes(this.buscaTreinador.toLowerCase())
        );
    }
  },
  watch: {
    aberto(novo) {
      if (novo) {
        this.carregarTreinadores();
      }
    }
  },
  methods: {
    fecharModalAdicionarTime() {
      this.modalidadeSelecionada = null;
      this.timeParaAdicionar = '';
      this.arquivoFoto = null;
      this.$emit('fechar');
    },

    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) this.arquivoFoto = file;
    },

    selecionarTreinador(u) {
      this.treinadorSelecionado = u;
      this.buscaTreinador = '';
      this.abrirDropdownTreinador = false;
    },

    selecionarModalidade(id) {
      this.modalidadeSelecionada = id;
    },

    async carregarTreinadores() {
      try {
        const res = await api.get('/usuarios');
        this.treinadores = res.data;
      } catch (err) {
        console.error(err);
        this.treinadores = [];
      }
    },

    async adicionarTime() {
      if (!this.modalidadeSelecionada || !this.timeParaAdicionar.trim()) {
        Swal.fire('Atenção', 'Preencha todos os campos.', 'warning');
        return;
      }

      try {
        let urlImagem = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/QuadraLivre.png';

        if (this.arquivoFoto) {
          const formData = new FormData();
          formData.append('file', this.arquivoFoto);

          const uploadResponse = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          urlImagem = uploadResponse.data.fileUrl || uploadResponse.data.url || urlImagem;
        }

        const payload = {
          nome: this.timeParaAdicionar.trim(),
          modalidadeId: Number(this.modalidadeSelecionada),
          treinadorId: this.treinadorSelecionado?.id,
          foto: urlImagem
        };

        await api.post('/time', payload);

        Swal.fire('Sucesso', 'Time adicionado com sucesso!', 'success');

        this.fecharModalAdicionarTime();

        this.$emit('atualizar');

      } catch (error) {
        console.error('Erro ao adicionar time:', error);
        Swal.fire(
          'Erro',
          error.response?.data?.erro || error.message || 'Erro ao adicionar time.',
          'error'
        );
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
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 900px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.form-group {
  margin-bottom: 20px;
}

input[type='text'],
select.dropdown,
input[type='file'] {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.buttons {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save {
  background-color: #3b82f6;
}

.btn-cancel {
  background-color: #7e7e7e;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 25px;
}

.aba {
  text-align: center;
  padding: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f1f1f1;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
  border: none;
}

.aba:hover {
  background-color: #e0e0e0;
}

.aba.ativa {
  background-color: #3b82f6;
  color: white;
}

.dropdown-custom {
  position: relative;
  width: 100%;
}

.dropdown-selected {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.dropdown-selected:hover {
  border-color: #3b82f6;
}

.dropdown-selected .seta {
  margin-left: auto;
  font-size: 12px;
  color: #555;
}

.dropdown-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  z-index: 50;
  overflow: hidden;
}

.dropdown-list ul {
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
}

.dropdown-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-list li:hover {
  background-color: #f3f4f6;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}

.input-busca-jogador {
  width: 100%;
  padding: 10px 14px;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  outline: none;
  font-size: 14px;
}

.sem-jogador {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
}

@media (max-width: 768px) {
  .abas-container {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
