<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2>Gerenciar Jogadores - {{ time?.nome }}</h2>

      <div class="form-group">
        <label for="acaoGerenciarJogadores">Escolha a ação:</label>
        <select id="acaoGerenciarJogadores" v-model="acaoLocal" class="dropdown">
          <option disabled value="">Selecione uma opção</option>
          <option value="adicionar">Adicionar Jogador</option>
          <option value="adicionarExistente">Adicionar Jogador Existente</option>
          <option value="remover">Remover Jogador</option>
        </select>
      </div>

      <!-- Adicionar novo jogador -->
      <div v-if="acaoLocal === 'adicionar'" class="form-group">
        <label for="nomeJogador">Nome do jogador:</label>
        <input type="text" id="nomeJogador" v-model="nomeJogador" placeholder="Digite o nome" class="dropdown" />

        <div class="campo">
          <label>Vincular usuário</label>

          <div class="dropdown-custom" ref="dropdownUsuario">
            <div class="dropdown-selected" @click="abrirDropdownUsuarios = !abrirDropdownUsuarios">
              <img v-if="usuarioSelecionado?.foto" :src="usuarioSelecionado.foto" class="avatar" />
              <span>
                {{ usuarioSelecionado?.nome || 'Selecione um usuário (opcional)' }}
              </span>
            </div>

            <div v-if="abrirDropdownUsuarios" class="dropdown-list">
              <input type="text" v-model="buscaUsuario" placeholder="Buscar usuário..." class="input-busca-jogador"
                @click.stop />

              <ul>
                <li v-for="u in usuariosFiltradosComBusca" :key="u.id" @click.stop="selecionarUsuario(u)">
                  <img :src="u.foto" class="avatar" />
                  <span>{{ u.nome }}</span>
                </li>

                <li v-if="usuariosFiltradosComBusca.length === 0" class="sem-jogador">
                  Nenhum usuário encontrado
                </li>
              </ul>
            </div>
          </div>
        </div>

        <label for="fotoJogador">Foto (opcional):</label>
        <input type="file" id="fotoJogador" @change="handleImagemUpload" accept=".jpg,.jpeg,.png" class="dropdown" />
      </div>

      <!-- Adicionar jogador existente -->
      <div v-if="acaoLocal === 'adicionarExistente'" class="form-group">
        <label>Adicionar jogador existente:</label>
        <div class="dropdown-custom" ref="dropdownJogadores">
          <div class="dropdown-selected" @click="abrirDropdownJogadores = !abrirDropdownJogadores">
            <img v-if="jogadorSelecionadoExistente?.foto" :src="jogadorSelecionadoExistente.foto" class="avatar" />
            <span>{{ jogadorSelecionadoExistente?.nome || 'Selecione um jogador existente' }}</span>
          </div>

          <ul v-if="abrirDropdownJogadores" class="dropdown-list">
            <input type="text" v-model="buscaJogador" placeholder="Buscar jogador..." class="input-busca-jogador"
              @click.stop />

            <li v-if="jogadoresExistentesFiltradosComBusca.length === 0" class="sem-jogador">
              Nenhum jogador disponível
            </li>

            <li v-for="j in jogadoresExistentesFiltradosComBusca" :key="j.id"
              @click.stop="selecionarJogadorExistente(j)">
              <img :src="j.foto" class="avatar" />
              <span>
                {{ j.nome }}
                <span v-if="j.times.length">
                  ({{ j.times[0].nome }})
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="acaoLocal === 'remover'" class="form-group">
        <label for="selecionarJogador">Escolha o jogador:</label>
        <select id="selecionarJogador" v-model="jogadorSelecionado" class="dropdown">
          <option disabled value="">Selecione um jogador</option>
          <option v-for="j in jogadores" :key="j.id" :value="j.id">{{ j.nome }}</option>
        </select>
      </div>

      <div class="botoes">
        <button :disabled="!acaoLocal ||
          (acaoLocal === 'adicionar' && !nomeJogador) ||
          (acaoLocal === 'adicionarExistente' && !jogadorSelecionadoExistente) ||
          (acaoLocal === 'remover' && !jogadorSelecionado)" @click="confirmar" class="btn-save1">
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
      buscaJogador: '',
      buscaUsuario: '',
      arquivoFoto: null,
      jogadorSelecionado: null,
      usuariosDisponiveis: [],
      usuarioSelecionado: null,
      abrirDropdownUsuarios: false,
      jogadores: [],
      jogadorSelecionadoExistente: null,
      abrirDropdownJogadores: false
    };
  },

  computed: {
    jogadoresExistentesFiltrados() {
      if (!this.time) return [];
      const timeIdAtual = this.time.id;
      return this.jogadores.filter(j => {
        const estaNesteTime = j.times.some(t => t.id === timeIdAtual);
        return !estaNesteTime;
      });
    },
    jogadoresExistentesFiltradosComBusca() {
      return this.jogadoresExistentesFiltrados.filter(j =>
        j.nome.toLowerCase().includes(this.buscaJogador.toLowerCase())
      );
    },
    usuariosFiltradosComBusca() {
      return this.usuariosDisponiveis
        .filter(u => u.permissaoId !== 1)
        .filter(u =>
          u.nome.toLowerCase().includes(this.buscaUsuario.toLowerCase())
        );
    }
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
      this.jogadorSelecionadoExistente = null;
      this.abrirDropdownUsuarios = false;
      this.abrirDropdownJogadores = false;
      this.$emit('fechar');
    },

    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) this.arquivoFoto = file;
    },

    selecionarUsuario(u) {
      this.usuarioSelecionado = u;
      this.buscaUsuario = '';
      this.abrirDropdownUsuarios = false;
    },

    selecionarJogadorExistente(j) {
      this.jogadorSelecionadoExistente = j;
      this.buscaJogador = '';
      this.abrirDropdownJogadores = false;
    },

    async carregarJogadores() {
      if (!this.time?.modalidadeId) return;

      try {
        const res = await api.get(`/jogadores/${this.time.modalidadeId}`);
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
          u => (!u.jogador && (!u.times || u.times.length === 0)) && u.permissaoId === 3
        );
      } catch (err) {
        console.error(err);
        this.usuariosDisponiveis = [];
      }
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
      const nome = this.nomeJogador.trim().toLowerCase();

      const jaExiste = this.jogadores.some(
        j => j.nome.toLowerCase() === nome
      );

      if (jaExiste) {
        Swal.fire(
          'Atenção',
          'Já existe um jogador com esse nome nesta modalidade',
          'warning'
        );
        return;
      }

      const urlImagem = await this.uploadImagem();

      await api.post('/adicionar', {
        nome: this.nomeJogador.trim(),
        foto: urlImagem,
        timeId: this.time.id,
        usuarioId: this.usuarioSelecionado?.id
      });

      Swal.fire('Sucesso', 'Jogador adicionado!', 'success');
    },
    
    async adicionarJogadorExistente() {
      if (!this.jogadorSelecionadoExistente) return;
      await api.post('/mover', {
        jogadorId: this.jogadorSelecionadoExistente.id,
        novoTimeId: this.time.id
      });
      Swal.fire('Sucesso', 'Jogador movido para o novo time!', 'success');
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
        if (this.acaoLocal === 'adicionar') await this.adicionarJogador();
        else if (this.acaoLocal === 'adicionarExistente') await this.adicionarJogadorExistente();
        else if (this.acaoLocal === 'remover') await this.removerJogador();

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

.input-busca-jogador {
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid #ddd;
  outline: none;
  font-size: 14px;
}

.dropdown-list ul {
  max-height: 180px;
  overflow-y: auto;
}

.sem-jogador {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>