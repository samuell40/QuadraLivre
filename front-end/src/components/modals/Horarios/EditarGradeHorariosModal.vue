<template>
    <div class="modal-overlay" @click.self="fechar">
        <div class="modal-content">
            <div class="modal-header">
                <div>
                    <h2 class="title">Editar Grade de Horários</h2>
                    <p class="subtitle">{{ quadra.nome }}</p>
                </div>
            </div>

            <div v-if="isLoading" class="loader-container">
                <div class="loader"></div>
            </div>

            <div v-else class="modal-body">
                <p class="info-text">Configure os dias de funcionamento da quadra.</p>

                <div class="tabs-header">
                    <button v-for="(dia, index) in diasSemanaNomes" :key="index"
                        :class="['tab-btn', { active: diaSelecionado === index }]" @click="mudarDia(index)">
                        {{ dia }}
                    </button>
                </div>

                <div class="tab-content">

                    <div class="dia-header-row">
                        <div class="titulo-switch-wrapper">
                            <h3 class="dia-titulo">{{ diasSemanaExtenso[diaSelecionado] }}</h3>

                            <div class="switch-container">
                                <span class="switch-label">{{ diaEstaAberto ? 'Aberto' : 'Fechado' }}</span>
                                <label class="switch">
                                    <input type="checkbox" :checked="diaEstaAberto" @change="alternarFuncionamento">
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div v-if="diaEstaAberto" class="ferramentas-icones">
                            <button class="btn-tool" @click="showGerador = !showGerador" title="Gerador Automático"
                                :class="{ active: showGerador }">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    viewBox="0 0 16 16">
                                    <path
                                        d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
                                </svg>
                                <span>Automático</span>
                            </button>
                            <button class="btn-tool" @click="showReplicar = !showReplicar"
                                title="Copiar para outros dias" :class="{ active: showReplicar }">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    viewBox="0 0 16 16">
                                    <path fill-rule="evenodd"
                                        d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                    <path
                                        d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                                    <path
                                        d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                                </svg>
                                <span>Copiar</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="diaEstaAberto" class="conteudo-aberto">

                        <div v-if="showGerador" class="painel-ferramenta slide-down">
                            <div class="gerador-inputs">
                                <div class="g-group">
                                    <label>Início</label>
                                    <input type="time" v-model="gerador.inicio">
                                </div>
                                <div class="g-group">
                                    <label>Fim</label>
                                    <input type="time" v-model="gerador.fim">
                                </div>
                                <div class="g-group">
                                    <label>Duração (min)</label>
                                    <input type="number" v-model="gerador.duracao" placeholder="60">
                                </div>
                                <button class="btn-acao-painel" @click="gerarHorariosAutomaticos">Gerar Grade</button>
                            </div>
                            <small class="hint">Substituirá os horários atuais deste dia.</small>
                        </div>

                        <div v-if="showReplicar" class="painel-ferramenta slide-down">
                            <p class="replicar-titulo">Copiar grade de <strong>{{ diasSemanaNomes[diaSelecionado]
                                    }}</strong> para:</p>
                            <div class="dias-checks">
                                <label v-for="(dia, idx) in diasSemanaNomes" :key="idx" class="chk-item">
                                    <input type="checkbox" :value="idx" v-model="diasParaReplicar"
                                        :disabled="idx === diaSelecionado">
                                    {{ dia }}
                                </label>
                            </div>
                            <button class="btn-acao-painel" @click="confirmarReplicacao">Aplicar Cópia</button>
                        </div>

                        <div class="add-horario-form">
                            <div class="input-wrapper">
                                <input type="time" v-model="novoHorarioInput" class="time-input"
                                    @keyup.enter="adicionarHorario" />
                                <span class="clock-icon">🕒</span>
                            </div>
                            <button @click="adicionarHorario" class="btn-add" :disabled="!novoHorarioInput">
                                + Adicionar
                            </button>
                        </div>

                        <div class="lista-horarios">
                            <div v-if="gradePorDia[diaSelecionado].length === 0" class="sem-horarios">
                                Nenhum horário configurado.
                            </div>
                            <div v-else v-for="(horario, hIndex) in gradePorDia[diaSelecionado]" :key="hIndex"
                                class="horario-chip">
                                <span>{{ horario }}</span>
                                <button @click="removerHorario(hIndex)" class="btn-remove-chip">&times;</button>
                            </div>
                        </div>

                        <div v-if="gradePorDia[diaSelecionado].length > 0" class="resumo-footer">
                            <span>{{ gradePorDia[diaSelecionado].length }} horários listados</span>
                            <button @click="limparDia" class="btn-clear">Limpar Dia</button>
                        </div>
                    </div>

                    <div v-else class="estado-fechado slide-down">
                        <div class="fechado-content">
                            <span class="fechado-icon">🚫</span>
                            <p><strong>Dia Fechado</strong></p>
                            <p class="fechado-desc">Não haverá horários disponíveis para agendamento.</p>
                        </div>
                    </div>

                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-cancelar" @click="fechar" :disabled="isSaving">Cancelar</button>
                <button class="btn-salvar" @click="salvarGradeCompleta" :disabled="isSaving || isLoading">
                    {{ isSaving ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import api from "@/axios";
import Swal from "sweetalert2";

export default {
    name: "EditarGradeHorariosModal",
    props: {
        quadra: { type: Object, required: true }
    },
    data() {
        return {
            isLoading: true,
            isSaving: false,
            diaSelecionado: 1,
            novoHorarioInput: "",
            showGerador: false,
            showReplicar: false,
            diasParaReplicar: [],
            gerador: { inicio: "07:00", fim: "23:00", duracao: 60 },
            diasSemanaNomes: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            diasSemanaExtenso: ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
            gradePorDia: [[], [], [], [], [], [], []],
            statusDias: [false, false, false, false, false, false, false]
        };
    },
    computed: {
        diaEstaAberto() {
            return this.statusDias[this.diaSelecionado];
        }
    },
    mounted() {
        this.carregarGradeExistente();
    },
    methods: {
        async carregarGradeExistente() {
            this.isLoading = true;
            try {
                const response = await api.get(`/grade-horarios/${this.quadra.id}`);
                this.gradePorDia = [[], [], [], [], [], [], []];
                this.statusDias = [false, false, false, false, false, false, false];

                response.data.forEach(item => {
                    if (this.gradePorDia[item.diaSemana]) {
                        this.gradePorDia[item.diaSemana].push(item.horario);
                        this.statusDias[item.diaSemana] = true;
                    }
                });
                this.gradePorDia.forEach(diaArr => diaArr.sort());
            } catch (error) {
                console.error("Erro ao carregar:", error);
            } finally {
                this.isLoading = false;
            }
        },

        mudarDia(index) {
            this.diaSelecionado = index;
            this.showGerador = false;
            this.showReplicar = false;
        },

        alternarFuncionamento() {
            const novoStatus = !this.statusDias[this.diaSelecionado];
            this.statusDias[this.diaSelecionado] = novoStatus;

            if (!novoStatus) {
                this.gradePorDia[this.diaSelecionado] = [];
            }
        },

        adicionarHorario() {
            if (!this.novoHorarioInput) return;
            const arr = this.gradePorDia[this.diaSelecionado];
            if (arr.includes(this.novoHorarioInput)) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Horário já existe', showConfirmButton: false, timer: 1500 });
                return;
            }
            arr.push(this.novoHorarioInput);
            arr.sort();
            this.novoHorarioInput = "";
        },

        removerHorario(index) {
            this.gradePorDia[this.diaSelecionado].splice(index, 1);
        },

        limparDia() {
            this.gradePorDia[this.diaSelecionado] = [];
        },

        gerarHorariosAutomaticos() {
            if (!this.gerador.inicio || !this.gerador.fim || !this.gerador.duracao) return;

            const novos = [];
            let atual = this.timeToMinutes(this.gerador.inicio);
            const fim = this.timeToMinutes(this.gerador.fim);
            const duracao = parseInt(this.gerador.duracao);

            while (atual < fim) {
                if (atual + duracao > fim && duracao > (fim - atual)) break;
                novos.push(this.minutesToTime(atual));
                atual += duracao;
            }

            this.gradePorDia[this.diaSelecionado] = novos;
            this.showGerador = false;
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Grade gerada!', showConfirmButton: false, timer: 1500 });
        },

        confirmarReplicacao() {
            if (this.diasParaReplicar.length === 0) return;
            const copia = [...this.gradePorDia[this.diaSelecionado]];

            this.diasParaReplicar.forEach(idx => {
                this.gradePorDia[idx] = [...copia];
                this.statusDias[idx] = true;
            });

            this.showReplicar = false;
            this.diasParaReplicar = [];
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Copiado com sucesso!', showConfirmButton: false, timer: 1500 });
        },

        timeToMinutes(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; },
        minutesToTime(m) { return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; },

        async salvarGradeCompleta() {
            this.isSaving = true;
            try {
                const promises = this.gradePorDia.map((horarios, diaIndex) => {
                    const dadosFinais = this.statusDias[diaIndex] ? horarios : [];
                    return api.post('/grade-horarios', { quadraId: this.quadra.id, diaSemana: diaIndex, horarios: dadosFinais });
                });
                await Promise.all(promises);
                Swal.fire("Sucesso", "Grade atualizada!", "success");
                this.$emit("sucesso");
                this.fechar();
            } catch (e) {
                Swal.fire("Erro", "Falha ao salvar.", "error");
            } finally {
                this.isSaving = false;
            }
        },
        fechar() { this.$emit("fechar"); }
    }
};
</script>

<style scoped>
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
    background: #fff;
    padding: 32px;
    border-radius: 12px;
    width: 95%;
    max-width: 750px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    color: #1e293b;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: 'Montserrat', sans-serif;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
}

.title {
    font-size: 24px;
    color: #3B82F6;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 4px 0 0 0;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}

.info-text {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 20px;
}

.tabs-header {
    display: flex;
    gap: 16px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 24px;
}

.tab-btn {
    background: none;
    border: none;
    padding: 12px 4px;
    font-size: 15px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
}

.tab-btn::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: #3B82F6;
    transform: scaleX(0);
    transition: transform 0.2s;
    border-radius: 3px 3px 0 0;
}

.tab-btn:hover {
    color: #3B82F6;
}

.tab-btn.active {
    color: #3B82F6;
    font-weight: 700;
}

.tab-btn.active::after {
    transform: scaleX(1);
}

.dia-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 10px;
}

.titulo-switch-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
}

.dia-titulo {
    font-size: 18px;
    color: #1e293b;
    margin: 0;
    font-weight: 600;
}

.switch-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.switch-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
}

.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #3B82F6;
}

input:checked+.slider:before {
    transform: translateX(18px);
}

.ferramentas-icones {
    display: flex;
    gap: 8px;
}

.btn-tool {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-tool:hover,
.btn-tool.active {
    background: #dbeafe;
    color: #3B82F6;
}

.painel-ferramenta {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.gerador-inputs {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.g-group {
    display: flex;
    flex-direction: column;
}

.g-group label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    margin-bottom: 4px;
    text-transform: uppercase;
}

.g-group input {
    padding: 8px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    width: 90px;
    font-size: 14px;
    color: #334155;
}

.btn-acao-painel {
    background: #3B82F6;
    color: white;
    border: none;
    padding: 9px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    height: 38px;
}

.btn-acao-painel:hover {
    background: #2563eb;
}

.hint {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 8px;
    display: block;
}

.replicar-titulo {
    font-size: 13px;
    margin: 0 0 10px 0;
    color: #475569;
}

.dias-checks {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 12px;
}

.chk-item {
    font-size: 13px;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    background: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
}

.add-horario-form {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 24px;
}

.input-wrapper {
    position: relative;
}

.time-input {
    padding: 10px 12px 10px 36px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 15px;
    width: 130px;
    color: #334155;
    outline: none;
    transition: border 0.2s;
}

.time-input:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clock-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 14px;
    pointer-events: none;
}

.btn-add {
    background: #94a3b8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-add:hover:not(:disabled) {
    background: #64748b;
}

.btn-add:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.lista-horarios {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 60px;
    align-content: flex-start;
}

.sem-horarios {
    width: 100%;
    text-align: center;
    color: #94a3b8;
    font-style: italic;
    font-size: 13px;
    margin-top: 10px;
}

.horario-chip {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.horario-chip:hover {
    background: #dbeafe;
}

.btn-remove-chip {
    background: none;
    border: none;
    color: #60a5fa;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    display: flex;
}

.btn-remove-chip:hover {
    color: #ef4444;
}

.resumo-footer {
    margin-top: 16px;
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
}

.btn-clear {
    background: none;
    border: none;
    color: #ef4444;
    font-size: 12px;
    cursor: pointer;
    text-decoration: underline;
}

.estado-fechado {
    background: #fef2f2;
    border: 1px dashed #fca5a5;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    margin-top: 20px;
    color: #991b1b;
    animation: slideDown 0.3s ease-out;
}

.fechado-icon {
    font-size: 40px;
    display: block;
    margin-bottom: 10px;
}

.fechado-desc {
    font-size: 13px;
    color: #b91c1c;
    margin-top: 5px;
}

.modal-footer {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn-cancelar {
    background: #f1f5f9;
    color: #475569;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.btn-cancelar:hover {
    background: #e2e8f0;
}

.btn-salvar {
    background: #3B82F6;
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);
}

.btn-salvar:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.5);
}

.btn-salvar:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loader-container {
    height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loader {
    width: 40px;
    height: 40px;
    border: 4px solid #f1f5f9;
    border-top-color: #3B82F6;
    border-radius: 50%;
    animation: spin 1s infinite linear;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>