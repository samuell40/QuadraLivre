<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Usuários</h1>
        <input type="text" placeholder="Digite o nome do usuário..." v-model="busca" class="input-busca"
          :disabled="isLoading" />
      </div>

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="usuarios" v-if="usuariosFiltrados.length > 0">
          <div class="card" v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <div class="card-conteudo">
              <div class="foto">
                <img :src="usuario.foto" alt="Foto do usuário" />
              </div>
              <div class="info">
                <h2>{{ usuario.nome }}</h2>
                <p>{{ usuario.funcao }}</p>
                <p>{{ usuario.email }}</p>
              </div>
            </div>

            <div class="botoes">
              <button class="btn-editar" @click="editarUsuario(usuario)">Alterar Permissões</button>
              <button class="btn-detalhar" @click="detalhesUsuario(usuario)">Detalhar</button>
            </div>
          </div>
        </div>

        <p v-else class="sem-resultados">Nenhum usuário encontrado.</p>
      </div>
    </div>

    <!-- Modal de detalhar -->
    <div v-if="mostrarDetalhes" class="modal-overlay">
      <div class="modal-content">
        <h2>Detalhes do Usuário</h2>
        <div class="topo-detalhes">
          <div class="detalhe-foto">
            <img :src="usuarioSelecionado.foto" alt="Foto do usuário" />
          </div>
          <div class="detalhe-info">
            <div class="campo">
              <strong>Nome:</strong>
              <p class="detalhe">{{ usuarioSelecionado.nome }}</p>
            </div>
            <div class="campo">
              <strong>Email:</strong>
              <p class="detalhe">{{ usuarioSelecionado.email }}</p>
            </div>
          </div>
        </div>

        <div class="campo">
          <strong>Telefone:</strong>
          <p class="detalhe">{{ usuarioSelecionado.telefone || 'Não informado' }}</p>
        </div>

        <div class="campo">
          <strong>Função:</strong>
          <p class="detalhe">{{ usuarioSelecionado.funcao }}</p>
        </div>

        <div class="campo" v-if="usuarioSelecionado.funcao === 'ADMINISTRADOR'">
          <strong>Quadra:</strong>
          <p class="detalhe">{{ usuarioSelecionado.quadra || 'Nenhuma' }}</p>
        </div>

        <div class="campo" v-if="usuarioSelecionado.funcao === 'USUARIO'">
          <strong>Times:</strong>
          <p class="detalhe">
            <span v-if="usuarioSelecionado.times && usuarioSelecionado.times.length">
              {{usuarioSelecionado.times.map(t => t.nome).join(', ')}}
            </span>
            <span v-else>Nenhum</span>
          </p>
        </div>

        <div class="campo">
          <strong>Total de Agendamentos:</strong>
          <p class="detalhe">{{ usuarioSelecionado.totalAgendamentos }}</p>
        </div>

        <button class="btn-fechar" @click="fecharDetalhes">Fechar</button>
      </div>
    </div>

    <!-- Modal de edição -->
    <div v-if="mostrarEditar" class="modal-overlay">
      <div class="modal-content">
        <h2>Editar Usuário</h2>
        <div v-if="isCarregandoModal" class="loader-wrapper">
          <div class="loader loader-small"></div>
        </div>

        <div v-else>
          <div class="campo">
            <strong>Função:</strong>
            <select v-model="form.funcao">
              <option disabled value="">Selecione a função</option>
              <option v-for="p in permissoesFiltradas" :key="p.id" :value="p.descricao">
                {{ p.descricao }}
              </option>
            </select>
          </div>

          <div class="campo"
            v-if="form.funcao === 'ADMINISTRADOR' && usuarioLogado.funcao === 'DESENVOLVEDOR_DE_SISTEMA'">
            <strong>Quadra:</strong>
            <select v-model="form.quadra">
              <option disabled value="">Selecione a quadra</option>
              <option v-for="q in quadras" :key="q.id" :value="q.id">
                {{ q.nome }}
              </option>
            </select>
          </div>


          <div class="campo" v-if="form.funcao === 'USUARIO'">
            <strong>Time:</strong>
            <select v-model="form.timeId">
              <option disabled value="">Selecione o time</option>
              <option v-for="t in times" :key="t.id" :value="t.id">
                {{ t.nome }}
              </option>
            </select>
          </div>

          <div class="botoes" style="margin-top: 20px;">
            <button class="btn-salvarEdicao" @click="salvarEdicao" :disabled="isSalvando">Salvar</button>
            <button class="btn-fecharEdicao" @click="fecharEditar" :disabled="isSalvando">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import api from '@/axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/store';

export default {
  name: 'UsuariosView',
  components: { SideBar },
  data() {
    return {
      usuarios: [],
      busca: '',
      isLoading: true,
      isCarregandoModal: false,
      isSalvando: false,
      mostrarDetalhes: false,
      mostrarEditar: false,
      usuarioSelecionado: {},
      permissoes: [],
      quadras: [],
      times: [],
      form: {
        email: '',
        funcao: '',
        quadra: '',
        timeId: '',
      },
    };
  },
  computed: {
    usuarioLogado() {
      const authStore = useAuthStore();
      return authStore.usuario || {};
    },
    usuarioLogadoEmail() {
      return this.usuarioLogado.email || '';
    },
    usuariosFiltrados() {
      return this.usuarios
        .filter(u => u.nome.toLowerCase().includes(this.busca.toLowerCase()))
        .filter(u => u.email !== this.usuarioLogadoEmail)
        .filter(u => {
          if (this.usuarioLogado.funcao === 'ADMINISTRADOR') {
            return u.funcao !== 'DESENVOLVEDOR_DE_SISTEMA' && u.funcao !== 'ADMINISTRADOR';
          }
          return true;
        });
    },
    permissoesFiltradas() {
      if (this.usuarioLogado.funcao === 'ADMINISTRADOR') {
        return this.permissoes.filter(p => p.descricao === 'USUARIO');
      }
      return this.permissoes;
    }
  },
  mounted() {
    this.carregarUsuarios();
  },
  methods: {
    async carregarUsuarios() {
      this.isLoading = true;
      try {
        const response = await api.get('/usuarios');
        this.usuarios = response.data.map(u => ({
          ...u,
          times: u.times || [],
        }));
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao carregar usuários.' });
      } finally {
        this.isLoading = false;
      }
    },

    detalhesUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.mostrarDetalhes = true;
    },

    fecharDetalhes() {
      this.mostrarDetalhes = false;
    },

    async listarPermissoes() {
      const resPerm = await api.get('/permissoes');
      this.permissoes = resPerm.data;
    },

    async listarQuadras() {
      const resQuadra = await api.get('/quadra');
      this.quadras = resQuadra.data;
    },

    async listarTimes() {
      const resTimes = await api.get('/times');
      this.times = resTimes.data;
    },

    async editarUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.form.email = usuario.email;
      this.form.funcao = usuario.funcao;
      this.form.quadra = usuario.quadra?.id || '';
      this.form.timeId = usuario.time?.id || '';
      this.mostrarEditar = true;

      this.isCarregandoModal = true;
      try {
        await Promise.all([this.listarPermissoes(), this.listarQuadras(), this.listarTimes()]);
      } catch (err) {
        console.error('Erro ao carregar dados do modal:', err);
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao carregar dados do modal.' });
      } finally {
        this.isCarregandoModal = false;
      }
    },

    async salvarEdicao() {
      this.isSalvando = true;
      try {
        if (!this.form.funcao) {
          await Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Selecione uma função válida antes de salvar.' });
          return;
        }

        const permissaoSelecionada = this.permissoes.find(p => p.descricao === this.form.funcao);
        if (!permissaoSelecionada) {
          await Swal.fire({ icon: 'error', title: 'Erro', text: 'Permissão inválida.' });
          return;
        }

        if (this.form.funcao === 'USUARIO' && !this.form.timeId) {
          await Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Usuários precisam estar vinculados a um time.' });
          return;
        }

        if (this.form.funcao === 'ADMINISTRADOR' && !this.form.quadra) {
          await Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Administradores precisam estar vinculados a uma quadra.' });
          return;
        }

        const payload = {
          email: this.form.email,
          funcao: this.form.funcao,
          permissaoId: permissaoSelecionada.id,
          quadra: this.form.quadra || null,
          timeId: this.form.timeId || null
        };

        if (this.form.funcao === 'USUARIO') {
          const timeSelecionado = this.times.find(t => t.id === Number(this.form.timeId));
          const jaTemTimeNaModalidade = this.usuarioSelecionado.times?.find(
            t => t.modalidadeId === timeSelecionado.modalidadeId
          );

          if (jaTemTimeNaModalidade && jaTemTimeNaModalidade.id !== timeSelecionado.id) {
            const confirmacao = await Swal.fire({
              title: 'Trocar de time?',
              text: `Você já faz parte do time "${jaTemTimeNaModalidade.nome}" na modalidade "${timeSelecionado.modalidade.nome}". Deseja trocar para o time "${timeSelecionado.nome}"?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sim, trocar',
              cancelButtonText: 'Cancelar',
              confirmButtonColor: '#3b82f6',
              cancelButtonColor: '#7E7E7E',
            });

            if (!confirmacao.isConfirmed) return;
          }

          await api.post('/vincular', { usuarioId: this.usuarioSelecionado.id, timeId: timeSelecionado.id });
        }

        await api.put('/editar/usuario', payload);

        await Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Usuário atualizado com sucesso!' });
        this.mostrarEditar = false;
        this.carregarUsuarios();
      } catch (err) {
        console.error('Erro ao salvar edição:', err);
        await Swal.fire({ icon: 'error', title: 'Erro', text: err.response?.data?.error || 'Falha ao salvar edição do usuário.' });
      } finally {
        this.isSalvando = false;
      }
    },

    fecharEditar() {
      this.mostrarEditar = false;
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
}

.layout {
  flex: 1;
  padding: 20px;
  min-height: 100vh;
  margin-left: 180px;
  margin-right: -70px;
  position: relative;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
  margin-top: 17px;
}

.input-busca {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
}

.usuarios {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.sem-resultados {
  color: #999;
  font-style: italic;
  text-align: center;
  margin-top: 30px;
}

.card {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-conteudo {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
}

.foto {
  flex: 0 0 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.foto img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #276ef1;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.info p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  justify-content: flex-end;
}

.btn-editar,
.btn-detalhar {
  flex: 1;
  padding: 5px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-editar {
  background-color: #3b82f6;
  color: white;
}

.btn-detalhar {
  background-color: #7E7E7E;
  color: white;
}

.btn-salvarEdicao {
  background-color: #3b82f6;
  color: white;
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

.btn-fecharEdicao {
  background-color: #7E7E7E;
  color: white;
  flex: 1;
  padding: 10px 0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
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
}

.modal-content {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 800px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.btn-fechar {
  margin-top: 15px;
  background-color: #3b82f6;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.campo {
  display: flex;
  flex-direction: column;
}

.campo strong {
  color: #2d3748;
  font-size: 14px;
}

.detalhe {
  padding: 5px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  font-size: 15px;
  color: #333;
}

.topo-detalhes {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.detalhe-foto img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #276ef1;
}

.detalhe-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 5px;
}

.loader-container-centralizado {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto 80px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}


@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }

  .usuarios {
    grid-template-columns: 1fr !important;
  }

  .layout {
    margin-left: 0;
    margin-right: 0;
    padding: 15px 10px;
  }

  .input-busca {
    width: 100%;
  }

  .card {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    max-width: 450px;
  }

  .foto img {
    width: 80px;
    height: 80px;
  }

  .btn-fechar {
    width: 100%;
  }

  .detalhe-foto {
    display: none;
  }
}
</style>