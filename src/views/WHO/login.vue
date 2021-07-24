<template>
  <div class="home">
    <div id="topNav">
        <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
    </div>
    <div id="loginWrapper">
      <el-row>
      <el-col :span="22">
        <el-col :span="6">
          <fieldset>
            <legend>WHO Login</legend>
              <img alt="MetaMask Logo" src="../../assets/imgs/metaMaskLogo.png">
              <el-button :loading="metaMaskLoginBtn" @click="metaMaskLogin()" type="primary" plain>Login with MetaMask</el-button>
          </fieldset>
        </el-col>
      </el-col>
    </el-row>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  // name: 'Home',
  data () {
    return {
      userAddr: null,
      // Loading states
      metaMaskLoginBtn: false
    }
  },
  components: {
  },
  created () {

  },
  methods: {
    hoverCard (selectedIndex) {
      this.selectedCard = selectedIndex
    },
    isSelected (cardIndex) {
      return this.selectedCard === cardIndex
    },
    LinkRedirect (selectedIndex) {
      if (selectedIndex === 0) {
        window.location.href('WHO/login')
      }
      if (selectedIndex === 1) {
        console.log('2 selected')
      }
      if (selectedIndex === 2) {
        console.log('3 selected')
      }
      if (selectedIndex === 3) {
        console.log('4 selected')
      }
      if (selectedIndex === 4) {
        console.log('5 selected')
      }
    },
    backToPrvPg () {
      this.$router.push('/')
    }
  },
  computed: {

  }
}
</script>

<style scoped>
.home {
  height: 100%;
  display: flex;
  flex-direction: column;
}
#topNav{
  width: 100%;
  height: 5%;
}
#loginWrapper{
  margin: 20% 40%;
  width: 20%;
  padding: 1rem 1.5rem;
}
legend {
 font-style: italic;
}
</style>
