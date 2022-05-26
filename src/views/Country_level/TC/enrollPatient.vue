<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
        </div>
        <div class="wrapper" v-loading="loadingPOnboardingPage">
            <h3>Enroll Patient on Borderless</h3>
            <div v-loading="pageLoadingState">
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
            </div>
            <el-row>
                <el-steps :active="active" align-center finish-status="success">
                <el-step title="Step 1" description="Enter and Process data"></el-step>
                <el-step title="Step 2" description="Get TC's signature"></el-step>
                <el-step title="Step 3" description="Get IPFS hash via QR code"></el-step>
                <el-step title="Step 4" description="Anchor in blockchain"></el-step>
                </el-steps>
            </el-row>
            <br>
            <el-row>
                <el-col :span="9">
                    <div class="grid-content bg-purple-dark">
                        <el-form
                            :model="onboardPerson"
                            :rules="rules"
                            ref="onboardPerson"
                            label-width="145px"
                        >
                            <el-form-item label="Patient ID" prop="userID">
                                <el-input v-model="onboardPerson.userID" placeholder="Please enter patient's ID"></el-input>
                            </el-form-item>
                            <el-form-item label="Test status" prop="tStatus">
                                <el-select
                                    v-model="onboardPerson.tStatus"
                                    style="width:100%"
                                    placeholder="Select test status">
                                    <el-option label="Positive" value="Positive"></el-option>
                                    <el-option label="Negative" value="Negative"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Vaccination status" prop="vStatus">
                                <el-select
                                    v-model="onboardPerson.vStatus"
                                    style="width:100%"
                                    placeholder="Select vaccination status">
                                    <el-option label="Not vaccinated" value="Not Vaccinated"></el-option>
                                    <el-option label="Vaccinated" value="vaccinated"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-row>
                              <el-form-item label="**TC's consent**" prop="authCheckBox">
                                  <el-checkbox v-model="onboardPerson.authCheckBox">I understand the implication of this action.</el-checkbox>
                              </el-form-item>
                            </el-row>
                            <el-row>
                                <el-button :disabled='isDisabled' :loading="personOnboardLoadBtn" @click="processFormData('onboardPerson')">Process data</el-button>
                                <el-button @click="resetForm('onboardPerson')">Reset</el-button>
                            </el-row>
                        </el-form>
                    </div>
                </el-col>
                <el-col :span="13" :offset="2">
                    <fieldset>
                        <legend>Processed Data</legend>
                            <el-row>
                                <el-col :span="5" :offset="0">
                                    <p class="computedLabels">Hash of Patient's ID:</p>
                                </el-col>
                                <el-col :span="5" :offset="0">
                                    <p id="formattedString_hEcDR">{{HashedID}}</p>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="6" :offset="0">
                                    <p class="computedLabels">Proof-of-COVID status:</p>
                                </el-col>
                                <el-col :span="5" :offset="0">
                                    <p class="formattedString">{{proofOfCOVIDStatus}}</p>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="6" :offset="0">
                                    <p class="computedLabels">IPFS Hash of Enc. Data:</p>
                                </el-col>
                                <el-col :span="5" :offset="0">
                                    <p class="formattedString">{{IPFSHashOfhEcDR}}</p>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :span="5" :offset="0">
                                    <p class="computedLabels">TC's Signature:</p>
                                </el-col>
                                <el-col :span="5" :offset="0">
                                    <p class="formattedString">{{signatureTC_substring}}</p>
                                </el-col>
                            </el-row>
                    </fieldset>
                </el-col>
            </el-row>
            <el-row>
                <el-button type="primary" :loading="submitLoadBtn" @click="anchorOnchain()">Submit to blockchain</el-button>
            </el-row>
        </div>
        <div id="overlay" v-loading="qrCodeLoading">
          <div id="qrCodeGenerated"></div>
          <el-button type="primary" @click="qrCodeDivDisappear()">Done</el-button>
        </div>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import * as signatureGenerator from '@/assets/js/sigHelperFns'
import getHash from '@/assets/js/hashFunc'
import web3 from '@/assets/js/web3Only'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
import getMerkleRootFromMkTree from '@/assets/js/getMerkleRootOfData'
import computeIPFShash from '@/assets/js/computeIPFShashBeforeStorage'
const ipfs = new window.Ipfs()
const qrCode = new window.QRCodeStyling({
  width: 200,
  height: 200,
  data: 'https://github.com/JustNETOrgani',
  image: 'https://user-images.githubusercontent.com/44321289/127468529-2dd325cf-a2e6-4f62-9dfa-803b66be4f4c.png',
  dotsOptions: {
    color: '#4267b2',
    type: 'rounded'
  }
})

export default {
  data () {
    return {
      onboardPerson: {
        userID: '',
        tStatus: '',
        vStatus: '',
        authCheckBox: false
      },
      // Steps.
      active: 0,
      // Dynamic variables.
      ED: '',
      hED: '',
      HashedID: '',
      timeStamp: '',
      mkRoot: '',
      IPFSHashOfhEcDR: '',
      hIPFShash: '',
      fullSignature: '',
      signatureTC_substring: '',
      signature_substring: '',
      proofOfCOVIDStatus: '',
      address: '',
      currentEthAddress: '',
      personAccount: '',
      pubKeyOfPerson: '',
      AHPkeyGenerated: '',
      sigOfTC: '',
      merkeTreeData: [],
      pgAccounts: [],
      nameOfTC: '',
      addrOfTC: '',
      statusOfTC: '',
      addrOfCountry: '',
      // Loading states
      pageLoadingState: false,
      personOnboardLoadBtn: false,
      loadingPOnboardingPage: true,
      submitLoadBtn: false,
      qrCodeLoading: false,
      // Account change status.
      accountChangeStatus: false,
      // Dialogs.
      accountSwitchDialogVisible: false,
      qrCodeOfIPFShashDialog: false,
      // Button disable tracker.
      processDataBtnState: false,
      anchorOnBlockBtnState: false,
      rules: {
        userID: [
          { required: true, message: 'Please input user ID', trigger: 'blur' },
          { min: 5, message: 'Length should be at least 5', trigger: 'blur' }
        ],
        tStatus: [
          { required: true, message: 'Please select test status from the list.', trigger: 'blur' }
        ],
        vStatus: [
          { required: true, message: 'Please select vaccination status from the list.', trigger: 'blur' }
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
        this.currentEthAddress = accounts[0]
        this.pgAccounts.push(this.currentEthAddress)
        console.log('Current account: ', this.currentEthAddress)
        // Make a call to WHO SC to get details about country before page loads. Name, Deployed SC address.
        this.loadTCinfoFromCountrySC().then(res => {
          if (res === true) {
            console.log('Call to SC successful')
            // Proceed to get user Public key.
            this.getPublicKeyOfPatient()
          } else {
            console.log('Call to SC failed.')
          }
        })
      })
    }
  },
  watch: {
    'currentEthAddress' () {
      this.switchAccount()
    }
  },
  computed: {
    isDisabled: function () {
      return !this.onboardPerson.authCheckBox
    }
  },
  methods: {
    switchAccount () {
      var myRoot = this // Ensure all this or vue global variables can be accessed within this fucntion via myRoot.
      window.ethereum.on('accountsChanged', function (accounts) {
        myRoot.pgAccounts.push(accounts[0])
        myRoot.personAccount = accounts[0]
        console.log('Selected account: ', myRoot.personAccount)
        myRoot.$message({
          message: 'Account switched successfully..',
          type: 'success'
        })
        console.log('Account switched')
        myRoot.accountChangeStatus = true
      })
    },
    async loadTCinfoFromCountrySC () {
      this.pageLoadingState = true
      console.log('Getting TC info.')
      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      countrySC.methods.getTCInfo().call({ from: this.currentEthAddress }).then(res => {
        this.addrOfCountry = res[0]
        // console.log('Addr. of Country: ', this.addrOfCountry)
        this.nameOfTC = res[1]
        this.addrOfTC = this.currentEthAddress
        if (res[2] === '1') {
          this.statusOfTC = 'Activated'
        }
        if (res[2] === '2') {
          this.statusOfTC = 'Revoked'
          this.$message.warning('Sorry! TC revoked. You cannot enroll Patients.')
        }
        this.pageLoadingState = false
      }).catch(err => {
        console.log('Error calling SC: ', err)
        this.$message.error('Sorry! Unknown TC.')
        return false
      })
      return true
    },
    getPublicKeyOfPatient () {
      console.log('Inside Pub.Key acquisition.')
      this.$prompt('Please input public key of Patient.', 'Information required', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel'
      }).then(({ value }) => {
        // Valid Public key before proceeding.
        this.pubKeyOfPerson = value
        console.log('Public key acquired.')
      }).catch((err) => {
        console.log('User has cancelled.', err)
        this.$message.error('Sorry! Public key of Patient required. Reloading...')
        window.location.reload() // Reload page.
      })
    },
    backToPrvPg () {
      this.$router.push('tcLanding')
    },
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    },
    handleAccountSwitchDialogClose (done) {
      this.$confirm('Are you sure to close this dialog?')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    processFormData (formName) {
      if (this.processDataBtnState === false) {
        if (this.onboardPerson.authCheckBox === true) {
          this.$refs[formName].validate(valid => {
            this.personOnboardLoadBtn = true
            if (valid) {
              var data = {
                userID: this.onboardPerson.userID,
                tStatus: this.onboardPerson.tStatus,
                vStatus: this.onboardPerson.vStatus,
                tTime: Math.round(+new Date() / 1000)// unix timestamp
              }
              this.timeStamp = data.tTime
              console.log('Data: ', data)
              // Encrypt data using user public key ---> EcDR
              this.importPubKeyAndEncrypt(JSON.stringify(data)).then(encryptedDataRes => {
                console.log('EcDR: ', encryptedDataRes)
                this.ED = encryptedDataRes
                // Hash encrypted data---> hEcDR.
                getHash(this.ED).then(res => {
                  this.hED = res
                  // Hash the UserID alone as input to the SC.
                  getHash(data.userID).then(HID => {
                    this.HashedID = HID
                    console.log('Hashed ID: ', this.HashedID)
                    // Prepare data for Merkle Tree.
                    this.merkeTreeData.push(data.tStatus, data.vStatus, this.timeStamp, this.HashedID, this.addrOfCountry)
                    // Compute Merkle root.
                    const merkleToutput = getMerkleRootFromMkTree(this.merkeTreeData)
                    if (merkleToutput.aProof === true) {
                      this.mkRoot = merkleToutput.merkleRoot
                      this.proofOfCOVIDStatus = merkleToutput.merkleRoot.substr(0, 20) + '...' + merkleToutput.merkleRoot.substr(merkleToutput.merkleRoot.length - 20)
                      this.active += 1 // Increment step to move to next stage.
                      // Prepare data H(Proof||hED) to be signed by TC.
                      const dataToSign = this.mkRoot.concat(this.hED)
                      // Hash to sign.
                      getHash(dataToSign).then(hashedDataToSign => {
                        // TC signs Proof to get signature.
                        this.signatureOfTC(hashedDataToSign) // Includes push to IPFS.
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
                  })
                })
              // Person signs IPFShash to get signature.
              // Anchor data onto the blockchain via Smart Contract.
              })
            } else {
              console.log('Submission error.')
              this.personOnboardLoadBtn = false
              return false
            }
          })
        } else {
          this.$message('Please check the checkbox')
        }
      } else {
        this.$message({
          message: 'Sorry! Patient\'s data already processed.',
          type: 'warning'
        })
      }
    },
    async getAccount () {
      var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      return accounts
    },
    signatureOfTC (data) {
      // eslint-disable-next-line no-return-assign
      signatureGenerator.signatureGen(data, this.currentEthAddress, (sig) => {
        this.sigOfTC = sig
        console.log('TC\'s sig.: ', this.sigOfTC)
        this.signatureTC_substring = (this.sigOfTC.substring(0, 25) + '...' + this.sigOfTC.substr(this.sigOfTC.length - 25)).replace(/"/g, '') // Remove the double quotes.
        // TC signature acquired. Increment.
        this.active += 1 // Increment step to move to next stage.
        // Push data to IPFS.
        this.pushToIPFShub()
      })
    },
    pushToIPFShub () {
      var encryptedDataToSendToJviaIPFS = JSON.stringify({ timeStamp: this.timeStamp, ProofCovidStatus: this.mkRoot, sigOfTC: this.sigOfTC, encryptedData: this.ED })
      // console.log('Connecting to IPFS.')
      const MyBuffer = window.Ipfs.Buffer
      var dataToBuffer = MyBuffer.from(encryptedDataToSendToJviaIPFS)
      // console.log('Buffer conversion done.')
      // Pre-compute IPFS hash before pushing to IPFS.
      computeIPFShash(dataToBuffer).then(returnedIPFShash => {
        ipfs.add(dataToBuffer).then(res => {
          // Confirm returned IPFS matches precomputed hash.
          if (returnedIPFShash === res[0].hash) {
            // Match confirmed
            this.IPFSHashOfhEcDR = res[0].hash
            // Hash IPFS hash to be stored in SC.
            getHash(this.IPFSHashOfhEcDR).then(hashOfIPFShash => {
              this.hIPFShash = hashOfIPFShash
              console.log('Data upload to IPFS sucessful')
              this.$message('File upload to IPFS successful.')
              this.active += 1 // Increment step by 1 to move to next step.
              this.personOnboardLoadBtn = false
              if (this.accountChangeStatus === false) {
                this.accountSwitchDialogVisible = true
                // Change state of processData button.
                this.processDataBtnState = true
                this.$alert('Scan QR that follows to get the IPFS hash for proof', 'User information', {
                  confirmButtonText: 'OK',
                  callback: action => {
                    this.$message({
                      type: 'info',
                      message: 'User consented'
                    })
                    // Display the QR code by callign the method.
                    this.displayQRcode(this.IPFSHashOfhEcDR)
                  }
                })
              }
            })
          } else {
            this.$message({
              message: 'IPFS mismatch! Possible MiTM attack',
              type: 'warning'
            })
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
    },
    displayQRcode (userIPFShash) {
      this.qrCodeLoading = true
      console.log('Preparing QR code for: ', userIPFShash)
      console.log('Generating QR code containing IPFS hash of person.')
      // Update the QR code instance.
      // Concatenate ipfs hash and hashed user ID.
      qrCode.update({
        data: userIPFShash + this.addrOfCountry
      })
      console.log('Appending QR code to DOM.')
      document.getElementById('overlay').style.display = 'block'
      qrCode.append(document.getElementById('qrCodeGenerated'))
      this.qrCodeLoading = false
    },
    qrCodeDivDisappear () {
      document.getElementById('overlay').style.display = 'none'
    },
    async sendTnx (txParams) {
      // Transaction execution in Ethereum from Metamask
      var txReceipt = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] })
      return txReceipt
    },
    anchorOnchain () {
      if (this.processDataBtnState === true) {
        // Check all needed smart contract-related data have been acquired.
        console.log('Sending to blockchain')
        this.submitLoadBtn = true
        var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })
        console.log('Contract instance created.')
        // Smart contract and other logic continues.
        try {
          // Transaction parameters
          const txParams = {
            from: this.currentEthAddress,
            to: contractAddressCountrySC,
            data: countrySC.methods.patientRegistration(this.HashedID, this.hIPFShash).encodeABI()
          }
          this.sendTnx(txParams).then(tnxReceipt => {
            console.log('Transaction receipt: ', tnxReceipt)
            this.$message({
              type: 'info',
              message: 'Transaction successful'
            })
            // Display success note.
            this.active += 1 // Increment step.
            this.$alert('Person successfully anchored on Blockchain.', 'Creation success', {
              confirmButtonText: 'OK',
              callback: action => {
                this.$message({
                  type: 'info',
                  message: 'Transaction successful'
                })
                this.anchorOnBlockBtnState = true
                // this.getUserChoiceForRedirect() // Allow user to decide.
              }
            })
            this.$message({
              message: 'Person successfully created on Blockchain.',
              type: 'success'
            })
            this.submitLoadBtn = false
          })
        } catch {
          console.log('Sorry! Error occured.')
          this.submitLoadBtn = false
          this.$message.error('Non-transactional error. Please try again later.')
        }
        this.submitLoadBtn = false
      } else {
        this.$message.error('Sorry! Data on page not processed.')
      }
    },
    getUserChoiceForRedirect () {
      this.$confirm('Do you want to onboard another person?', 'Information needed', {
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
          message: 'Redirecting to landing page'
        })
        this.$router.push('healthFacIndexPg')
      })
    },
    async importPubKeyAndEncrypt (plaintext) {
      // const plaintext = 'This text will be encoded UTF8 and may contain special characters like § and €.'// Also works for json.

      try {
        const pub = await this.importPublicKey(this.pubKeyOfPerson)
        const encrypted = await this.encryptRSA(pub, new TextEncoder().encode(plaintext))
        const encryptedBase64 = window.btoa(this.ab2str(encrypted))
        // console.log('Encrypted Msg: ', encryptedBase64.replace(/(.{64})/g, '$1\n'))
        return encryptedBase64.replace(/(.{64})/g, '$1\n')
      } catch (error) {
        console.log('Error during encryption', error)
      }
    },
    // Helper functions to encrypt.
    async importPublicKey (spkiPem) {
      return await window.crypto.subtle.importKey(
        'spki',
        this.getSpkiDer(spkiPem),
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['encrypt']
      )
    },
    async encryptRSA (key, plaintext) {
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        key,
        plaintext
      )
      return encrypted
    },
    ab2str (buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf))
    },
    getSpkiDer (spkiPem) {
      const pemHeader = '-----BEGIN PUBLIC KEY-----'
      const pemFooter = '-----END PUBLIC KEY-----'
      var pemContents = spkiPem.substring(pemHeader.length, spkiPem.length - pemFooter.length)
      var binaryDerString = window.atob(pemContents)
      return this.str2ab(binaryDerString)
    },
    str2ab (str) {
      const buf = new ArrayBuffer(str.length)
      const bufView = new Uint8Array(buf)
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
      }
      return buf
    }
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
  margin: 3% auto;
  width: 75%;
  padding: 1rem 1.5rem;
}

.statusGreen {color: darkgreen; font-style: italic; font-weight: bold;}
.statusRed {color: darkred; font-style: italic; font-weight: bold;}

h3{color: rgb(120, 160, 173);}

fieldset {
  border-radius: 2rem;
}

legend {
 font-style: italic;
}
.computedLabels{
  text-align: left;
  font-size: 0.72rem;
  color: rgb(113, 140, 189);
}
#formattedString_hEcDR {
  font-size: 0.66rem;
  font-style: italic;
  color: rgb(95, 64, 116);
}
.formattedString{
  font-size: 0.71rem;
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

#qrCodeGenerated {
  margin-top: 15%;
}
</style>
