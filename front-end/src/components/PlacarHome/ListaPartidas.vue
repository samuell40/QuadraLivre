<template>
  <section v-if="partidasPorModalidade && Object.keys(partidasPorModalidade).length" class="partidas-gerais">
    <div v-for="(grupo, modalidade) in partidasPorModalidade" :key="modalidade" class="grupo-modalidade">
      <h4 class="modalidade-titulo">{{ modalidade }}</h4>

      <div class="cards-partidas">
        <div v-for="partida in grupo" :key="partida.id" class="card-partida-wrapper">
          <div class="card-partida" :class="{ encerrada: partida.finalizada }">
            <div class="time">
              <span>{{ partida.timeA?.nome }}</span>
              <img :src="partida.timeA?.foto || '/img/default-team.png'" alt="Escudo Time A" />
            </div>

            <div class="placar">
              <span>{{ partida.pontosTimeA }}</span>
              <span>x</span>
              <span>{{ partida.pontosTimeB }}</span>

              <div class="status-partida" :class="{ encerrada: partida.finalizada }">
                {{ statusPartida(partida) }}
              </div>
            </div>

            <div class="time">
              <img :src="partida.timeB?.foto || '/img/default-team.png'" alt="Escudo Time B" />
              <span>{{ partida.timeB?.nome }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useWebSocketStore } from "@/webscoket";
import { mapState } from "pinia";

export default {
  name: "ListaPartidas",
  data() {
    return {
      tempoDecorrido: 0,
      intervaloTempo: null,
    };
  },
  computed: {
    ...mapState(useWebSocketStore, [
      "partidasAtivas",
      "partidasEncerradas",
      "placares",
    ]),

    partidasPorModalidade() {
      const todas = [...this.partidasAtivas, ...this.partidasEncerradas];
      return todas.reduce((acc, partida) => {
        let modalidade = partida.modalidade?.nome;

        modalidade = modalidade.charAt(0).toUpperCase() + modalidade.slice(1);

        if (!acc[modalidade]) acc[modalidade] = [];
        acc[modalidade].push(partida);
        return acc;
      }, {});
    },

  },
  watch: {
    partidasAtivas: {
      handler(novas) {
        if (novas.length > 0) {
          this.iniciarCronometro(novas[0]);
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    iniciarCronometro(partida) {
      if (this.intervaloTempo) clearInterval(this.intervaloTempo);

      if (partida?.createdAt && !partida.finalizada) {
        this.intervaloTempo = setInterval(() => {
          const inicio = new Date(partida.createdAt);
          const agora = new Date();
          this.tempoDecorrido = Math.floor((agora - inicio) / 60000);
        }, 1000);
      }
    },
    statusPartida(partida) {
      if (partida.finalizada) return "ENCERRADA";
      if (partida.emIntervalo) return "PAUSADA";
      if (!partida.finalizada && this.partidasAtivas[0]?.id === partida.id) {
        return `${this.tempoDecorrido} MIN`;
      }
      return "EM ANDAMENTO";
    },
  },
  beforeUnmount() {
    if (this.intervaloTempo) clearInterval(this.intervaloTempo);
  },
  mounted() {
    const wsStore = useWebSocketStore();
    wsStore.iniciar();
  },
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
  max-width: 900px;
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

.time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  min-width: 140px;
}

.time span {
  display: inline-block;
  flex: 1;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
  flex-shrink: 0;
}

.placar {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  gap: 8px;
  align-items: center;
  position: relative;
  /* necessário pro absolute funcionar */
}

.placar span {
  color: #7E7E7E;
  min-width: 20px;
  text-align: center;
}

.status-partida {
  position: absolute;
  top: -13px;
  /* sobe o tempo */
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #1e3a8a;
  white-space: nowrap;
}

.status-partida.encerrada {
  color: #dc2626;
  /* vermelho */
}

@media (max-width: 1024px) {
  .card-partida {
    width: 90%;
    padding: 12px 16px;
  }

  .time {
    min-width: 120px;
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
    min-width: 110px;
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
