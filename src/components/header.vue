<template>
  <div class="header">
    <div class="menu">
      <p id="appHeadingOne">Privacy-aware Secure and Borderless Travel Solution for COVID-19 and Future Pandemics</p>
      <img class="logo" src="../assets/imgs/appLogo.png" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Head',
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>

<style scoped>
.header {
  height: 4.5rem;
  padding: 0.5rem 1rem;
  display: flex;
  background-color: #ffffff;
}
.logo {
  height: 4.5rem;
}

.menu {
  flex: 1;
  display: flex;
  /* align-items: center; */
  justify-content: flex-end;
}

.menu-item {
  text-decoration: none;
  color: #60bdfa;
  margin: 0 0.5rem;
}

#appHeadingOne{
    color: rgb(60, 87, 117);
    font-size: 2rem;
    font-family: sans-serif;
    margin: 0.9% auto;
}
el-menu-item:hover{
  text-decoration: cadetblue;
}
</style>
