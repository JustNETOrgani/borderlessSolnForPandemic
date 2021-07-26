<template>
  <div class="home" :style="image" id="bgImage">
    <div id="topNav">
        <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="BackToPrvPage">Previous</el-link>
    </div>
    <div id="loginWrapper">
      <el-row>
      <el-col :span="22">
        <el-col :span="6">
          <fieldset>
            <legend>TC Login</legend>
              <img alt="MetaMask Logo" src="../../../assets/imgs/metaMaskLogo.png">
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
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
// Import image.
// import Bg2 from '@/../assets/images/logo2.png'

export default {
  // name: 'Home',
  data () {
    return {
      currentAddress: '',
      accountChangeStatus: false,
      // Loading states
      metaMaskLoginBtn: false,
      // Background image.
      image: { backgroundImage: 'url(https://user-images.githubusercontent.com/44321289/126989869-88b54c57-2874-4bab-a0bc-fbb1da78fb59.jpeg)' }
    }
  },
  components: {
  },
  created () {
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.currentAddress = accounts[0]
        console.log('Current account: ', this.currentAddress)
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
    metaMaskLogin () {
      console.log('Attempting MetaMask login via the SC...')
      this.metaMaskLoginBtn = true
      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        countrySC.methods.checkTCLogin().call({ from: this.currentAddress }).then(res => {
          if (res === true) {
          // Login success. Proceed.
            this.$message({
              message: 'Login success',
              type: 'success'
            })
            this.metaMaskLoginBtn = false
            this.$router.push('/Country_level/TC/tcLanding')
          } else {
          // Failed authentication.
            this.$message.error('Sorry! Failed login.')
            this.metaMaskLoginBtn = false
          }
        })
      } catch {
        console.log('Sorry! Error occured.')
        this.metaMaskLoginBtn = false
        this.$message.error('Contract call error. Please try again later.')
      }
    },
    BackToPrvPage () {
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
  width: 100%;
  display: flex;
  flex-direction: column;
}
#bgImage {
        background-repeat: no-repeat;
        background-size: 100% auto;
    }
#topNav{
  width: 100%;
  height: 5%;
}
#loginWrapper{
  margin: 13% 40%;
  width: 20%;
  padding: 1rem 1.5rem;
}
fieldset{
    border-radius: 10%;
}
legend {
 font-style: italic;
 color: rgb(243, 235, 232);
 font-size: 1.3rem;
}
</style>
