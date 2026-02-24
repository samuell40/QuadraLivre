<template>
    <div class="layout">
        <NavBarHome />

        <div class="conteudo">
            <div v-if="isLoading" class="loader"></div>

            <div v-else>
                <div class="abas-container">
                    <div class="aba" v-for="m in modalidades" :key="m.id" :class="{ ativa: modalidadeAtiva === m.id }"
                        @click="selecionarModalidade(m.id)">
                        {{ formatarTextoCapitalizado(m.nome) }}
                    </div>
                </div>

                <h1 class="title">Times</h1>

                <div v-if="isLoadingTimes" class="loader"></div>

                <div v-else>
                    <div v-if="times && times.length" class="lista-times">
                        <div v-for="time in times" :key="time.id" class="card" @click="abrirModalJogadores(time)">

                            <div class="card-conteudo">
                                <div class="foto">
                                    <img :src="time.foto" :alt="time.nome" />
                                </div>

                                <div class="info">
                                    <h2>{{ time.nome }}</h2>
                                    <p>
                                        {{ time.qtdJogadores }}
                                        jogador{{ time.qtdJogadores === 1 ? '' : 'es' }}
                                    </p>

                                    <p>Treinador: {{ time.treinador }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else class="mensagem-placar">
                        Nenhum time encontrado para esta modalidade.
                    </div>
                </div>
            </div>
            <!-- MODAL JOGADORES -->
            <div v-if="mostrarModal" class="modal-overlay" @click.self="fecharModal">
                <div class="modal-conteudo modal-placar">
                    <div class="header-placar">
                        <h2 class="title_placar">
                            Jogadores – {{ timeSelecionado?.nome }}
                        </h2>
                    </div>

                    <div v-if="isLoadingJogadores" class="loader-container-centralizado">
                        <div class="loader"></div>
                    </div>

                    <!-- Lista de jogadores -->
                    <div v-else class="modal-jogadores">
                        <div v-for="(lista, funcao) in jogadoresPorFuncao" :key="funcao" class="grupo-funcao">
                            <h3 class="titulo-funcao">
                                {{ funcao.toUpperCase() }}
                            </h3>

                            <div class="grid-jogadores">
                                <div v-for="j in lista" :key="j.id" class="card-jogador">
                                    <img :src="j.foto" />
                                    <div class="nome-jogador">
                                        <span v-if="temNumeroJogador(j.numero)" class="numero-jogador">#{{ j.numero }}</span>
                                        <span>{{ formatarTextoCapitalizado(j.nome) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="!jogadores.length" class="sem-dados-centralizado">
                            Nenhum jogador cadastrado.
                        </div>
                    </div>

                    <button class="btn-cancel-placar" @click="fecharModal">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import NavBarHome from '@/components/NavBarHome.vue'
import api from '@/axios'

export default {
    name: 'TimesHomeView',
    components: { NavBarHome },

    data() {
        return {
            modalidades: [],
            modalidadeAtiva: null,
            times: [],
            isLoading: true,
            isLoadingTimes: false,
            mostrarModal: false,
            timeSelecionado: null,
            jogadores: [],
            isLoadingJogadores: false
        }
    },

    computed: {
        jogadoresPorFuncao() {
            const grupos = {}

            this.jogadores.forEach(j => {
                const funcao = j.funcao?.nome || 'Sem função'

                if (!grupos[funcao]) {
                    grupos[funcao] = []
                }

                grupos[funcao].push(j)
            })

            return grupos
        }
    },

    methods: {
        formatarTextoCapitalizado(texto) {
            if (!texto) return ''
            return String(texto)
                .toLowerCase()
                .replace(/(^|\s)\S/g, letra => letra.toUpperCase())
        },
        temNumeroJogador(numero) {
            const numeroNormalizado = Number(numero)
            return Number.isInteger(numeroNormalizado) && numeroNormalizado > 0
        },
        async abrirModalJogadores(time) {
            this.timeSelecionado = time
            this.mostrarModal = true
            this.jogadores = []
            this.isLoadingJogadores = true

            try {
                const { data } = await api.get(`/time/${time.id}`)
                this.jogadores = data
            } catch (err) {
                console.error('Erro ao carregar jogadores', err)
            } finally {
                this.isLoadingJogadores = false
            }
        },

        async carregarModalidades() {
            try {
                const { data } = await api.get('/listar/modalidade')
                this.modalidades = data

                if (data.length) {
                    this.modalidadeAtiva = data[0].id
                    this.carregarTimes()
                }
            } catch (err) {
                console.error('Erro ao carregar modalidades', err)
            } finally {
                this.isLoading = false
            }
        },

        async carregarTimes() {
            if (!this.modalidadeAtiva) {
                this.times = []
                return
            }

            this.isLoadingTimes = true

            try {
                const res = await api.get(`/times/modalidade/${this.modalidadeAtiva}`)
                this.times = res.data.map(t => ({
                    id: t.id,
                    nome: t.nome,
                    foto: t.foto,
                    modalidadeId: t.modalidadeId,
                    qtdJogadores: t._count?.jogadores,
                    treinador: t.treinador?.usuario?.nome,
                }))
            } catch (err) {
                console.error('Erro ao carregar times', err)
            } finally {
                this.isLoadingTimes = false
            }
        },

        fecharModal() {
            this.mostrarModal = false
            this.timeSelecionado = null
            this.jogadores = []
        },

        selecionarModalidade(id) {
            this.modalidadeAtiva = id
            this.carregarTimes()
        },

        obterQtdJogadores(time) {
            return time.jogadores ? time.jogadores.length : 0
        }
    },

    mounted() {
        this.carregarModalidades()
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

.conteudo {
    margin-top: 90px;
    padding: 20px 60px;
}

.title {
    font-size: 30px;
    color: #3b82f6;
    font-weight: bold;
    margin-bottom: 20px;
}

.loader {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #3b82f6;
    border-radius: 50%;
    width: 80px;
    height: 80px;
    animation: spin 1s linear infinite;
    margin: 30px auto;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.abas-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
}

.aba {
    padding: 8px 14px;
    border-radius: 999px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #e5e7eb;
    font-weight: 600;
    color: #475569;
    transition: 0.15s ease;
    user-select: none;
}

.aba:hover {
    border-color: #3b82f6;
    background: #f8fafc;
}

.aba.ativa {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    box-shadow: 0 10px 22px rgba(59, 130, 246, 0.18);
}

.lista-times {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
    margin-top: 14px;
}

.card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    padding: 16px 18px;
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    transition: 0.15s ease;
}

.card:hover {
    transform: translateY(-2px);
    border-color: #3b82f6;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.10);
}

.card-conteudo {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: flex-start;
}

.foto {
    flex: 0 0 72px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.foto img {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid #dbeafe;
    object-fit: cover;
    background: #f8fafc;
}

.info h2 {
    margin: 0;
    font-size: 18px;
    color: #334155;
    font-weight: 800;
}

.info p {
    margin: 4px 0;
    color: #666;
    font-size: 14px;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-conteudo.modal-placar {
    background-color: #fff;
    border-radius: 16px;
    padding: 0;
    display: flex;
    flex-direction: column;
    width: min(980px, 92vw);
    max-height: 80vh;
    overflow: hidden;
    box-sizing: border-box;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.25);
}

.header-placar {
    padding: 18px 22px;
    border-bottom: 1px solid #eef2f7;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.title_placar {
    color: #3b82f6;
    font-size: 24px;
    margin: 0;
}

.btn-fechar-x {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    background: #fff;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    color: #334155;
    transition: 0.15s ease;
}

.btn-fechar-x:hover {
    border-color: #3b82f6;
    color: #1d4ed8;
    background: #eff6ff;
}

.modal-jogadores {
    padding: 18px 18px 18px 22px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    max-height: calc(80vh - 140px);
    scrollbar-gutter: stable;
}

.modal-jogadores::-webkit-scrollbar {
    width: 10px;
}

.modal-jogadores::-webkit-scrollbar-track {
    background: transparent;
}

.modal-jogadores::-webkit-scrollbar-thumb {
    background: rgba(15, 23, 42, 0.18);
    border-radius: 999px;
    border: 3px solid transparent;
    background-clip: content-box;
}

.modal-jogadores::-webkit-scrollbar-thumb:hover {
    background: rgba(15, 23, 42, 0.28);
    border: 3px solid transparent;
    background-clip: content-box;
}

.modal-jogadores {
    scrollbar-width: thin;
    scrollbar-color: rgba(15, 23, 42, 0.25) transparent;
}

.titulo-funcao {
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    border-left: 3px solid #3b82f6;
    padding-left: 10px;
    margin-bottom: 16px;
}

.grid-jogadores {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 14px;
}

.card-jogador {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    text-align: center;
    transition: 0.15s ease;
}

.card-jogador:hover {
    transform: translateY(-3px);
    border-color: #3b82f6;
    box-shadow: 0 12px 26px rgba(0, 0, 0, 0.10);
}

.card-jogador img {
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    background: #f3f4f6;
    display: block;
}

.nome-jogador {
    margin: 0;
    padding: 8px 10px;
    background: #fff;
    color: #334155;
    font-weight: 800;
    font-size: 13px;
    border-top: 1px solid #eef2f7;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
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

.btn-cancel-placar {
    margin: 18px 22px 22px;
    padding: 16px 20px;
    width: calc(100% - 44px);
    border-radius: 999px;
    border: 2px solid #3b82f6;
    background: transparent;
    color: #3b82f6;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-cancel-placar:hover {
    background: #3b82f6;
    color: #fff;
    box-shadow: 0 10px 20px rgba(59, 130, 246, 0.25);
}

@media (max-width: 768px) {
    .conteudo {
        padding: 16px;
    }

    .title {
        font-size: 22px;
    }

    .abas-container {
        gap: 8px;
    }

    .aba {
        font-size: 14px;
        padding: 10px 12px;
    }

    .lista-times {
        grid-template-columns: 1fr;
    }

    .modal-conteudo.modal-placar {
        width: 94vw;
        max-height: 78vh;
        padding: 0;
        overflow: hidden;
    }

    .title_placar {
        font-size: 18px;
    }

    .modal-jogadores {
        max-height: calc(78vh - 140px);
        gap: 18px;
    }

    .grid-jogadores {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
    }

    .card-jogador img {
        aspect-ratio: 1 / 1;
    }

    .nome-jogador {
        font-size: 12px;
        padding: 6px 8px;
    }
}
</style>
