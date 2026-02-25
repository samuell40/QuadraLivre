<template>
  <div class="container position-absolute top-0 end-0 p-3 navbar-user-root">
    <div class="row align-items-center justify-content-end">
      <div class="col-md-6 user-info d-flex align-items-center justify-content-end">
        <div class="foto">
          <img :src="usuario?.foto" alt="Foto" class="rounded-circle user-photo1">
        </div>
        <div>
          <div class="user-name navbar-user-name fw-bold">{{ usuario?.nome }}</div>
          <div class="user-role">
            <span class="user-role-badge">
              <span>{{ String(usuario?.permissao?.descricao || 'Sem permissao').toUpperCase() }}</span>
            </span>
          </div>
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
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
  }
}
</script>

<style>
.user-info {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.user-photo1 {
  width: 55px;
  height: 55px;
  object-fit: cover;
  margin-right: 1px;
}

.user-info .user-name {
  font-size: 17px;
  color: #000;
  font-weight: bold;
}

.user-info .navbar-user-name {
  color: #000 !important;
}

.user-info .user-role {
  margin-top: 2px;
}

.user-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  color: #3b82f6;
  background: #dbeafe;
  border: 1px solid #bfdbfe;
  line-height: 1;
}

.shield-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .navbar-user-root {
    display: none !important;
  }

  .user-info {
    align-items: center;
    margin-right: 0;
    gap: 5px;
  }

  .user-photo1 {
    width: 50px;
    height: 50px;
  }

  .user-info .user-name {
    font-size: 14px;
  }

  .user-info .user-role {
    margin-top: 1px;
  }

  .user-role-badge {
    font-size: 10px;
    padding: 4px 8px;
  }
}
</style>
