<template>
  <div class="layout">
    <SideBar />
    <div class="conteudo">
      <h1 class="title">Usuarios</h1>
      <NavBarUse />
      <div class="input-busca-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" class="input-busca-icone" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Digite o nome do usuario..." v-model="busca" class="input-busca"
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
                <img :src="usuario.foto" alt="Foto do usuario" />
              </div>

              <div class="info">
                <div class="info-header">
                  <h2>{{ usuario.nome }}</h2>
                  <div class="badge-permissao badge-permissao-lista">
                    <span>{{ String(usuario.permissao?.descricao || 'Sem permissao').toUpperCase() }}</span>
                  </div>
                </div>
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
                  : 'Alterar Permissoes'
                }}

              </button>

              <button class="btn-detalhar" @click="detalhesUsuario(usuario)">Detalhar</button>
            </div>
          </div>
        </div>
        <p v-else class="sem-resultados">Nenhum usuario encontrado.</p>
      </div>
    </div>

    <!-- Modal de detalhar -->
    <div v-if="mostrarDetalhes" class="modal-overlay " @click.self="fecharDetalhes">
      <div class="modal-content modal-detalhes-user">
        <div class="modal-user-header">
          <div class="header-left">
            <h2 class="modal-title">Detalhes do Usuario</h2>
          </div>

          <button class="btn-close-x btn-close-x-user" @click="fecharDetalhes" aria-label="Fechar detalhes">
            x
          </button>
        </div>

        <div class="user-top-grid">
          <div class="user-profile">
            <div class="avatar-wrap">
              <img class="avatar-lg" :src="usuarioSelecionado.foto" />
            </div>

            <div class="user-identity">
              <div class="user-name">{{ usuarioSelecionado.nome }}</div>
              <div class="badge-permissao">
                <span>{{ permissaoSelecionadaLabel }}</span>
              </div>
            </div>
          </div>

          <div class="info-card contato-card">
            <div class="card-title">Contato</div>

            <div class="info-row">
              <div class="info-label">E-mail</div>
              <div class="info-value info-actions">
                <span class="text-clip">{{ usuarioSelecionado.email || 'Nao informado' }}</span>

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
                <span class="text-clip">{{ usuarioSelecionado.telefone || 'Nao informado' }}</span>

                <button v-if="usuarioSelecionado.telefone" class="icon-btn icon-btn-wa"
                  @click="contatoWhatsApp(usuarioSelecionado)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#25D366" viewBox="0 0 16 16">
                    <path
                      d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="user-grid">

          <div class="info-card perfil-card">
            <div class="card-title">Perfil</div>

            <div class="perfil-highlight">
              <div class="perfil-highlight-title">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="shield-icon">
                  <path d="M12 2.75l7 3.1v5.1c0 4.06-2.45 7.86-7 10.3-4.55-2.44-7-6.24-7-10.3v-5.1l7-3.1z"
                    stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                  <path d="M9.4 12.3l1.7 1.7 3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                <span>Perfil</span>
              </div>

              <div class="perfil-cadastro">
                Cadastrado desde: <strong>{{ dataCadastroSelecionado }}</strong>
              </div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 2">
              <div class="info-label">Quadra</div>
              <div class="info-value">{{ usuarioSelecionado.quadra?.nome || 'Nao vinculada' }}</div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 5">
              <div class="info-label">Times (Treinador)</div>
              <div class="info-value">{{ usuarioSelecionado.timesComoTreinador?.map(t => t.nome).join(', ') || 'Nenhum' }}</div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 3">
              <div class="info-label">Times</div>
              <div class="info-value">{{ usuarioSelecionado.times?.map(t => t.nome).join(', ') || 'Nenhum' }}</div>
            </div>

            <div class="info-row" v-if="usuarioSelecionado.permissaoId === 3 && usuarioSelecionado.jogador">
              <div class="info-label">Jogador</div>
              <div class="info-value">{{ usuarioSelecionado.jogador.nome }}</div>
            </div>
          </div>

          <div class="info-card stats-card">
            <div class="card-title">Estatisticas</div>

            <div class="stats-inline">
              <div class="stat">
                <span class="stat-label">Agendamentos no mes de {{ nomeMesAtual }}:</span>
                <span class="stat-value">{{ agendamentosNoMesSelecionado }}</span>
              </div>

              <div class="stat">
                <span class="stat-label">Ultima atividade:</span>
                <span class="stat-text">{{ ultimaAtividadeSelecionado }}</span>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-fechar-premium" @click="fecharDetalhes">
          Fechar
        </button>
      </div>
    </div>
    <div v-if="mostrarEditar" class="modal-overlay">
      <div class="modal-content modal-content-edicao">
        <div class="modal-header-edicao">
          <h2>Alterar Permissoes</h2>
          <button type="button" class="btn-close-x" @click="fecharEditar" :disabled="isSalvando"
            aria-label="Fechar modal">
            x
          </button>
        </div>

        <div v-if="isCarregandoModal" class="loader-wrapper">
          <div class="loader loader-small"></div>
        </div>

        <div v-else>
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
              <strong>Mesário:</strong>
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

    permissaoSelecionadaLabel() {
      return String(this.usuarioSelecionado?.permissao?.descricao || 'Sem permissao').toUpperCase()
    },

    dataCadastroSelecionado() {
      const valor =
        this.usuarioSelecionado?.dataCadastro ||
        this.usuarioSelecionado?.createdAt ||
        this.usuarioSelecionado?.criadoEm ||
        null
      return this.formatarDataExtenso(valor)
    },

    agendamentosNoMesSelecionado() {
      return Number(this.usuarioSelecionado?.agendamentosNoMes || 0)
    },

    nomeMesAtual() {
      const nomeMes = new Date().toLocaleDateString('pt-BR', { month: 'long' })
      return nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
    },

    ultimaAtividadeSelecionado() {
      return this.formatarDataHora(this.usuarioSelecionado?.ultimaAtividade)
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

    formatarDataExtenso(data) {
      if (!data) return 'Nao informado'

      const dataObj = new Date(data)
      if (Number.isNaN(dataObj.getTime())) return 'Nao informado'

      const base = dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })

      return base.replace(/ de ([^ ]+)/, (_, mes) => ` de ${mes.charAt(0).toUpperCase()}${mes.slice(1)}`)
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
        console.error('Erro ao carregar usuários:', error)
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
        if (this.form.permissaoId === 5) {
          this.form.timeId = usuario.timesComoTreinador?.[0]?.id || ''
        }
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
            title: 'Atenção',
            text: 'Selecione uma permissão válida.',
          })
          return
        }

        if (this.form.permissaoId === 2 && !this.form.quadra) {
          await Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'Administrador precisa estar vinculado a uma quadra.',
          })
          return
        }

        if (this.form.permissaoId === 5 && !this.form.timeId) {
          await Swal.fire({
            icon: 'warning',
            title: 'Atenção',
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

        Swal.fire('Sucesso', 'Usuário atualizado com sucesso!', 'success')
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
          title: 'Atenção',
          text: 'Usuário não possui telefone cadastrado.',
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
          title: 'Atenção',
          text: 'Usuário não possui e-mail cadastrado.',
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
  padding: 22px 24px;
  margin-left: 250px;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 4px;
  margin-bottom: 8px;
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

.input-busca-wrapper {
  position: relative;
  margin-top: 14px;
  margin-bottom: 14px;
}

.input-busca-icone {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
  pointer-events: none;
}

.input-busca {
  padding: 12px 12px 12px 42px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  width: 100%;
  margin-top: 0;
  margin-bottom: 0;
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

.input-busca-wrapper:focus-within .input-busca-icone {
  color: #3b82f6;
}

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

.usuarios {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
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
  padding: 14px;
  gap: 8px;
  min-height: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-conteudo {
  display: flex;
  flex-direction: row;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
}

.foto {
  flex: 0 0 92px;
  width: 92px;
  height: 92px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 999px;
  padding: 4px;
  background: linear-gradient(145deg, #90dcff 0%, #56b8ff 45%, #2e78f4 100%);
  box-shadow: 0 0 0 2px #ebf6ff, 0 0 0 4px rgba(86, 184, 255, 0.30), 0 6px 14px rgba(45, 116, 229, 0.24);
}

.foto img {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  border: 2px solid #d9eaff;
  background: #d7dfec;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 1px;
}

.info h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: bold;
  text-transform: uppercase;
}

.info p {
  margin: 3px 0;
  color: #666;
  font-size: 13px;
}

.botoes {
  display: flex;
  gap: 8px;
  margin-top: 6px;
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
  transition: background-color 0.2s ease, transform 0.2s ease;
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

.modal-content.modal-detalhes-user {
  width: min(840px, 90%);
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  border-radius: 14px;
  border: 1px solid #d4dced;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.24);
  padding: 12px;
}

.modal-content.modal-detalhes-user::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.modal-user-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid #dbe3f0;
  padding-bottom: 6px;
  margin-bottom: 6px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title {
  margin: 0;
  font-size: 21px;
  line-height: 32px;
  font-weight: 900;
  color: #3873d7;
  letter-spacing: 0.2px;
}

.btn-close-x-user {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.55);
  background: #fff;
  color: #3b82f6;
  cursor: pointer;
  font-size: 17px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.btn-close-x-user:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.35);
  color: #ef4444;
  transform: translateY(-1px);
}

.user-top-grid {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 8px;
  margin-top: 6px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 12px;
  background: #edf2fa;
  border: 1px solid #c9d7ee;
}

.avatar-wrap {
  width: 76px;
  height: 76px;
  border-radius: 999px;
  padding: 3px;
  background: linear-gradient(145deg, #90dcff 0%, #56b8ff 45%, #2e78f4 100%);
  box-shadow: 0 0 0 2px #ebf6ff, 0 0 0 4px rgba(86, 184, 255, 0.30), 0 6px 14px rgba(45, 116, 229, 0.24);
}

.avatar-lg {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
  border: 2px solid #d9eaff;
  background: #d7dfec;
}

.user-identity {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-weight: 900;
  font-size: 17px;
  line-height: 1.05;
  text-transform: uppercase;
  color: #202f4a;
}

.badge-permissao {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 12px;
  min-height: 30px;
  font-size: 12px;
  font-weight: 800;
  color: #3b82f6;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  white-space: nowrap;
  box-shadow: none;
}

.badge-permissao-panel {
  margin-top: 8px;
}

.badge-permissao-lista {
  margin: 0;
  width: fit-content;
  padding: 4px 9px;
  min-height: 24px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.shield-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.user-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 8px;
}

.stats-card {
  grid-column: 1 / -1;
}

.info-card {
  border-radius: 12px;
  border: 1px solid #d2dceb;
  padding: 10px;
}

.card-title {
  font-size: 12px;
  font-weight: 900;
  color: #233556;
  margin-bottom: 6px;
}

.info-row {
  display: grid;
  grid-template-columns: 124px 1fr;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 10px;
  border: 1px solid #d9e2f0;
  
  margin-bottom: 6px;
}

.perfil-card .info-row:last-child {
  margin-bottom: 0;
}

.contato-card .info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 14px;
  font-weight: 900;
  color: #253a5b;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #2e3f5b;
}

.perfil-highlight {
  border: 1px solid #d9e2f0;
  border-radius: 10px;
  padding: 7px 9px;
  margin-bottom: 6px;
}

.perfil-highlight-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #2a3f62;
  font-size: 15px;
  font-weight: 700;
  border-bottom: 1px solid #d4deee;
  padding-bottom: 5px;
}

.perfil-cadastro {
  margin-top: 6px;
  color: #3f526f;
  font-size: 14px;
}

.perfil-cadastro strong {
  color: #25395b;
  font-weight: 900;
}

.info-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.text-clip {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid #cad6e9;
  background: #ecf2fb;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #e3ebf8;
}

.stats-inline {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.stats-card .stat {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  padding: 8px 9px;
  border-radius: 10px;
  border: 1px solid #dbe3f1;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #445774;
}

.stat-value,
.stat-text {
  font-size: 14px;
  font-weight: 700;
  color: #233758;
}

.btn-fechar-premium {
  width: 100%;
  margin-top: 8px;
  padding: 9px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 15px;
  background: #f5f7fb;
  color:  #3b82f6;
  border: 2px solid #3b82f6;
}


@media (max-width: 768px) {
  .modal-content.modal-detalhes-user {
    width: calc(100% - 12px);
    max-height: calc(100vh - 20px);
    padding: 12px;
    border-radius: 18px;
  }

  .modal-user-header {
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  .modal-title {
    font-size: 24px;
    line-height: 36px;
  }

  .btn-close-x-user {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .user-profile {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .user-top-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .avatar-wrap {
    width: 94px;
    height: 94px;
    box-shadow: 0 0 0 3px #ebf6ff, 0 0 0 6px rgba(86, 184, 255, 0.35), 0 8px 20px rgba(45, 116, 229, 0.22);
  }

  .user-name {
    font-size: 24px;
  }

  .user-identity {
    min-width: 0;
  }

  .badge-permissao {
    font-size: 13px;
    padding: 8px 12px;
  }

  .badge-permissao-lista {
    margin-left: auto;
    margin-right: auto;
  }

  .user-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .info-card {
    border-radius: 16px;
    padding: 10px;
  }

  .info-row {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 10px;
    border-radius: 12px;
  }

  .info-actions {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .icon-btn {
    width: 42px;
    height: 42px;
  }

  .stats-inline {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .stats-card .stat {
    flex-wrap: wrap;
  }

  .btn-fechar-premium {
    padding: 12px;
    border-radius: 16px;
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
    padding: 12px 16px 16px 16px !important;
    width: 100%;
    box-sizing: border-box;
  }

  .title {
    font-size: 24px;
    line-height: 1.2;
    margin: 0 0 8px 0;
    padding-left: 52px;
    min-height: 42px;
    display: flex;
    align-items: center;
  }

  .usuarios {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .card {
    min-height: auto;
  }

  .card-conteudo {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    text-align: left;
  }

  .foto {
    flex: 0 0 80px;
    width: 80px;
    height: 80px;
    padding: 3px;
    box-shadow: 0 0 0 2px #ebf6ff, 0 0 0 3px rgba(86, 184, 255, 0.28), 0 5px 10px rgba(45, 116, 229, 0.2);
  }

  .foto img {
    width: 100%;
    height: 100%;
  }

  .info h2 {
    font-size: 18px;
  }

  .info-header {
    justify-content: flex-start;
    gap: 6px;
  }

  .info-header .badge-permissao-lista {
    margin: 0;
    font-size: 10px;
    padding: 2px 7px;
    min-height: 20px;
    border-radius: 9px;
  }

  .info {
    min-width: 0;
    width: 100%;
  }

  .info p {
    font-size: 13px;
  }

  .botoes {
    flex-direction: row;
    gap: 8px;
  }

  .botoes .btn-editar,
  .botoes .btn-detalhar {
    width: calc(50% - 4px);
    padding: 8px 0;
  }

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

