<template>
  <div class="modal-overlay" @click.self="$emit('fechar')">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="titulo_h2">Detalhes do Agendamento</h2>
        <span class="badge-tipo">{{ agendamento.tipo }}</span>
      </div>

      <div class="detalhes-box">
        <p><strong>Realizado por:</strong> {{ obterNomeUsuario(agendamento) }}</p>

        <p>
          <strong>Data:</strong> {{ formatarDataHora(agendamento) }}
        </p>

        <p><strong>Duração:</strong> {{ agendamento.duracao }} hora(s)</p>

        <p><strong>Time:</strong> {{ obterNomeTime(agendamento) }}</p>
        <p><strong>Código de Verificação:</strong> {{ agendamento.codigoVerificacao || 'N/A' }}</p>

        <div v-if="agendamento.motivoRecusa" class="alerta-recusa">
          <strong>Motivo da Recusa:</strong> {{ agendamento.motivoRecusa }}
        </div>
      </div>

      <button class="btn-cancelar" @click="$emit('fechar')">Fechar</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DetalheAgendModal',
  props: {
    agendamento: { type: Object, required: true }
  },
  methods: {
    normalizarTextoExibicao(texto) {
      if (typeof texto !== 'string') return texto
      return texto
        .replace(/NÃ£o/g, 'Não')
        .replace(/N�o/g, 'Não')
        .replace(/UsuÃ¡rio/g, 'Usuário')
    },

    obterNomeUsuario(ag) {
      if (ag?.usuario?.nome) return this.normalizarTextoExibicao(ag.usuario.nome)
      if (typeof ag?.usuario === 'string' && ag.usuario.trim()) return this.normalizarTextoExibicao(ag.usuario)
      if (typeof ag?.usuarioNome === 'string' && ag.usuarioNome.trim()) return this.normalizarTextoExibicao(ag.usuarioNome)
      return 'Usuário desconhecido'
    },

    obterNomeTime(ag) {
      if (ag?.time?.nome) return this.normalizarTextoExibicao(ag.time.nome)
      if (typeof ag?.time === 'string' && ag.time.trim()) return this.normalizarTextoExibicao(ag.time)
      if (typeof ag?.timeNome === 'string' && ag.timeNome.trim()) return this.normalizarTextoExibicao(ag.timeNome)
      return 'Não vinculado'
    },

    formatarDataHora(ag) {
      if (ag.datahora) {
        const dataObj = new Date(ag.datahora)
        return (
          dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }) +
          ' às ' +
          dataObj.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })
        )
      }

      const dia = String(ag.dia).padStart(2, '0')
      const mes = String(ag.mes).padStart(2, '0')
      const ano = ag.ano
      const hora = String(ag.hora).padStart(2, '0')

      return `${dia}/${mes}/${ano} às ${hora}:00`
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1300;
  padding: 16px;
}

.modal-content {
  width: min(900px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  padding: 28px 30px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.titulo_h2 {
  margin: 0;
  color: #3b82f6;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.3px;
  line-height: 1.15;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}

.badge-tipo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(37, 99, 235, 0.22);
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.18);
  white-space: nowrap;
  flex-shrink: 0;
}

.detalhes-box {
  margin-top: 10px;
  margin-bottom: 18px;
  padding: 18px 18px 16px;
  border-radius: 16px;
  background: #f9fbff;
  border: 1px solid rgba(59, 130, 246, 0.22);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.06);
}

.detalhes-box p {
  margin: 10px 0;
  font-size: 15px;
  color: #334155;
  line-height: 1.45;
}

.detalhes-box p strong {
  color: #0f172a;
  font-weight: 900;
}

.alerta-recusa {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  background: #fff1f2;
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.28);
  box-shadow: inset 0 0 0 1px rgba(239, 68, 68, 0.06);
}

.alerta-recusa strong {
  font-weight: 900;
}

.btn-cancelar {
  width: 100%;
  margin-top: 10px;
  padding: 12px 16px;
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: 999px;
  font-weight: 900;
  font-size: 14px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.18);
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.btn-cancelar:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(37, 99, 235, 0.24);
  filter: brightness(0.98);
}

.btn-cancelar:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-content {
    padding: 16px 14px;
    border-radius: 14px;
  }

  .modal-header {
    flex-wrap: nowrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .titulo_h2 {
    font-size: 20px;
    line-height: 1.15;
    flex: 1;
    min-width: 0;
  }

  .badge-tipo {
    padding: 6px 10px;
    font-size: 12px;
  }

  .detalhes-box {
    padding: 12px 12px 10px;
    border-radius: 14px;
  }

  .detalhes-box p {
    margin: 8px 0;
    font-size: 14px;
  }

  .btn-cancelar {
    padding: 12px 14px;
    margin-top: 12px;
  }
}
</style>
