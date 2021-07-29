<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="logOut">Log out</el-link>
        </div>
        <div class="wrapper" v-loading="pageLoadingState">
            <h2>Testing Center's Dashboard</h2>
            <el-row>
              <el-col :span="6">
                <h5>TC's Name: {{nameOfTC}}</h5>
              </el-col>
              <el-col :span="12">
                <h5>Address of TC: {{addrOfTC}}</h5>
              </el-col>
              <el-col :span="4" :offset="2">
                <h5 :class="[statusOfTC.length < 9 ? 'statusRed' : 'statusGreen']">Status: {{statusOfTC}}</h5>
              </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-menu
                        default-active="2"
                        class="el-menu-vertical-demo"
                        @open="handleOpen"
                        @close="handleClose"
                        background-color="#545c64"
                        text-color="#fff"
                        active-text-color="#ffd04b">
                        <el-submenu index="1">
                            <template slot="title">
                            <i class="el-icon-user"></i>
                            <span>Patient handling</span>
                            </template>
                            <el-menu-item-group title="Data Entry">
                            <el-menu-item index="1-1"><el-link :underline="false" style="color: #fff;" href="enrollPatient">Enroll Patient</el-link></el-menu-item>
                            <el-menu-item index="1-2"><el-link :underline="false" style="color: #fff;" href="updatePatientInfo">Patient Update</el-link></el-menu-item>
                            </el-menu-item-group>
                            <el-menu-item-group title="Information">
                            <el-menu-item index="1-3">Statistics</el-menu-item>
                            </el-menu-item-group>
                        </el-submenu>
                        <el-menu-item index="2">
                            <i class="el-icon-menu"></i>
                            <span>Information Centre</span>
                        </el-menu-item>
                        <el-menu-item index="3" disabled>
                            <i class="el-icon-document"></i>
                            <span>Others</span>
                        </el-menu-item>
                    </el-menu>
                </el-col>
                 <el-col :span="12">
                   <h3>Core tasks.</h3>
                   <a href="enrollPatient"><img class="coreTasksLogo" src="../../../assets/imgs/onboardPerson.png" /></a>
                   <br>
                   <el-link :underline="false" href="enrollPatient"><p class="imgDescription">Enroll Patient</p></el-link>
                   <br>
                   <a href="tcStatistics"><img class="coreTasksLogo" src="../../../assets/imgs/statisticsImg.png" /></a>
                   <br>
                  <el-link :underline="false" href="tcStatistics"><p>Get test/vaccine statistics</p></el-link>
                 </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'

export default {
  data () {
    return {
      nameOfTC: '',
      addrOfTC: '',
      statusOfTC: '',
      pageLoadingState: false,
      currentAddress: ''
    }
  },
  created () {
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.currentAddress = accounts[0]
        console.log('Current account: ', this.currentAddress)
        // Make a call to WHO SC to get details about country before page loads. Name, Deployed SC address.
        this.loadTCinfoFromCountrySC()
      })
    }
  },
  watch: {
    'currentAddress' () {
      this.switchAccount()
    }
  },
  methods: {
    async getAccount () {
      var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      return accounts
    },
    switchAccount () {
      var myRoot = this // Ensure all this or vue global variables can be accessed within this fucntion via myRoot.
      window.ethereum.on('accountsChanged', function (accounts) {
        myRoot.currentAddress = accounts[0]
        console.log('Selected account: ', myRoot.currentAddress)
        myRoot.$message({
          message: 'Account switched successfully.',
          type: 'success'
        })
        console.log('Account switched')
        myRoot.accountChangeStatus = true
      })
    },
    loadTCinfoFromCountrySC () {
      this.pageLoadingState = true
      console.log('Getting TC info.')
      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        countrySC.methods.getTCInfo().call({ from: this.currentAddress }).then(res => {
          this.nameOfTC = res[1]
          this.addrOfTC = this.currentAddress
          if (res[2] === '1') {
            this.statusOfTC = 'Activated'
          }
          if (res[2] === '2') {
            this.statusOfTC = 'Revoked'
          }
          this.pageLoadingState = false
        }).catch(err => {
          console.log('Error calling SC: ', err)
          this.$message.error('Sorry! Unknown TC.')
        })
      } catch {
        console.log('Sorry! Error occured.')
        this.$message.error('Sorry! Unknown TC.')
      }
    },
    logOut () {
      // Clear authorization.
      sessionStorage.removeItem('API-HTTP-AUTHORIZATION')
      sessionStorage.removeItem('USER-TYPE')
      sessionStorage.clear()
      this.$router.push('/Country_level/TC/login')
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
  width: 45%;
  padding: 1rem 1.5rem;
}

.statusGreen {color: darkgreen; font-style: italic; font-weight: bold;}
.statusRed {color: darkred; font-style: italic; font-weight: bold;}

.coreTasksLogo{
  height: 5rem;
  border-radius: 50%;
  width: 5em;
}
.coreTasksLogo:hover{
    transform: scale(1.1); /* Negative value rotates and decreases size.*/
}
.imgDescription{
    margin-bottom: 3rem;
}
</style>
