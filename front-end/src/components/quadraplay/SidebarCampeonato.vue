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
                <div class="menu-group">
                    <router-link :to="{ name: 'gerenciar_partida', query: { id: campeonatoId } }" class="menu-link"
                        :class="{ active: isPartidasAtivo }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
                        </svg>
                        <span>Partidas</span>
                    </router-link>
                    <router-link v-if="estaNaPartida" :to="{ name: 'Partida', query: { id: campeonatoId } }"
                        class="menu-link submenu" :class="{ active: isActiveRoute('Partida') }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                            class="bi bi-controller" viewBox="0 0 16 16">
                            <path
                                d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1z" />
                            <path
                                d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729q.211.136.373.297c.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466s.34 1.78.364 2.606c.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527s-2.496.723-3.224 1.527c-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.3 2.3 0 0 1 .433-.335l-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a14 14 0 0 0-.748 2.295 12.4 12.4 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.4 12.4 0 0 0-.339-2.406 14 14 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27s-2.063.091-2.913.27" />
                        </svg>
                        <span>Controle Partida</span>
                    </router-link>
                </div>
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

const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

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
        window.addEventListener("resize", this.handleResize);
        const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        this.collapsed = saved === "1";

        this.handleResize();
        this.usuario = JSON.parse(localStorage.getItem("usuario"));
    },

    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },

    computed: {
        isPermissao4() {
            return this.usuario?.permissaoId === 4
        },

        campeonatoId() {
            const store = useCampeonatoStore()
            return store.campeonatoAtivo?.id
        },

        estaNaPartida() {
            return this.$route.name === 'Partida'
        },

        isPartidasAtivo() {
            return ['gerenciar_partida', 'Partida'].includes(this.$route.name)
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
                this.$emit('sidebar-toggle', false)
            } else {
                this.sidebarVisible = true
                const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
                this.collapsed = saved === "1"
                this.$emit('sidebar-toggle', this.collapsed)
            }
        },

        toggleCollapse() {
            if (this.isMobile) return
            this.collapsed = !this.collapsed
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, this.collapsed ? "1" : "0")

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
    flex: 1;
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
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
}

.sidebar_quadra.collapsed {
    width: 70px;
}

.sidebar_quadra.collapsed a span,
.sidebar_quadra.collapsed .user-text {
    display: none;
}

.sidebar_quadra a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    color: white;
    text-decoration: none;
    font-size: 15px;
}

.sidebar-user {
    margin-top: auto;
    margin-bottom: 20%;
    padding: 12px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.user-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar_quadra.collapsed .sidebar-user {
    justify-content: center;
    padding: 20px 0;
}

.sidebar_quadra.collapsed .user-photo {
    display: block;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    object-fit: cover;
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
}

.button-sidebar {
    position: fixed;
    top: 5px;
    left: 5px;
    z-index: 1000;
    background: transparent;
    border: none;
    color: white;
}

.menu-group {
    display: flex;
    flex-direction: column;
}

.menu-link.submenu {
    padding-left: 45px;
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.05);
}

.menu-link.submenu svg {
    opacity: 0.9;
}

@media (max-width: 768px) {
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