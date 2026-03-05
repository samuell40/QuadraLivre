-- Performance indexes for hot filters and list endpoints

CREATE INDEX IF NOT EXISTS "Usuario_ativo_deletedAt_idx"
  ON "Usuario"("ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Usuario_permissaoId_ativo_deletedAt_idx"
  ON "Usuario"("permissaoId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Agendamento_usuarioId_deletedAt_datahora_idx"
  ON "Agendamento"("usuarioId", "deletedAt", "datahora");

CREATE INDEX IF NOT EXISTS "Agendamento_quadraId_deletedAt_datahora_idx"
  ON "Agendamento"("quadraId", "deletedAt", "datahora");

CREATE INDEX IF NOT EXISTS "Agendamento_quadraId_status_ano_mes_dia_idx"
  ON "Agendamento"("quadraId", "status", "ano", "mes", "dia");

CREATE INDEX IF NOT EXISTS "Agendamento_timeId_deletedAt_ano_mes_dia_idx"
  ON "Agendamento"("timeId", "deletedAt", "ano", "mes", "dia");

CREATE INDEX IF NOT EXISTS "Agendamento_status_deletedAt_datahora_idx"
  ON "Agendamento"("status", "deletedAt", "datahora");

CREATE INDEX IF NOT EXISTS "Agendamento_campeonatoId_deletedAt_status_datahora_idx"
  ON "Agendamento"("campeonatoId", "deletedAt", "status", "datahora");

CREATE INDEX IF NOT EXISTS "Campeonato_modalidadeId_ativo_deletedAt_dataInicio_idx"
  ON "Campeonato"("modalidadeId", "ativo", "deletedAt", "dataInicio");

CREATE INDEX IF NOT EXISTS "Campeonato_status_ativo_deletedAt_idx"
  ON "Campeonato"("status", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Campeonato_quadraId_ativo_deletedAt_idx"
  ON "Campeonato"("quadraId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "CampeonatoTime_campeonatoId_ativo_deletedAt_idx"
  ON "CampeonatoTime"("campeonatoId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "CampeonatoTime_timeId_ativo_deletedAt_idx"
  ON "CampeonatoTime"("timeId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Fase_campeonatoId_ativo_idx"
  ON "Fase"("campeonatoId", "ativo");

CREATE INDEX IF NOT EXISTS "Time_modalidadeId_deletedAt_nome_idx"
  ON "Time"("modalidadeId", "deletedAt", "nome");

CREATE INDEX IF NOT EXISTS "Partida_campeonatoId_faseId_rodadaId_status_idx"
  ON "Partida"("campeonatoId", "faseId", "rodadaId", "status");

CREATE INDEX IF NOT EXISTS "Partida_campeonatoId_faseId_status_idx"
  ON "Partida"("campeonatoId", "faseId", "status");

CREATE INDEX IF NOT EXISTS "Partida_campeonatoId_status_data_idx"
  ON "Partida"("campeonatoId", "status", "data");

CREATE INDEX IF NOT EXISTS "Partida_faseId_status_data_idx"
  ON "Partida"("faseId", "status", "data");

CREATE INDEX IF NOT EXISTS "Partida_timeAId_timeBId_status_idx"
  ON "Partida"("timeAId", "timeBId", "status");

CREATE INDEX IF NOT EXISTS "Partida_timeBId_timeAId_status_idx"
  ON "Partida"("timeBId", "timeAId", "status");

CREATE INDEX IF NOT EXISTS "TreinadorTime_usuarioId_ativo_deletedAt_idx"
  ON "TreinadorTime"("usuarioId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "JogadorTime_timeId_ativo_deletedAt_idx"
  ON "JogadorTime"("timeId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "JogadorTime_modalidadeId_ativo_deletedAt_idx"
  ON "JogadorTime"("modalidadeId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Placar_campeonatoId_faseId_visivel_deletedAt_posicao_idx"
  ON "Placar"("campeonatoId", "faseId", "visivel", "deletedAt", "posicao");

CREATE INDEX IF NOT EXISTS "Placar_campeonatoId_visivel_deletedAt_pontuacao_idx"
  ON "Placar"("campeonatoId", "visivel", "deletedAt", "pontuacao");

CREATE INDEX IF NOT EXISTS "Placar_timeId_deletedAt_idx"
  ON "Placar"("timeId", "deletedAt");

CREATE INDEX IF NOT EXISTS "UsuarioTime_timeId_ativo_deletedAt_idx"
  ON "UsuarioTime"("timeId", "ativo", "deletedAt");

CREATE INDEX IF NOT EXISTS "Aviso_quadraId_fixado_data_idx"
  ON "Aviso"("quadraId", "fixado", "data");

CREATE INDEX IF NOT EXISTS "Aviso_fixado_data_idx"
  ON "Aviso"("fixado", "data");
