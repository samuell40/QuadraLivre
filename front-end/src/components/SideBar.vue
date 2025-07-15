<template>
    <div>
        <button class="button-sidebar d-block d-md-none" :class="{ hidden: !sidebarVisible }" @click="toggleSidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-list"
                viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
            </svg>
        </button>

        <div v-if="sidebarVisible" class="sidebar">
            <img src="../assets/Logo1.jpg" alt="Logo"> 
            <a href="/agendarquadra">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 56 56">
                    <path fill="currentColor"
                        d="M7.219 36.822c.985 0 1.548-.563 1.548-1.548V23.531c0-.985-.563-1.548-1.548-1.548H0v14.84Zm13.814-7.44c0 3.218 2.292 5.972 5.288 6.696V22.747a6.744 6.744 0 0 0-5.288 6.636m8.525 6.696c3.016-.724 5.248-3.478 5.288-6.696c.02-3.217-2.251-5.911-5.288-6.635Zm19.223-14.095c-.985 0-1.548.563-1.548 1.548v11.743c0 .985.563 1.548 1.548 1.548H56v-14.84ZM56 40.06h-7.28c-2.975 0-4.724-1.75-4.724-4.726V23.471c0-2.976 1.749-4.725 4.725-4.725H56v-2.072c0-4.142-2.111-6.233-6.314-6.233H29.558v9.27c4.705.764 8.184 4.765 8.244 9.692c.06 4.966-3.519 8.968-8.244 9.732v9.25h20.128c4.203 0 6.314-2.092 6.314-6.234Zm-56 0v2.09c0 4.143 2.131 6.234 6.314 6.234H26.32v-9.25c-4.705-.743-8.244-4.745-8.244-9.731c0-4.947 3.539-9.009 8.244-9.732v-9.23H6.314C2.13 10.441 0 12.512 0 16.674v2.072h7.279c2.976 0 4.725 1.749 4.725 4.725v11.863c0 2.976-1.75 4.726-4.725 4.726Z" />
                </svg>
                Quadra
            </a>
            <a href="/agendamentos">
                <svg width="16" height="16" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M9.375 7.5V1.25M21.875 7.5V1.25M26.875 21.25V26.875H4.375V23.125M26.7038 10.625H4.19M0.625 22.8125V23.125H23L23.1875 22.8125L23.48 22.1988C25.7152 17.5009 26.875 12.3638 26.875 7.16125V4.375H4.375V7.035C4.37505 12.2777 3.1973 17.4535 0.92875 22.18L0.625 22.8125Z"
                        stroke="white" />
                </svg>

                Agendamentos
            </a>
            <a href="/usuarios">
                <svg width="16" height="16" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M15 12.5C16.3261 12.5 17.5979 11.9732 18.5355 11.0355C19.4732 10.0979 20 8.82608 20 7.5C20 6.17392 19.4732 4.90215 18.5355 3.96447C17.5979 3.02678 16.3261 2.5 15 2.5C13.6739 2.5 12.4021 3.02678 11.4645 3.96447C10.5268 4.90215 10 6.17392 10 7.5C10 8.82608 10.5268 10.0979 11.4645 11.0355C12.4021 11.9732 13.6739 12.5 15 12.5ZM6.875 16.25C7.7038 16.25 8.49866 15.9208 9.08471 15.3347C9.67076 14.7487 10 13.9538 10 13.125C10 12.2962 9.67076 11.5013 9.08471 10.9153C8.49866 10.3292 7.7038 10 6.875 10C6.0462 10 5.25134 10.3292 4.66529 10.9153C4.07924 11.5013 3.75 12.2962 3.75 13.125C3.75 13.9538 4.07924 14.7487 4.66529 15.3347C5.25134 15.9208 6.0462 16.25 6.875 16.25ZM26.25 13.125C26.25 13.9538 25.9208 14.7487 25.3347 15.3347C24.7487 15.9208 23.9538 16.25 23.125 16.25C22.2962 16.25 21.5013 15.9208 20.9153 15.3347C20.3292 14.7487 20 13.9538 20 13.125C20 12.2962 20.3292 11.5013 20.9153 10.9153C21.5013 10.3292 22.2962 10 23.125 10C23.9538 10 24.7487 10.3292 25.3347 10.9153C25.9208 11.5013 26.25 12.2962 26.25 13.125ZM15 13.75C16.6576 13.75 18.2473 14.4085 19.4194 15.5806C20.5915 16.7527 21.25 18.3424 21.25 20V27.5H8.75V20C8.75 18.3424 9.40848 16.7527 10.5806 15.5806C11.7527 14.4085 13.3424 13.75 15 13.75ZM6.25 20C6.25 19.1338 6.375 18.2975 6.61 17.5075L6.3975 17.525C5.3261 17.6426 4.33583 18.1516 3.61658 18.9544C2.89733 19.7571 2.49972 20.7972 2.5 21.875V27.5H6.25V20ZM27.5 27.5V21.875C27.5001 20.7605 27.0749 19.6879 26.3111 18.8762C25.5473 18.0646 24.5025 17.575 23.39 17.5075C23.6238 18.2975 23.75 19.1338 23.75 20V27.5H27.5Z"
                        fill="white" />
                </svg>

                Usuarios
            </a>
            <a href="">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <g fill="#fff">
                        <rect width="5" height="18" x="16" y="3" rx="2" />
                        <rect width="5" height="12" x="9.5" y="9" rx="2" />
                        <rect width="5" height="5" x="3" y="16" rx="2" />
                    </g>
                </svg>
                Gráficos
            </a>
            <a href="/controleplacar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor"
                        d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
                </svg>
                Placar
            </a>
            <button class="logout-button" @click="logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-coin"
                    viewBox="0 0 16 16">
                    <path fill-rule="evenodd"
                        d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z" />
                    <path fill-rule="evenodd"
                        d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z" />
                </svg>
                Sair
            </button>
        </div>
    </div>
</template>
<script>
import { useAuthStore } from '@/store.js';

export default {
    name: "SideBar",
    setup() {
        const authStore = useAuthStore();

        return { authStore };
    },
    data() {
        return {
            sidebarVisible: true,
            isMobile: false,
        };
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    },
    beforeUnmount() {

        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        toggleSidebar() {
            if (this.isMobile) {   // Controla o estado do sidebar apenas quando o botão for clicado
                this.sidebarVisible = !this.sidebarVisible;
            } else {
                this.sidebarVisible = true; // No desktop, o sidebar permanece visível
            }
        },
        logout() {
            window.location.href = '/';
        },
        handleResize() {
            if (window.innerWidth <= 768) {
                this.isMobile = true;
                if (!this.sidebarVisible) {
                    this.sidebarVisible = false; // Oculta o sidebar no modo responsivo se estiver fechado
                }
            } else {
                this.isMobile = false;
                this.sidebarVisible = true; // No desktop, o sidebar deve estar sempre visível
            }
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

.sidebar {
    height: 100%;
    width: 250px;
    position: fixed;
    top: 0;
    left: 0;
    background-color: #152147;
    padding-top: 20px;
    text-align: center;
    box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.10);
     z-index: 10;
}

.sidebar img {
    width: 170px;
    margin-top: 20px;
    margin-bottom: 30px;
    border: 1px solid;
}

.sidebar a {
    padding: 20px 15px;
    text-decoration: none;
    font-size: 16px;
    text-align: left;
    color: white;
    display: block;
    margin-left: 30px;
}

.sidebar a svg {
    margin-right: 6px;
    /* Ajusta o espaço entre o ícone e o texto */
    vertical-align: middle;
}


.sidebar a:hover {
    color: white;
}

.logout-button {
    justify-content: center;
    position: absolute;
    bottom: 35px;
    font-size: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    /* Alinhamento com flexbox */
    align-items: center;
    /* Alinha verticalmente */
    background-color: transparent;
    /* Sem fundo */
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    width: 80%;
    text-align: center;
    font-family: 'Montserrat', sans-serif;
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

.button-sidebar.hidden {
    color: #152147;
}
</style>