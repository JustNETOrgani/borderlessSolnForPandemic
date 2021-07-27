<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="logOut">Log out</el-link>
        </div>
        <div class="wrapper">
            <h3>World Health Organization Management Dashboard</h3>
            <el-row>
                <el-col :span="12">
                    <el-menu
                    default-active="1-1"
                    class="el-menu-vertical-demo"
                    @open="handleOpen"
                    @close="handleClose"
                    background-color="#545c64"
                    text-color="#fff"
                    active-text-color="#ffd04b">
                    <el-submenu index="1">
                        <template slot="title">
                        <i class="el-icon-user-solid"></i>
                        <span>Country Management</span>
                        </template>
                        <el-menu-item-group title="About Countries">
                        <el-menu-item index="1-1">Register new Country</el-menu-item>
                        <el-menu-item index="1-2"><el-link :underline="false" style="color:#fff" href="revokeCountry">Revoke Country</el-link></el-menu-item>
                        <el-menu-item index="1-3"><el-link :underline="false" style="color:#fff" href="updateCountry">Country update</el-link></el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="Covid-19 Statistics">
                        <el-menu-item index="1-4">Statistics</el-menu-item>
                        </el-menu-item-group>
                        <el-submenu index="1-5">
                        <template slot="title">Activations</template>
                        <el-menu-item index="1-5-1"><el-link :underline="false" style="color:#fff" href="reactivateCountry">Reactivate Country</el-link></el-menu-item>
                        </el-submenu>
                    </el-submenu>
                    <el-menu-item index="2" disabled>
                        <i class="el-icon-menu"></i>
                        <span>Navigator Two</span>
                    </el-menu-item>
                    <el-menu-item index="3" disabled>
                        <i class="el-icon-document"></i>
                        <span>Navigator Three</span>
                    </el-menu-item>
                    <el-menu-item index="4" disabled>
                        <i class="el-icon-setting"></i>
                        <span>Navigator Four</span>
                    </el-menu-item>
                    </el-menu>
                </el-col>
                 <el-col :span="12">
                   <h3>Core tasks.</h3>
                   <a href="registerCountry"><img class="coreTasksLogo" src="../../assets/imgs/registerCountry.png" /></a>
                   <br>
                   <el-link :underline="false" href="registerCountry"><p>Register Country</p></el-link>
                   <br>
                   <a href="statistics"><img class="coreTasksLogo" src="../../assets/imgs/statisticsImg.png" /></a>
                   <br>
                   <el-link :underline="false" href="statistics"><p>Retrieve test/vaccine statistics</p></el-link>
                   <br>
                   <a href="revokeCountry"><img class="coreTasksLogo" src="../../assets/imgs/revokeCountry.png" /></a>
                   <br>
                   <el-link :underline="false" href="revokeCountry"><p>Revoke Country</p></el-link>
                 </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>

export default {
  data () {
    return {

    }
  },
  methods: {
    logOut () {
    // Clear authorization.
      sessionStorage.removeItem('API-HTTP-AUTHORIZATION')
      sessionStorage.removeItem('USER-TYPE')
      sessionStorage.clear()
      this.$router.push('/')
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    }
  },
  computed: {

  }
}
</script>

<style scoped>
#pageContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

#topNav{
  width: 100%;
  height: 5%;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 2.5% auto;
  width: 40%;
  padding: 1rem 1.5rem;
}
.coreTasksLogo{
  height: 5rem;
  border-radius: 50%;
  width: 5em;
}
.coreTasksLogo:hover{
    transform: scale(1.1); /* Negative value rotates and decreases size.*/
}
</style>
