<template>
    <div class="layout">
        <NavBarQuadra />

        <div class="conteudo">
            <div v-if="isLoading" class="loader"></div>

            <div v-else>
                <div class="abas-container">
                    <div class="aba" v-for="m in modalidades" :key="m.id" :class="{ ativa: modalidadeAtiva === m.id }"
                        @click="selecionarModalidade(m.id)">
                        {{ m.nome }}
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
                                        {{ j.nome }}
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
import NavBarQuadra from '@/components/quadraplay/NavBarQuadra.vue'
import api from '@/axios'

export default {
    name: 'TimesHomeView',
    components: { NavBarQuadra },

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
        async abrirModalJogadores(time) {
            this.timeSelecionado = time
            this.mostrarModal = true
            this.jogadores = []
            this.isLoadingJogadores = true

            try {
                const { data } = await api.get(`/time/${time.id}`)
                this.jogadores = data // <-- já é array
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

.lista-times {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 20px;
}

.card {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    gap: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.card-conteudo {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
}

.foto {
    flex: 0 0 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.foto img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px solid #276ef1;
    object-fit: cover;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.info h2 {
    margin: 0;
    font-size: 20px;
    color: #7E7E7E;
    font-weight: bold;
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
    border-radius: 12px;
    padding: 30px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: fit-content;
    min-width: 900px;
    max-width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    box-sizing: border-box;
}

.modal-jogadores {
    display: flex;
    flex-direction: column;
    gap: 40px;
    overflow-y: auto;
    max-height: 55vh;
    padding-right: 10px;
}

.titulo-funcao {
    font-size: 15px;
    font-weight: bold;
    color: #7E7E7E;
    border-left: 4px solid #3b82f6;
    padding-left: 10px;
    margin-bottom: 20px;
}

.grid-jogadores {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 20px;
}

.card-jogador {
    background: #fff;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    text-align: center;
    padding: 10px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-jogador:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-jogador img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    background: #f9fafb;
}

.nome-jogador {
    margin-top: 10px;
    background: #3b82f6;
    color: #fff;
    font-weight: bold;
    padding: 6px 4px;
    font-size: 14px;
}

.title_placar {
    color: #3b82f6;
    font-size: 28px;
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

@media (max-width: 768px) {
    .conteudo {
        padding: 16px;
    }

    .title {
        font-size: 22px;
    }

    .abas-container {
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }

    .aba {
        font-size: 14px;
        padding: 10px;
    }

    .lista-times {
        grid-template-columns: 1fr;
    }
}
</style>