<template>
  <section v-if="partidasAtivas.length" class="partidas-ativas">
    <div v-for="(grupo, modalidade) in partidasPorModalidade" :key="modalidade" class="grupo-modalidade">
      <h4 class="modalidade-titulo">{{ modalidade }}</h4>

      <div class="cards-partidas">
        <div v-for="partida in grupo" :key="partida.id" class="card-partida-wrapper">
          <div class="card-partida">
            <!-- Time A: nome à esquerda, imagem à direita -->
            <div class="time">
              <span>{{ partida.timeA?.nome }}</span>
              <img 
                :src="partida.timeA?.foto || '/img/default-team.png'" 
                alt="Escudo Time A" 
              />
            </div>

            <!-- Placar -->
            <div class="placar">
              <span>{{ partida.pontosTimeA }}</span>
              <span>x</span>
              <span>{{ partida.pontosTimeB }}</span>
            </div>

            <!-- Time B: imagem à esquerda, nome à direita -->
            <div class="time">
              <img 
                :src="partida.timeB?.foto || '/img/default-team.png'" 
                alt="Escudo Time B" 
              />
              <span>{{ partida.timeB?.nome }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    partidasAtivas: {
      type: Array,
      required: true
    }
  },
  computed: {
    partidasPorModalidade() {
      return this.partidasAtivas.reduce((acc, partida) => {
        const modalidade = partida.modalidade.nome;
        if (!acc[modalidade]) acc[modalidade] = [];
        acc[modalidade].push(partida);
        return acc;
      }, {});
    }
  }
};
</script>

<style scoped>
.cards-partidas {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.card-partida-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.card-partida {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 14px 20px;
  width: 83%;
  max-width: 900px; /* limite em telas muito largas */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #1e3a8a;
}

.modalidade-titulo {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  padding: 10px 0;
  color: #7E7E7E;
  background: white;
  position: sticky;
  top: 0; 
  z-index: 20;
  margin-left: 8%;
}

.card-partida:hover {
  background: #f9fafb;
}

/* Bloco de time */
.time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  min-width: 140px; /* largura fixa para alinhar */
}

/* Nome do time */
.time span {
  display: inline-block;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Escudo do time */
.time img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
  flex-shrink: 0;
}

/* Placar */
.placar {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  gap: 8px;
  align-items: center;
}

.placar span {
  color: #7E7E7E; 
  min-width: 20px;
  text-align: center;
}

/* Responsivo */
@media (max-width: 1024px) {
  .card-partida {
    width: 90%;
    padding: 12px 16px;
  }

  .time {
    min-width: 120px; /* ajusta mas mantém alinhado */
  }

  .time span {
    font-size: 13px;
  }

  .placar {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .card-partida {
    width: 95%;
    padding: 10px 14px;
    gap: 6px;
  }

  .time {
    min-width: 110px; /* menor no celular */
  }

  .time img {
    width: 26px;
    height: 26px;
  }

  .time span {
    max-width: 90px;
    font-size: 13px;
  }

  .placar {
    font-size: 15px;
  }

  .modalidade-titulo {
    margin-left: 0;
    text-align: center;
    font-size: 16px;
  }
}
</style>
