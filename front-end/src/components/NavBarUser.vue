<template>
  <div class="navbar-user-root">
    <div class="navbar-user-shell">
      <div class="foto">
        <img
          v-if="usuario?.foto"
          :src="usuario.foto"
          :alt="`Foto de ${userName}`"
          class="user-photo1"
        >
        <span v-else class="user-fallback">{{ userInitial }}</span>
      </div>

      <div class="user-meta">
        <div class="user-name">{{ userName }}</div>

        <div class="user-role">
          <span class="user-role-badge">
            {{ roleLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBarUse',
  data() {
    return {
      usuario: null
    }
  },
  computed: {
    userName() {
      return this.usuario?.nome || 'Usuario'
    },
    roleLabel() {
      return String(this.usuario?.permissao?.descricao || 'Sem permissao').toUpperCase()
    },
    userInitial() {
      return this.userName.trim().charAt(0).toUpperCase() || 'U'
    }
  },
  mounted() {
    try {
      this.usuario = JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      this.usuario = null
    }
  }
}
</script>

<style scoped>
.navbar-user-root {
  position: absolute;
  top: 16px;
  right: 32px;
  padding: 0;
  z-index: 20;
}

.navbar-user-shell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  width: clamp(200px, calc((100vw - 620px) / 5), 252px);
  min-height: 58px;
  padding: 5px 14px 5px 7px;
  border-radius: 18px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.94) 100%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(14px);
  box-sizing: border-box;
}

.foto {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 50px;
  border-radius: 999px;
  padding: 3px;
  background: linear-gradient(145deg, #90dcff 0%, #56b8ff 45%, #2e78f4 100%);
  box-shadow: 0 0 0 2px #ebf6ff, 0 0 0 4px rgba(86, 184, 255, 0.3), 0 6px 14px rgba(45, 116, 229, 0.24);
}

.user-photo1,
.user-fallback {
  width: 44px;
  height: 44px;
  border-radius: 999px;
}

.user-photo1 {
  display: block;
  object-fit: cover;
  border: 2px solid #d9eaff;
  background: #d7dfec;
}

.user-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d9eaff;
  background: linear-gradient(180deg, #e0ecff 0%, #c9dcff 100%);
  color: #1d4ed8;
  font-size: 17px;
  font-weight: 800;
}

.user-meta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 3px;
}

.user-name {
  max-width: 100%;
  font-size: 13px;
  line-height: 1.05;
  color: #0f172a;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin-top: 0;
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 19px;
  padding: 0 7px;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .navbar-user-root {
    display: none;
  }
}
</style>
