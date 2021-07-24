<template>
  <div class="home">
    <div id="topNav">
        <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="BackToPrvPage">Previous</el-link>
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
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABI, contractAddress, suppliedGas } from '@/assets/js/ABIs/WHO_ABI'

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
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.currentAddress = accounts[0]
        console.log('Current account: ', this.currentAddress)
        this.proofTypeDialogFormVisible = true
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
      var WHOsmartContract = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      WHOsmartContract.methods.checkWHOaddr().call({ from: this.currentAddress }).then(res => {
        if (res === true) {
          // Login success. Proceed.
          this.$message({
            message: 'Login success',
            type: 'success'
          })
          this.metaMaskLoginBtn = false
          this.$router.push('/WHO/WHOindex')
        } else {
          // Failed authentication.
          this.$message.error('Sorry! Failed login.')
          this.metaMaskLoginBtn = false
        }
      })
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
