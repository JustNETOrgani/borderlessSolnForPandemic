<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
        </div>
        <div class="formArea">
            <h2>TC Revocation</h2>
            <i><p>Disables TC from performing testing/vaccination for global use</p></i>
            <el-row>
                <el-col :span="3">
                    <img id="registImg" src="../../assets/imgs/revokeCountry.png" />
                </el-col>
                <el-col :span="19" :offset='1'>
                    <div class="grid-content bg-purple-dark">
                        <el-form
                            :model="tcRegistForm"
                            :rules="rules"
                            ref="tcRegistForm"
                            label-width="200px">
                            <fieldset>
                                <el-form-item label="Name of TC" prop="tcName">
                                    <el-input v-model="tcRegistForm.tcName" placeholder="Name of the Testing Center."></el-input>
                                </el-form-item>
                                <el-form-item label="Address of TC" prop="addrOfTC">
                                    <el-input v-model="tcRegistForm.addrOfTC" placeholder="Please input blockchain address of TC."></el-input>
                                </el-form-item>
                                <el-form-item label="Reason" prop="revokeReason">
                                    <el-input v-model="tcRegistForm.revokeReason" placeholder="Please input reason for revocation."></el-input>
                                </el-form-item>
                                <el-form-item label="**Manager's consent**" prop="authCheckBox">
                                    <el-checkbox v-model="tcRegistForm.authCheckBox">I fully understand the implication of this action.</el-checkbox>
                                </el-form-item>
                                </fieldset>
                                <br>
                                <el-form-item>
                                    <el-button type="danger" :loading="registTCBtnLoadState" @click="submitForm('tcRegistForm')">Revoke TC</el-button>
                                    <el-button @click="resetForm('tcRegistForm')">Reset</el-button>
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
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
export default {
  data () {
    return {
      tcRegistForm: {
        authCheckBox: '',
        tcName: '',
        addrOfTC: '',
        revokeReason: ''
      },
      registTCBtnLoadState: false,
      contractDeployerAccount: '',
      rules: {
        authCheckBox: [
          { required: true, message: 'Please check the checkbox', trigger: 'blur' }
        ],
        tcName: [
          { required: true, message: 'Please input name of TC.', trigger: 'blur' },
          { min: 2, message: 'Length should be at least 2', trigger: 'blur' }
        ],
        addrOfTC: [
          { required: true, message: 'Please input blockchain address of the TC.', trigger: 'blur' },
          { min: 20, message: 'Length should be at least 20', trigger: 'blur' }
        ],
        revokeReason: [
          { required: true, message: 'Please input reason for revocation.', trigger: 'blur' },
          { min: 4, message: 'Length should be at least 4', trigger: 'blur' }
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
      this.$router.push('countryLanding')
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
      if (this.tcRegistForm.authCheckBox === true) {
        if (this.tcNameValidation(this.tcRegistForm.tcName) !== 0) {
          if (web3.utils.isAddress(this.tcRegistForm.addrOfTC) === true) {
            this.$refs[formName].validate(valid => {
              this.registTCBtnLoadState = true
              if (valid) {
                console.log('Valid data.')
                var data = {
                  tcName: this.tcRegistForm.tcName,
                  addrOfTC: this.tcRegistForm.addrOfTC,
                  revokeReason: this.tcRegistForm.revokeReason
                }
                console.log('Registration data: ', data)
                var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })
                console.log('Contract instance created.')
                // Smart contract and other logic continues.
                try {
                  // Transaction parameters
                  const txParams = {
                    from: this.contractDeployerAccount,
                    to: contractAddressCountrySC,
                    data: countrySC.methods.revokeTCcert(data.tcName, data.addrOfTC, data.revokeReason).encodeABI()
                  }
                  this.sendTnx(txParams).then(tnxReceipt => {
                    console.log('Transaction receipt: ', tnxReceipt)
                    this.$message({
                      message: 'Transaction successful.',
                      type: 'success'
                    })
                    this.$alert('Transaction hash : ' + tnxReceipt, 'TC Registration success', {
                      confirmButtonText: 'OK',
                      callback: action => {
                        this.$message({
                          type: 'info',
                          message: 'TC successfully registered.'
                        })
                      }
                    })
                    this.registTCBtnLoadState = false
                  })
                } catch {
                  console.log('Sorry! Error occured.')
                  this.registTCBtnLoadState = false
                  this.$message.error('Non-transactional error. Please try again later.')
                }
              } else {
                console.log('Submission error.')
                this.registTCBtnLoadState = false
                return false
              }
            })
          } else {
            this.$message({
              message: 'Invalid blockchain address.',
              type: 'warning'
            })
          }
        } else {
          this.$message({
            message: 'Invalid TC name.',
            type: 'warning'
          })
        }
      } else {
        this.$message('Please check the checkbox')
      }
    },
    tcNameValidation (input) {
      var regexpRule = new RegExp('^[0-9A-Za-z_.-]+$')
      if (!regexpRule.test(input)) {
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

h2{color: brown;}
p{color: brown;}

.formArea {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 2.5% auto;
  width: 49%;
  padding: 1rem 1.5rem;
}

fieldset{
    border-radius: 2%;
}
#registImg{
    width: 7rem;
    height: 17rem;
}
</style>
