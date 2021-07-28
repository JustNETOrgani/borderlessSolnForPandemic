<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="LogOut">Log out</el-link>
        </div>
        <div class="wrapper" v-loading="pageLoadingState">
            <h3>Country Management Dashboard</h3>
            <el-row>
                <el-col :span="6">
                    <h4>Name of Country</h4>
                </el-col>
                <el-col :span="6">
                    <h4>Blockchain Address</h4>
                </el-col>
                <el-col :span="4">
                    <h4>Status</h4>
                </el-col>
                <el-col :span="6">
                    <h4>IPFS hash of Current TC File</h4>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="6">
                    <h5>{{country_Name}}</h5>
                </el-col>
                <el-col :span="6">
                    <h5>{{country_SCaddr}}</h5>
                </el-col>
                <el-col :span="4">
                    <h5 :class="[country_Status.length < 9 ? 'statusRed' : 'statusGreen']">{{country_Status}}</h5>
                </el-col>
                <el-col :span="6">
                    <h5>{{country_tcIPFShash}}</h5>
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
        <div id="tcLoaderDIV">
            <h3>TC Document area</h3>
            <h4>Document upload and Update in WHO Smart Contract</h4>
            <el-col :span="12" :offset="6">
                 <el-form
                    :model="tcDocUpload"
                    ref="tcDocUpload"
                    label-width="220px"
                  >
                     <fieldset>
                        <legend>File upload</legend>
                            <el-col :span="16" :offset="3">
                              <el-form-item label="TC Document Upload to IPFS" prop="tcDoc">
                                <el-upload
                                  class="upload-demo"
                                  action="tcDocumentUpload"
                                  :http-request="beforeUpload"
                                  :on-remove="handleRemove"
                                  :before-remove="beforeRemove">
                                  <el-button :loading="updateTCloadState" class="el-icon-upload" slot="trigger" size="small" type="primary">Select TC Document</el-button>
                                  <div class="el-upload__tip" slot="tip">.json file only. Max. size is 10MB</div>
                                </el-upload>
                              </el-form-item>
                              <p :class="[newTCipfsHash.length == 0 ? 'notShow' : 'showReturnedHash']">IPFS hash: {{newTCipfsHash}}</p>
                            </el-col>
                     </fieldset>
                 </el-form>
               </el-col>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABI, contractAddress, suppliedGas } from '@/assets/js/ABIs/WHO_ABI'
import computeIPFShash from '@/assets/js/precomputeIPFShash'
const ipfs = new window.Ipfs()

export default {
  data () {
    return {
      pageLoadingState: false,
      country_Name: '',
      country_SCaddr: '',
      country_Status: '',
      country_tcIPFShash: '',
      currentAddress: '',
      newTCipfsHash: '',
      tcDocUpload: {
        tcDoc: ''
      },
      readJSONfile: null,
      updateTCloadState: false
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
        this.loadCountryInfoFromWHOsc()
      })
    }
  },
  watch: {
    'currentAddress' () {
      this.switchAccount()
    }
  },
  methods: {
    loadCountryInfoFromWHOsc () {
      this.pageLoadingState = true
      console.log('Getting country info.')
      var WHOsmartContract = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        WHOsmartContract.methods.getCountryInfo().call({ from: this.currentAddress }).then(res => {
          this.country_Name = res[0]
          this.country_SCaddr = this.currentAddress
          this.country_tcIPFShash = res[1]
          if (res[2] === '1') {
            this.country_Status = 'Activated'
          }
          if (res[2] === '2') {
            this.country_Status = 'Revoked'
          }
          this.pageLoadingState = false
        }).catch(err => {
          console.log('Error calling SC: ', err)
          this.$message.error('Sorry! Country unknown.')
        })
      } catch {
        console.log('Sorry! Error occured.')
        this.$message.error('Sorry! Country unknown.')
      }
    },
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
    LogOut () {
      // Clear authorization.
      sessionStorage.removeItem('API-HTTP-AUTHORIZATION')
      sessionStorage.removeItem('USER-TYPE')
      sessionStorage.clear()
      this.$router.push('/Country_level/login')
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    beforeUpload (item) {
      const file = item.file
      console.log('File action:', item.action)
      const extensionJSON = file.name.split('.').pop() === 'json'
      const sizeLimit = file.size / 1024 / 1024 < 10
      if (!extensionJSON) {
        this.$message.warning('Sorry! The uploaded TC file can only be in JSON format!')
        return
      }
      if (!sizeLimit) {
        this.$message.warning('Sorry! The upload file size cannot exceed 10MB!')
        return
      }
      if (item.action === 'tcDocumentUpload') {
        console.log('Initilaized upload of TC document: ', file)
        var reader = new FileReader()
        reader.readAsText(file)
        reader.onload = e => this.jsonParserAsync(e.target.result) // e.target.result is the filestring or actual text within the file.
          .then(res => {
            this.readJSONfile = res
            console.log('Read json file: ', this.readJSONfile)
            // Push file to IPFS to get returned hash.
            // Precompute IPFS hash.
            const MyBuffer = window.Ipfs.Buffer
            var dataToBuffer = MyBuffer.from(this.readJSONfile)
            computeIPFShash(dataToBuffer).then(precomputedIPFShash => {
              // Push file to IPFS.
              ipfs.add(dataToBuffer).then(res => {
              // Confirm returned IPFS matches precomputed hash.
                if (precomputedIPFShash === res[0].hash) {
                  // Match confirmed
                  this.newTCipfsHash = res[0].hash
                  console.log('TC IPFS hash: ', this.newTCipfsHash)
                  // Prompt user before proceeding with update.
                  this.$confirm('Continue with update in Smart Contract?', 'Confirmation required', {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                    type: 'warning'
                  }).then(() => {
                    // Perform update.
                    this.updateTCforCountry(this.newTCipfsHash)
                  }).catch(() => {
                    this.$message({
                      type: 'info',
                      message: 'Update aborted'
                    })
                  })
                } else {
                  this.$alert('Possible MiTM attack! IPFS mismatch! ', 'IPFS hash mismatch', {
                    confirmButtonText: 'OK',
                    callback: action => {
                      this.$message({
                        type: 'warning ',
                        message: 'User informed'
                      })
                    }
                  })
                }
              })
            })
            // Display on DOM.
          })
      }
    },
    async jsonParserAsync (filestring) {
      return JSON.parse(JSON.stringify(filestring))
    },
    updateTCforCountry (newIPFShash) {
      console.log('Getting ready to update TC for this country.')
      // Get confirmation from user before proceeding.
      var WHOsmartContract = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        // Transaction parameters
        const txParams = {
          from: this.currentAddress,
          to: contractAddress,
          data: WHOsmartContract.methods.updateTChash(newIPFShash).encodeABI()
        }
        this.sendTnx(txParams).then(tnxReceipt => {
          console.log('Transaction receipt: ', tnxReceipt)
          this.$message({
            message: 'Transaction successful.',
            type: 'success'
          })
          this.$alert('Transaction hash : ' + tnxReceipt, 'Update success', {
            confirmButtonText: 'OK',
            callback: action => {
              this.$message({
                type: 'info',
                message: 'IPFS hash of TCs successfully updated.'
              })
            }
          })
          this.updateTCloadState = false
          // Reload page to reflect new IPFS hash.
          window.location.reload()
        }).catch(err => {
          console.log('Ooops:', err)
          this.updateTCloadState = false
        })
      } catch {
        console.log('Sorry! Error occured.')
        this.updateTCloadState = false
        this.$message.error('Non-transactional error. Please try again later.')
      }
    },
    async sendTnx (txParams) {
      // Transaction execution in Ethereum from Metamask
      var txReceipt = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] })
      return txReceipt
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    beforeRemove (file, fileList) {
      return this.$confirm(`Cancel the transfert of ${file.name} ?`)
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

.statusGreen {color: darkgreen; font-style: italic; font-weight: bold;}
.statusRed {color: darkred; font-style: italic; font-weight: bold;}

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

#tcLoaderDIV {
  width: 100%;
  float: left;
}

.showReturnedHash {color: rgb(143, 186, 221); font-style: italic; font-size: 0.7rem;}
.notShow {color: rgb(247, 242, 242); font-style: italic; font-size: 0.7rem;}
</style>
