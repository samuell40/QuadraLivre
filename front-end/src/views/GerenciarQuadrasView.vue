<template>
    <div class="layout">
        <SideBar />

        <div class="conteudo">
            <div class="header-gerenciar">
                <h1 class="title">Gerenciar Quadras</h1>

                <button v-if="authStore.usuario?.permissaoId === 1" class="btn-cadastrar-topo"
                    @click="$router.push('/cadastrarquadra')">
                    Adicionar Quadra
                </button>
            </div>

            <div v-if="isLoading" class="loader-container-centralizado">
                <div class="loader"></div>
            </div>

            <div v-else>
                <div v-if="quadras.length === 0" style="text-align: center; color: #666; margin-top: 50px;">
                    <h3>Nenhuma quadra vinculada ao seu perfil.</h3>
                </div>

                <div class="quadras-grid">
                    <div class="card-quadra" v-for="quadra in quadras" :key="quadra.id">
                        <div class="status-badge" :class="quadra.interditada ? 'interditada' : 'ativa'">
                            {{ quadra.interditada ? 'INDISPONÍVEL' : 'ATIVA' }}
                        </div>

                        <img :src="quadra.foto || require('@/assets/futibinha.png')" :alt="quadra.nome"
                            class="imagem-quadra" />

                        <div class="overlay">
                            <h3 class="nome-quadra">{{ quadra.nome }}</h3>
                            <p class="endereco">{{ quadra.endereco }}</p>

                            <div class="botoes-acao">
                                <button class="btn-editar-card" @click="abrirModalEdicao(quadra)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor"
                                        viewBox="0 0 16 16" class="btn-icon">
                                        <path
                                            d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                                    </svg>
                                    Editar Quadra
                                </button>

                                <button class="btn-grade-card" @click="abrirModalGrade(quadra)">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor"
                                        class="btn-icon" viewBox="0 0 16 16">
                                        <path
                                            d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z" />
                                        <path
                                            d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z" />
                                    </svg>
                                    Horários
                                </button>

                                <button class="btn-status-card"
                                    :class="quadra.interditada ? 'btn-liberar' : 'btn-bloquear'"
                                    @click="alternarStatus(quadra)">
                                    <svg v-if="quadra.interditada" xmlns="http://www.w3.org/2000/svg" width="12"
                                        height="12" fill="currentColor" viewBox="0 0 16 16" class="btn-icon">
                                        <path
                                            d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                        fill="currentColor" viewBox="0 0 16 16" class="btn-icon">
                                        <path
                                            d="M15 8a6.97 6.97 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0" />
                                    </svg>
                                    {{ quadra.interditada ? 'Liberar' : 'Fechar' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="quadraEditando" class="modal-overlay">
                <div class="modal-content">
                    <h2 class="title" style="margin-bottom: 20px; font-size: 30px;">Editar Unidade: {{
                        quadraEditando.nome }}</h2>
                    <form @submit.prevent="salvarEdicao">
                        <div class="form-group">
                            <label for="nome">Nome da Quadra:</label>
                            <input type="text" id="nome" v-model="formEdicao.nome" required />
                        </div>
                        <div class="form-group">
                            <label for="endereco">Endereço:</label>
                            <input type="text" id="endereco" v-model="formEdicao.endereco" required />
                        </div>
                        <div class="form-group">
                            <label>Modalidades Disponíveis:</label>
                            <div class="checkbox-list">
                                <div v-for="mod in todasModalidades" :key="mod.id" class="checkbox-item">
                                    <input type="checkbox" :id="'mod-' + mod.id" :value="mod.id"
                                        v-model="formEdicao.modalidadesSelecionadas" />
                                    <label :for="'mod-' + mod.id">{{ formatarNomeModalidade(mod.nome) }}</label>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="imagem">Atualizar Imagem (Opcional):</label>
                            <input type="file" id="imagem" @change="handleFileChange" accept=".jpg, .jpeg, .png" />
                        </div>
                        <div class="modal-botoes">
                            <button type="button" class="btn-cancelar" @click="quadraEditando = null">Cancelar</button>
                            <button type="submit" class="btn_salvar_modal">Confirmar Alterações</button>
                        </div>
                    </form>
                </div>
            </div>

            <EditarGradeHorariosModal v-if="mostrarModalGrade && quadraParaGrade" :quadra="quadraParaGrade"
                @fechar="mostrarModalGrade = false" @sucesso="mostrarModalGrade = false" />

        </div>
    </div>
</template>

<script>
import Swal from "sweetalert2";
import SideBar from '@/components/SideBar.vue';
import api from "@/axios";
import { useAuthStore } from "@/store";
import EditarGradeHorariosModal from '@/components/modals/Horarios/EditarGradeHorariosModal.vue';

export default {
    name: "AdminGerenciarQuadras",
    components: { SideBar, EditarGradeHorariosModal },
    setup() {
        const authStore = useAuthStore();
        return { authStore };
    },
    data() {
        return {
            quadras: [],
            todasModalidades: [],
            isLoading: true,
            quadraEditando: null,
            formEdicao: { nome: '', endereco: '', imagem: null, modalidadesSelecionadas: [] },
            quadraParaGrade: null,
            mostrarModalGrade: false
        };
    },
    mounted() {
        this.carregarDados();
    },
    methods: {
        async carregarDados() {
            this.isLoading = true;
            try {
                const [resQuadras, resModalidades] = await Promise.all([
                    api.get("/quadra"),
                    api.get("/listar/modalidade")
                ]);

                const todasAsQuadras = resQuadras.data;
                const usuario = this.authStore.usuario;

                if (usuario.permissaoId === 2 && usuario.quadraId) {
                    this.quadras = todasAsQuadras.filter(q => q.id === usuario.quadraId);
                } else {
                    this.quadras = todasAsQuadras;
                }

                this.todasModalidades = resModalidades.data;
            } catch (err) {
                Swal.fire("Erro de Sistema", "Não foi possível carregar os dados das quadras.", "error");
            } finally {
                this.isLoading = false;
            }
        },

        abrirModalEdicao(quadra) {
            this.quadraEditando = quadra;
            this.formEdicao = {
                nome: quadra.nome,
                endereco: quadra.endereco,
                imagem: null,
                modalidadesSelecionadas: quadra.modalidades.map(m => m.id)
            };
        },

        abrirModalGrade(quadra) {
            this.quadraParaGrade = quadra;
            this.mostrarModalGrade = true;
        },

        handleFileChange(event) {
            this.formEdicao.imagem = event.target.files[0];
        },

        async salvarEdicao() {
            if (this.formEdicao.modalidadesSelecionadas.length === 0) {
                Swal.fire("Aviso", "É obrigatório selecionar ao menos uma modalidade para a unidade.", "warning");
                return;
            }
            try {
                let urlImagem = this.quadraEditando.foto;
                if (this.formEdicao.imagem) {
                    const formData = new FormData();
                    formData.append('file', this.formEdicao.imagem);
                    const uploadRes = await api.post('/upload', formData);
                    urlImagem = uploadRes.data.fileUrl;
                }
                const modalidadesFormatadas = this.formEdicao.modalidadesSelecionadas.map(id => ({ id }));
                await api.patch(`/quadra/${this.quadraEditando.id}`, {
                    nome: this.formEdicao.nome,
                    endereco: this.formEdicao.endereco,
                    foto: urlImagem,
                    modalidades: modalidadesFormatadas
                });
                Swal.fire({ icon: 'success', title: 'Sucesso', text: 'O registro atualizado.', timer: 2000, showConfirmButton: false });
                this.quadraEditando = null;
                this.carregarDados();
            } catch (err) {
                Swal.fire("Erro", "Falha ao salvar alterações.", "error");
            }
        },

        async alternarStatus(quadra) {
            const novoStatus = !quadra.interditada;
            const acaoTexto = novoStatus ? 'interditar' : 'liberar';
            const result = await Swal.fire({
                title: `Confirmar alteração`,
                text: `Deseja ${acaoTexto} a quadra "${quadra.nome}"?`,
                icon: 'warning', showCancelButton: true,
                confirmButtonColor: novoStatus ? '#1E3A8A' : '#3B82F6', cancelButtonColor: '#D9D9D9',
                confirmButtonText: 'Confirmar', cancelButtonText: 'Cancelar'
            });
            if (result.isConfirmed) {
                try {
                    await api.patch(`/quadra/${quadra.id}`, { interditada: novoStatus });
                    this.carregarDados();
                    Swal.fire('Sucesso', `Status alterado com sucesso.`, 'success');
                } catch (error) {
                    Swal.fire("Erro", "Não foi possível alterar o status.", "error");
                }
            }
        },

        formatarNomeModalidade(nome) {
            return nome.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }
    }
};
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Montserrat', sans-serif;
}

.conteudo {
    flex: 1;
    padding: 32px;
    margin-left: 250px;
    background-color: #F7F9FC;
}

.header-gerenciar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.title {
    font-size: 30px;
    color: #3B82F6;
    font-weight: bold;
    margin: 0;
}

.btn-cadastrar-topo {
    background-color: #3B82F6;
    padding: 8px 14px;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    color: white;
}

.quadras-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 25px;
    margin-top: 25px;
}

.card-quadra {
    position: relative;
    height: 250px;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    background-color: #FFFFFF;
}

.card-quadra:hover {
    transform: translateY(-5px);
}

.imagem-quadra {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    background: linear-gradient(transparent, rgba(21, 33, 71, 0.95));
    padding: 15px 20px;
    color: white;
    box-sizing: border-box;
}

.nome-quadra {
    font-size: 20px;
    font-weight: bold;
    margin: 0;
}

.endereco {
    font-size: 13px;
    color: #e2e8f0;
    margin: 4px 0 8px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.status-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    color: white;
    z-index: 5;
}

.status-badge.ativa {
    background: #3B82F6;
}

.status-badge.interditada {
    background: #f73434;
}

.botoes-acao {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.botoes-acao button {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    flex: 1;
    white-space: nowrap;
    min-width: 80px;
}

.btn-icon {
    margin-right: 5px;
    vertical-align: middle;
}

.btn-editar-card {
    background: #3B82F6;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-editar-card:hover {
    background: #1E3A8A;
}

.btn-grade-card {
    background: #f59e0b;
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-grade-card:hover {
    background: #d97706;
}

.btn-status-card {
    color: white;
    border: none;
    padding: 6px 10px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-liberar {
    background: #32d084;
}

.btn-liberar:hover {
    background: #26a166;
}

.btn-bloquear {
    background: #f73434;
}

.btn-bloquear:hover {
    background: #a42222;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #FFFFFF;
    padding: 40px;
    border-radius: 15px;
    width: 80%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    color: #152147;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    text-align: left;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 8px;
}

.form-group input {
    padding: 10px;
    border: 1px solid #D9D9D9;
    border-radius: 6px;
    color: #152147;
}

.form-group input:focus {
    outline: 2px solid #3B82F6;
}

.checkbox-list {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #D9D9D9;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #FFFFFF;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #D9D9D9;
}

.checkbox-item label {
    font-size: 12px;
    margin: 0;
    cursor: pointer;
    color: #152147;
}

.modal-botoes {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
}

.btn-cancelar {
    background: #D9D9D9;
    color: #152147;
    border: none;
    padding: 10px 25px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
}

.btn_salvar_modal {
    background-color: #3B82F6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    padding: 10px 30px;
    width: auto;
}

.loader-container-centralizado {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
}

.loader {
    border: 6px solid #F7F9FC;
    border-top: 6px solid #3B82F6;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

@media (max-width: 900px) {
    .conteudo {
        margin-left: 0;
    }

    .checkbox-list {
        grid-template-columns: repeat(2, 1fr);
    }

    .quadras-grid {
        grid-template-columns: 1fr;
    }
}
</style>