<template>
    <div>
        <button class="button-sidebar d-block d-md-none" @click="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
            </svg>
        </button>

        <div v-if="sidebarVisible" class="sidebar_quadra" :class="{ collapsed: !isMobile && collapsed }">
            <button v-if="!isMobile" class="collapse-btn" @click="toggleCollapse">
                <svg v-if="!collapsed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-caret-left" viewBox="0 0 16 16">
                    <path
                        d="M10 12.796V3.204L4.519 8zm-.659.753-5.48-4.796a1 1 0 0 1 0-1.506l5.48-4.796A1 1 0 0 1 11 3.204v9.592a1 1 0 0 1-1.659.753" />
                </svg>

                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                    class="bi bi-caret-right" viewBox="0 0 16 16">
                    <path
                        d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
                </svg>
            </button>
            <div class="menu-itens">
                <a href="/telainicial" :class="{ active: isActive('/telainicial') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-trophy-fill" viewBox="0 0 16 16">
                        <path
                            d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935" />
                    </svg>
                    <span>Todos Campeonatos</span>
                </a>
                <router-link :to="{ name: 'Detalhar_Campeonatos', query: { id: campeonatoId } }" class="menu-link "
                    :class="{ active: isActive('/detalharcampeonatos') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-grid-1x2-fill" viewBox="0 0 16 16">
                        <path
                            d="M0 1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm9 0a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1zm0 9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1z" />
                    </svg>
                    <span>Visão Geral</span>
                </router-link>
                <router-link :to="{ name: 'Classificacao', query: { id: campeonatoId } }" class="menu-link"
                    :class="{ active: isActive('/classificacao') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-bar-chart-fill" viewBox="0 0 16 16">
                        <path
                            d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" />
                    </svg>
                    <span>Classificação</span>
                </router-link>
                <router-link :to="{ name: 'Classificacao', query: { id: campeonatoId } }" class="menu-link"
                    :class="{ active: isActive('/classificacao') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-people-fill" viewBox="0 0 16 16">
                        <path
                            d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                    </svg>
                    <span>Gerenciar Equipes</span>
                </router-link>
                <router-link :to="{ name: 'Classificacao', query: { id: campeonatoId } }" class="menu-link"
                    :class="{ active: isActive('/classificacao') }">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-gear-fill" viewBox="0 0 16 16">
                        <path
                            d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                    </svg>
                    <span>Configurações</span>
                </router-link>
            </div>
            <div class="sidebar-user user-info">

                <img class="user-photo" :src="usuario?.foto" alt="Foto do usuário" />

                <div class="user-text">
                    <div class="user-name fw-bold">
                        {{ usuario?.nome }}
                    </div>
                    <div class="user-role">
                        {{ usuario?.permissao?.descricao }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import router from "@/router";
import { useCampeonatoStore } from '@/storecampeonato'

export default {
    name: "SideBar",
    data() {
        return {
            usuario: null,
            isMobile: false,
            collapsed: false,
            sidebarVisible: true
        };
    },
    mounted() {
        window.addEventListener("resize", this.handleResize)
        this.handleResize()
        this.usuario = JSON.parse(localStorage.getItem("usuario"))
    },

    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize)
    },
    computed: {
        isPermissao4() {
            return this.usuario?.permissaoId === 4
        },
        campeonatoId() {
            const store = useCampeonatoStore()
            return store.campeonatoAtivo?.id || null
        }
    },
    methods: {
        isActive(path) {
            return this.$route.path === path
        },

        isActiveRoute(name) {
            return this.$route.name === name
        },
        logout() {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            router.push("/");
        },
        handleResize() {
            this.isMobile = window.innerWidth <= 768
            if (this.isMobile) {
                this.sidebarVisible = false
                this.collapsed = false
                this.$emit('sidebar-toggle', false)
            } else {
                this.sidebarVisible = true
            }
        },

        toggleCollapse() {
            if (this.isMobile) return

            this.collapsed = !this.collapsed
            this.$emit('sidebar-toggle', this.collapsed)
        },

        toggleSidebar() {
            if (!this.isMobile) return

            this.sidebarVisible = !this.sidebarVisible
        }
    },
};
</script>

<style>
body {
    margin: 0;
    font-family: 'Montserrat', sans-serif;
    background-color: white;
}

.menu-itens {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.logout-container {
    position: absolute;
    bottom: 10px;
    width: 100%;
}

.sidebar_quadra {
    position: fixed;
    top: 70px;
    left: 0;
    width: 250px;
    height: calc(100% - 70px);
    background-color: #152147;
    padding-top: 10px;
    box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.10);
    z-index: 10;
    text-align: left;
    transition: width 0.3s ease;
    display: flex;
    flex-direction: column;
}

.sidebar_quadra.collapsed {
    width: 70px;
}

.sidebar_quadra.collapsed a span,
.sidebar_quadra.collapsed .user-text {
    display: none;
}

.sidebar_quadra.collapsed a {
    justify-content: center;
    padding: 12px 0;
}

.collapse-btn {
    position: absolute;
    top: 50%;
    right: -30px;
    transform: translateY(-50%);
    background-color: #152147;
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: background-color 0.2s;
}

.collapse-btn:hover {
    background-color: #1e3a8a;
}

.sidebar_quadra a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    color: white;
    text-decoration: none;
    font-size: 15px;
    width: 100%;
    justify-content: flex-start;
}

.sidebar_quadra a span {
    display: inline-block;
    white-space: nowrap;
}

.sidebar img {
    width: 170px;
    margin-top: 20px;
    margin-bottom: 10px;
    border: 1px solid;
}

.sidebar-user {
    margin-top: 115%;
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.sidebar_quadra.collapsed .sidebar-user {
    margin-top: auto;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
}

.sidebar_quadra.collapsed .user-photo {
    display: block;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
}

.sidebar_quadra.collapsed .user-info {
    justify-content: center;
}

.logout-button svg {
    margin-right: 8px;
}

.logout-button:hover {
    color: white;
}

.button-sidebar {
    position: fixed;
    top: -4px;
    left: -3px;
    font-size: 7px;
    padding: 10px 14px;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    z-index: 1000;
    cursor: pointer;
    background: transparent;
    color: rgb(240, 231, 231);
}

.logout-button {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    color: white;
    border: none;
    padding: 8px;
    cursor: pointer;
    width: 80%;
    margin: 0 auto 35px;
}

.logo {
    width: 170px;
    height: 170px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 99%;
}

.user-photo {
    display: none;
}

.user-text {
    display: flex;
    flex-direction: column;
}

.user-info .user-name {
    font-size: 15px;
    color: #3b82f6;
    font-weight: bold;
}

.user-info .user-role {
    font-size: 13px;
    color: #cbd5e1;
    margin-top: -1px;
}

@media (max-width: 768px) {
    .button-sidebar {
        width: 50px;
        height: 50px;
        padding: 12px;
        font-size: 20px;
        top: 5px;
    }

    .button-sidebar svg {
        width: 32px;
        height: 32px;
    }

    .user-photo {
        width: 45px;
        height: 45px;
    }

    .user-info .user-name {
        font-size: 14px;
    }

    .user-info .user-role {
        font-size: 11px;
    }
}
</style>