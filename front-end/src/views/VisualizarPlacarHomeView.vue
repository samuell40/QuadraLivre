<template>
  <div class="layout">
    <nav class="navbar-custom">
      <div class="navbar-container">
        <div class="esquerda-section">
          <div class="hamburger" @click="toggleMenu">
            <span :class="{ open: isMenuOpen }"></span>
            <span :class="{ open: isMenuOpen }"></span>
            <span :class="{ open: isMenuOpen }"></span>
          </div>

          <div class="logo">Quadra Livre</div>
          <a href="/" class="btn-voltar-mobile">
            Voltar a tela inicial
          </a>


          <a href="/telainicial" class="quadra-play desktop-only">
            QuadraPlay
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
              class="bi bi-arrow-left-right" viewBox="0 0 16 16">
              <path fill-rule="evenodd"
                d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
            </svg>
          </a>
        </div>

        <ul class="nav-links" :class="{ active: isMenuOpen }">
          <li class="login-item">
            <a href="/" class="login">Voltar a tela inicial</a>
          </li>

          <li class="quadra-play-mobile">
            <a href="/telainicial" class="quadra-play">
              QuadraPlay
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-arrow-left-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                  d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5" />
              </svg>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="conteudo">
      <h1 class="title">Tabelas de Classificação</h1>
      <div v-if="isLoading" class="loader"></div>
      <div v-else>
        <!-- ABAS DE CAMPEONATOS -->
        <div class="abas-container">
          <div class="aba" v-for="c in campeonatos" :key="c.id" :class="{ ativa: campeonatoAtivo === c.id }"
            @click="selecionarCampeonato(c.id)">
            {{ c.nome }}
          </div>
        </div>

        <div class="placar-table" v-if="campeonatoAtivo">
          <div v-if="timesPlacar === null" class="loader-container-centralizado">
            <div class="loader"></div>
          </div>

          <div v-else-if="Array.isArray(timesPlacar) && timesPlacar.length === 0" class="sem-dados-centralizado">
            Nenhum placar encontrado para este campeonato.
          </div>

          <table v-else-if="['futebol', 'futebol de areia', 'futsal'].includes(modalidadeNormalizada)" class="placar">
            <thead>
              <tr>
                <th>Time</th>
                <th>PTS</th>
                <th>J</th>
                <th>GM</th>
                <th>GS</th>
                <th>SG</th>
                <th>E</th>
                <th>VIT</th>
                <th>DER</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(time, index) in timesPlacar" :key="time.id">
                <td class="time-info">
                  <span class="posicao">{{ index + 1 }}º</span>

                  <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />

                  <span class="nome-time">
                    {{ time.time?.nome }}
                  </span>
                </td>

                <td>{{ time.pontuacao }}</td>
                <td>{{ time.jogos }}</td>
                <td>{{ time.golsPro }}</td>
                <td>{{ time.golsSofridos }}</td>
                <td>{{ time.saldoDeGols }}</td>
                <td>{{ time.empates }}</td>
                <td>{{ time.vitorias }}</td>
                <td>{{ time.derrotas }}</td>
              </tr>
            </tbody>
          </table>

          <table v-else-if="['volei', 'volei de areia', 'futevolei'].includes(modalidadeNormalizada)" class="placar">
            <thead>
              <tr>
                <th>Time</th>
                <th>PTS</th>
                <th>J</th>
                <th>VIT</th>
                <th>DER</th>
                <th>STV</th>
                <th>3x0</th>
                <th>3x2</th>
                <th>2x3</th>
                <th>0x3</th>
                <th>W.O.</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="(time, index) in timesPlacar" :key="time.id">
                <td class="time-info">
                  <span class="posicao">{{ index + 1 }}º</span>

                  <img v-if="time.time?.foto" :src="time.time.foto" class="time-image" />

                  <span class="nome-time">
                    {{ time.time?.nome }}
                  </span>
                </td>

                <td>{{ time.pontuacao }}</td>
                <td>{{ time.jogos }}</td>
                <td>{{ time.vitorias }}</td>
                <td>{{ time.derrotas }}</td>
                <td>{{ time.setsVencidos }}</td>
                <td>{{ time.vitoria3x0 }}</td>
                <td>{{ time.vitoria3x2 }}</td>
                <td>{{ time.derrota2x3 }}</td>
                <td>{{ time.derrota0x3 }}</td>
                <td>{{ time.derrotaWo }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/axios'

export default {
  name: 'VisualizarPlacarHome',

  data() {
    return {
      campeonatos: [],
      campeonatoAtivo: null,
      isLoading: false,
      isMenuOpen: false
    }
  },

  computed: {
    campeonatoSelecionado() {
      return this.campeonatos.find(
        c => c.id === this.campeonatoAtivo
      ) || null
    },

    timesPlacar() {
      // null = loading visual
      if (!this.campeonatoSelecionado) return null

      // se não existir placar
      if (!this.campeonatoSelecionado.placares) return []

      return this.campeonatoSelecionado.placares
    },

    modalidadeNormalizada() {
      if (!this.campeonatoSelecionado?.modalidade?.nome) return ''

      return this.campeonatoSelecionado.modalidade.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    }
  },

  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },

    selecionarCampeonato(id) {
      this.campeonatoAtivo = id
    },

    async carregarCampeonatos() {
      this.isLoading = true
      try {
        const { data } = await api.get('/todos/campeonatos')
        this.campeonatos = data
        if (data.length) {
          this.campeonatoAtivo = data[0].id
        }
      } catch (err) {
        console.error('Erro ao carregar campeonatos:', err)
      } finally {
        this.isLoading = false
      }
    },

    formatarData(data) {
      return new Date(data).toLocaleDateString('pt-BR')
    }
  },

  mounted() {
    this.carregarCampeonatos()
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 40px;
}

.navbar-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #152147;
  height: 70px;
  font-family: "Montserrat", sans-serif;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 100%;
  position: relative;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 100px;
  height: 100px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

.title {
  font-size: 30px;
  color: #3b82f6;
  font-weight: bold;
  margin-top: 2px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.esquerda-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: -12%;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  white-space: nowrap;
  margin-left: 80px;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
  align-items: center;
  margin-right: 80px;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links li a:hover {
  color: #3B82F6;
  text-decoration-color: #3B82F6;
}

.nav-links li a:focus,
.nav-links li a:active {
  color: #ffffff;
  text-decoration-color: #3B82F6;
}

.quadra-play {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
  padding: 6px 25px;
  border: 2px solid #3B82F6;
  border-radius: 15px;
  transition: background-color 0.3s, color 0.3s;
  overflow: visible;
}

.quadra-play svg {
  position: absolute;
  top: 90%;
  right: -12px;
  transform: translateY(-50%);
  width: 25px;
  height: 25px;
  background-color: #152147;
  border-radius: 50%;
  padding: 2px;
}

.quadra-play-mobile {
  display: none;
}

.login {
  background-color: #1E3A8A;
  padding: 6px 50px;
  border-radius: 30px;
  color: white;
  font-weight: 500;
  text-align: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: #fff;
  transition: 0.3s;
}

.nav-links.active {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 70px;
  right: 0;
  background-color: #152147;
  width: 100%;
  padding: 20px 0;
  gap: 20px;
}

.login-btn-mobile {
  display: none;
}

.conteudo {
  margin-top: 90px;
  padding: 20px 60px;
}

/* ABAS */
.abas-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
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
}

.aba:hover {
  background-color: #e0e0e0;
}

.aba.ativa {
  background-color: #3b82f6;
  color: white;
}

/* CAMPEONATOS */
.campeonatos-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card-campeonato {
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-campeonato h3 {
  margin-bottom: 10px;
  color: #152147;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status.em_andamento {
  background-color: #dcfce7;
  color: #166534;
}

.status.encerrado {
  background-color: #fee2e2;
  color: #991b1b;
}

.sem-dados {
  grid-column: 1 / -1;
  text-align: center;
  color: #666;
  margin-top: 40px;
}


.placar-table {
  margin-top: 30px;
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* TABLE */
.placar {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

/* CABEÇALHO */
.placar thead th {
  background-color: #3b82f6;
  color: white;
  font-weight: 600;
  padding: 14px 12px;
  font-size: 15px;
  text-align: left;
  white-space: nowrap;
}

/* LINHAS */
.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s ease;
}

.placar tbody tr:hover {
  background-color: #f3f4f6;
}

/* CELULAS */
.placar tbody td {
  color: #374151;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

/* INFO DO TIME */
.time-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* POSIÇÃO */
.posicao {
  font-weight: bold;
  font-size: 14px;
  min-width: 20px;
  text-align: right;
  color: #3b82f6;
}

.time-image {
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

.nome-time {
  font-weight: 500;
  color: #111827;
}

.loader-container-centralizado {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 220px;
}

.sem-dados-centralizado {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #6b7280;
}

.btn-voltar-mobile {
  display: none;
  /* esconde no desktop */
}

@media (max-width: 768px) {

  /* ===== NAVBAR ===== */
  .navbar-container {
    padding: 0 16px;
  }

  .logo {
    margin-left: 0;
    font-size: 16px;
  }

  .esquerda-section {
    margin-left: 0;
  }

  .desktop-only {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: none;
  }

  .nav-links.active {
    display: flex;
  }

  /* ===== CONTEÚDO ===== */
  .conteudo {
    padding: 16px;
  }

  .title {
    font-size: 22px;
    text-align: center;
    margin-top: 10px;
  }

  /* ===== ABAS ===== */
  .abas-container {
    flex-direction: column;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .aba {
    font-size: 14px;
    padding: 10px;
  }

  /* ===== TABELA ===== */
  .placar-table {
    border-radius: 8px;
  }

  .placar {
    min-width: 800px;
  }

  .time-info {
    gap: 6px;
  }

  .time-image {
    width: 28px;
    height: 28px;
  }

  .nome-time {
    font-size: 13px;
  }

  /* ===== MODAL ===== */
  .modal-partida {
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 16px;
  }

  .placar-modal {
    flex-direction: column;
    gap: 12px;
  }

  /* ===== JOGADORES ===== */
  .jogadores-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .jogador-item {
    gap: 8px;
  }

  .foto-jogador {
    width: 40px;
    height: 40px;
  }

  .btn-voltar-mobile {
    display: inline-block;
    /* mostra no mobile */
    position: absolute;
    /* tira do fluxo normal */
    right: 16px;
    /* distância da borda direita */
    top: 50%;
    /* centraliza verticalmente */
    transform: translateY(-50%);
    color: white;
    font-weight: 500;
    text-decoration: none;
    background: #1E3A8A;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
  }
}
</style>