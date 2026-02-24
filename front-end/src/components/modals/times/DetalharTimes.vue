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
                <th>Posicao</th>
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

                    <span class="select-arrow">v</span>
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
  <div v-if="modalGerenciarJogadoresAberto" class="modal-overlay-gerenciar" @click.self="fecharModalGerenciarJogadores">
    <div class="modal-content-gerenciar">
      <div class="modal-header-gerenciar">
        <h2>Gerenciar Jogadores - {{ formatarInicialMaiuscula(time?.nome) }}</h2>
        <button type="button" class="btn-close-x-gerenciar" @click="fecharModalGerenciarJogadores">x</button>
      </div>

      <div class="abas-container-gerenciar">
        <div class="aba-gerenciar" :class="{ ativa: gerenciarAcaoLocal === 'adicionarExistente' }"
          @click="gerenciarAcaoLocal = 'adicionarExistente'">
          Jogador Existente
        </div>
        <div class="aba-gerenciar" :class="{ ativa: gerenciarAcaoLocal === 'adicionar' }"
          @click="gerenciarAcaoLocal = 'adicionar'">
          Adicionar Novo
        </div>
        <div class="aba-gerenciar" :class="{ ativa: gerenciarAcaoLocal === 'adicionarMassa' }"
          @click="gerenciarAcaoLocal = 'adicionarMassa'">
          Adicionar em massa
        </div>
        <div class="aba-gerenciar" :class="{ ativa: gerenciarAcaoLocal === 'remover' }"
          @click="gerenciarAcaoLocal = 'remover'">
          Remover
        </div>
      </div>

      <div v-if="gerenciarAcaoLocal" class="conteudo-aba-gerenciar">
        <div v-if="gerenciarAcaoLocal === 'adicionar'" class="form-group-gerenciar">
          <label for="nomeJogadorGerenciar">Nome do jogador:</label>
          <input id="nomeJogadorGerenciar" v-model="gerenciarNomeJogador" type="text" placeholder="Digite o nome"
            class="dropdown-gerenciar" />

          <label for="numeroJogadorGerenciar">Numero do jogador:</label>
          <input id="numeroJogadorGerenciar" v-model.number="gerenciarNumeroJogador" type="number" min="1" step="1"
            placeholder="Digite o numero da camisa" class="dropdown-gerenciar" />

          <label>Vincular usuario</label>
          <div class="dropdown-custom-gerenciar">
            <div class="dropdown-selected-gerenciar" @click="gerenciarAbrirDropdownUsuarios = !gerenciarAbrirDropdownUsuarios">
              <img v-if="gerenciarUsuarioSelecionado?.foto" :src="gerenciarUsuarioSelecionado.foto" class="avatar" />
              <span>
                {{ gerenciarUsuarioSelecionado?.nome || 'Selecione um usuario (opcional)' }}
              </span>
            </div>

            <div v-if="gerenciarAbrirDropdownUsuarios" class="dropdown-list-gerenciar">
              <input v-model="gerenciarBuscaUsuario" type="text" placeholder="Buscar usuario..."
                class="input-busca-jogador-gerenciar" @click.stop />

              <ul>
                <li v-for="u in gerenciarUsuariosFiltradosComBusca" :key="u.id" @click.stop="selecionarUsuario(u)">
                  <img :src="u.foto" class="avatar" />
                  <span>{{ u.nome }}</span>
                </li>

                <li v-if="gerenciarUsuariosFiltradosComBusca.length === 0" class="sem-jogador-gerenciar">
                  Nenhum usuario encontrado
                </li>
              </ul>
            </div>
          </div>

          <label for="fotoJogadorGerenciar">Foto (opcional):</label>
          <input id="fotoJogadorGerenciar" type="file" @change="handleImagemUpload" accept=".jpg,.jpeg,.png"
            class="dropdown-gerenciar" />
        </div>

        <div v-if="gerenciarAcaoLocal === 'adicionarExistente'" class="form-group-gerenciar">
          <label>Adicionar jogador existente:</label>
          <div class="dropdown-custom-gerenciar">
            <div class="dropdown-selected-gerenciar" @click="gerenciarAbrirDropdownJogadores = !gerenciarAbrirDropdownJogadores">
              <img v-if="gerenciarJogadorSelecionadoExistente?.foto" :src="gerenciarJogadorSelecionadoExistente.foto"
                class="avatar" />
              <span v-if="gerenciarJogadoresSelecionadosExistentes.length === 0">
                Selecione jogador(es) existente(s)
              </span>
              <span v-else>
                {{ gerenciarJogadoresSelecionadosExistentes.length }} jogador(es) selecionado(s)
              </span>
            </div>

            <ul v-if="gerenciarAbrirDropdownJogadores" class="dropdown-list-gerenciar">
              <input v-model="gerenciarBuscaJogador" type="text" placeholder="Buscar por nome ou numero..."
                class="input-busca-jogador-gerenciar" @click.stop />

              <li v-if="gerenciarJogadoresExistentesFiltradosComBusca.length === 0" class="sem-jogador-gerenciar">
                Nenhum jogador disponivel
              </li>

              <li v-for="j in gerenciarJogadoresExistentesFiltradosComBusca" :key="j.id"
                @click.stop="toggleJogadorExistente(j)" :class="{ selecionado: isJogadorSelecionado(j.id) }">
                <img :src="j.foto" class="avatar" />
                <span v-if="temNumeroJogador(j.numero)" class="numero-jogador">#{{ j.numero }}</span>
                <span>
                  {{ formatarInicialMaiuscula(j.nome) }}
                  <span v-if="j.times && j.times.length">
                    ({{ formatarInicialMaiuscula(j.times[0].nome) }})
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div v-if="gerenciarAcaoLocal === 'remover'" class="form-group-gerenciar">
          <label>Escolha o(s) jogador(es):</label>
          <div class="dropdown-custom-gerenciar">
            <div class="dropdown-selected-gerenciar" @click="gerenciarAbrirDropdownRemover = !gerenciarAbrirDropdownRemover">
              <span v-if="gerenciarJogadoresSelecionadosRemover.length === 0">Selecione jogador(es)</span>
              <span v-else>
                {{ gerenciarJogadoresSelecionadosRemover.length }} jogador(es) selecionado(s)
              </span>
            </div>

            <div v-if="gerenciarAbrirDropdownRemover" class="dropdown-list-gerenciar">
              <input v-model="gerenciarBuscaJogadorRemover" type="text" placeholder="Buscar por nome ou numero..."
                class="input-busca-jogador-gerenciar" @click.stop />

              <ul>
                <li v-for="j in gerenciarJogadoresFiltradosRemover" :key="j.id" @click.stop="toggleJogadorRemover(j)"
                  :class="{ selecionado: isJogadorSelecionadoRemover(j.id) }">
                  <img :src="j.foto" class="avatar" />
                  <span v-if="temNumeroJogador(j.numero)" class="numero-jogador">#{{ j.numero }}</span>
                  <span>{{ formatarInicialMaiuscula(j.nome) }}</span>
                </li>

                <li v-if="gerenciarJogadoresFiltradosRemover.length === 0" class="sem-jogador-gerenciar">
                  Nenhum jogador encontrado
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-if="gerenciarAcaoLocal === 'adicionarMassa'" class="form-group-gerenciar">
        <label>Adicionar jogadores em massa:</label>
        <textarea v-model="gerenciarNomesJogadoresMassa" class="dropdown-gerenciar" rows="4"
          placeholder="Ex:\nSamuel 40, Pedro 30\nJoao 10"></textarea>
        <small style="color:#666">
          Informe no formato nome numero, separado por virgula ou quebra de linha
        </small>
      </div>

      <div class="botoes-gerenciar">
        <button v-if="gerenciarAcaoLocal" class="btn-save1-gerenciar" @click="confirmarGerenciar"
          :disabled="(gerenciarAcaoLocal === 'adicionar' && (!gerenciarNomeJogador || !gerenciarNumeroJogadorValido)) ||
            (gerenciarAcaoLocal === 'adicionarExistente' && gerenciarJogadoresSelecionadosExistentes.length === 0) ||
            (gerenciarAcaoLocal === 'remover' && gerenciarJogadoresSelecionadosRemover.length === 0) ||
            (gerenciarAcaoLocal === 'adicionarMassa' && !gerenciarNomesJogadoresMassa)">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios';
import Swal from 'sweetalert2';

export default {
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
      modalGerenciarJogadoresAberto: false,
      gerenciarAcaoLocal: 'adicionarExistente',
      gerenciarNomeJogador: '',
      gerenciarNumeroJogador: null,
      gerenciarBuscaJogador: '',
      gerenciarBuscaUsuario: '',
      gerenciarArquivoFoto: null,
      gerenciarJogadorSelecionado: null,
      gerenciarJogadorSelecionadoExistente: null,
      gerenciarUsuariosDisponiveis: [],
      gerenciarUsuarioSelecionado: null,
      gerenciarAbrirDropdownUsuarios: false,
      gerenciarJogadores: [],
      gerenciarJogadoresSelecionadosExistentes: [],
      gerenciarJogadoresSelecionadosRemover: [],
      gerenciarAbrirDropdownJogadores: false,
      gerenciarAbrirDropdownRemover: false,
      gerenciarBuscaJogadorRemover: '',
      gerenciarNomesJogadoresMassa: ''
    };
  },
  watch: {
    aberto(novo) {
      if (novo && this.time?.id) {
        console.log('Modal aberto, modalidade selecionada:', this.modalidadeSelecionada);
        this.carregarFuncoes();
        this.carregarJogadores(this.time.id);
      } else {
        this.fecharModalGerenciarJogadores();
      }
    },
    modalidadeSelecionada(novoValor) {
      console.log('modalidadeSelecionada mudou no filho:', novoValor);
      if (this.aberto) {
        this.carregarFuncoes();
      }
    },
    time(novo) {
      if (novo?.id && this.modalGerenciarJogadoresAberto) {
        this.carregarJogadoresGerenciar();
        this.carregarUsuariosDisponiveisGerenciar();
      }
    }
  },
  computed: {
    modalidadeSelecionadaId() {
      return this.modalidadeSelecionada;
    },
    gerenciarNumeroJogadorValido() {
      return this.normalizarNumeroJogador(this.gerenciarNumeroJogador) !== null;
    },
    gerenciarJogadoresExistentesFiltrados() {
      if (!this.time) return [];
      const timeIdAtual = this.time.id;
      return this.gerenciarJogadores.filter(j => !j.times.some(t => t.id === timeIdAtual));
    },
    gerenciarJogadoresExistentesFiltradosComBusca() {
      return this.gerenciarJogadoresExistentesFiltrados.filter(j =>
        this.jogadorCombinaBusca(j, this.gerenciarBuscaJogador)
      );
    },
    gerenciarUsuariosFiltradosComBusca() {
      return this.gerenciarUsuariosDisponiveis
        .filter(u => u.permissaoId !== 1)
        .filter(u => u.nome.toLowerCase().includes(this.gerenciarBuscaUsuario.toLowerCase()));
    },
    gerenciarJogadoresFiltradosRemover() {
      if (!this.gerenciarJogadores || !this.time) return [];
      const timeIdAtual = this.time.id;
      return this.gerenciarJogadores
        .filter(j => j.times.some(t => t.id === timeIdAtual))
        .filter(j => this.jogadorCombinaBusca(j, this.gerenciarBuscaJogadorRemover));
    }
  },
  methods: {
    resetarModalGerenciarEstado() {
      this.gerenciarAcaoLocal = 'adicionarExistente';
      this.gerenciarNomeJogador = '';
      this.gerenciarNumeroJogador = null;
      this.gerenciarBuscaJogador = '';
      this.gerenciarBuscaUsuario = '';
      this.gerenciarArquivoFoto = null;
      this.gerenciarJogadorSelecionado = null;
      this.gerenciarJogadorSelecionadoExistente = null;
      this.gerenciarUsuarioSelecionado = null;
      this.gerenciarJogadoresSelecionadosExistentes = [];
      this.gerenciarJogadoresSelecionadosRemover = [];
      this.gerenciarAbrirDropdownUsuarios = false;
      this.gerenciarAbrirDropdownJogadores = false;
      this.gerenciarAbrirDropdownRemover = false;
      this.gerenciarBuscaJogadorRemover = '';
      this.gerenciarNomesJogadoresMassa = '';
    },
    abrirModalGerenciarJogadores() {
      if (!this.time?.id) return;
      this.resetarModalGerenciarEstado();
      this.modalGerenciarJogadoresAberto = true;
      this.carregarJogadoresGerenciar();
      this.carregarUsuariosDisponiveisGerenciar();
    },
    fecharModalGerenciarJogadores() {
      this.modalGerenciarJogadoresAberto = false;
      this.resetarModalGerenciarEstado();
    },
    formatarInicialMaiuscula(texto) {
      if (!texto) return '';
      return String(texto).replace(/(^|\s)\S/g, letra => letra.toUpperCase());
    },
    normalizarNumeroJogador(valor) {
      const numero = Number(valor);
      if (!Number.isInteger(numero) || numero <= 0) return null;
      return numero;
    },
    temNumeroJogador(numero) {
      return this.normalizarNumeroJogador(numero) !== null;
    },
    jogadorCombinaBusca(jogador, busca) {
      const termo = String(busca || '').trim().toLowerCase();
      if (!termo) return true;
      const nome = String(jogador?.nome || '').toLowerCase();
      const numero = String(jogador?.numero ?? '').toLowerCase();
      return nome.includes(termo) || numero.includes(termo);
    },
    normalizarLinhaJogadorMassa(linha) {
      const texto = String(linha || '').trim();
      if (!texto) return null;

      const nomeComNumeroNoFim = texto.match(/^(.+?)\s+(\d+)$/);
      if (nomeComNumeroNoFim) {
        const nome = nomeComNumeroNoFim[1].trim();
        const numero = this.normalizarNumeroJogador(nomeComNumeroNoFim[2]);
        if (!numero || !nome) return null;
        return { nome, numero };
      }

      const numeroNoInicio = texto.match(/^(\d+)\s*[-:;|,]\s*(.+)$/);
      if (numeroNoInicio) {
        const numero = this.normalizarNumeroJogador(numeroNoInicio[1]);
        const nome = numeroNoInicio[2].trim();
        if (!numero || !nome) return null;
        return { nome, numero };
      }

      const numeroNoFim = texto.match(/^(.+?)\s*[-:;|,]\s*(\d+)$/);
      if (numeroNoFim) {
        const nome = numeroNoFim[1].trim();
        const numero = this.normalizarNumeroJogador(numeroNoFim[2]);
        if (!numero || !nome) return null;
        return { nome, numero };
      }

      return null;
    },
    handleImagemUpload(event) {
      const file = event.target.files[0];
      if (file) this.gerenciarArquivoFoto = file;
    },
    selecionarUsuario(usuario) {
      this.gerenciarUsuarioSelecionado = usuario;
      this.gerenciarBuscaUsuario = '';
      this.gerenciarAbrirDropdownUsuarios = false;
    },
    toggleJogadorExistente(jogador) {
      const index = this.gerenciarJogadoresSelecionadosExistentes.findIndex(j => j.id === jogador.id);
      if (index !== -1) {
        this.gerenciarJogadoresSelecionadosExistentes.splice(index, 1);
      } else {
        this.gerenciarJogadoresSelecionadosExistentes.push(jogador);
        this.gerenciarJogadorSelecionadoExistente = jogador;
      }
    },
    isJogadorSelecionado(id) {
      return this.gerenciarJogadoresSelecionadosExistentes.some(j => j.id === id);
    },
    toggleJogadorRemover(jogador) {
      const index = this.gerenciarJogadoresSelecionadosRemover.findIndex(j => j.id === jogador.id);
      if (index !== -1) {
        this.gerenciarJogadoresSelecionadosRemover.splice(index, 1);
      } else {
        this.gerenciarJogadoresSelecionadosRemover.push(jogador);
      }
    },
    isJogadorSelecionadoRemover(id) {
      return this.gerenciarJogadoresSelecionadosRemover.some(j => j.id === id);
    },
    async carregarJogadoresGerenciar() {
      if (!this.time?.modalidadeId) return;
      try {
        const res = await api.get(`/jogadores/${this.time.modalidadeId}`);
        this.gerenciarJogadores = res.data || [];
      } catch (err) {
        console.error(err);
        this.gerenciarJogadores = [];
      }
    },
    async carregarUsuariosDisponiveisGerenciar() {
      try {
        const res = await api.get('/usuarios');
        this.gerenciarUsuariosDisponiveis = res.data.filter(
          u => (!u.jogador && (!u.times || u.times.length === 0)) && u.permissaoId === 3
        );
      } catch (err) {
        console.error(err);
        this.gerenciarUsuariosDisponiveis = [];
      }
    },
    async uploadImagemGerenciar() {
      if (!this.gerenciarArquivoFoto) return null;
      const formData = new FormData();
      formData.append('file', this.gerenciarArquivoFoto);
      const uploadResponse = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return uploadResponse.data.fileUrl || uploadResponse.data.url;
    },
    async adicionarJogadorGerenciar() {
      const nome = this.gerenciarNomeJogador.trim().toLowerCase();
      const numeroJogador = this.normalizarNumeroJogador(this.gerenciarNumeroJogador);
      const jaExiste = this.gerenciarJogadores.some(j => String(j.nome || '').toLowerCase() === nome);

      if (jaExiste) {
        Swal.fire('Atenção', 'Já existe um jogador com esse nome nesta modalidade', 'warning');
        return;
      }

      if (!numeroJogador) {
        Swal.fire('Atenção', 'Informe um numero valido para o jogador', 'warning');
        return;
      }

      const FOTO_PADRAO = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';
      const urlImagem = await this.uploadImagemGerenciar();

      await api.post('/adicionar', {
        nome: this.gerenciarNomeJogador.trim(),
        numero: numeroJogador,
        foto: urlImagem || FOTO_PADRAO,
        timeId: this.time.id,
        usuarioId: this.gerenciarUsuarioSelecionado?.id
      });

      Swal.fire('Sucesso', 'Jogador adicionado!', 'success');
    },
    async adicionarJogadorExistenteGerenciar() {
      if (this.gerenciarJogadoresSelecionadosExistentes.length === 0) return;
      for (const jogador of this.gerenciarJogadoresSelecionadosExistentes) {
        await api.post('/mover', {
          jogadorId: jogador.id,
          novoTimeId: this.time.id
        });
      }

      Swal.fire(
        'Sucesso',
        `${this.gerenciarJogadoresSelecionadosExistentes.length} jogador(es) adicionados ao time!`,
        'success'
      );
    },
    async adicionarJogadoresEmMassaGerenciar() {
      const entradasDigitadas = this.gerenciarNomesJogadoresMassa
        .split(/[\n,]+/)
        .map(entrada => entrada.trim())
        .filter(entrada => entrada.length > 0);

      if (entradasDigitadas.length === 0) {
        Swal.fire('Atenção', 'Informe ao menos um jogador no formato nome numero', 'warning');
        return;
      }

      const invalidas = [];
      const jogadoresDigitados = [];
      for (const entrada of entradasDigitadas) {
        const jogador = this.normalizarLinhaJogadorMassa(entrada);
        if (!jogador) {
          invalidas.push(entrada);
          continue;
        }
        jogadoresDigitados.push(jogador);
      }

      if (invalidas.length > 0) {
        Swal.fire(
          'Atenção',
          `Formato inválido em ${invalidas.length} item(ns).\nUse: nome numero`,
          'warning'
        );
        return;
      }

      const jogadoresPorNome = new Map(
        this.gerenciarJogadores.map(j => [String(j.nome || '').toLowerCase(), j])
      );
      const nomesExistentes = [];
      const jogadoresParaAdicionar = [];
      const nomesNoLote = new Set();
      const nomesDuplicadosNoLote = [];

      for (const jogador of jogadoresDigitados) {
        const nomeLower = jogador.nome.toLowerCase();
        if (nomesNoLote.has(nomeLower)) {
          nomesDuplicadosNoLote.push(jogador.nome);
          continue;
        }
        nomesNoLote.add(nomeLower);

        if (jogadoresPorNome.has(nomeLower)) {
          nomesExistentes.push(jogadoresPorNome.get(nomeLower).nome);
        } else {
          jogadoresParaAdicionar.push(jogador);
        }
      }

      if (jogadoresParaAdicionar.length === 0) {
        let mensagem = 'Todos os jogadores informados já existem.';
        if (nomesExistentes.length > 0) {
          mensagem += `\n\nJa existentes:\n${nomesExistentes.join(', ')}`;
        }
        if (nomesDuplicadosNoLote.length > 0) {
          mensagem += `\n\nDuplicados no lote:\n${nomesDuplicadosNoLote.join(', ')}`;
        }
        Swal.fire('Atenção', mensagem, 'warning');
        return;
      }

      const FOTO_PADRAO = 'https://pub-8c7959cad5c04469b16f4b0706a2e931.r2.dev/uploads/Imagem%20padrao.png';
      for (const jogador of jogadoresParaAdicionar) {
        await api.post('/adicionar', {
          nome: jogador.nome,
          numero: jogador.numero,
          foto: FOTO_PADRAO,
          timeId: this.time.id
        });
      }

      let mensagem = `${jogadoresParaAdicionar.length} jogador(es) adicionados com sucesso!`;
      if (nomesExistentes.length > 0) {
        mensagem += `\n\nJa existentes:\n${nomesExistentes.join(', ')}`;
      }
      if (nomesDuplicadosNoLote.length > 0) {
        mensagem += `\n\nDuplicados no lote:\n${nomesDuplicadosNoLote.join(', ')}`;
      }
      Swal.fire('Concluido', mensagem, 'success');
    },
    async removerJogadorGerenciar() {
      if (this.gerenciarJogadoresSelecionadosRemover.length === 0) return;
      for (const jogador of this.gerenciarJogadoresSelecionadosRemover) {
        await api.delete(`/remover/${this.time.id}/${jogador.id}`);
      }

      Swal.fire('Sucesso', `${this.gerenciarJogadoresSelecionadosRemover.length} jogador(es) removido(s)!`, 'success');
    },
    handleErrorGerenciar(err) {
      console.error(err);
      const mensagem = err.response?.data?.message;
      Swal.fire('Erro', mensagem, 'error');
    },
    async confirmarGerenciar() {
      try {
        if (this.gerenciarAcaoLocal === 'adicionar') await this.adicionarJogadorGerenciar();
        else if (this.gerenciarAcaoLocal === 'adicionarExistente') await this.adicionarJogadorExistenteGerenciar();
        else if (this.gerenciarAcaoLocal === 'remover') await this.removerJogadorGerenciar();
        else if (this.gerenciarAcaoLocal === 'adicionarMassa') await this.adicionarJogadoresEmMassaGerenciar();

        this.$emit('atualizar-lista');
        if (this.time?.id) {
          await this.carregarJogadores(this.time.id);
        }
        this.fecharModalGerenciarJogadores();
      } catch (err) {
        this.handleErrorGerenciar(err);
      }
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
            funcaoId
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

.modal-overlay-gerenciar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.modal-content-gerenciar {
  background: white;
  padding: 30px 40px;
  border-radius: 10px;
  width: 900px;
  max-width: 90%;
}

.modal-header-gerenciar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-header-gerenciar h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.btn-close-x-gerenciar {
  width: 34px;
  height: 34px;
  border: 1px solid #3b82f6;
  border-radius: 999px;
  background: #fff;
  color: #3b82f6;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  flex: 0 0 auto;
}

.dropdown-gerenciar {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.botoes-gerenciar {
  display: flex;
  gap: 10px;
  margin-top: 1rem;
}

.btn-save1-gerenciar {
  flex: 1;
  padding: 10px 0;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 16px;
  background-color: #3b82f6;
}

.dropdown-custom-gerenciar {
  position: relative;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 15px;
  width: 100%;
}

.dropdown-selected-gerenciar {
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

.dropdown-selected-gerenciar img.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.dropdown-list-gerenciar {
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

.dropdown-list-gerenciar li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-list-gerenciar img.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.input-busca-jogador-gerenciar {
  width: 100%;
  padding: 8px;
  border: none;
  border-bottom: 1px solid #ddd;
  outline: none;
  font-size: 14px;
}

.dropdown-list-gerenciar ul {
  max-height: 180px;
  overflow-y: auto;
}

.sem-jogador-gerenciar {
  padding: 10px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.selecionado {
  background-color: #eef6ff;
  font-weight: bold;
}

.abas-container-gerenciar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.aba-gerenciar {
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

.aba-gerenciar:hover {
  background-color: #e0e0e0;
}

.aba-gerenciar.ativa {
  background-color: #3b82f6;
  color: white;
}

.conteudo-aba-gerenciar {
  margin-top: 10px;
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

  .modal-overlay-gerenciar {
    align-items: flex-start;
    padding: 20px 10px;
  }

  .modal-content-gerenciar {
    width: 100%;
    max-width: 100%;
    padding: 20px;
    border-radius: 8px;
  }

  .modal-header-gerenciar h2 {
    font-size: 18px;
  }

  .dropdown-gerenciar,
  .dropdown-selected-gerenciar {
    font-size: 14px;
  }

  .botoes-gerenciar {
    flex-direction: row;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn-save1-gerenciar {
    flex: 1;
    font-size: 15px;
  }

  .abas-container-gerenciar {
    gap: 8px;
  }

  .aba-gerenciar {
    flex: 1 1 100px;
    font-size: 14px;
    padding: 8px;
  }
}
</style>


