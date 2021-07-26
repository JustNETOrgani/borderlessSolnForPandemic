<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="LogOut">Log out</el-link>
        </div>
        <div class="wrapper" :loading="pageLoadingState">
            <h3>Country Management Dashboard</h3>
            <el-row>
                <el-col :span="6">
                    <h5>Name of Country: {{country_Name}}</h5>
                </el-col>
                <el-col :span="6">
                    <h5>Address of Smart Contract: {{country_SCaddr}}</h5>
                </el-col>
                <el-col :span="6">
                    <h5>Status: {{country_Status}}</h5>
                </el-col>
                <el-col :span="6">
                    <h5>IPFS hash of TC document: {{country_tcIPFShash}}</h5>
                </el-col>
            </el-row>
            <div class="tasksSections" id="registTask">
                <el-row>
                    <el-col :span="12" :offset="5">
                        <h4>Registration</h4>
                        <a href="registerTC"><img class="coreTasksLogo" src="../../assets/imgs/registerCountry.png" /></a>
                        <br>
                        <el-link :underline="false" href="registerTC"><p>Register Testing Center (TC)</p></el-link>
                    </el-col>
                </el-row>
            </div>
            <div class="tasksSections" id="actTasks">
                <el-row>
                    <el-col :span="12" :offset="5">
                        <h4>Activations</h4>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6" :offset="4">
                        <a href="reactivateTC"><img class="coreTasksLogo" src="../../assets/imgs/reactivate.png" /></a>
                        <br>
                        <el-link :underline="false" href="reactivateTC"><p>Reactivate TC</p></el-link>
                    </el-col>
                    <el-col :span="6" :offset="4">
                        <a href="revokeTC"><img class="coreTasksLogo" src="../../assets/imgs/revokeCountry.png" /></a>
                        <br>
                        <el-link :underline="false" href="revokeTC"><p>Revoke TC</p></el-link>
                    </el-col>
                </el-row>
            </div>
            <div class="tasksSections" id="statsTasks">
                <el-row>
                    <el-col :span="12" :offset="5">
                        <h4>Statistics</h4>
                        <a href="statistics"><img class="coreTasksLogo" src="../../assets/imgs/statisticsImg.png" /></a>
                        <br>
                        <el-link :underline="false" href="statistics"><p>Retrieve test/vaccine statistics</p></el-link>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  data () {
    return {
      pageLoadingState: false,
      country_Name: '',
      country_SCaddr: '',
      country_Status: '',
      country_tcIPFShash: ''
    }
  },
  created () {
    /* if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.currentAddress = accounts[0]
        console.log('Current account: ', this.currentAddress)
      })
    } */
    this.pageLoadingState = true
    // Make a call to WHO SC to get details about country before page loads. Name, Deployed SC address.
  },
  methods: {
    LogOut () {
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
  height: 3%;
}
h3{color:cornflowerblue}
h4{text-align: center; color: darksalmon;}

.wrapper {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 2.5% auto;
  width: 90%;
  padding: 1rem 1.5rem;
}
.tasksSections{
    width: 33%;
    height: 35%;
    float: left;
    align-content: center;
    margin-top: 1.4rem;
}

#registTask{
    background-color: rgb(203, 214, 214);
}
#actTasks{
    background-color: rgb(198, 228, 245);
}
#statsTasks{
    background-color: rgb(203, 214, 214);
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
