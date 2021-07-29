<template>
    <div class="home" :style="image" id="bgImage">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
        </div>
        <div class="wrapper">
            <h2>Patient Blockchain credential creation</h2>
            <el-row>
                <el-col :span="12">
                  <el-link :underline="false" href="https://www.myetherwallet.com/" target="_blank">
                    <p>Create your blockchian address here</p>
                  </el-link>
                </el-col>
                <el-col :span="12">
                  <a href="https://www.myetherwallet.com/"><img src="../../assets/imgs/mewImg.png" /></a>
                </el-col>
            </el-row>
        </div>
        <div class="wrapper">
            <h2>Generate Asymmetric keys</h2>
            <el-row>
                <el-col :span="12" :offset="6">
                  <el-button type="primary" :loading="keyGenBtnLoadState" @click="keyGen()">Generate keys</el-button>
                </el-col>
            </el-row>
        </div>
        <div class="wrapper">
            <h2>Update address on the blockchain</h2>
            <el-row>
                <el-col :span="12" :offset="6">
                  <el-button type="primary" :loading="addrUpdateBtnLoadState" @click="addrUpdate()">Create update</el-button>
                </el-col>
            </el-row>
        </div>
        <div id="overlay">
          <div id="cryptoContainer">
            <el-row>
                <el-col :span="6" >
                   <el-card shadow="hover">
                    <table style="table-layout: fixed; width: 100%">
                      <tr>
                        <td style="word-wrap: break-word">{{pubKey}}}</td>
                      </tr>
                    </table>
                  </el-card>
                </el-col>
                <el-col :span="18">
                  <el-card shadow="hover">
                    <table style="table-layout: fixed; width: 100%">
                      <tr>
                        <td style="word-wrap: break-word">{{prvKey}}}</td>
                      </tr>
                    </table>
                  </el-card>
                </el-col>
            </el-row>
          </div>
          <el-button type="primary" @click="closeDiv()">Close</el-button>
        </div>
        <el-dialog title="Addres update" :visible.sync="addrUpdateDialogFormVisible" width="30%">
          <el-form :model="addressUpdateForm" :rules="rules" ref="addressUpdateForm">
            <el-form-item label="Hashed ID" prop="hid">
              <el-input v-model="addressUpdateForm.hid" placeholder="Enter Hashed ID"></el-input>
            </el-form-item>
            <el-form-item label="IPFS hash" prop="ifpsHash">
              <el-input v-model="addressUpdateForm.ifpsHash" placeholder="Enter IPFS hash"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addrUpdateDialogFormVisible = false">Cancel</el-button>
            <el-button type="primary" @click="performAddrUpdate('addressUpdateForm')">Confirm</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import * as signatureGenerator from '@/assets/js/sigHelperFns'
import getHash from '@/assets/js/hashFunc'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
import web3 from '@/assets/js/web3Only'

export default {
  data () {
    return {
      // Background image.
      image: { backgroundImage: 'url(https://user-images.githubusercontent.com/44321289/127439445-3b05e65a-e666-4962-a7ed-2959c38e5e2b.jpg)' },
      keyGenBtnLoadState: false,
      prvKey: null,
      pubKey: null,
      addressUpdateForm: {
        hid: '',
        ifpsHash: ''
      },
      personAddress: '',
      newPersonAddress: '',
      accountChangeStatus: false,
      addrUpdateDialogFormVisible: false,
      addrUpdateBtnLoadState: false,
      rules: {
        hid: [
          { required: true, message: 'Please input HID', trigger: 'blur' },
          { min: 46, message: 'Length should be at least 46', trigger: 'blur' }
        ],
        ifpsHash: [
          { required: true, message: 'Please input IPFS hash', trigger: 'blur' },
          { min: 46, message: 'Length should be at least 46', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.personAddress = accounts[0]
        console.log('Current account: ', this.personAddress)
      })
    }
  },
  watch: {
    'personAddress' () {
      this.switchAccount()
    }
  },
  methods: {
    backToPrvPg () {
      this.$router.push('/')
    },
    async getAccount () {
      var accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      return accounts
    },
    switchAccount () {
      var myRoot = this // Ensure all this or vue global variables can be accessed within this fucntion via myRoot.
      window.ethereum.on('accountsChanged', function (accounts) {
        myRoot.newPersonAddress = accounts[0]
        myRoot.personAddress = accounts[0]
        console.log('Selected account: ', myRoot.newPersonAddress)
        myRoot.$message({
          message: 'Account switched successfully.',
          type: 'success'
        })
        console.log('Account switched')
        myRoot.accountChangeStatus = true
      })
    },
    keyGen () {
      this.keyGenBtnLoadState = true
      window.crypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
      ).then(keyPair => {
        console.log('Public key: ', keyPair.publicKey)
        console.log('Private key: ', keyPair.privateKey)
        this.exportPrvCryptoKey(keyPair.privateKey).then(exportedPrvKey => {
          this.prvKey = exportedPrvKey
          this.exportPubCryptoKey(keyPair.publicKey).then(exportedPubKey => {
            this.keyGenBtnLoadState = false
            console.log('Public key in PEM format: ', exportedPubKey)
            this.pubKey = exportedPubKey
            // Show Div
            document.getElementById('overlay').style.display = 'block'
          })
        }).catch(err => {
          console.log('Error converting to PEM format', err)
          this.keyGenBtnLoadState = false
        })
      }).catch(err => {
        this.keyGenBtnLoadState = false
        console.log('Error generating RSA keypair', err)
      })
    },
    // Key conversion function helpers begin.
    // Convert  an ArrayBuffer into a string
    ab2str (buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf))
    },
    async exportPrvCryptoKey (key) {
    // Export the given key and write it into the "exported-key" space.
      const exported = await window.crypto.subtle.exportKey(
        'pkcs8',
        key
      )
      const exportedAsString = this.ab2str(exported)
      const exportedAsBase64 = window.btoa(exportedAsString)
      const pemExported = `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`
      return pemExported
    }, // Key conversion function helpers end.
    async exportPubCryptoKey (key) {
      const exported = await window.crypto.subtle.exportKey(
        'spki',
        key
      )
      const exportedAsString = this.ab2str(exported)
      const exportedAsBase64 = window.btoa(exportedAsString)
      const pemExported = `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`
      return pemExported
    },
    // General function
    str2ab (str) {
      const buf = new ArrayBuffer(str.length)
      const bufView = new Uint8Array(buf)
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
      }
      return buf
    },
    closeDiv () {
      document.getElementById('overlay').style.display = 'none'
    },
    async sendTnx (txParams) {
      // Transaction execution in Ethereum from Metamask
      var txReceipt = await window.ethereum.request({ method: 'eth_sendTransaction', params: [txParams] })
      return txReceipt
    },
    addrUpdate () {
      this.addrUpdateBtnLoadState = true
      this.addrUpdateDialogFormVisible = true
    },
    performAddrUpdate (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          console.log('Address update initiated')
          this.addrUpdateDialogFormVisible = false
          var dataEntered = {
            personHID: this.addressUpdateForm.hid,
            personIPFShash: this.addressUpdateForm.ifpsHash
          }
          getHash(dataEntered.personIPFShash).then(hIPFShash => {
            console.log('Hash computed.')
            // Get Signature from person.
            signatureGenerator.signatureGen(hIPFShash, this.personAddress, (sig) => {
              console.log('Signature generated')
              this.$message('Please switch account to new account and sign again')
              this.$confirm('Account switched?.', 'Warm tip', {
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                type: 'warning'
              }).then(() => {
                if (this.accountChangeStatus === true) {
                  this.pushTransactionToBlockchain(dataEntered.personHID, hIPFShash, sig)
                } else {
                  this.$message.error('Oops, account not changed.')
                  this.addrUpdateBtnLoadState = false
                }
              }).catch(() => {
                this.$message({
                  type: 'info',
                  message: 'User canceled'
                })
                this.addrUpdateBtnLoadState = false
              })
            }).catch(err => {
              console.log('Sorry! Error occured.', err)
              this.addrUpdateBtnLoadState = false
              this.$message.error('Error getting signature. Please try again later.')
            })
          })
        } else {
          console.log('Submission error.')
          this.$message({
            message: 'Please, fill the form.',
            type: 'warning'
          })
          this.addrUpdateBtnLoadState = false
          return false
        }
      })
    },
    pushTransactionToBlockchain (personHID, hIPFShash, sig) {
      console.log('Sending transaction on chain')
      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        // Transaction parameters
        const txParams = {
          from: this.personAddress,
          to: contractAddressCountrySC,
          data: countrySC.methods.updateBlockchainAddr(this.newPersonAddress, personHID, hIPFShash, sig).encodeABI()
        }
        this.sendTnx(txParams).then(tnxReceipt => {
          console.log('Transaction receipt: ', tnxReceipt)
          this.$message({
            type: 'info',
            message: 'Transaction successful'
          })
          this.addrUpdateBtnLoadState = false
          this.$alert('Address successfully updated in Smart Contract.', 'Address update success', {
            confirmButtonText: 'OK',
            callback: action => {
              this.$message({
                type: 'info',
                message: 'Transaction successful'
              })
            }
          })
        }).catch(err => {
          console.log('Sorry! Error occured.', err)
          this.addrUpdateBtnLoadState = false
          this.$message.error('Blockchain error. Please try again later.')
        })
      } catch {
        console.log('Sorry! Error occured.')
        this.addrUpdateBtnLoadState = false
        this.$message.error('Non-transactional error. Please try again later.')
      }
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
    background-size: 100% 71%;
    }

#topNav{
  width: 100%;
  height: 5%;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 2.5% auto;
  width: 27%;
  padding: 1rem 1.5rem;
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
#cryptoContainer {
  width: 60%;
  height: 70%;
  margin: 2% auto;
}
td {
  border: 1px solid;
}
</style>
