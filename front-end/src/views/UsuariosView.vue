<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <h1 class="title">Usuarios</h1>
      <NavBarUse />
      <input type="text" placeholder="Digite o nome do usuário..." v-model="busca" class="input-busca"
        :disabled="isLoading" />

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
                <p class="detalhe-contato">
                  <span>{{ usuario.email }}</span>
                  <svg v-if="usuario.email" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 48 48" class="icon" @click="contatoGmail(usuario)"
                    style="cursor:pointer; margin-left: 8px;">
                    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
                    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
                    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
                    <path fill="#c62828"
                      d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
                    <path fill="#fbc02d"
                      d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z" />
                  </svg>
                </p>
                <p class="detalhe-contato">
                  <span>{{ usuario.telefone || 'Não informado' }}</span>
                  <svg v-if="usuario.telefone" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#25D366"
                    class="icon" viewBox="0 0 16 16" @click="contatoWhatsApp(usuario)"
                    style="cursor:pointer; margin-left: 8px;">
                    <path
                      d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </p>
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
              <div class="detalhe detalhe-contato">
                <span>{{ usuarioSelecionado.email }}</span>
                <svg v-if="usuarioSelecionado.email" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20"
                  height="20" viewBox="0 0 48 48" @click="contatoGmail(usuarioSelecionado)" class="icon"
                  style="cursor:pointer; margin-left: 8px;">
                  <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
                  <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
                  <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
                  <path fill="#c62828"
                    d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
                  <path fill="#fbc02d"
                    d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        <div class="campo">
          <strong>Telefone:</strong>
          <div class="detalhe detalhe-contato">
            <span>{{ usuarioSelecionado.telefone || 'Não informado' }}</span>
            <svg v-if="usuarioSelecionado.telefone" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              fill="#25D366" class="icon" viewBox="0 0 16 16" @click="contatoWhatsApp(usuarioSelecionado)"
              style="cursor:pointer; margin-left: 8px;">
              <path
                d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
            </svg>
          </div>
        </div>

        <div class="campo">
          <strong>Função:</strong>
          <p class="detalhe">{{ usuarioSelecionado.funcao }}</p>
        </div>

        <div class="campo" v-if="usuarioSelecionado.funcao === 'ADMINISTRADOR'">
          <strong>Quadra:</strong>
          <p class="detalhe">{{ usuarioSelecionado.quadra?.nome.trim() || 'Nenhuma' }}</p>
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
import NavBarUse from '@/components/NavBarUser.vue';
import api from '@/axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/store';

export default {
  name: 'UsuariosView',
  components: { SideBar, NavBarUse },
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
      mostrarContato: false,
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
    abrirModalContato(usuario) {
      this.usuarioSelecionado = usuario;
      this.mostrarContato = true;
    },

    fecharModalContato() {
      this.mostrarContato = false;
    },

    contatoWhatsApp(usuario) {
      if (!usuario.telefone) {
        Swal.fire({ icon: 'warning', title: 'Atenção', text: 'Usuário não possui telefone cadastrado.' });
        return;
      }
      const numeroLimpo = usuario.telefone.replace(/\D/g, '');
      const url = `https://wa.me/${numeroLimpo}`;
      window.open(url, '_blank');
      this.fecharModalContato();
    },

    contatoGmail(usuario) {
      if (!usuario.email) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Usuário não possui e-mail cadastrado.'
        });
        return;
      }

      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${usuario.email}`;
      window.open(url, '_blank');

      this.fecharModalContato();
    },


    fecharEditar() {
      this.mostrarEditar = false;
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.conteudo {
  flex: 1;
  padding: 32px;
  margin-left: 250px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 12px;
}

.SideBar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  transition: transform 0.3s ease;
}

.input-busca {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 25px;
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
  justify-content: space-between;
}

.icones-contato {
  display: flex;
  gap: 10px;
  margin-top: -5px;
  align-self: flex-start;
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

.detalhe-contato {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icones-contato {
  display: flex;
  gap: 10px;
}

.icon:hover {
  opacity: 0.8;
  transform: scale(1.1);
  transition: 0.2s;
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

.navbar-use {
  display: flex;
  width: 435px;
}

.loader-container-centralizado {
  position: fixed;
  top: 50%;
  left: 55%;
  transform: translate(-60%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
}

.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
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
  .SideBar {
    transform: translateX(-100%);
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 250px;
    background: #fff;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
    z-index: 100;
  }

  .SideBar.open {
    transform: translateX(0);
  }

  .conteudo {
    margin-left: 0;
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
  }

  .title {
    font-size: 24px;
  }

  .usuarios {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .card-conteudo {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .foto img {
    width: 80px;
    height: 80px;
  }

  .info h2 {
    font-size: 18px;
  }

  .info p {
    font-size: 13px;
  }

  .botoes {
    flex-direction: column;
    gap: 10px;
  }

  .btn-editar,
  .btn-detalhar,
  .btn-salvarEdicao,
  .btn-fecharEdicao {
    width: 100%;
    padding: 8px 0;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .detalhe-foto img {
    width: 120px;
    height: 120px;

  }

  .detalhe-info {
    gap: 8px;
  }

  select {
    font-size: 14px;
  }
}
</style>