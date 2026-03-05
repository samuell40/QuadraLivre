<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="fecharModalPartida">
    <div class="modal-partida">
      <div v-if="loadingDetalhePartida" class="modal-loader-shell">
        <LoadingState
          size="compact"
          title="Carregando detalhes da partida"
          description="Buscando placar, escalação e estatísticas do confronto selecionado."
        />
      </div>

      <div v-else-if="partidaDetalhada">
        <h2>Detalhes da Partida (Campeonato {{ partidaDetalhada.campeonato?.nome }})</h2>

        <div class="infos">
          <p>
            <span class="status-badge" :class="statusClass(partidaDetalhada, 'text')">
              <span v-if="partidaDetalhada?.status === 'EM_ANDAMENTO'" class="status-live-dot"
                aria-hidden="true"></span>
              {{ statusLabel(partidaDetalhada) }}
            </span>
          </p>
          <p v-if="!isPartidaEmAndamento">
            <strong v-if="!isPartidaFinalizada">Data Prevista: </strong>
            {{ formatarDataPartida(partidaDetalhada?.data || partidaDetalhada?.createdAt) }}
          </p>

          <p v-if="!isDetalheVolei && !isPartidaAgendada">
            <strong>Faltas:</strong>
            {{ partidaDetalhada.faltasTimeA ?? 0 }} x {{ partidaDetalhada.faltasTimeB ?? 0 }}
          </p>
        </div>

        <div class="placar-modal">
          <div class="time">
            <img v-if="partidaDetalhada.timeA?.foto" :src="partidaDetalhada.timeA.foto" alt="Escudo time A" />
            <strong>{{ partidaDetalhada.timeA?.nome }}</strong>
            <p v-if="!isDetalheVolei && nomesGoleadoresTimeA" class="goleadores-linha" :title="nomesGoleadoresTimeA">
              {{ nomesGoleadoresTimeA }}
            </p>
          </div>

          <span v-if="isPartidaAgendada" class="resultado">
            x
          </span>

          <span v-else class="resultado">
            {{ partidaDetalhada.pontosTimeA ?? 0 }} x {{ partidaDetalhada.pontosTimeB ?? 0 }}
          </span>

          <div class="time">
            <img v-if="partidaDetalhada.timeB?.foto" :src="partidaDetalhada.timeB.foto" alt="Escudo time B" />
            <strong>{{ partidaDetalhada.timeB?.nome }}</strong>
            <p v-if="!isDetalheVolei && nomesGoleadoresTimeB" class="goleadores-linha" :title="nomesGoleadoresTimeB">
              {{ nomesGoleadoresTimeB }}
            </p>
          </div>
        </div>

        <div v-if="!isDetalheVolei" class="jogadores-container">
          <div class="time-mobile-title">
            {{ partidaDetalhada.timeA?.nome }}
            <div class="jogadores-time">
              <p v-if="semEscalacaoTimeA" class="sem-escalacao">Escalacão não Definida</p>
              <div v-else v-for="jp in jogadoresTimeA" :key="jp.id" class="jogador-item"
                :class="{ 'jogador-suspenso': jogadorSuspenso(jp) }">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" alt="Foto do jogador" />
                <div class="dados-jogador">
                  <span v-if="temNumeroJogador(jp.jogador?.numero)" class="numero-jogador">#{{ jp.jogador?.numero }}</span>
                  <span class="nome" :class="{ 'nome-suspenso': jogadorSuspenso(jp) }">{{ jp.jogador?.nome }}</span>
                  <span v-if="jogadorSuspenso(jp)" class="status-suspenso" :title="jp.motivoSuspensao || 'Jogador suspenso'">
                    Suspenso
                  </span>
                  <div v-if="temEstatisticas(jp)" class="estatisticas">
                    <span v-if="temGols(jp)" class="estat-item gols" title="Bola">
                      ⚽
                      <span class="estat-valor">{{ valorPositivo(jp.gols) }}</span>
                    </span>
                    <span v-if="temCartaoAmarelo(jp)" class="estat-item cartao amarelo" title="Cartao amarelo">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesAmarelos) }}</span>
                    </span>
                    <span v-if="temCartaoVermelho(jp)" class="estat-item cartao vermelho" title="Cartao vermelho">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesVermelhos) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="time-mobile-title">
            {{ partidaDetalhada.timeB?.nome }}
            <div class="jogadores-time">
              <p v-if="semEscalacaoTimeB" class="sem-escalacao">Escalação não Definida</p>
              <div v-else v-for="jp in jogadoresTimeB" :key="jp.id" class="jogador-item"
                :class="{ 'jogador-suspenso': jogadorSuspenso(jp) }">
                <img v-if="jp.jogador?.foto" :src="jp.jogador.foto" class="foto-jogador" alt="Foto do jogador" />
                <div class="dados-jogador">
                  <span v-if="temNumeroJogador(jp.jogador?.numero)" class="numero-jogador">#{{ jp.jogador?.numero }}</span>
                  <span class="nome" :class="{ 'nome-suspenso': jogadorSuspenso(jp) }">{{ jp.jogador?.nome }}</span>
                  <span v-if="jogadorSuspenso(jp)" class="status-suspenso" :title="jp.motivoSuspensao || 'Jogador suspenso'">
                    Suspenso
                  </span>
                  <div v-if="temEstatisticas(jp)" class="estatisticas">
                    <span v-if="temGols(jp)" class="estat-item gols" title="Bola">
                      ⚽
                      <span class="estat-valor">{{ valorPositivo(jp.gols) }}</span>
                    </span>
                    <span v-if="temCartaoAmarelo(jp)" class="estat-item cartao amarelo" title="Cartao amarelo">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesAmarelos) }}</span>
                    </span>
                    <span v-if="temCartaoVermelho(jp)" class="estat-item cartao vermelho" title="Cartao vermelho">
                      <svg class="estat-icon icon-cartao" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                        <rect x="4" y="2.5" width="12" height="15" rx="2" ry="2" fill="currentColor" />
                      </svg>
                      <span class="estat-valor">{{ valorPositivo(jp.cartoesVermelhos) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="acoes-modal">
        <button
          class="btn-compartilhar"
          :disabled="loadingDetalhePartida || loadingCompartilhamento || !partidaDetalhada"
          @click="compartilharResultado"
        >
          <span class="btn-compartilhar-content">
            <span v-if="loadingCompartilhamento" class="btn-compartilhar-spinner" aria-hidden="true"></span>
            <span>{{ loadingCompartilhamento ? 'Gerando imagem...' : 'Compartilhar' }}</span>
          </span>
        </button>
        <button class="btn-cancel-placar" @click="fecharModalPartida">Fechar</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
import api from '@/axios'
import LoadingState from '@/components/loading/LoadingState.vue'
import { obterFotoTime } from '@/utils/timeImagem'
import {
  isStatusPartidaPendente,
  obterRotuloStatusPartida,
  obterStatusExibicaoPartida
} from '@/utils/partidaStatus'

const STATUS_CONFIG = {
  FINALIZADA: { label: 'ENCERRADA', card: 'partida-finalizada', text: 'status-finalizada' },
  EM_ANDAMENTO: { label: 'EM ANDAMENTO', card: 'partida-andamento', text: 'status-andamento' },
  AGENDADA: { label: 'AGENDADA', card: 'partida-agendada', text: 'status-agendada' },
  AGENDADA_HOJE: { label: 'AGENDADA PARA HOJE', card: 'partida-agendada', text: 'status-agendada' },
  ADIADA: { label: 'ADIADA', card: 'partida-agendada', text: 'status-agendada' },
  CANCELADA: { label: 'CANCELADA', card: 'partida-cancelada', text: 'status-cancelada' }
}

export default {
  name: 'DetalharPartidaModal',
  components: { LoadingState },
  props: {
    modelValue: { type: Boolean, default: false },
    partidaId: { type: [Number, String], default: null }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loadingDetalhePartida: false,
      partidaDetalhada: null,
      loadingCompartilhamento: false
    }
  },
  computed: {
    partidaIdNormalizado() {
      const id = Number(this.partidaId)
      return Number.isFinite(id) && id > 0 ? id : null
    },
    modalidadeDetalheNormalizada() {
      return String(this.partidaDetalhada?.modalidade?.nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
    },
    isDetalheVolei() {
      return ['volei', 'volei de areia', 'futevolei', 'beach tenis', 'beach tennis'].includes(this.modalidadeDetalheNormalizada)
    },
    isPartidaAgendada() {
      return isStatusPartidaPendente(this.partidaDetalhada)
    },
    isPartidaEmAndamento() {
      return String(this.partidaDetalhada?.status || '') === 'EM_ANDAMENTO'
    },
    isPartidaFinalizada() {
      return String(this.partidaDetalhada?.status || '') === 'FINALIZADA'
    },
    semEscalacaoTimeA() {
      return this.isPartidaAgendada || this.jogadoresTimeA.length === 0
    },
    semEscalacaoTimeB() {
      return this.isPartidaAgendada || this.jogadoresTimeB.length === 0
    },
    jogadoresTimeA() {
      if (!this.partidaDetalhada) return []
      return (this.partidaDetalhada.jogadoresPartida || [])
        .filter(j => j.timeId === this.partidaDetalhada.timeA?.id)
    },
    jogadoresTimeB() {
      if (!this.partidaDetalhada) return []
      return (this.partidaDetalhada.jogadoresPartida || [])
        .filter(j => j.timeId === this.partidaDetalhada.timeB?.id)
    },
    nomesGoleadoresTimeA() {
      return this.listarNomesGoleadores(this.jogadoresTimeA)
    },
    nomesGoleadoresTimeB() {
      return this.listarNomesGoleadores(this.jogadoresTimeB)
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(val) {
        if (val) {
          this.carregarDetalhePartida()
        } else {
          this.partidaDetalhada = null
          this.loadingDetalhePartida = false
        }
      }
    },
    partidaId() {
      if (this.modelValue) {
        this.carregarDetalhePartida()
      }
    }
  },
  methods: {
    async carregarDetalhePartida() {
      if (!this.partidaIdNormalizado) {
        this.partidaDetalhada = null
        return
      }

      this.loadingDetalhePartida = true
      this.partidaDetalhada = null

      try {
        const { data } = await api.get(`/detalhar/partida/${this.partidaIdNormalizado}`)
        this.partidaDetalhada = data
      } catch (err) {
        console.error('Erro ao detalhar partida:', err)
        Swal.fire('Erro', 'Não foi possível carregar os detalhes da partida.', 'error')
        this.fecharModalPartida()
      } finally {
        this.loadingDetalhePartida = false
      }
    },
    fecharModalPartida() {
      this.$emit('update:modelValue', false)
      this.partidaDetalhada = null
      this.loadingDetalhePartida = false
    },
    statusClass(partida, tipo) {
      const statusExibicao = obterStatusExibicaoPartida(partida)
      return STATUS_CONFIG[statusExibicao]?.[tipo] || ''
    },
    statusLabel(partida) {
      return obterRotuloStatusPartida(partida)
    },
    async compartilharResultado() {
      if (!this.partidaDetalhada || this.loadingCompartilhamento) return

      this.loadingCompartilhamento = true

      try {
        const payload = await this.gerarArquivoCompartilhamento()

        const escolha = await Swal.fire({
          title: 'Compartilhar resultado',
          text: 'Onde voce quer compartilhar?',
          icon: 'question',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Instagram',
          denyButtonText: 'WhatsApp',
          cancelButtonText: 'Cancelar',
          zIndex: 6000
        })

        if (escolha.isConfirmed) {
          await this.compartilharArquivo('instagram', payload)
        }

        if (escolha.isDenied) {
          await this.compartilharArquivo('whatsapp', payload)
        }
      } catch (error) {
        console.error('Erro ao compartilhar resultado da partida:', error)
        Swal.fire({
          title: 'Erro',
          text: 'Nao foi possivel gerar a imagem para compartilhar.',
          icon: 'error',
          zIndex: 6000
        })
      } finally {
        this.loadingCompartilhamento = false
      }
    },
    async gerarArquivoCompartilhamento() {
      const blob = await this.gerarImagemResultadoBlob()
      const arquivoNome = `resultado-partida-${this.partidaIdNormalizado || 'quadraplay'}.jpg`
      const arquivo = new File([blob], arquivoNome, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setTimeout(() => URL.revokeObjectURL(url), 60_000)

      return {
        arquivo,
        arquivoNome,
        url,
        texto: this.montarTextoCompartilhamento()
      }
    },
    montarTextoCompartilhamento() {
      const partida = this.partidaDetalhada || {}
      const timeA = partida.timeA?.nome || 'Time A'
      const timeB = partida.timeB?.nome || 'Time B'
      const resultado = this.isPartidaAgendada
        ? 'x'
        : `${partida.pontosTimeA ?? 0} x ${partida.pontosTimeB ?? 0}`
      const status = this.statusLabel(partida)
      const campeonato = partida.campeonato?.nome || 'Campeonato'
      const quadra = partida.quadra?.nome || 'Quadra'

      return `${timeA} ${resultado} ${timeB} | ${status} | ${campeonato} | ${quadra}`
    },
    async compartilharArquivo(canal, payload) {
      const shareNativoDisponivel = !!(navigator.share && navigator.canShare && payload?.arquivo)
      const canShareArquivo = shareNativoDisponivel && navigator.canShare({ files: [payload.arquivo] })

      if (canShareArquivo) {
        try {
          await navigator.share({
            title: 'Resultado da partida',
            text: payload.texto,
            files: [payload.arquivo]
          })
          return
        } catch (error) {
          if (error?.name === 'AbortError') return
          console.warn('Compartilhamento nativo indisponivel:', error)
        }
      }

      if (canal === 'whatsapp') {
        const linkWhatsApp = `https://wa.me/?text=${encodeURIComponent(payload.texto)}`
        window.open(linkWhatsApp, '_blank', 'noopener,noreferrer')
        this.baixarImagemCompartilhamento(payload.url, payload.arquivoNome)
        await Swal.fire({
          title: 'Imagem pronta',
          text: 'Abrimos o WhatsApp e baixamos a imagem para voce anexar.',
          icon: 'info',
          zIndex: 6000
        })
        return
      }

      this.baixarImagemCompartilhamento(payload.url, payload.arquivoNome)
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(payload.texto)
        }
      } catch (error) {
        console.warn('Nao foi possivel copiar a legenda automaticamente:', error)
      }
      await Swal.fire({
        title: 'Imagem pronta',
        text: 'A imagem foi baixada. Abra o Instagram e selecione na galeria.',
        icon: 'info',
        zIndex: 6000
      })
    },
    baixarImagemCompartilhamento(url, arquivoNome) {
      if (!url) return

      const link = document.createElement('a')
      link.href = url
      link.download = arquivoNome || 'resultado-partida.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    carregarImagemCanvas(url) {
      return new Promise((resolve) => {
        const src = String(url || '').trim()
        if (!src) {
          resolve(null)
          return
        }

        const imagem = new Image()
        imagem.crossOrigin = 'anonymous'
        imagem.onload = () => resolve(imagem)
        imagem.onerror = () => resolve(null)
        imagem.src = src
      })
    },
    desenharRetanguloArredondado(ctx, x, y, largura, altura, raio) {
      const r = Math.min(raio, largura / 2, altura / 2)
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + largura - r, y)
      ctx.quadraticCurveTo(x + largura, y, x + largura, y + r)
      ctx.lineTo(x + largura, y + altura - r)
      ctx.quadraticCurveTo(x + largura, y + altura, x + largura - r, y + altura)
      ctx.lineTo(x + r, y + altura)
      ctx.quadraticCurveTo(x, y + altura, x, y + altura - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    },
    quebrarTexto(ctx, texto, larguraMaxima) {
      const palavras = String(texto || '').trim().split(/\s+/).filter(Boolean)
      if (!palavras.length) return []

      const linhas = []
      let linhaAtual = palavras[0]

      for (let i = 1; i < palavras.length; i += 1) {
        const tentativa = `${linhaAtual} ${palavras[i]}`
        if (ctx.measureText(tentativa).width <= larguraMaxima) {
          linhaAtual = tentativa
        } else {
          linhas.push(linhaAtual)
          linhaAtual = palavras[i]
        }
      }

      linhas.push(linhaAtual)
      return linhas
    },
    obterSiglaTime(nome) {
      const partes = String(nome || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)

      if (!partes.length) return '--'
      if (partes.length === 1) return partes[0].slice(0, 3).toUpperCase()
      return partes.slice(0, 3).map(parte => parte.charAt(0).toUpperCase()).join('')
    },
    desenharAvatarTimeCanvas(ctx, imagem, x, y, raio, nomeTime, corFallback) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, raio, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()

      if (imagem) {
        ctx.drawImage(imagem, x - raio, y - raio, raio * 2, raio * 2)
      } else {
        const gradiente = ctx.createLinearGradient(x - raio, y - raio, x + raio, y + raio)
        gradiente.addColorStop(0, corFallback)
        gradiente.addColorStop(1, '#ffffff')
        ctx.fillStyle = gradiente
        ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2)

        ctx.fillStyle = '#0f172a'
        ctx.font = `800 ${Math.max(28, Math.round(raio * 0.7))}px Montserrat, Arial, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(this.obterSiglaTime(nomeTime), x, y + 2)
      }
      ctx.restore()

      ctx.beginPath()
      ctx.arc(x, y, raio, 0, Math.PI * 2)
      ctx.lineWidth = 6
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.stroke()
    },
    desenharNomeCompletoTime(ctx, nome, x, yInicial, larguraMaxima) {
      const nomeCompleto = String(nome || '').trim() || 'Time'
      let tamanhoFonte = 40
      let linhas = []

      while (tamanhoFonte >= 22) {
        ctx.font = `700 ${tamanhoFonte}px Montserrat, Arial, sans-serif`
        linhas = this.quebrarTexto(ctx, nomeCompleto, larguraMaxima)
        if (linhas.length <= 4) break
        tamanhoFonte -= 2
      }

      const alturaLinha = Math.round(tamanhoFonte * 1.18)
      linhas.forEach((linha, indice) => {
        ctx.fillText(linha, x, yInicial + indice * alturaLinha)
      })

      return linhas.length
    },
    async gerarImagemResultadoBlob() {
      const partida = this.partidaDetalhada || {}
      const largura = 900
      const altura = 1200
      const canvas = document.createElement('canvas')
      canvas.width = largura
      canvas.height = altura
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Nao foi possivel iniciar o canvas de compartilhamento')
      }

      const gradienteFundo = ctx.createLinearGradient(0, 0, largura, altura)
      gradienteFundo.addColorStop(0, '#0b132b')
      gradienteFundo.addColorStop(0.55, '#1d4ed8')
      gradienteFundo.addColorStop(1, '#0f172a')
      ctx.fillStyle = gradienteFundo
      ctx.fillRect(0, 0, largura, altura)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.09)'
      ctx.beginPath()
      ctx.arc(90, 90, 60, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(largura - 80, 180, 90, 0, Math.PI * 2)
      ctx.fill()

      this.desenharRetanguloArredondado(ctx, 52, 120, largura - 104, altura - 220, 38)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#ffffff'
      ctx.font = '800 46px Montserrat, Arial, sans-serif'
      ctx.fillText('Quadra Play', largura / 2, 86)
      ctx.font = '500 24px Montserrat, Arial, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.fillText('Resultado da partida', largura / 2, 116)

      const status = this.statusLabel(partida)
      this.desenharRetanguloArredondado(ctx, largura / 2 - 190, 178, 380, 52, 999)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.48)'
      ctx.fill()
      ctx.font = '800 22px Montserrat, Arial, sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(status, largura / 2, 212)

      const timeANome = partida.timeA?.nome || 'Time A'
      const timeBNome = partida.timeB?.nome || 'Time B'
      const resultado = this.isPartidaAgendada
        ? 'x'
        : `${partida.pontosTimeA ?? 0} x ${partida.pontosTimeB ?? 0}`

      const [fotoTimeA, fotoTimeB] = await Promise.all([
        this.carregarImagemCanvas(obterFotoTime(partida.timeA?.foto)),
        this.carregarImagemCanvas(obterFotoTime(partida.timeB?.foto))
      ])

      const yTimes = 430
      const xTimeA = 220
      const xTimeB = largura - 220
      const raioAvatar = 82

      this.desenharAvatarTimeCanvas(ctx, fotoTimeA, xTimeA, yTimes, raioAvatar, timeANome, '#dbeafe')
      this.desenharAvatarTimeCanvas(ctx, fotoTimeB, xTimeB, yTimes, raioAvatar, timeBNome, '#fee2e2')

      ctx.fillStyle = '#ffffff'
      ctx.font = '900 86px Montserrat, Arial, sans-serif'
      ctx.fillText(resultado, largura / 2, yTimes + 22)

      const larguraTextoTime = 300
      ctx.fillStyle = '#ffffff'
      this.desenharNomeCompletoTime(ctx, timeANome, xTimeA, 560, larguraTextoTime)
      this.desenharNomeCompletoTime(ctx, timeBNome, xTimeB, 560, larguraTextoTime)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(120, 770)
      ctx.lineTo(largura - 120, 770)
      ctx.stroke()

      const campeonatoNome = partida.campeonato?.nome || 'Campeonato'
      const quadraNome = partida.quadra?.nome || 'Quadra'
      const dataTexto = this.formatarDataPartida(partida?.data || partida?.createdAt)

      ctx.font = '700 30px Montserrat, Arial, sans-serif'
      ctx.fillStyle = '#ffffff'
      const linhasCampeonato = this.quebrarTexto(ctx, campeonatoNome, largura - 180).slice(0, 3)
      linhasCampeonato.forEach((linha, indice) => {
        ctx.fillText(linha, largura / 2, 840 + indice * 40)
      })

      ctx.font = '600 28px Montserrat, Arial, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
      ctx.fillText(quadraNome, largura / 2, 980)
      ctx.fillText(dataTexto, largura / 2, 1030)

      ctx.font = '500 20px Montserrat, Arial, sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)'
      ctx.fillText('Gerado por Quadra Play', largura / 2, altura - 64)

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((arquivo) => {
          if (arquivo) resolve(arquivo)
          else reject(new Error('Falha ao gerar imagem da partida'))
        }, 'image/jpeg', 0.92)
      })

      return blob
    },
    formatarDataPartida(data) {
      const dt = new Date(data)
      if (Number.isNaN(dt.getTime())) return '-'

      const diaSemana = dt.toLocaleDateString('pt-BR', { weekday: 'long' })
      const dataFormatada = dt.toLocaleDateString('pt-BR')
      const diaCapitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)

      return `${diaCapitalizado} - ${dataFormatada}`
    },
    listarNomesGoleadores(jogadoresPartida) {
      const nomes = [...new Set((Array.isArray(jogadoresPartida) ? jogadoresPartida : [])
        .filter(j => this.temGols(j))
        .map(j => String(j?.jogador?.nome || '').trim())
        .filter(Boolean))]
      return nomes.join(' • ')
    },
    valorPositivo(valor) {
      const numero = Number(valor)
      return Number.isFinite(numero) && numero > 0 ? numero : 0
    },
    temGols(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.gols) > 0
    },
    temCartaoAmarelo(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.cartoesAmarelos) > 0
    },
    temCartaoVermelho(jogadorPartida) {
      return this.valorPositivo(jogadorPartida?.cartoesVermelhos) > 0
    },
    temNumeroJogador(numero) {
      const numeroNormalizado = Number(numero)
      return Number.isInteger(numeroNormalizado) && numeroNormalizado > 0
    },
    jogadorSuspenso(jogadorPartida) {
      return !!jogadorPartida?.suspenso
    },
    temEstatisticas(jogadorPartida) {
      return this.temGols(jogadorPartida) ||
        this.temCartaoAmarelo(jogadorPartida) ||
        this.temCartaoVermelho(jogadorPartida)
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-partida {
  background-color: #fff;
  border-radius: 12px;
  padding: 28px 36px;
  width: fit-content;
  min-width: 900px;
  max-width: 95vw;
  max-height: 90vh;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.modal-partida h2 {
  font-size: 30px;
  color: #3b82f6;
  margin: 0;
}

.placar-modal {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
}

.time-mobile-title {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
}

.placar-modal .time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #374151;
  min-width: 0;
}

.goleadores-linha {
  margin: 0;
  width: 100%;
  color: #7e7e7e;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;   
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.placar-modal img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}

.resultado {
  font-size: 60px;
  font-weight: bold;
  color: #3b82f6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.infos {
  padding-top: 14px;
}

.infos p {
  margin: 6px 0;
  color: #4b5563;
  font-size: 15px;
}

.loader {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3b82f6;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.jogadores-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 6px;
}

.jogadores-time {
  border: 1px solid #3b82f6;
  border-radius: 10px;
  padding: 12px;
  background: #f9fafb;
}

.sem-escalacao {
  margin: 4px 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.jogador-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 8px;
  box-sizing: border-box;
}

.jogador-item.jogador-suspenso {
  background: #fff1f2;
}

.jogador-item:last-child {
  border-bottom: none;
}

.foto-jogador {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ccc;
}

.dados-jogador {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.nome {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
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

.nome.nome-suspenso {
  color: #b91c1c;
}

.status-suspenso {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 11px;
  font-weight: 700;
}

.estatisticas {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 0;
  flex-shrink: 0;
}

.estat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
  font-weight: 700;
}

.estat-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.estat-valor {
  font-size: 13px;
}

.gols {
  color: #1e3a8a;
}

.cartao {
  color: #64748b;
}

.cartao.amarelo {
  color: #ca8a04;
}

.cartao.vermelho {
  color: #dc2626;
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
  font-size: 15px;
}

.btn-cancel-placar:hover {
  background-color: #2563eb;
}

.acoes-modal {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
}

.btn-compartilhar {
  background: #0f172a;
  color: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.4);
  border-radius: 20px;
  cursor: pointer;
  min-height: 44px;
  margin-top: 20px;
  font-size: 15px;
  font-weight: 700;
}

.btn-compartilhar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-compartilhar-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-compartilhar-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #ffffff;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
}

.status-badge.status-andamento {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.12);
  border: 1px solid rgba(22, 163, 74, 0.35);
}

.status-badge.status-finalizada {
  color: #bd1c1c;
  background: rgba(189, 28, 28, 0.12);
  border: 1px solid rgba(189, 28, 28, 0.35);
}

.status-badge.status-agendada {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
  border: 1px solid rgba(37, 99, 235, 0.35);
}

.status-badge.status-cancelada {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.35);
}

.status-live-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #22c55e;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: statusDotPulse 1s infinite;
}

@keyframes statusDotPulse {
  0% {
    transform: scale(0.9);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }

  70% {
    transform: scale(1.2);
    opacity: 0.7;
    box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
  }

  100% {
    transform: scale(0.9);
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@media (max-width: 768px) {
  .modal-overlay {
    align-items: center;
    padding: 10px;
    overflow-y: auto;
  }

  .modal-partida {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    max-height: 92vh;
    overflow-y: auto;
    padding: 16px;
    border-radius: 16px 16px;
  }

  .modal-partida h2 {
    text-align: left;
    font-size: 24px;
  }

  .placar-modal {
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    text-align: center;
  }

  .placar-modal .time {
    font-size: 13px;
  }

  .goleadores-linha {
    font-size: 11px;
    max-width: 120px;
  }

  .placar-modal img {
    width: 38px;
    height: 38px;
  }

  .resultado {
    font-size: 26px;
  }

  .acoes-modal {
    grid-template-columns: 1fr;
  }

  .jogadores-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: none;
    overflow: visible;
  }

  .jogador-item {
    gap: 8px;
    align-items: center;
  }

  .foto-jogador {
    width: 38px;
    height: 38px;
  }

  .dados-jogador .nome {
    font-size: 13px;
    max-width: 130px;
  }

  .estatisticas {
    flex-wrap: nowrap;
    gap: 6px;
  }
}
</style>
