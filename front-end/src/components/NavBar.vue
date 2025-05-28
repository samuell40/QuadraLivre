<template>
  <div>
    <nav class="navbar-custom">
      <div class="navbar-container">
        <div class="logo">Quadra Livre</div>
        <ul class="nav-links">
          <li><a href="/quadra">Quadras</a></li>
          <li><a href="/horarios">Horários</a></li>
          <li><a href="/placar">Placar</a></li>
          <li><a href="/login" class="login">Login</a></li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
}
</script>

<style scoped>
.navbar-custom {
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #152147;
  height: 70px;
  font-family: "Montserrat", sans-serif;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 30px;
  flex-wrap: wrap;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  white-space: nowrap;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 40px;
  margin: 0;
  padding: 0;
}

.nav-links li a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 500;
}

.nav-links .login {
  background-color: #1E3A8A;
  padding: 6px 16px;
  border-radius: 30px;
  font-weight:"Montserrat";
}

.image-container {
  margin-top: 70px;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
}
</style>