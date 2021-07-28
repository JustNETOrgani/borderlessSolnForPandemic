<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
        </div>
        <div class="formArea">
          <el-row>
            <el-col :span="4" :offset="10">
              <img id="registImg" src="../../assets/imgs/registerCountry.png" />
            </el-col>
          </el-row>
            <h2>Country registration</h2>
            <i><p>Enables a country to deploy testing/vaccination centers for global use.</p></i>
            <el-row>
                <el-col :span="20" :offset="2">
                    <div class="grid-content bg-purple-dark">
                        <el-form
                            :model="countryRegistForm"
                            :rules="rules"
                            ref="countryRegistForm"
                            label-width="200px">
                            <el-form-item label="Name of Country" prop="countryName">
                                <el-input v-model="countryRegistForm.countryName" placeholder="Name of the Country."></el-input>
                            </el-form-item>
                            <el-form-item label="Country's address" prop="scAddrOfCountry">
                                <el-input v-model="countryRegistForm.scAddrOfCountry" placeholder="Please input SC address of Country."></el-input>
                            </el-form-item>
                            <el-form-item label="Blockchain in use" prop="btcInUse">
                                <el-select
                                    v-model="countryRegistForm.btcInUse"
                                    style="width:100%"
                                    placeholder="Select blockchain">
                                    <el-option label="Ethereum" value="Ethereum"></el-option>
                                    <el-option label="Binance" value="Binance"></el-option>
                                    <el-option label="Hyperledger" value="Hyperledger"></el-option>
                                    <el-option label="Bitcoin Rootstock" value="BitcoinRSK"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="IPFS hash of TC Doc." prop="tcIPFShash">
                                <el-input v-model="countryRegistForm.tcIPFShash" placeholder="Please input IPFS hash of doc of TCs."></el-input>
                            </el-form-item>
                            <el-form-item label="**Manager's consent**" prop="authCheckBox">
                                <el-checkbox v-model="countryRegistForm.authCheckBox">I fully understand the implication of this action.</el-checkbox>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" :loading="registCountryBtnLoadState" @click="submitForm('countryRegistForm')">Register</el-button>
                                <el-button @click="resetForm('countryRegistForm')">Reset</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABI, contractAddress, suppliedGas } from '@/assets/js/ABIs/WHO_ABI'
export default {
  data () {
    return {
      countryRegistForm: {
        authCheckBox: '',
        countryName: '',
        scAddrOfCountry: '',
        btcInUse: '',
        tcIPFShash: ''
      },
      registCountryBtnLoadState: false,
      contractDeployerAccount: '',
      rules: {
        authCheckBox: [
          { required: true, message: 'Please check the checkbox', trigger: 'blur' }
        ],
        countryName: [
          { required: true, message: 'Please input name of Country.', trigger: 'blur' },
          { min: 2, message: 'Length should be at least 2', trigger: 'blur' }
        ],
        scAddrOfCountry: [
          { required: true, message: 'Please input SC address of the Country.', trigger: 'blur' },
          { min: 20, message: 'Length should be at least 20', trigger: 'blur' }
        ],
        btcInUse: [
          { required: true, message: 'Please select blockchain type from the list.', trigger: 'blur' }
        ],
        tcIPFShash: [
          { required: true, message: 'Please input IPFS hash for TCs document.', trigger: 'blur' },
          { min: 20, message: 'Length should be at least 20', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.loadingPOnboardingPage = false
      this.getAccount().then(accounts => {
        this.contractDeployerAccount = accounts[0]
        console.log('Current account: ', this.contractDeployerAccount)
      })
    }
  },
  methods: {
    async getAccount () {
      var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      return accounts
    },
    backToPrvPg () {
      this.$router.push('WHOindex')
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    async sendTnx (txParams) {
      // Transaction execution in Ethereum from Metamask
      var txReceipt = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] })
      return txReceipt
    },
    submitForm (formName) {
      if (this.countryRegistForm.authCheckBox === true) {
        if (this.countryNameValidation(this.countryRegistForm.countryName) !== 0) {
          if (web3.utils.isAddress(this.countryRegistForm.scAddrOfCountry) === true) {
            this.$refs[formName].validate(valid => {
              this.registCountryBtnLoadState = true
              if (valid) {
                console.log('Valid data.')
                var data = {
                  countryName: this.countryRegistForm.countryName,
                  scAddrOfCountry: this.countryRegistForm.scAddrOfCountry,
                  btcName: this.countryRegistForm.btcInUse,
                  tcIPFShash: this.countryRegistForm.tcIPFShash
                }
                console.log('Registration data: ', data)
                var WHOsmartContract = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })
                console.log('Contract instance created.')
                // Smart contract and other logic continues.
                try {
                  // Transaction parameters
                  const txParams = {
                    from: this.contractDeployerAccount,
                    to: contractAddress,
                    data: WHOsmartContract.methods.registerCountry(data.btcName, data.countryName, data.scAddrOfCountry, data.tcIPFShash).encodeABI()
                  }
                  this.sendTnx(txParams).then(tnxReceipt => {
                    console.log('Transaction receipt: ', tnxReceipt)
                    this.$message({
                      message: 'Transaction successful.',
                      type: 'success'
                    })
                    this.$alert('Transaction hash : ' + tnxReceipt, 'Registration success', {
                      confirmButtonText: 'OK',
                      callback: action => {
                        this.$message({
                          type: 'info',
                          message: 'Country successfully registered.'
                        })
                      }
                    })
                    this.registCountryBtnLoadState = false
                  })
                } catch {
                  console.log('Sorry! Error occured.')
                  this.registCountryBtnLoadState = false
                  this.$message.error('Non-transactional error. Please try again later.')
                }
              } else {
                console.log('Submission error.')
                this.registCountryBtnLoadState = false
                return false
              }
            })
          } else {
            this.$message({
              message: 'Invalid Smart Contract address.',
              type: 'warning'
            })
          }
        } else {
          this.$message({
            message: 'Invalid Country name.',
            type: 'warning'
          })
        }
      } else {
        this.$message('Please check the checkbox')
      }
    },
    countryNameValidation (input) {
      if (input === '' || /[^a-zA-Z]/.test(input) === true || input == null) {
        return 0
      } else {
        return 1
      }
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

.formArea {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 2.5% auto;
  width: 45%;
  padding: 1rem 1.5rem;
}

#registImg{
    margin-top: 1.2rem;
    width: 9rem;
    height: 6rem;
}
</style>
