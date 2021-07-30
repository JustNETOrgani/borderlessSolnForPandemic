<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
        </div>
        <div class="formArea">
          <el-row>
            <el-col :span="4" :offset="9">
              <img id="verifyImg" src="../../assets/imgs/verify.png" />
            </el-col>
          </el-row>
            <h2>Covid-19 test/vaccination verification</h2>
            <p>Travel Safely Amid Pandemic Courtesy Blockchain Technology</p>
            <el-row>
                <el-col :span="20" :offset="0">
                    <div class="grid-content bg-purple-dark">
                        <el-form
                            :model="verificationForm"
                            :rules="rules"
                            ref="verificationForm"
                            label-width="25px">
                            <el-col :span="18" :offset="0">
                            <el-form-item>
                                <el-input v-model="verificationForm.ifpsHash" placeholder="Enter IPFS hash"></el-input>
                            </el-form-item>
                            </el-col>
                            <el-col :span="2" :offset="0">
                              <p>or</p>
                            </el-col>
                            <el-col :span="4" :offset="0">
                              <el-button type="info" round :loading="scanPersonQRcodeLoadBtn" @click="getPersonQRcode()">Scan QR code</el-button>
                            </el-col>
                            <el-col :span="18" :offset="0">
                            <el-form-item>
                                <el-input v-model="verificationForm.hashedID" placeholder="Enter Hash of ID"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <el-input v-model="verificationForm.addOfPatientCountry" placeholder="Enter Patient's Country's Address"></el-input>
                            </el-form-item>
                            </el-col>
                            <el-col :span="12" :offset="4">
                                <el-button type="primary" :loading="verifyBtnLoadState" @click="submitForm('verificationForm')">Verify</el-button>
                                <el-button @click="resetForm('verificationForm')">Reset</el-button>
                            </el-col>
                        </el-form>
                    </div>
                </el-col>
            </el-row>
            <el-row>
              <el-col :span="5" :offset="1">
                <p id="computedLabel">Person signature:</p>
              </el-col>
              <el-col :span="5" :offset="0">
                <p id="formattedString">{{sigOnIPFShash}}</p>
              </el-col>
            </el-row>
        </div>
        <el-dialog
            title="Covid-19 test/vaccination status verification"
            :visible.sync="dialogVisible" width="40%">
            <span id="IPFShashNotice">Verifying via: {{enteredIPFShash}}</span>
            <br />
            <span id="BlockchainInUse">Blockchain in use: Ethereum</span>
            <el-steps v-loading="stepLoading" direction="vertical" :active="step">
                <template v-for="(item, index) in VerifyResult">
                    <el-step
                        :key="index"
                        :title="item.step"
                        :description="item.name"
                        :status="item.status"
                        >
                    </el-step>
                </template>
            </el-steps>
        </el-dialog>
        <div id="overlay">
          <div id="qrCodeScanning" width="500px"></div>
          <el-button type="primary" @click="qrCodeDivDisappear()">Done</el-button>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import * as signatureGenerator from '@/assets/js/sigHelperFns'
import getHash from '@/assets/js/hashFunc'
import getMerkleRootFromMkTree from '@/assets/js/getMerkleRootOfData'
import web3 from '@/assets/js/web3Only'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
const ipfs = new window.Ipfs()

export default {
  // name: 'Home',
  data () {
    return {
      verificationForm: {
        ifpsHash: '',
        hashedID: '',
        addOfPatientCountry: ''
      },
      countryAddr: '',
      enteredIPFShash: '',
      hEcDR: '',
      sigOnIPFShash: '',
      fullSignature: '',
      currentAddress: '',
      VerifyResult: [],
      scResponse: [],
      errorCount: 0,
      userAssertions: { green: ['Negative', 'vaccinated'], yellow: ['Negative', 'Not Vaccinated'] },
      accountChangeStatus: false,
      proofTypeFormLabelWidth: '135px',
      setUserProofType: false,
      merkleObject: { first: [], second: [] },
      merkleRoot: [],
      // Loading states
      verifyBtnLoadState: false,
      scanPersonQRcodeLoadBtn: false,
      stepLoading: false,
      // Step
      step: 1,
      // Dialog.
      dialogVisible: false,
      rules: {
        ifpsHash: [
          { required: true, message: 'Please input IPFS hash of the Encrypted Covid-19 Data', trigger: 'blur' },
          { min: 46, message: 'Length should be at least 46', trigger: 'blur' }
        ],
        addOfPatientCountry: [
          { required: true, message: 'Please input Patient\'s Country\'s address', trigger: 'blur' },
          { min: 42, message: 'Length should be at least 42', trigger: 'blur' }
        ]
      }
    }
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
    backToPrvPg () {
      this.$router.push('/')
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    qrCodeDivDisappear () {
      document.getElementById('overlay').style.display = 'none'
      this.scanPersonQRcodeLoadBtn = false
      // window.location.reload() // Reload page. This will close camera.
    },
    getPersonQRcode () {
      // Check that user has already set proof type.
      if (this.setUserProofType === true) {
        console.log('QR code scanner initiated.')
        this.scanPersonQRcodeLoadBtn = true
        const config = {
          fps: 10,
          qrbox: 250
        }
        const html5QrcodeScanner = new window.Html5QrcodeScanner('qrCodeScanning', config)
        document.getElementById('overlay').style.display = 'block'
        html5QrcodeScanner.render(this.onScanSuccess, this.onScanFailure)
      } else {
        this.proofTypeDialogFormVisible = true
      }
    },
    onScanSuccess (qrCodeMessage) {
      console.log('QR code scan result:', qrCodeMessage)
      // Expected format changed: 'https://ipfs.io/ipfs/' + userIPFShash.
      // Current format: userIPFShash+HashedID (46+66)
      // Get last 46 characters to retrieve only the ipfs hash.
      this.$message({
        message: 'QR code successfully scanned.',
        type: 'success'
      })
      this.countryAddr = (qrCodeMessage.substr(qrCodeMessage.length - 42)).replace(/"/g, '') // Get last 42 characters and Remove the double quotes.
      var retrievedIPFShash = (qrCodeMessage.substr(0, 46)).replace(/"/g, '') // Get the first 46 characters and Remove the double quotes.
      if (this.ipfsInputValidation(retrievedIPFShash) !== 0) {
        this.scanPersonQRcodeLoadBtn = false
        console.log('Retrieved ipfs hash: ', retrievedIPFShash)
        this.$prompt('Please input hash of your ID.', 'Information required', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel'
        }).then(({ value }) => {
          console.log('Entered hashed ID: ', value)
          // Person verification process.
          this.performVerification(retrievedIPFShash, value, this.countryAddr)
        })
      } else {
        this.$message({
          message: 'Sorry! Invalid IPFS hash received from QR code. Please, scan BlockCovid compatible QR code.',
          type: 'warning'
        })
      }
    },
    onScanFailure (error) {
    // handle scan failure, usually better to ignore and keep scanning
      console.log('QR scan error: ', error)
    },
    submitForm (formName) {
      if (this.verificationForm.ifpsHash !== '') {
        if (this.ipfsInputValidation(this.verificationForm.ifpsHash) !== 0) {
          this.$refs[formName].validate(valid => {
            this.verifyBtnLoadState = true
            if (valid) {
              // Perform verification
              var data = {
                ipfsHash: this.verificationForm.ifpsHash,
                hashedID: this.verificationForm.hashedID,
                pCountryAddr: this.verificationForm.addOfPatientCountry
              }
              console.log('Data: ', data)
              this.performVerification(data.ipfsHash, data.hashedID, data.pCountryAddr)
            } else {
              console.log('Submission error.')
              this.verifyBtnLoadState = false
              return false
            }
          })
        } else {
          this.$message({
            message: 'Sorry! Invalid IPFS hash entered. Please, re-enter.',
            type: 'warning'
          })
        }
      } else {
        this.$message({
          message: 'Sorry! IPFS field cannot be empty.',
          type: 'warning'
        })
      }
    },
    getMerkleTree (data) {
      // This generates a root hash composed of tStatus, vStatus, timeStamp and hashedUserID.
      return getMerkleRootFromMkTree(data)
    },
    verifyTimestampValidity (timeStamp) {
      // Check that the timestamp is within 72 hours (3 days).
      const currentTimestamp = (Math.round(+new Date() / 1000)) * 1000// unix timestamp and convert to milliseconds.
      const tDiff = currentTimestamp - (timeStamp * 1000)
      const hoursElapsed = Math.floor(tDiff / 1000 / 60 / 60)
      return hoursElapsed
    },
    performVerification (ipfsHash, hashedID, addrOfPatientsCountry) {
      console.log('Verification initialized...')
      console.time('time')
      this.enteredIPFShash = ipfsHash
      // Create array object for steps.
      this.VerifyResult = {
        1: { step: '1', name: 'Getting data from IPFS', status: 'wait' },
        2: { step: '2', name: 'Timestamp check', status: 'wait' },
        3: { step: '3', name: 'Creating Proof', status: 'wait' },
        4: { step: '4', name: 'Hashing data', status: 'wait' },
        5: { step: '5', name: 'Optional signature request', status: 'wait' },
        6: { step: '6', name: 'Verifying in Smart Contract', status: 'wait' }
      }
      this.dialogVisible = true
      // Steps ---> TODO
      var currentStep = 0
      var keyToUse = Object.keys(this.VerifyResult)[currentStep]
      // Acquire encrypted data on IPFS.
      ipfs.cat(this.enteredIPFShash).then(retrievedData => {
        console.log('Data received from IPFS', JSON.parse(retrievedData.toString()))
        var EcDRwithSig = JSON.parse(retrievedData.toString()) // Convert to string and parse as JSON object.
        if (Object.keys(EcDRwithSig).length > 1 && 'timeStamp' in EcDRwithSig) {
          // Get header.
          this.VerifyResult[keyToUse].status = 'success'
          // Check timestamp.
          const timeStamp = EcDRwithSig.timeStamp
          // const testLatetimeStamp = 1619218659
          // const convertedTimeStamp = this.convertUnixTimestamp(timeStamp)
          const daysElapsed = this.verifyTimestampValidity(timeStamp)
          if (daysElapsed <= 72) {
            // Timestamp is within last 72 hours.
            // Increment step.
            currentStep += 1
            keyToUse = Object.keys(this.VerifyResult)[currentStep]
            this.VerifyResult[keyToUse].status = 'success'
            // Construct merkle root.
            this.merkleObject.first.push(this.userAssertions.green[0], this.userAssertions.green[1], timeStamp, hashedID) // All four needed acquired.
            this.merkleObject.second.push(this.userAssertions.yellow[0], this.userAssertions.yellow[1], timeStamp, hashedID) // All four needed acquired.
            // Generate Merkle tree.
            const merkleToutputOne = this.getMerkleTree(this.merkleObject.first)
            const merkleToutputTwo = this.getMerkleTree(this.merkleObject.second)
            if (merkleToutputOne.aProof === true && merkleToutputTwo.aProof === true) {
              this.merkleRoot.push(merkleToutputOne.merkleRoot, merkleToutputTwo.merkleRoot)
              // Increment step.
              currentStep += 1
              keyToUse = Object.keys(this.VerifyResult)[currentStep]
              this.VerifyResult[keyToUse].status = 'success'
              // Data body in IPFS pulled object.
              // console.log('Encrypted data: ', EcDRwithSig)
              // Hash IPFS hash to be verified on chain.
              getHash(this.enteredIPFShash).then(hashOfIPFShash => {
                currentStep += 1
                keyToUse = Object.keys(this.VerifyResult)[currentStep]
                // Change status.
                this.VerifyResult[keyToUse].status = 'success'
                const hIPFShash = hashOfIPFShash
                // Optional signing.
                this.$confirm('Would you like to sign?', 'Optional Information', {
                  confirmButtonText: 'Yes',
                  cancelButtonText: 'No',
                  type: 'info'
                }).then(() => {
                  this.$message({
                    type: 'success',
                    message: 'Getting Person signature'
                  })
                  // Allow user to sign IPFS hash if need.
                  signatureGenerator.signatureGen(ipfsHash, this.currentAddress, (sig) => {
                    this.fullSignature = sig
                    currentStep += 1
                    keyToUse = Object.keys(this.VerifyResult)[currentStep]
                    if (this.fullSignature.length > 0) {
                      this.sigOnIPFShash = (sig.substring(0, 25) + '...' + sig.substr(sig.length - 25)).replace(/"/g, '') // Remove the double quotes.
                      console.log('Person sig.: ', this.fullSignature)
                      // Change status.
                      this.VerifyResult[keyToUse].status = 'success'
                      // Continue verification on-chain.
                      this.continueVerificationOnchain(currentStep, hIPFShash, this.merkleRoot, hashedID)
                    }
                  }).catch(err => {
                    console.log('Signature error: ', err)
                    this.$message.error('Oops, Error generating signature.')
                    this.verifyBtnLoadState = false
                  })
                }).catch(() => {
                  this.$message({
                    type: 'info',
                    message: 'Signature request canceled'
                  })
                  // Change status.
                  this.VerifyResult[keyToUse].status = 'success'
                  currentStep += 1
                  // Continue verification on-chain.
                  this.continueVerificationOnchain(currentStep, hIPFShash, this.merkleRoot, hashedID)
                })
              })
            } else {
              this.$alert('Invalid proof generation of covid records. ', 'Invalid Proof', {
                confirmButtonText: 'OK',
                callback: action => {
                  this.$message({
                    type: 'warning ',
                    message: 'User informed'
                  })
                }
              })
            }
          } else {
            currentStep += 1
            keyToUse = Object.keys(this.VerifyResult)[currentStep]
            this.VerifyResult[keyToUse].status = 'error'
            this.$alert('Time above 72 hrs threshold. ', 'Timestamp alert', {
              confirmButtonText: 'OK',
              callback: action => {
                this.$message({
                  type: 'warning ',
                  message: 'User informed'
                })
              }
            })
          }
        } else {
          this.VerifyResult[keyToUse].status = 'error'
          this.verifyBtnLoadState = false
          console.log('Invalid encrypted data from IPFS for Blockcovid.')
          this.$message.error('Invalid encrypted data from IPFS for Blockcovid.')
        }
      }).catch(err => {
        console.log('IPFS error: ', err)
        this.$message.error('Oops, Error pulling data from IPFS.')
        this.verifyBtnLoadState = false
      })
    },
    continueVerificationOnchain (currentStep, hIPFShash, merkeRoot, hashedID) {
      // Verify on-chain
      console.log('Verifying on-chain.')
      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      currentStep += 1
      var keyToUse = Object.keys(this.VerifyResult)[currentStep]
      // Smart contract and other logic continues.
      // This is call operation. Any account can be used. It cost zero Eth.
      // Run loop on pre-defined assertions.
      countrySC.methods.verifyPersonStatus(hIPFShash, hashedID, merkeRoot[0], this.fullSignature).call({ from: this.currentAddress }).then(resOne => {
        // console.log('First response from Contract: ', resOne)
        this.scResponse.push(resOne)
        countrySC.methods.verifyPersonStatus(hIPFShash, hashedID, merkeRoot[1], this.fullSignature).call({ from: this.currentAddress }).then(resTwo => {
          // console.log('Second response from Contract: ', resTwo)
          this.scResponse.push(resTwo)
          if (this.scResponse[0] === true || this.scResponse[1] === true) {
            // Person passed. Display status.
            this.VerifyResult[keyToUse].status = 'success'
            this.$notify({
              title: 'Successful proof',
              message: 'You passed blockchain proof',
              type: 'success'
            })
            this.verifyBtnLoadState = false
            console.timeEnd('time')
          } else {
            // Person failed proof verification.
            console.log('Failed proof')
            // Change status.
            this.VerifyResult[keyToUse].status = 'error'
            this.$notify.error({
              title: 'Failed proof',
              message: 'Sorry! You failed blockchain verification.'
            })
            this.getUserChoice()
          }
        }).catch(err => {
          console.log('Error occurred during blockchain verification', err)
          this.$message.error('Sorry! Blockchain error')
        })
      }).catch(err => {
        console.log('Error occurred during blockchain verification', err)
        this.$message.error('Sorry! Blockchain error')
      })
    },
    ipfsInputValidation (input) {
      const count = input.toString().length
      if (input === '' || count < 46 || input.startsWith('Qm') === false) { // Consider: inputPattern: /^Qm[0-9A-Z]{44}$/i
        return 0
      } else {
        return 1
      }
    },
    getUserChoice () {
      this.$confirm('Do you want to verify another person?', 'Information needed', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'info'
      }).then(() => {
        this.$message({
          type: 'success',
          message: 'Awaiting new input'
        })
        window.location.reload() // Reload page.
      }).catch(() => {
        this.$message({
          type: 'info',
          message: 'Redirecting to home page'
        })
        this.$router.push('/')
      })
    },
    convertUnixTimestamp (unixTimestamp) {
      // Convert UNIX Time to Date/Time
      var monthsArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      var date = new Date(unixTimestamp * 1000)
      var year = date.getFullYear()
      var month = monthsArr[date.getMonth()]
      var day = date.getDate()
      var hours = date.getHours()
      var minutes = '0' + date.getMinutes()
      var seconds = '0' + date.getSeconds()
      // Display date time in MM-dd-yyyy h:m:s format
      var convertedTime = month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
      return convertedTime
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
  width: 40%;
  padding: 1rem 1.5rem;
}

#verifyImg{
    margin-top: 1.2rem;
    width: 9rem;
    height: 6rem;
}
#computedLabel{
  text-align: left;
  font-size: 0.8rem;
  color: rgb(113, 140, 189);
}
#formattedString{
  font-size: 0.75rem;
  text-align: left;
  font-style: italic;
  color: rgb(95, 64, 116);
}
#IPFShashNotice{
  font-size: 0.8rem;
  color: rgb(113, 140, 189);
}
#BlockchainInUse{
  font-size: 0.9rem;
  font-style: italic;
  color: rgb(95, 64, 116);
}
#overlay {
  position: fixed;
  display: none; /* Should be hidden by on page load */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5); /* Black background with opacity */
  z-index: 2; /* Specify a stack order based on other divs */
  cursor: pointer; /* Adds a pointer on hover */
}
#qrCodeScanning {
  width: 400px;
  margin-top: 4%;
  margin-left: 30%;
}
</style>
