<template>
  <div class="container position-absolute top-0 end-0 p-3">
    <div class="row align-items-center justify-content-end">
      <div class="col-md-6 user-info d-flex align-items-center justify-content-end"> 
        <div class="foto">
          <img 
            :src="usuario?.foto" 
            alt="Foto" 
            class="rounded-circle user-photo"
          >
        </div>
        <div>
          <div class="user-name fw-bold">{{ usuario?.nome }}</div>
          <div class="user-role text-muted">{{ formatarFuncao(usuario?.funcao) }}</div>
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
    this.usuario = JSON.parse(localStorage.getItem("usuario") || "null")
    console.log("Usuário logado no NavBarUse:", this.usuario)
  },
  methods: {
    formatarFuncao(funcao) {
      if (!funcao) return '';
      return funcao
        .split('_') 
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()) 
        .join(' '); 
    }
  }
}
</script>

<style>
.user-info {
  display: flex;
  align-items: center;
  margin-right: 20px; 
}

.user-photo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 1px; 
}

.user-info .user-name {
  font-size: 20px;
}

.user-info .user-role {
  font-size: 14px;
}

@media (max-width: 768px) {
  .user-info {
    align-items: center;
    margin-right: 0;
    gap: 5px;
  }

  .user-photo {
    width: 50px;
    height: 50px;
  }

  .user-info .user-name {
    font-size: 14px;
  }

  .user-info .user-role {
    font-size: 10px;
    text-align: center;
  }
}
</style>