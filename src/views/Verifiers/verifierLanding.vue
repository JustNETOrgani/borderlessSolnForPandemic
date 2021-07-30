<template>
  <div class="home">
    <div id="topNav">
        <el-link icon="el-icon-arrow-left" style="font-size:17px;float:left;" @click="backToPrvPg">Previous Page</el-link>
    </div>
    <el-dialog title="Verification Type" :visible.sync="dialogFormVisible" width="40%">
        <el-form :model="vTypeForm">
            <el-form-item label="Verification option" :label-width="formLabelWidth">
            <el-select v-model="vTypeForm.vType" placeholder="Select verification type">
                <el-option label="Borderless" value="borderless"></el-option>
                <el-option label="In Country" value="inCountry"></el-option>
            </el-select>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="backToPrvPg()">Cancel</el-button>
            <el-button type="primary" @click="execUserVoption()">Confirm</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  // name: 'Home',
  data () {
    return {
      vTypeForm: {
        vType: ''
      },
      dialogFormVisible: false,
      formLabelWidth: '140px'
    }
  },
  components: {
  },
  created () {
    this.dialogFormVisible = true
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
    execUserVoption () {
      if (this.vTypeForm.vType === '') {
        this.$message.warning('Please select verification option.')
      }
      if (this.vTypeForm.vType === 'borderless') {
        console.log('Borderless verification selected')
        this.dialogFormVisible = false
      }
      if (this.vTypeForm.vType === 'inCountry') {
        console.log('In country verification selected')
        this.dialogFormVisible = false
        this.$router.push('inCountryVerify')
      }
    },
    backToPrvPg () {
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

#topNav{
  width: 100%;
  height: 5%;
}
</style>
