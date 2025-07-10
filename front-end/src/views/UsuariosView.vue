<template>
  <div class="container">
    <SideBar />
    <div class="layout">
      <div class="header">
        <h1 class="title">Usuários</h1>
        <input type="text" placeholder="Digite o nome do usuário..." v-model="busca" class="input-busca"
          :disabled="isLoading" />
      </div>

      <div v-if="isLoading" class="loader"></div>

      <div v-else>
        <div class="usuarios" v-if="usuariosFiltrados.length > 0">
          <div class="card" v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <div class="foto">
              <img :src="usuario.foto" alt="Foto do usuário" />
            </div>
            <div class="info">
              <h2>{{ usuario.nome }}</h2>
              <p>{{ usuario.funcao }}</p>
              <p>{{ usuario.email }}</p>

              <div class="botoes">
                <button class="btn-editar" @click="editarUsuario(usuario)">Editar</button>
                <button class="btn-detalhar" @click="detalhesUsuario(usuario)">Detalhar</button>
              </div>
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

        <div class="campo">
          <strong>Quadra:</strong>
          <p class="detalhe">{{ usuarioSelecionado.quadra || 'Nenhuma' }}</p>
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

        <div class="campo">
          <strong>Função:</strong>
          <select v-model="form.funcao">
            <option disabled value="">Selecione a função</option>
            <option v-for="p in permissoes" :key="p.id" :value="p.descricao">
              {{ p.descricao }}
            </option>
          </select>
        </div>

        <!-- Não mostrar quadra para DESENVOLVEDOR_DE_SISTEMA e USUARIO -->
        <div class="campo" v-if="form.funcao !== 'DESENVOLVEDOR_DE_SISTEMA' && form.funcao !== 'USUARIO'">
          <strong>Quadra:</strong>
          <select v-model="form.quadra">
            <option disabled value="">Selecione a quadra</option>
            <option v-for="q in quadras" :key="q.id" :value="q.nome">
              {{ q.nome }}
            </option>
          </select>
        </div>

        <div class="botoes" style="margin-top: 20px;">
          <button class="btn-salvarEdicao" @click="salvarEdicao">Salvar</button>
          <button class="btn-fecharEdicao" @click="fecharEditar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'UsuariosView',
  components: {
    SideBar,
  },
  data() {
    return {
      usuarios: [],
      busca: '',
      isLoading: true,
      mostrarDetalhes: false,
      mostrarEditar: false,
      usuarioSelecionado: {},
      permissoes: [],
      quadras: [],
      form: {
        email: '',
        funcao: '',
        quadra: '',
      },
    };
  },
  computed: {
    usuariosFiltrados() {
      return this.usuarios.filter((u) =>
        u.nome.toLowerCase().includes(this.busca.toLowerCase())
      );
    },
  },
  mounted() {
    this.carregarUsuarios();
  },
  methods: {
    async carregarUsuarios() {
      this.isLoading = true;
      try {
        const response = await axios.get('https://quadra-livre-backend.onrender.com/usuarios');
        this.usuarios = response.data;
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao carregar usuários.',
        });
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
      try {
        const resPerm = await axios.get('https://quadra-livre-backend.onrender.com/permissoes');
        this.permissoes = resPerm.data;
      } catch (err) {
        console.error('Erro ao carregar permissões', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao carregar permissões.',
        });
      }
    },

    async listarQuadras() {
      try {
        const resQuadra = await axios.get('https://quadra-livre-backend.onrender.com/quadra');
        this.quadras = resQuadra.data;
      } catch (err) {
        console.error('Erro ao carregar quadras', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao carregar quadras.',
        });
      }
    },

    async editarUsuario(usuario) {
      this.usuarioSelecionado = usuario;
      this.form.email = usuario.email;
      this.form.funcao = '';
      this.form.quadra = '';
      this.mostrarEditar = true;

      await Promise.all([this.listarPermissoes(), this.listarQuadras()]);
    },
    async salvarEdicao() {
      try {
        if (!this.form.funcao) {
          Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'Selecione uma função válida antes de salvar.',
          });
          return;
        }

        await axios.put('https://quadra-livre-backend.onrender.com/editar/usuario', {
          email: this.form.email,
          funcao: this.form.funcao,
          quadra: this.form.quadra,
        });

        Swal.fire({
          icon: 'success',
          title: 'Sucesso',
          text: 'Usuário atualizado com sucesso!',
        });

        this.mostrarEditar = false;
        this.carregarUsuarios();
      } catch (err) {
        console.error('Erro ao salvar edição:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Falha ao salvar edição do usuário.',
        });
      }
    },
    fecharEditar() {
      this.mostrarEditar = false;
    },
  },
};
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
  font-size: 28px;
  color: #276ef1;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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
  flex-direction: row;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  gap: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
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

.info b {
  color: #333;
}

.botoes {
  display: flex;
  gap: 10px;
  margin-top: 10px;
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

.btn-cancel {
  background-color: #7E7E7E;
  flex: 1;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
}


.btn-save {
  background-color: #3b82f6;
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  color: white;
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
