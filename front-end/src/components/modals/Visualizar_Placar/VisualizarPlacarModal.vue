<template>
  <div v-if="modalPlacarAberto" class="modalPlacarPai">
    <div class="modal-conteudo modal-placar">
      <div class="header-placar">
        <h2 class="title_placar">Visualizar Placar</h2>
         <div class="botoes">
        <button class="btn-ocultar" @click="abrirVisibilidade">Visibilidade Placar</button>
        <button class="btn-reset" @click="$emit('abrir-modal-resetar')">Resetar Placar</button>
        </div>
      </div>

      <div>
        <label for="modalidade-placar">Escolha a modalidade:</label>
        <select id="modalidade-placar" v-model="modalidadePlacarSelecionadaLocal" @change="carregarPlacar"
          class="dropdown">
          <option disabled value="">Selecione</option>
          <option v-for="modalidade in modalidadesDisponiveis" :key="modalidade.id" :value="modalidade.nome">
            {{ modalidade.nome.charAt(0).toUpperCase() + modalidade.nome.slice(1) }}
          </option>
        </select>
      </div>

      <div class="placar-table">
        <!-- Tabela Futebol -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'futebol'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>GM</th>
              <th>GS</th>
              <th>SG</th>
              <th>E</th>
              <th>VIT</th>
              <th>DER</th>
              <th>Amarelos</th>
              <th>Vermelhos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.golsPro }}</td>
              <td>{{ time.golsSofridos }}</td>
              <td>{{ time.saldoDeGols }}</td>
              <td>{{ time.empates }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.cartoesAmarelos }}</td>
              <td>{{ time.cartoesVermelhos }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Tabela Futebol De Areia-->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'futebol_de_areia'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>GM</th>
              <th>GS</th>
              <th>SG</th>
              <th>E</th>
              <th>VIT</th>
              <th>DER</th>
              <th>Amarelos</th>
              <th>Vermelhos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.golsPro }}</td>
              <td>{{ time.golsSofridos }}</td>
              <td>{{ time.saldoDeGols }}</td>
              <td>{{ time.empates }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.cartoesAmarelos }}</td>
              <td>{{ time.cartoesVermelhos }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabela Futsal -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'futsal'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>GM</th>
              <th>GS</th>
              <th>SG</th>
              <th>E</th>
              <th>VIT</th>
              <th>DER</th>
              <th>Amarelos</th>
              <th>Vermelhos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.golsPro }}</td>
              <td>{{ time.golsSofridos }}</td>
              <td>{{ time.saldoDeGols }}</td>
              <td>{{ time.empates }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.cartoesAmarelos }}</td>
              <td>{{ time.cartoesVermelhos }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabela Vôlei -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'volei'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>VIT</th>
              <th>DER</th>
              <th>STV</th>
              <th>2x0</th>
              <th>2x1</th>
              <th>1x2</th>
              <th>0x2</th>
              <th>W.O.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}º</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.setsVencidos }}</td>
              <td>{{ time.vitoria2x0 }}</td>
              <td>{{ time.vitoria2x1 }}</td>
              <td>{{ time.derrota2x1 }}</td>
              <td>{{ time.derrota2x0 }}</td>
              <td>{{ time.derrotaWo }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabela Vôlei De Areia -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'volei_de_areia'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>VIT</th>
              <th>DER</th>
              <th>STV</th>
              <th>2x0</th>
              <th>2x1</th>
              <th>1x2</th>
              <th>0x2</th>
              <th>W.O.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}º</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.setsVencidos }}</td>
              <td>{{ time.vitoria2x0 }}</td>
              <td>{{ time.vitoria2x1 }}</td>
              <td>{{ time.derrota2x1 }}</td>
              <td>{{ time.derrota2x0 }}</td>
              <td>{{ time.derrotaWo }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Tabela Vôleibol -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'voleibol'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>VIT</th>
              <th>DER</th>
              <th>STV</th>
              <th>2x0</th>
              <th>2x1</th>
              <th>1x2</th>
              <th>0x2</th>
              <th>W.O.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}º</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.setsVencidos }}</td>
              <td>{{ time.vitoria2x0 }}</td>
              <td>{{ time.vitoria2x1 }}</td>
              <td>{{ time.derrota2x1 }}</td>
              <td>{{ time.derrota2x0 }}</td>
              <td>{{ time.derrotaWo }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Tabela Futevolei -->
        <table class="placar" v-if="modalidadePlacarSelecionadaLocal === 'futevolei'">
          <thead>
            <tr>
              <th>Posição</th>
              <th>Time</th>
              <th>PTS</th>
              <th>J</th>
              <th>VIT</th>
              <th>DER</th>
              <th>STV</th>
              <th>2x0</th>
              <th>2x1</th>
              <th>1x2</th>
              <th>0x2</th>
              <th>W.O.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(time, index) in timesPlacar" :key="time.id">
              <td>{{ index + 1 }}º</td>
              <td class="time-info">
                <img v-if="time.foto" :src="time.foto" alt="Foto do time" class="time-image" />
                {{ time.time }}
              </td>
              <td>{{ time.pontuacao }}</td>
              <td>{{ time.jogos }}</td>
              <td>{{ time.vitorias }}</td>
              <td>{{ time.derrotas }}</td>
              <td>{{ time.setsVencidos }}</td>
              <td>{{ time.vitoria2x0 }}</td>
              <td>{{ time.vitoria2x1 }}</td>
              <td>{{ time.derrota2x1 }}</td>
              <td>{{ time.derrota2x0 }}</td>
              <td>{{ time.derrotaWo }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="timesPlacar.length === 0" class="sem-dados">
        Nenhum placar encontrado para essa modalidade.
      </div>

      <button class="btn-cancel-placar" @click="$emit('fechar')">Fechar</button>
    </div>
    <OcultarPlacar :aberto="visibilidadeAberto" @fechar="fecharVisibilidade" />
  </div>
</template>

<script>
export default {
  name: 'VisualizarPlacarModal',
  props: {
    modalPlacarAberto: Boolean,
    modalidadePlacarSelecionada: String,
    modalidadesDisponiveis: Array,
    timesPlacar: Array,
    visibilidadeAberto: Boolean  
  },
  data() {
    return {
      modalidadePlacarSelecionadaLocal: this.modalidadePlacarSelecionada || ''
    };
  },
  watch: {
    modalidadePlacarSelecionada(newVal) {
      this.modalidadePlacarSelecionadaLocal = newVal;
    }
  },
  methods: {
    carregarPlacar() {
      this.$emit('carregar-placar', this.modalidadePlacarSelecionadaLocal);
    },
    abrirVisibilidade() {
      this.$emit('abrir-visibilidade');
    },
    fecharVisibilidade() {
      this.$emit('fechar-visibilidade');
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
  width: 400px;
  max-width: 90%;
}

.modal-content h2 {
  margin-bottom: 20px;
  color: #3b82f6;
}

.botoes {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
}

.form-group input[type="text"],
.form-group input[type="file"] {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.modalPlacarPai {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.modal-conteudo.modal-placar {
  background-color: #fff;
  border-radius: 12px;
  width: 800px;
  height: 600px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.placar-table {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-height: 100%;
}

.placar {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

.title_placar {
  color: #3b82f6;
  font-size: 28px;
}

.placar thead th {
  background-color: #1e3a8a;
  color: white;
  font-weight: bold;
  padding: 14px 12px;
  font-size: 16px;
  text-align: left;
}

.placar tbody tr {
  background-color: white;
  transition: background-color 0.2s;
}


.placar tbody tr:hover {
  background-color: #f3f4f6;
}

.placar tbody td {
  color: #4b5563;
  padding: 12px;
  font-size: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.placar tbody tr:last-child td {
  border-bottom: none;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}

.btn-cancel-placar {
  background-color: #3b82f6;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-top: 20px;
  width: 100%;
}

.header-placar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.btn-reset {
  background-color: #3b82f6;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.btn-ocultar {
  background-color: #7E7E7E;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
.dropdown {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 16px;
  margin-bottom: 10px;
}

.dropdown-row {
  display: flex;
  gap: 20px;
  width: 90%;
  margin-left: 15%;
}

.dropdown-row .team {
  flex: 1;
}
@media (max-width: 768px) {
 @media (max-width: 768px) {
  .header-placar {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .botoes {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .btn-reset,
  .btn-ocultar {
    width: auto;
    min-width: 120px;
    text-align: center;
  }
}
}

</style>