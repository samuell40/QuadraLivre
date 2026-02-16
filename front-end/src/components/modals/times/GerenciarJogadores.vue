<template>
  <div v-if="aberto" class="modal-overlay" @click.self="fecharModal">
    <div class="modal-content">
      <h2>Gerenciar Jogadores - {{ time?.nome }}</h2>

      <div class="abas-container">
        <div class="aba" :class="{ ativa: acaoLocal === 'adicionarExistente' }"
          @click="acaoLocal = 'adicionarExistente'">
          Jogador Existente
        </div>
        <div class="aba" :class="{ ativa: acaoLocal === 'adicionar' }" @click="acaoLocal = 'adicionar'">
          Adicionar Novo
        </div>
        <div class="aba" :class="{ ativa: acaoLocal === 'adicionarMassa' }" @click="acaoLocal = 'adicionarMassa'">
          Adicionar em massa
        </div>
        <div class="aba" :class="{ ativa: acaoLocal === 'remover' }" @click="acaoLocal = 'remover'">
          Remover
        </div>
      </div>

      <div v-if="acaoLocal" class="conteudo-aba">
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

        <div v-if="acaoLocal === 'adicionarExistente'" class="form-group">
          <label>Adicionar jogador existente:</label>
          <div class="dropdown-custom" ref="dropdownJogadores">
            <div class="dropdown-selected" @click="abrirDropdownJogadores = !abrirDropdownJogadores">
              <img v-if="jogadorSelecionadoExistente?.foto" :src="jogadorSelecionadoExistente.foto" class="avatar" />
              <span v-if="jogadoresSelecionadosExistentes.length === 0">
                Selecione jogador(es) existente(s)
              </span>

              <span v-else>
                {{ jogadoresSelecionadosExistentes.length }} jogador(es) selecionado(s)
              </span>
            </div>

            <ul v-if="abrirDropdownJogadores" class="dropdown-list">
              <input type="text" v-model="buscaJogador" placeholder="Buscar jogador..." class="input-busca-jogador"
                @click.stop />

              <li v-if="jogadoresExistentesFiltradosComBusca.length === 0" class="sem-jogador">
                Nenhum jogador disponível
              </li>

              <li v-for="j in jogadoresExistentesFiltradosComBusca" :key="j.id" @click.stop="toggleJogadorExistente(j)"
                :class="{ selecionado: isJogadorSelecionado(j.id) }">
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
          <label>Escolha o(s) jogador(es):</label>

          <div class="dropdown-custom" ref="dropdownRemover">
            <div class="dropdown-selected" @click="abrirDropdownRemover = !abrirDropdownRemover">
              <span v-if="jogadoresSelecionadosRemover.length === 0">Selecione jogador(es)</span>
              <span v-else>
                {{ jogadoresSelecionadosRemover.length }} jogador(es) selecionado(s)
              </span>
            </div>

            <div v-if="abrirDropdownRemover" class="dropdown-list">
              <input type="text" v-model="buscaJogadorRemover" placeholder="Buscar jogador..."
                class="input-busca-jogador" @click.stop />

              <ul>
                <li v-for="j in jogadoresFiltradosRemover" :key="j.id" @click.stop="toggleJogadorRemover(j)"
                  :class="{ selecionado: isJogadorSelecionadoRemover(j.id) }">
                  <img :src="j.foto" class="avatar" />
                  <span>{{ j.nome }}</span>
                </li>

                <li v-if="jogadoresFiltradosRemover.length === 0" class="sem-jogador">
                  Nenhum jogador encontrado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="acaoLocal === 'adicionarMassa'" class="form-group">
        <label>Adicionar jogadores em massa:</label>

        <textarea v-model="nomesJogadoresMassa" class="dropdown" rows="4"
          placeholder="Ex: João, Tiago, Pedro"></textarea>

        <small style="color:#666">
          Separe os nomes por vírgula ou um por linha
        </small>
      </div>

      <div class="botoes">
        <button v-if="acaoLocal" :disabled="(acaoLocal === 'adicionar' && !nomeJogador) ||
          (acaoLocal === 'adicionarExistente' && jogadoresSelecionadosExistentes.length === 0) ||
          (acaoLocal === 'remover' && jogadoresSelecionadosRemover.length === 0) ||
          (acaoLocal === 'adicionarMassa' && !nomesJogadoresMassa)" @click="confirmar" class="btn-save1">
          Confirmar
        </button>

        <button @click="fecharModal" :class="['btn-cancel-placar', !acaoLocal ? 'btn-cancel-ativo' : '']">
          Cancelar
        </button>
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
      jogadoresSelecionadosExistentes: [],
      jogadoresSelecionadosRemover: [],
      abrirDropdownJogadores: false,
      abrirDropdownRemover: false,
      buscaJogadorRemover: '',
      nomesJogadoresMassa: '',
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
    },
    jogadoresFiltradosRemover() {
      if (!this.jogadores || !this.time) return [];
      const timeIdAtual = this.time.id;
      return this.jogadores
        .filter(j => j.times.some(t => t.id === timeIdAtual))
        .filter(j =>
          j.nome.toLowerCase().includes(this.buscaJogadorRemover.toLowerCase())
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
      this.jogadoresSelecionadosExistentes = [];
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

    selecionarJogadorRemover(jogador) {
      this.jogadorSelecionado = jogador;
      this.buscaJogadorRemover = '';
      this.abrirDropdownRemover = false;
    },

    toggleJogadorExistente(jogador) {
      const index = this.jogadoresSelecionadosExistentes.findIndex(
        j => j.id === jogador.id
      );

      if (index !== -1) {
        this.jogadoresSelecionadosExistentes.splice(index, 1);
      } else {
        this.jogadoresSelecionadosExistentes.push(jogador);
      }
    },

    isJogadorSelecionado(id) {
      return this.jogadoresSelecionadosExistentes.some(j => j.id === id);
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

      const FOTO_PADRAO = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';

      const urlImagem = await this.uploadImagem();

      await api.post('/adicionar', {
        nome: this.nomeJogador.trim(),
        foto: urlImagem || FOTO_PADRAO,
        timeId: this.time.id,
        usuarioId: this.usuarioSelecionado?.id
      });

      Swal.fire('Sucesso', 'Jogador adicionado!', 'success');
    },

    async adicionarJogadorExistente() {
      if (this.jogadoresSelecionadosExistentes.length === 0) return;

      for (const jogador of this.jogadoresSelecionadosExistentes) {
        await api.post('/mover', {
          jogadorId: jogador.id,
          novoTimeId: this.time.id
        });
      }

      Swal.fire(
        'Sucesso',
        `${this.jogadoresSelecionadosExistentes.length} jogador(es) adicionados ao time!`,
        'success'
      );
    },
    
    async adicionarJogadoresEmMassa() {
      const nomesDigitados = this.nomesJogadoresMassa
        .split(/[\n,]+/)
        .map(n => n.trim())
        .filter(n => n.length > 0);

      if (nomesDigitados.length === 0) {
        Swal.fire('Atenção', 'Informe ao menos um nome', 'warning');
        return;
      }

      const jogadoresPorNome = new Map(
        this.jogadores.map(j => [j.nome.toLowerCase(), j])
      );

      const nomesExistentes = [];
      const nomesParaAdicionar = [];

      for (const nome of nomesDigitados) {
        const nomeLower = nome.toLowerCase();

        if (jogadoresPorNome.has(nomeLower)) {
          nomesExistentes.push(jogadoresPorNome.get(nomeLower).nome);
        } else {
          nomesParaAdicionar.push(nome);
        }
      }

      if (nomesParaAdicionar.length === 0) {
        Swal.fire(
          'Atenção',
          `Todos os jogadores já existem:\n\n${nomesExistentes.join(', ')}`,
          'warning'
        );
        return;
      }

      const FOTO_PADRAO ='https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';

      for (const nome of nomesParaAdicionar) {
        await api.post('/adicionar', {
          nome,
          foto: FOTO_PADRAO,
          timeId: this.time.id
        });
      }

      let mensagem = `${nomesParaAdicionar.length} jogador(es) adicionados com sucesso!`;

      if (nomesExistentes.length > 0) {
        mensagem += `\n\nJá existentes:\n${nomesExistentes.join(', ')}`;
      }

      Swal.fire('Concluído', mensagem, 'success');
    },

    toggleJogadorRemover(jogador) {
      const index = this.jogadoresSelecionadosRemover.findIndex(j => j.id === jogador.id);
      if (index !== -1) {
        this.jogadoresSelecionadosRemover.splice(index, 1); 
      } else {
        this.jogadoresSelecionadosRemover.push(jogador); 
      }
    },

    isJogadorSelecionadoRemover(id) {
      return this.jogadoresSelecionadosRemover.some(j => j.id === id);
    },

    async removerJogador() {
      if (this.jogadoresSelecionadosRemover.length === 0) return;

      for (const jogador of this.jogadoresSelecionadosRemover) {
        await api.delete(`/remover/${this.time.id}/${jogador.id}`);
      }

      Swal.fire('Sucesso', `${this.jogadoresSelecionadosRemover.length} jogador(es) removido(s)!`, 'success');
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
        else if (this.acaoLocal === 'adicionarMassa') await this.adicionarJogadoresEmMassa();

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
  text-align: center;
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

.btn-cancel-ativo {
  background-color: #3b82f6;
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

.selecionado {
  background-color: #eef6ff;
  font-weight: bold;
}

.abas-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.aba {
  flex: 1; 
  text-align: center;
  padding: 10px 0;
  border-radius: 6px;
  cursor: pointer;
  background-color: #f1f1f1;
  font-weight: 500;
  color: #333;
  transition: all 0.2s;
}

.aba:hover {
  background-color: #e0e0e0;
}

.aba.ativa {
  background-color: #3b82f6;
  color: white;
}

.conteudo-aba {
  margin-top: 10px;
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 20px 10px;
  }

  .modal-content {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 8px;
  }

  .modal-content h2 {
    font-size: 18px;
  }

  .dropdown,
  .dropdown-selected {
    font-size: 14px;
  }

  .botoes {
    flex-direction: row; 
    gap: 10px; 
    flex-wrap: wrap; 
  }

  .btn-save1,
  .btn-cancel-placar {
    flex: 1; 
    font-size: 15px;
  }

  .abas-container {
    gap: 8px;
  }

  .aba {
    flex: 1 1 100px; 
    font-size: 14px;
    padding: 8px;
  }
}
</style>
