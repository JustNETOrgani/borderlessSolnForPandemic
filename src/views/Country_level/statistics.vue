<template>
    <div class="pageContainer">
        <div id="topNav">
          <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPage">Previous Page</el-link>
        </div>
        <el-row>
          <el-col :span="23" :offset="1">
            <el-col :span="7">
              <h3 id="activityHub">Country Statistics Hub</h3>
            </el-col>
            <el-col :span="5">
                    <h4 class="textPlacements">Task selection area</h4>
            </el-col>
            <el-col :span="7">
              <div class="rowAlignment">
                  <el-form
                      :model="countrySpecificTasks"
                      :rules="rules"
                      ref="countrySpecificTasks"
                      label-width="120px"
                  >
                      <el-form-item label="Required task" prop="deployerTask">
                          <el-select
                              v-model="countrySpecificTasks.countryTasks"
                              style="width:100%"
                              placeholder="Please select the desired task.">
                              <el-option label="Get Country Statistics" value="countryStats"></el-option>
                          </el-select>
                      </el-form-item>
                    </el-form>
              </div>
            </el-col>
            <div class="rowAlignment">
            <el-col :span="5">
              <el-button type="info" round :loading="getDataBtnLoadState" @click="submitForm('countrySpecificTasks')">Get data</el-button>
            </el-col>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <h4>Status</h4>
          </el-col>
          <el-col :span="5">
            <h4>IPFS hash of Current TC File</h4>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4">
            <h5 :class="[country_Status.length < 9 ? 'statusRed' : 'statusGreen']">{{country_Status}}</h5>
          </el-col>
          <el-col :span="5">
            <h5>{{country_tcIPFShash}}</h5>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" :offset="0">
            <h4>Retrieved data appears below</h4>
            <div v-if="getAllTestsNvac" v-loading="allTestsNvacLoading">
              <el-row>
                <el-col :span="3">
                  <h5>Name of Country: {{country_Name}}</h5>
                </el-col>
                <el-col :span="6">
                  <h5>Blockchain Address: {{addressOfCountry}}</h5>
                </el-col>
              </el-row>
                <el-table
                :data="pageTableData"
                style="width: 100%"
                height="550px"
                >
                <!--Building table body-->
                <template v-for="(item, index) in allTestsNvactableLabel">
                  <el-table-column
                    :key="index"
                    :prop="item.prop"
                    :label="item.label" :width="item.width">
                  </el-table-column>
                </template>
              </el-table>
            </div>
            <div v-else-if="defaultPageItem">
                <p>No data retrieved</p>
            </div>
          </el-col>
        </el-row>
    </div>
</template>

<script>
import ethEnabled from '@/assets/js/web3nMetaMask'
import web3 from '@/assets/js/web3Only'
import { ABI, contractAddress, suppliedGas } from '@/assets/js/ABIs/WHO_ABI'
import { ABIcountrySC, contractAddressCountrySC, suppliedGasCountrySC } from '@/assets/js/ABIs/Country_ABI'
export default {
  // name: 'Home',
  data () {
    return {
      countrySpecificTasks: {
        countryTasks: ''
      },
      country_Name: '',
      country_Status: '',
      country_tcIPFShash: '',
      addressOfCountry: '',
      // Table data begins.
      pageTableData: [],
      // Table data ends.
      // Array to hold requested IPFS hashes of papers begins.
      reqIPFShashes: [],
      // Array to hold requested IPFS hashes of papers ends.
      // v-if states.
      getAllTestsNvac: false,
      defaultPageItem: false,
      // Loading states.
      getDataBtnLoadState: false,
      allTestsNvacLoading: false,
      rules: {
        countryTasks: [
          { required: true, message: 'Please select desired task', trigger: 'blur' }
        ]
      },
      // Table labels begin.
      allTestsNvactableLabel: [
        { label: 'Patients tested', prop: 'totalTests', width: '160px' },
        { label: 'Total Updated', prop: 'numOfUpdates', width: '170px' },
        { label: 'Total Vaccinated', prop: 'numOfVacc', width: '190px' }
      ]
      // Table labels end.
    }
  },
  components: {
  },
  created () {
    if (!ethEnabled()) {
      this.$message('Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!')
    } else {
      this.getAccount().then(accounts => {
        this.addressOfCountry = accounts[0]
        console.log('Current account: ', this.addressOfCountry)
        // Make a call to WHO SC to get details about country before page loads. Name, Deployed SC address.
        this.loadCountryInfoFromWHOsc()
      })
    }
  },
  watch: {
    'addressOfCountry' () {
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
        myRoot.addressOfCountry = accounts[0]
        console.log('Selected account: ', myRoot.addressOfCountry)
        myRoot.$message({
          message: 'Account switched successfully.',
          type: 'success'
        })
        console.log('Account switched')
        myRoot.accountChangeStatus = true
      })
    },
    loadCountryInfoFromWHOsc () {
      this.pageLoadingState = true
      console.log('Getting country info.')
      var WHOsmartContract = new web3.eth.Contract(ABI, contractAddress, { defaultGas: suppliedGas })// End of ABi Code from Remix.
      console.log('Contract instance created.')
      // Smart contract and other logic continues.
      try {
        WHOsmartContract.methods.getCountryInfo().call({ from: this.addressOfCountry }).then(res => {
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
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        this.getDataBtnLoadState = true
        if (valid) {
          // Call different methods here based on journal's selection.
          if (this.countrySpecificTasks.countryTasks === 'countryStats') {
            this.getCountryStatistics()
          }
        } else {
          console.log('Submission error.')
          this.getDataBtnLoadState = false
          return false
        }
      })
    },
    backToPrvPage () {
      this.$router.push('countryLanding')
    },
    getCountryStatistics () {
      this.pageTableData.splice(0, this.pageTableData.length) // Remove all previously stored values.
      this.allTestsNvacLoading = true
      this.defaultPageItem = false

      var countrySC = new web3.eth.Contract(ABIcountrySC, contractAddressCountrySC, { defaultGas: suppliedGasCountrySC })// End of ABi Code from Remix.
      console.log('Country Contract instance created.')
      // Smart contract and other logic continues.
      countrySC.methods.getPublicStatistics().call({ from: this.addressOfCountry }).then(res => {
        console.log('Response: ', res)
        for (let i = 0; i < 1; i++) {
          this.pageTableData[i] = []
          this.pageTableData[i].totalTests = res.Total_tested
          this.pageTableData[i].numOfUpdates = res.UpdatedRecords
          this.pageTableData[i].numOfVacc = res.TotalVaccinated
        }
        console.log('Page data: ', this.pageTableData)
        // Change states
        this.getDataBtnLoadState = false
        this.allTestsNvacLoading = false
        this.getAllTestsNvac = true
      })
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
  margin-top: 0.5rem;
  width: 100%;
  height: 5%;
}
#headingTop {
  background-color: #ffffff;
  border-radius: 4px;
  margin: 0.6% auto;
  width: 100%;
  padding: 0.2rem 1.5rem;
}
#headingTitle{
  width: 30%;
  float: left;
}
#topRight{
  background-color: #ffffff;
  width: 68%;
}
#activityHub{
  text-align: left;
}
.rowAlignment{
  margin-top: 0.8rem;
}
.textPlacements{
    margin-left: -2rem;
}
.infoAtGlance{
  text-align: left;
  margin-left: 1rem;
  font-size: 1.1rem;
  color: rgb(113, 140, 189);
}
h3{color:rgb(105, 96, 41)}
h5{color:rgb(105, 96, 41)}
.statusGreen {color: darkgreen; font-style: italic; font-weight: bold;}
.statusRed {color: darkred; font-style: italic; font-weight: bold;}
</style>
