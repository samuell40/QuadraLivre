<template>
    <div class="cadastro_quadra">
        <SideBar />
        <div class="container">
            <h1>Cadastrar Quadra</h1>
            <form @submit.prevent="cadastrarQuadra">
                <div class="form-group">
                    <label for="nome">Nome:</label>
                    <input type="text" id="nome" v-model="form.nome" required>
                </div>

                <div class="form-group">
                    <label for="email">Descrição:</label>
                    <input type="descricao" id="descricao" v-model="form.descricao" required>
                </div>

                <div class="form-group">
                    <label for="email">Endereço:</label>
                    <input type="endereco" id="endereco" v-model="form.endereco" required>
                </div>

                <div class="form-group" id="adicionar_imagem">
                    <label for="imagem">Imagem:</label>
                    <input type="file" id="imagem" @change="handleFileChange">
                </div>

                <button type="submit" class="btn_cadastrarquadra">Cadastrar Quadra</button>
            </form>
        </div>
    </div>
</template>

<script>
import SideBar from '@/components/SideBar.vue';

export default {
  components: {
    SideBar,
  },
  data() {
    return {
      form: {
        nome: '',
        descricao: '',
        endereco: '',
        imagem: null,
      }
    };
  },
  methods: {
    cadastrarQuadra() {
      console.log(this.form);
    },
    handleFileChange(event) {
      this.form.imagem = event.target.files[0];
    }
  }
};
</script>


<style scoped>
form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.cadastro_quadra {
    margin-left: 250px;
    padding: 20px;
    border-radius: 20px;
}
h1 {
    font-size: 30px;
    font-family: "Montserrat", sans-serif;
    font-weight: bold;
    margin-bottom: 50px;
    margin-top: 20px;
    margin-left: 7px;
    color:  #152147;
}

form {
    display: grid;
    gap: 25px;
    margin-top: 20px;
    align-items: start;
}

.form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
}

.form-group label {
    margin-bottom: 10px;
}

.form-group input,
select,
textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: 'Montserrat', sans-serif;
    box-sizing: border-box;
    resize: none;
}

.btn_cadastrarquadra {
    padding: 10px;
    background-color: #152147;
    border: none;
    border-radius: 4px;
    color: white;
    font-family: 'Montserrat', sans-serif;
    font-size: 15px;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
}

.btn_cadastrarprofissional:hover {
    background-color: #9B287B;
}

input[type="file"] {
    font-size: 14px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
}

#adicionar_imagem {
    grid-column: 1 / -1;
}

@media (max-width: 1024px) {
    .cadastro_quadra {
        margin-left: 0;
        padding: 15px;
    }
}

@media (max-width: 768px) {
    .cadastro_quadra {
        padding: 10px;
    }

    h1 {
        font-size: 24px;
        text-align: center;
    }

    .btn_cadastrarquadra {
        font-size: 14px;
    }
}

</style>
