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
            <h2>Borderless COVID-19 test/vaccination verification</h2>
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
        </div>
        <el-dialog
            title="Borderless COVID-19 Test/Vaccination Status Verification"
            :visible.sync="dialogVisible" width="40%">
            <span id="IPFShashNotice">Verifying via IPFS hash: {{blindedIPFShash}}</span>
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
        <el-dialog title="Claims" :visible.sync="claimTypeFormVisibleState" width="45%">
          <el-form :model="claimTypeForm">
              <el-form-item label="Statements:" :label-width="formLabelWidth">
                <span>Default</span>
                <el-checkbox v-model="claimTypeForm.greenCode" label="Negative/Vaccinated" border size="mini"></el-checkbox>
                <el-checkbox v-model="claimTypeForm.yellowCode" label="Negative/Not vaccinated" border size="mini"></el-checkbox>
              </el-form-item>
              <span>Others</span>
              <el-checkbox-group v-model="otherProofsChkBox" size="mini" disabled>
                <el-checkbox label="Negative/Specific vaccine" border></el-checkbox>
                <el-checkbox label="Negative/Vaccine jab" border></el-checkbox>
              </el-checkbox-group>
          </el-form>
          <span slot="footer" class="dialog-footer">
              <el-button @click="backToPrvPg()">Cancel</el-button>
              <el-button type="primary" @click="claims()">Confirm</el-button>
          </span>
        </el-dialog>
        <div id="overlay">
          <div id="qrCodeScanning" width="500px"></div>
          <el-button type="primary" @click="qrCodeDivDisappear()">Done</el-button>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import recoveredAddrFromSig from '@/assets/js/recoverSignerAddr'
import getHash from '@/assets/js/hashFunc'
import getMerkleRootFromMkTree from '@/assets/js/getMerkleRootOfData'
import web3 from '@/assets/js/web3Only'
import { ABI, contractAddress, suppliedGas } from '@/assets/js/ABIs/WHO_ABI' // WHO SC.
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
      claimTypeForm: {
        greenCode: true,
        yellowCode: true
      },
      otherProofsChkBox: [],
      formLabelWidth: '140px',
      claimTypeFormVisibleState: false,
      countryAddr: '',
      blindedIPFShash: '',
      hED: '',
      fullSignature: '',
      currentAddress: '',
      VerifyResult: [],
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
        this.claimTypeFormVisibleState = true
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
    claims () {
      // TODO...more responsive to changing times.
      this.userAssertions = { green: ['Negative', 'vaccinated'], yellow: ['Negative', 'Not Vaccinated'] }
      this.claimTypeFormVisibleState = false
    },
    backToPrvPg () {
      this.$router.push('verifierLanding')
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
        // console.log('Retrieved ipfs hash: ', retrievedIPFShash)
        this.$prompt('Please input hash of your ID.', 'Information required', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel'
        }).then(({ value }) => {
          console.log('Entered hashed ID: ', value)
          // Person verification process.
          this.performVerification(retrievedIPFShash, value)
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
              this.countryAddr = data.pCountryAddr
              this.performVerification(data.ipfsHash, data.hashedID)
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
    performVerification (ipfsHash, hashedID) {
      console.log('Verification initialized...')
      console.time('time')
      this.blindedIPFShash = ipfsHash.substr(0, 3) + '...xxx...xxx...' + ipfsHash.substr(43, 46)
      // Create array object for steps.
      this.VerifyResult = {
        1: { step: '1', name: 'Country\'s status', status: 'wait' },
        2: { step: '2', name: 'Creating Proof', status: 'wait' },
        3: { step: '3', name: 'Checking Proof', status: 'wait' },
        4: { step: '4', name: 'Timestamp Check', status: 'wait' },
        5: { step: '5', name: 'Accessing Country\'s TC File', status: 'wait' },
        6: { step: '6', name: 'Verifying Signature', status: 'wait' }
      }
      this.dialogVisible = true
      // Steps ---> TODO
      var currentStep = 0
      var keyToUse = Object.keys(this.VerifyResult)[currentStep]
      // Checking countries status.
      var WHOSC = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      var beginCcheck = 0
      WHOSC.methods.verificationTime(this.countryAddr).call({ from: this.currentAddress }).then(ipfsHashOfCountrysTCdoc => {
        console.log('Country check response: ', ipfsHashOfCountrysTCdoc)
        if (ipfsHashOfCountrysTCdoc) {
          // Country check passed
          beginCcheck = 1
          this.VerifyResult[keyToUse].status = 'success'
          console.log('Country state check done.')
          // Use the IPFShash to get data from IPFS
          currentStep += 1
          keyToUse = Object.keys(this.VerifyResult)[currentStep]
          // Acquire encrypted data on IPFS.
          ipfs.cat(ipfsHash).then(retrievedData => {
            console.log('Data received from IPFS', JSON.parse(retrievedData.toString()))
            var EcDRwithSig = JSON.parse(retrievedData.toString()) // Convert to string and parse as JSON object.
            if (Object.keys(EcDRwithSig).length > 1 && 'timeStamp' in EcDRwithSig) {
              // Get header.
              // this.VerifyResult[keyToUse].status = 'success'
              // Get timestamp from data.
              const timeStamp = EcDRwithSig.timeStamp
              // Construct merkle root.
              this.merkleObject.first.push(this.userAssertions.green[0], this.userAssertions.green[1], timeStamp, hashedID, this.countryAddr) // All four needed acquired.
              this.merkleObject.second.push(this.userAssertions.yellow[0], this.userAssertions.yellow[1], timeStamp, hashedID, this.countryAddr) // All four needed acquired.
              // Generate Merkle tree.
              const merkleToutputOne = this.getMerkleTree(this.merkleObject.first)
              const merkleToutputTwo = this.getMerkleTree(this.merkleObject.second)
              if (merkleToutputOne.aProof === true && merkleToutputTwo.aProof === true) {
                this.merkleRoot.push(merkleToutputOne.merkleRoot, merkleToutputTwo.merkleRoot)
                this.VerifyResult[keyToUse].status = 'success'
                console.log('Proof creation done')
                // Data body in IPFS pulled object.
                // console.log('Encrypted data: ', EcDRwithSig)
                currentStep += 1
                keyToUse = Object.keys(this.VerifyResult)[currentStep]
                // Check Proof
                // Check proof equality with IPFS data.
                if (this.merkleRoot[0] === EcDRwithSig.ProofCovidStatus || this.merkleRoot[1] === EcDRwithSig.ProofCovidStatus) {
                  this.VerifyResult[keyToUse].status = 'success'
                  console.log('Passed proof checks')
                  if (this.merkleRoot[0] === EcDRwithSig.ProofCovidStatus) {
                    // Patient vaccinated. Ignore timestamp.
                    // Increment step for timestamp passed.
                    currentStep += 1
                    keyToUse = Object.keys(this.VerifyResult)[currentStep]
                    this.VerifyResult[keyToUse].status = 'success'
                    console.log('Passed timestamp check...')
                    // Call Continue with verification function.
                    this.verificationContinued(keyToUse, currentStep, ipfsHashOfCountrysTCdoc, EcDRwithSig)
                  } else {
                    // Patient is not vaccinated. Check timestamp.
                    const daysElapsed = this.verifyTimestampValidity(timeStamp)
                    if (daysElapsed <= 72) {
                      // Timestamp is within last 72 hours.
                      // Increment step for timestamp passed.
                      currentStep += 1
                      keyToUse = Object.keys(this.VerifyResult)[currentStep]
                      this.VerifyResult[keyToUse].status = 'success'
                      console.log('Passed timestamp check')
                      // Call Continue with verification function.
                      this.verificationContinued(keyToUse, currentStep, ipfsHashOfCountrysTCdoc, EcDRwithSig)
                    } else {
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
                  }
                } else {
                  this.VerifyResult[keyToUse].status = 'error'
                  this.verifyBtnLoadState = false
                  console.log('Proof check failed.')
                  this.$message.error('Failed proof check.')
                }
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
              this.VerifyResult[keyToUse].status = 'error'
              this.verifyBtnLoadState = false
              console.log('Invalid encrypted data from IPFS for Borderless.')
              this.$message.error('Invalid encrypted data from IPFS for Borderless.')
            }
          }).catch(err => {
            console.log('IPFS error: ', err)
            this.$message.error('Oops, Error pulling data from IPFS.')
            this.verifyBtnLoadState = false
          })
        } else {
          return 0
        }
      }).catch(err => {
        console.log('Country is not activated', err)
        this.$message.error('Sorry! Country is not activated.')
      })
      if (beginCcheck === 0) {
        // Country check failed. Whole process aborted.
        this.VerifyResult[keyToUse].status = 'error'
      }
    },
    verificationContinued (keyToUse, currentStep, ipfsHashOfCountrysTCdoc, EcDRwithSig) {
      // Get TC file from IPFS.
      ipfs.cat(ipfsHashOfCountrysTCdoc).then(tcDataFileFromIPFS => {
        console.log('JSON File of TC', JSON.parse(tcDataFileFromIPFS.toString()))
        var tcData = JSON.parse(tcDataFileFromIPFS.toString())
        // Increment to next step.
        currentStep += 1
        keyToUse = Object.keys(this.VerifyResult)[currentStep]
        this.VerifyResult[keyToUse].status = 'success'
        // Prepare data H(Proof||hED) to be signed by TC.
        getHash(EcDRwithSig.encryptedData).then(res => {
          this.hED = res
          const dataSignedbyTC = EcDRwithSig.ProofCovidStatus.concat(this.hED)
          // Hash to sign.
          getHash(dataSignedbyTC).then(hashedDataOneSigned => {
            // Verify signature authenticity by recovering signer's address from signature.
            const signature = EcDRwithSig.sigOfTC.replace(/"/g, '') // Remove the double quotes.
            const recoveredAddrOfTC = recoveredAddrFromSig(hashedDataOneSigned, signature)
            console.log('Address recovered: ', recoveredAddrOfTC)
            // Check if address exist in patient's country's TC file.
            if (Object.values(tcData).includes(web3.utils.toChecksumAddress(recoveredAddrOfTC))) {
              // TC signature verification passed.
              console.log('Signature verification passed.')
              currentStep += 1
              keyToUse = Object.keys(this.VerifyResult)[currentStep]
              this.VerifyResult[keyToUse].status = 'success'
              this.$notify({
                title: 'Successful proof',
                message: 'Successful verification',
                type: 'success'
              })
              this.verifyBtnLoadState = false
              // this.getUserChoice()
            } else {
              currentStep += 1
              keyToUse = Object.keys(this.VerifyResult)[currentStep]
              this.VerifyResult[keyToUse].status = 'error'
              this.verifyBtnLoadState = false
              console.log('TC signature verification failed.')
              this.$message.error('TC signature verification failed.')
              this.$notify.error({
                title: 'Failed proof',
                message: 'Sorry! You failed verification.'
              })
              this.getUserChoice()
            }
          })
        })
      }).catch(err => {
        console.log('IPFS error in getting TC file: ', err)
        this.$message.error('Oops, Error pulling TC data from IPFS.')
        this.verifyBtnLoadState = false
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
        this.$router.push('verifierLanding')
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
