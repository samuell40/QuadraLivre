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
      <img src="../../assets/Cópia de xxxxx (2).png" class="logo" alt="Logo" />

      <!-- ADMINISTRAÇÃO -->
      <div v-if="!isPermissao4" class="sidebar-category">
        <div v-show="openCategory === 'admin'">
          <a href="/modalidades" :class="{ active: isActive('/modalidades') }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
            </svg>
            <span>Gerenciar Modalidades</span>
          </a>
          <a href="/gerenciarpartida" :class="{ active: isActive('gerenciarpartida') }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
            </svg>
            <span>Gerenciar Partidas</span>
          </a>
          <a href="/visualizarplacar" :class="{ active: isActive('/visualizarplacar') }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
            </svg>
            <span>Placar</span>
          </a>
          <a href="/gerenciartimes" :class="{ active: isActive('/gerenciartimes') }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor"
                d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h3V2h2v2h6V2h2v2h3q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm7.25-2h1.5v-1.5h-1.5zm4.25-3H18q.425 0 .713-.288T19 14v-4q0-.425-.288-.712T18 9h-2.5q-.425 0-.712.288T14.5 10v4q0 .425.288.713T15.5 15M5 15h4.5v-1.5h-3v-1h2q.425 0 .713-.288T9.5 11.5V10q0-.425-.288-.712T8.5 9H5v1.5h3v1H6q-.425 0-.712.288T5 12.5zm6.25-.5h1.5V13h-1.5zm4.75-1v-3h1.5v3zM11.25 11h1.5V9.5h-1.5zm0-3.5h1.5V6h-1.5z" />
            </svg>
            <span>Gerenciar Times</span>
          </a>

        </div>
      </div>

      <!-- LOGOUT -->
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
import router from "@/router";

export default {
  name: "SideBar",
  data() {
    return {
      sidebarVisible: true,
      isMobile: false,
      usuario: null,
      openCategory: localStorage.getItem("openCategory") ?? "agendamentos",
    };
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
    this.usuario = JSON.parse(localStorage.getItem("usuario"));
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  computed: {
    isPermissao4() {
      return this.usuario?.permissaoId === 4
    }
  },
  methods: {
    toggleSidebar() {
      if (this.isMobile) {
        this.sidebarVisible = !this.sidebarVisible;
      } else {
        this.sidebarVisible = true;
      }
    },
    toggleCategory(category) {
      if (category === "agendamentos") {
        this.openCategory = this.openCategory === category ? null : category;
      } else {
        this.openCategory = this.openCategory === category ? null : category;
      }
      localStorage.setItem("openCategory", this.openCategory);
    },
    isActive(path) {
      return this.$route.path === path;
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      router.push("/");
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      this.sidebarVisible = !this.isMobile;
    },
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
  margin-bottom: 10px;
  border: 1px solid;
}

.sidebar a {
  padding: 12px 15px;
  text-decoration: none;
  font-size: 14px;
  text-align: left;
  color: white;
  display: block;
  margin-left: 20px;
}

.sidebar a span {
  white-space: nowrap;
}

.sidebar a svg {
  margin-right: 5px;
  vertical-align: middle;
}

.sidebar a:hover {
  color: white;
}

.sidebar a.active {
  color: #3B82F6;
  text-decoration: none;
}

.sidebar a:hover {
  color: #3B82F6;
  border-radius: 6px;
  transition: background-color 0.2s ease;
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

.sidebar-links {
  display: flex;
  flex-direction: column;
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

.sidebar-category-header {
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
}

.sidebar-category-header.no-toggle {
  justify-content: flex-start;
}

.sidebar-category-header.no-toggle a {
  margin-left: 0;
  padding: 0;
  font-size: 16px;
  display: block;
  width: 100%;
}

.logo {
  width: 170px;
  height: 170px;
}
</style>