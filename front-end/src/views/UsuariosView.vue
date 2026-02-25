<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <h1 class="title">Usuarios</h1>
      <NavBarUse />
      <input type="text" placeholder="Digite o nome do usuÃ¡rio..." v-model="busca" class="input-busca"
        :disabled="isLoading" />

      <div v-if="isLoading" class="loader-container-centralizado">
        <div class="loader"></div>
      </div>

      <div v-else>
        <div class="usuarios" v-if="usuariosFiltrados.length > 0">
          <div class="card" v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <div class="card-conteudo">
              <div class="foto">
                <img :src="usuario.foto" alt="Foto do usuÃ¡rio" />
              </div>

              <div class="info">
                <h2>{{ usuario.nome }}</h2>
                <p>{{ usuario.permissao?.descricao }}</p>
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
                  <span>{{ usuario.telefone }}</span>
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
              <button class="btn-editar" @click="editarUsuario(usuario)">
                {{ usuarioLogado.permissaoId === 2
                  ? 'Gerenciar Usuarios'
                  : 'Alterar Permissões'
                }}

              </button>

              <button class="btn-detalhar" @click="detalhesUsuario(usuario)">Detalhar</button>
            </div>
          </div>
        </div>
        <p v-else class="sem-resultados">Nenhum usuÃ¡rio encontrado.</p>
      </div>
    </div>

    <!-- Modal de detalhar -->
    <div v-if="mostrarDetalhes" class="modal-overlay" @click.self="fecharDetalhes">
      <div class="modal-content modal-detalhes-user">
        <div class="modal-user-header">
          <div class="header-left">
            <h2 class="modal-title">Detalhes do Usuario</h2>
          </div>

          <button class="btn-close-x btn-close-x-user" @click="fecharDetalhes">
            x
          </button>
        </div>
        <div class="user-profile">
          <div class="avatar-wrap">
            <img class="avatar-lg" :src="usuarioSelecionado.foto" />
          </div>

          <div class="user-identity">
            <div class="user-name">{{ usuarioSelecionado.nome }}</div>
          </div>
        </div>

        <div class="user-grid">
          <div class="info-card">
            <div class="card-title">Contato</div>

            <div class="info-row">
              <div class="info-label">E-mail</div>
              <div class="info-value info-actions">
                <span class="text-clip">{{ usuarioSelecionado.email || 'NÃ£o informado' }}</span>

                <button v-if="usuarioSelecionado.email" class="icon-btn" @click="contatoGmail(usuarioSelecionado)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
                    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
                    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
                    <path fill="#c62828"
                      d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
                    <path fill="#fbc02d"
                      d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">Telefone</div>
              <div class="info-value info-actions">
                <span class="text-clip">{{ usuarioSelecionado.telefone || 'NÃ£o informado' }}</span>

                <button v-if="usuarioSelecionado.telefone" class="icon-btn icon-btn-wa"
                  @click="contatoWhatsApp(usuarioSelecionado)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="#25D366" viewBox="0 0 16 16">
                    <path
                      d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Perfil -->
          <div class="info-card">
            <div class="card-title">Perfil</div>

            <div class="info-row">
              <div class="info-label">Permissões</div>
              <div class="info-value">
                {{ usuarioSelecionado.permissao?.descricao }}
              </div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 2">
              <div class="info-label">Quadra</div>
              <div class="info-value">
                {{ usuarioSelecionado.quadra?.nome || 'NÃ£o vinculada' }}
              </div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 5">
              <div class="info-label">Times (Treinador)</div>
              <div class="info-value">
                {{usuarioSelecionado.timesComoTreinador?.map(t => t.nome).join(', ') || 'Nenhum'}}
              </div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 3">
              <div class="info-label">Times</div>
              <div class="info-value">
                {{usuarioSelecionado.times?.map(t => t.nome).join(', ') || 'Nenhum'}}
              </div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 3 && usuarioSelecionado.jogador">
              <div class="info-label">Jogador</div>
              <div class="info-value">{{ usuarioSelecionado.jogador.nome }}</div>
            </div>
          </div>

          <!-- EstatÃ­sticas -->
          <div class="info-card stats-card">
            <div class="card-title">Estatisticas</div>

            <div class="stats-inline">
              <div class="stat">
                <div class="stat-label">Agendamentos no mes</div>
                <div class="stat-kpi">
                  <span class="stat-value">{{ agendamentosNoMesSelecionado }}</span>
                </div>
              </div>

              <div class="stat" v-if="usuarioSelecionado.permissaoId === 5">
                <div class="stat-label">Times vinculados</div>
                <div class="stat-kpi">
                  <span class="stat-value">{{ totalTimesTreinadorSelecionado }}</span>
                </div>
              </div>

              <div class="stat">
                <div class="stat-label">Ultima atividade</div>
                <div class="stat-kpi stat-kpi-text">
                  <span class="stat-text">{{ ultimaAtividadeSelecionado }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <button class="btn-fechar btn-fechar-premium" @click="fecharDetalhes">
          Fechar
        </button>
      </div>
    </div>
    <!-- Modal de ediÃ§Ã£o -->
    <div v-if="mostrarEditar" class="modal-overlay">
      <div class="modal-content modal-content-edicao">
        <div class="modal-header-edicao">
          <h2>Alterar PermissÃµes</h2>
          <button type="button" class="btn-close-x" @click="fecharEditar" :disabled="isSalvando"
            aria-label="Fechar modal">
            x
          </button>
        </div>

        <div v-if="isCarregandoModal" class="loader-wrapper">
          <div class="loader loader-small"></div>
        </div>

        <div v-else>
          <!-- ABAS DE PERMISSÃƒO -->
          <div class="abas-container">
            <div class="aba" v-for="p in permissoesFiltradas" :key="p.id" :class="{ ativa: form.permissaoId === p.id }"
              @click="form.permissaoId = p.id">
              {{ p.id === 3 ? 'Vincular a um Time' : p.descricao }}
            </div>
          </div>

          <!-- DESENVOLVEDOR -> ADMIN -->
          <div class="campo" v-if="form.permissaoId === 2 && usuarioLogado.permissaoId === 1">
            <strong>Quadra:</strong>
            <select v-model.number="form.quadra">
              <option disabled value="">Selecione uma quadra</option>
              <option v-for="q in quadras" :key="q.id" :value="q.id">
                {{ q.nome }}
              </option>
            </select>
          </div>

          <!-- USUARIO -->
          <div class="campo" v-if="form.permissaoId === 3 || form.permissaoId === 5">
            <strong>Time:</strong>
            <select v-model.number="form.timeId" @change="carregarJogadoresTime">
              <option disabled value="">Selecione o time</option>
              <option v-for="t in times" :key="t.id" :value="t.id">
                {{ t.nome }}
              </option>
            </select>
          </div>

          <div class="campo" v-if="form.permissaoId === 3">
            <strong>Jogador:</strong>

            <div class="dropdown-custom" ref="dropdownJogador">
              <div class="dropdown-selected" @click="abrirDropdown = !abrirDropdown">
                <img v-if="jogadorSelecionadoObj?.foto" :src="jogadorSelecionadoObj.foto" class="avatar" />
                <span :class="{ 'dropdown-placeholder': !jogadorSelecionadoObj }">
                  {{ jogadorSelecionadoObj?.nome || 'Selecione o jogador' }}
                </span>
              </div>

              <div v-if="abrirDropdown" class="dropdown-list">
                <input type="text" v-model="buscaJogador" placeholder="Buscar jogador..." class="input-busca-jogador"
                  @click.stop />

                <ul>
                  <li v-for="j in jogadoresFiltrados" :key="j.id" @click.stop="selecionarJogador(j)">
                    <img :src="j.foto" class="avatar" />
                    <span>{{ j.nome }}</span>
                  </li>

                  <li v-if="jogadoresFiltrados.length === 0" class="sem-jogador">
                    Nenhum jogador encontrado
                  </li>
                </ul>
              </div>
            </div>
            <!-- MESARIO -->
            <div class="campo" v-if="form.permissaoId === 4">
              <strong>MesÃ¡rio:</strong>
            </div>

          </div>

          <div class="botoes-edicao">
            <button class="btn-salvarEdicao" @click="salvarEdicao" :disabled="isSalvando">
              <span v-if="!isSalvando">Salvar</span>
              <span v-else class="loader-pequeno"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue'
import NavBarUse from '@/components/NavBarUser.vue'
import api from '@/axios'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/store'

export default {
  name: 'UsuariosView',
  components: { SideBar, NavBarUse },

  data() {
    return {
      usuarios: [],
      busca: '',
      buscaJogador: '',
      isLoading: true,
      isCarregandoModal: false,
      isSalvando: false,
      mostrarDetalhes: false,
      mostrarEditar: false,
      usuarioSelecionado: {},
      permissoes: [],
      quadras: [],
      times: [],
      jogadores: [],
      mostrarContato: false,
      abrirDropdown: false,
      form: {
        email: '',
        permissaoId: null,
        quadra: '',
        timeId: '',
        jogadorId: null,
      },
    }
  },

  computed: {
    usuarioLogado() {
      const authStore = useAuthStore()
      return authStore.usuario || {}
    },

    jogadorSelecionadoObj() {
      return this.jogadores.find(j => j.id === this.form.jogadorId)
    },

    usuarioLogadoEmail() {
      return this.usuarioLogado.email
    },

    usuariosFiltrados() {
      return this.usuarios
        .filter(u =>
          u.nome.toLowerCase().includes(this.busca.toLowerCase())
        )
        .filter(u => u.email !== this.usuarioLogadoEmail)
        .filter(u => {
          if (this.usuarioLogado.permissaoId === 2) {
            return [3, 4, 5].includes(u.permissaoId)
          }
          return true
        })
    },

    jogadoresDisponiveis() {
      return this.jogadores.filter(j =>
        !j.vinculado || j.id === this.form.jogadorId
      )
    },

    permissoesFiltradas() {
      if (this.usuarioLogado.permissaoId === 1) {
        return this.permissoes
      }

      if (this.usuarioLogado.permissaoId === 2) {
        return this.permissoes.filter(p =>
          [3, 4, 5].includes(p.id)
        )
      }

      return []
    },

    jogadoresFiltrados() {
      return this.jogadoresDisponiveis.filter(j =>
        j.nome.toLowerCase().includes(this.buscaJogador.toLowerCase())
      )
    },

    agendamentosNoMesSelecionado() {
      return Number(this.usuarioSelecionado?.agendamentosNoMes || 0)
    },

    ultimaAtividadeSelecionado() {
      return this.formatarDataHora(this.usuarioSelecionado?.ultimaAtividade)
    },

    totalTimesTreinadorSelecionado() {
      return Array.isArray(this.usuarioSelecionado?.timesComoTreinador)
        ? this.usuarioSelecionado.timesComoTreinador.length
        : 0
    },
  },

  mounted() {
    this.carregarUsuarios()
    document.addEventListener('click', this.fecharModal)

  },

  methods: {
    fecharModal(event) {
      const dropdown = this.$refs.dropdownJogador
      if (dropdown && !dropdown.contains(event.target)) {
        this.abrirDropdown = false
      }
    },

    detalhesUsuario(usuario) {
      this.usuarioSelecionado = usuario
      this.mostrarDetalhes = true
    },

    selecionarJogador(jogador) {
      this.form.jogadorId = jogador.id
      this.buscaJogador = ''
      this.abrirDropdown = false
    },

    fecharDetalhes() {
      this.mostrarDetalhes = false
    },

    formatarDataHora(data) {
      if (!data) return 'Sem atividade'

      const dataObj = new Date(data)
      if (Number.isNaN(dataObj.getTime())) return 'Sem atividade'

      return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },

    async listarPermissoes() {
      const resPerm = await api.get('/permissoes')
      this.permissoes = resPerm.data
    },

    async listarQuadras() {
      const resQuadra = await api.get('/quadra')
      this.quadras = resQuadra.data
    },

    async listarTimes() {
      const resTimes = await api.get('/times')
      this.times = resTimes.data
    },

    async carregarUsuarios() {
      this.isLoading = true
      try {
        const response = await api.get('/usuarios')
        this.usuarios = response.data || []
      } catch (error) {
        console.error('Erro ao carregar usuÃ¡rios:', error)
        this.usuarios = []
      } finally {
        this.isLoading = false
      }
    },

    async editarUsuario(usuario) {
      this.usuarioSelecionado = usuario
      this.isCarregandoModal = true
      this.mostrarEditar = true

      try {
        await Promise.all([
          this.listarPermissoes(),
          this.listarQuadras(),
          this.listarTimes(),
        ])

        this.form.email = usuario.email
        this.form.permissaoId = Number(usuario.permissaoId)
        this.form.quadra = usuario.quadra?.id ?? ''
        this.form.timeId = usuario.times?.[0]?.id || ''
        this.form.jogadorId

        if (this.form.permissaoId === 3 && this.form.timeId) {
          await this.carregarJogadoresTime()

          if (usuario.jogador) {
            this.form.jogadorId = usuario.jogador.id
          }
        }

      } finally {
        this.isCarregandoModal = false
      }
    },

    async carregarJogadoresTime() {
      this.jogadores = []

      if (!this.form.timeId) return

      try {
        const { data } = await api.get(`/time/${this.form.timeId}`)
        let jogadoresTime = data || []
        if (this.usuarioSelecionado?.jogador) {
          const existe = jogadoresTime.some(
            j => j.id === this.usuarioSelecionado.jogador.id
          )
          if (!existe) {
            jogadoresTime.unshift(this.usuarioSelecionado.jogador)
          }
          this.form.jogadorId = this.usuarioSelecionado.jogador.id
        }

        this.jogadores = jogadoresTime

      } catch (err) {
        console.error('Erro ao carregar jogadores do time:', err)
        this.jogadores = []
      }
    },

    async salvarEdicao() {
      this.isSalvando = true
      try {
        if (!this.form.permissaoId) {
          await Swal.fire({
            icon: 'warning',
            title: 'AtenÃ§Ã£o',
            text: 'Selecione uma permissÃ£o vÃ¡lida.',
          })
          return
        }

        if (this.form.permissaoId === 2 && !this.form.quadra) {
          await Swal.fire({
            icon: 'warning',
            title: 'AtenÃ§Ã£o',
            text: 'Administrador precisa estar vinculado a uma quadra.',
          })
          return
        }

        if (this.form.permissaoId === 5 && !this.form.timeId) {
          await Swal.fire({
            icon: 'warning',
            title: 'AtenÃ§Ã£o',
            text: 'Selecione um time para o treinador.',
          })
          return
        }

        await api.put('/editar/usuario', {
          email: this.form.email,
          permissaoId: this.form.permissaoId,
          quadraId: this.form.quadra,
        })

        if (this.form.permissaoId === 3 && this.form.jogadorId) {
          await api.post('/vincular', {
            usuarioId: this.usuarioSelecionado.id,
            timeId: this.form.timeId,
            jogadorId: this.form.jogadorId,
          })
        }

        if (this.form.permissaoId === 5) {
          await api.post('/vincular/treinador', {
            usuarioId: this.usuarioSelecionado.id,
            timeId: this.form.timeId,
          })
        }

        Swal.fire('Sucesso', 'UsuÃ¡rio atualizado com sucesso!', 'success')
        this.mostrarEditar = false
        this.carregarUsuarios()
      } catch (err) {
        console.error(err)
        Swal.fire('Erro', err.response?.data?.error || err.message, 'error')
      } finally {
        this.isSalvando = false
      }
    },

    abrirModalContato(usuario) {
      this.usuarioSelecionado = usuario
      this.mostrarContato = true
    },

    fecharModalContato() {
      this.mostrarContato = false
    },

    contatoWhatsApp(usuario) {
      if (!usuario.telefone) {
        Swal.fire({
          icon: 'warning',
          title: 'AtenÃ§Ã£o',
          text: 'UsuÃ¡rio nÃ£o possui telefone cadastrado.',
        })
        return
      }

      const numeroLimpo = usuario.telefone.replace(/\D/g, '')
      window.open(`https://wa.me/${numeroLimpo}`, '_blank')
      this.fecharModalContato()
    },

    contatoGmail(usuario) {
      if (!usuario.email) {
        Swal.fire({
          icon: 'warning',
          title: 'AtenÃ§Ã£o',
          text: 'UsuÃ¡rio nÃ£o possui e-mail cadastrado.',
        })
        return
      }

      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${usuario.email}`,
        '_blank'
      )

      this.fecharModalContato()
    },

    fecharEditar() {
      this.mostrarEditar = false
    },
  },
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

/* =========================
   INPUTS MAIS "PREMIUM"
   - borda suave
   - foco azul + box-shadow leve
   - altura consistente
   ========================= */

/* Busca */
.input-busca {
  padding: 12px 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 25px;
  font-size: 14px;
  color: #0f172a;
  background: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.input-busca:hover {
  border-color: rgba(59, 130, 246, 0.55);
}

.input-busca:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

/* Selects (globais) */
select {
  padding: 12px 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  font-size: 14px;
  margin-top: 5px;
  background: #fff;
  color: #0f172a;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

select:hover {
  border-color: rgba(59, 130, 246, 0.55);
}

select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

/* Dropdown custom */
.dropdown-selected {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  background-color: #fff;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  min-height: 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}

.dropdown-placeholder {
  color: #0f172a;
  font-weight: 400;
}

.dropdown-selected:hover {
  border-color: rgba(59, 130, 246, 0.55);
}

.dropdown-selected:active {
  transform: translateY(0);
}

.input-busca-jogador {
  width: 100%;
  padding: 10px 10px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input-busca-jogador:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

/* ========================= */

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

.botoes-edicao {
  display: flex;
  margin-top: 20px;
}

.botoes-edicao .btn-salvarEdicao {
  width: 100%;
}

.detalhe-contato {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  width: 900px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.modal-content.modal-content-edicao {
  border-radius: 16px;
}

.modal-header-edicao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  margin-bottom: 14px;
}

.modal-header-edicao h2 {
  margin: 0;
}

.btn-close-x {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(59, 130, 246, 0.55);
  border-radius: 999px;
  background: #fff;
  color: #3b82f6;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.btn-close-x:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
  transform: translateY(-1px);
}

.btn-close-x:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

.dropdown-custom {
  position: relative;
  cursor: pointer;
  margin-top: 5px;
}

.dropdown-list {
  position: absolute;
  width: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
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

.abas-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  margin-bottom: 14px;
}

.aba {
  flex: 1 1 140px;
  text-align: center;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  background: transparent;
  font-weight: 800;
  color: #334155;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, color 0.2s ease;
  user-select: none;
  border: 1px solid transparent;
}

.aba:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}

.aba.ativa {
  background: #3b82f6;
  color: #fff;
  box-shadow: 0 12px 22px rgba(37, 99, 235, 0.22);
  border-color: rgba(255, 255, 255, 0.18);
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

.loader-pequeno {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #fff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-block;
  animation: spin 1s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* =========================
   MODAL MASTER DETALHES USER
   ========================= */

/* =========================
   MODAL - DETALHES USUÁRIO (MASTER)
   ========================= */

.modal-content.modal-detalhes-user {
  width: min(980px, calc(100% - 24px));
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
  padding: 16px;
}

.modal-content.modal-detalhes-user::-webkit-scrollbar {
  width: 0;
  height: 0;
}

/* header */
.modal-user-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.header-left {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.modal-title {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  color: #3b82f6;
}

.badge-permissao {
  display: inline-flex;
  align-items: center;
  line-height: 1;
  padding: 7px 12px;
  min-height: 30px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  color: #2563eb;
  background: #dbeafe;
  white-space: nowrap;
  transform: translateY(-6px);
}

/* close */
.btn-close-x-user {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(37, 99, 235, 0.4);
  background: #fff;
  color: #2563eb;
  cursor: pointer;
  font-size: 22px;
}

/* perfil */
.user-profile {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 14px;
  background: #f8fbff;
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.avatar-wrap {
  width: 76px;
  height: 76px;
  border-radius: 999px;
  padding: 3px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.avatar-lg {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}

.user-name {
  font-weight: 900;
  font-size: 18px;
}

.user-sub {
  font-size: 13px;
  color: #64748b;
  overflow-wrap: anywhere;
}

/* grid */
.user-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.stats-card {
  grid-column: 1 / -1;
}

.info-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 12px;
}

.card-title {
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 8px;
}

/* rows */
.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: #f8fafc;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 900;
}

.info-value {
  font-weight: 600;
}

/* actions */
.info-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
}

.text-clip {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: #fff;
  cursor: pointer;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: rgba(59, 130, 246, 0.08);
}

/* stats */
.stats-inline {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 8px;
}

.stats-card .stat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 12px;
  background: #f8fbff;
  min-width: 0;
}

.stat-label {
  font-weight: 500;
  color: #475569;
}

.stat-kpi {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
  color: #1e3a8a;
}

.stat-kpi-text {
  line-height: 1.2;
}

.stat-text {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  text-align: right;
}

/* footer */
.btn-fechar-premium {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 999px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
}

@media (max-width: 768px) {
  .modal-content.modal-detalhes-user {
    width: calc(100% - 12px);
    max-height: calc(100vh - 36px);
    padding: 12px 10px;
    border-radius: 12px;
  }

  .modal-user-header {
    align-items: flex-start;
    gap: 10px;
  }

  .header-left {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .modal-title {
    font-size: 24px;
  }

  .user-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 8px;
    gap: 8px;
  }

  .user-grid {
    grid-template-columns: 1fr;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .info-actions {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 8px;
  }

  .stats-card .stat {
    gap: 8px;
    padding: 8px;
  }

  .stat-kpi {
    align-items: flex-start;
  }

  .stat-text {
    text-align: left;
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
            padding: 80px 16px 16px 16px; 
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
  .btn-salvarEdicao {
    width: 100%;
    padding: 8px 0;
  }

  .modal-content {
    width: 95%;
    padding: 20px;
  }

  .modal-header-edicao {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }

  .abas-container {
    gap: 8px;
    padding: 8px;
  }

  .aba {
    flex: 1 1 48%;
    font-size: 13px;
    padding: 10px 8px;
  }

  select {
    font-size: 14px;
  }
}
</style>

