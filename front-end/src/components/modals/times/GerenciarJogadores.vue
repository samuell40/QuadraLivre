<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2>Gerenciar Jogadores - {{ time?.nome }}</h2>

      <div class="form-group">
        <label for="acaoGerenciarJogadores">Escolha a ação:</label>
        <select id="acaoGerenciarJogadores" v-model="acaoLocal" class="dropdown">
          <option disabled value="">Selecione uma opção</option>
          <option value="adicionar">Adicionar Jogador</option>
          <option value="remover">Remover Jogador</option>
        </select>
      </div>

      <div v-if="acaoLocal === 'adicionar'" class="form-group">
        <label for="nomeJogador">Nome do jogador:</label>
        <input type="text" id="nomeJogador" v-model="nomeJogador" placeholder="Digite o nome" class="dropdown" />

        <div class="campo">
          <label>Vincular usuário</label>
          <div class="dropdown-custom" ref="dropdownUsuario">
            <div class="dropdown-selected" @click="abrirDropdownUsuarios = !abrirDropdownUsuarios">
              <img v-if="usuarioSelecionado?.foto" :src="usuarioSelecionado.foto" class="avatar" />
              <span>{{ usuarioSelecionado?.nome || 'Selecione um usuário (opcional)' }}</span>
            </div>

            <ul v-if="abrirDropdownUsuarios" class="dropdown-list">
              <li v-for="u in usuariosDisponiveis" :key="u.id" @click.stop="selecionarUsuario(u)">
                <img :src="u.foto" class="avatar" />
                <span>{{ u.nome }}</span>
              </li>
            </ul>
          </div>
        </div>

        <label for="fotoJogador">Foto (opcional):</label>
        <input type="file" id="fotoJogador" @change="handleImagemUpload" accept=".jpg,.jpeg,.png" class="dropdown" />

      </div>
      <div v-if="acaoLocal === 'remover'" class="form-group">
        <label for="selecionarJogador">Escolha o jogador:</label>
        <select id="selecionarJogador" v-model="jogadorSelecionado" class="dropdown">
          <option disabled value="">Selecione um jogador</option>
          <option v-for="j in jogadores" :key="j.id" :value="j.id">{{ j.nome }}</option>
        </select>
      </div>

      <div class="botoes">
        <button
          :disabled="!acaoLocal || (acaoLocal === 'adicionar' && !nomeJogador) || (acaoLocal === 'remover' && !jogadorSelecionado)"
          @click="confirmar" class="btn-save1">
          Confirmar
        </button>
        <button class="btn-cancel-placar" @click="fecharModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
  name: 'GerenciarJogadoresModal',
  props: {
    aberto: Boolean,
    time: Object
  },

  data() {
    return {
      acaoLocal: '',
      nomeJogador: '',
      arquivoFoto: null,
      jogadorSelecionado: null,
      usuariosDisponiveis: [],
      usuarioSelecionado: null,
      abrirDropdownUsuarios: false,
      jogadores: []
    };
  },

  watch: {
    aberto(novo) {
      if (novo && this.time?.id) {
        this.carregarJogadores();
        this.carregarUsuariosDisponiveis();
      }
    },
    time(novo) {
      if (novo?.id) {
        this.carregarJogadores();
        this.carregarUsuariosDisponiveis();
      }
    }
  },

  methods: {
    fecharModal() {
      this.acaoLocal = '';
      this.nomeJogador = '';
      this.arquivoFoto = null;
      this.jogadorSelecionado = null;
      this.usuarioSelecionado = null;
      this.abrirDropdownUsuarios = false;
      this.$emit('fechar');
    },

    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.arquivoFoto = file;
      }
    },

    async carregarJogadores() {
      try {
        const res = await api.get(`/time/${this.time.id}`);
        this.jogadores = res.data || [];
      } catch (err) {
        console.error(err);
        this.jogadores = [];
      }
    },

    async carregarUsuariosDisponiveis() {
      try {
        const res = await api.get('/usuarios');
        this.usuariosDisponiveis = res.data.filter(
          u => (!u.jogador && (!u.times || u.times.length === 0)) && u.permissaoId === 3);
      } catch (err) {
        console.error(err);
        this.usuariosDisponiveis = [];
      }
    },

    selecionarUsuario(u) {
      this.usuarioSelecionado = u;
      this.abrirDropdownUsuarios = false;
    },

    async uploadImagem() {
      if (!this.arquivoFoto) return null;

      const formData = new FormData();
      formData.append('file', this.arquivoFoto);

      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return uploadResponse.data.fileUrl || uploadResponse.data.url;
    },

    async adicionarJogador() {
      const urlImagem = await this.uploadImagem();

      await api.post('/adicionar', {
        nome: this.nomeJogador.trim(),
        foto: urlImagem,
        timeId: this.time.id,
        usuarioId: this.usuarioSelecionado?.id || null
      });

      Swal.fire('Sucesso', 'Jogador adicionado!', 'success');
    },

    async removerJogador() {
      await api.delete(`/remover/${this.time.id}/${this.jogadorSelecionado}`);
      Swal.fire('Sucesso', 'Jogador removido!', 'success');
    },

    handleError(err) {
      console.error(err);
      const mensagem = err.response?.data?.message;
      Swal.fire('Erro', mensagem, 'error');
    },

    async confirmar() {
      try {
        if (this.acaoLocal === 'adicionar') {
          await this.adicionarJogador();
        } else if (this.acaoLocal === 'remover') {
          await this.removerJogador();
        }

        this.$emit('atualizar-lista');
        this.fecharModal();

      } catch (err) {
        this.handleError(err);
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

.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save1,
.btn-cancel-placar {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
}

.btn-save1 {
  background-color: #3b82f6;
}

.btn-cancel-placar {
  background-color: #7e7e7e;
}

.dropdown-custom {
  position: relative;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 15px;
  width: 100%;
}

.dropdown-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  font-size: 15px;
  color: #333;
  min-height: 38px;
}

.dropdown-selected img.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-list {
  position: absolute;
  width: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-list img.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
</style>