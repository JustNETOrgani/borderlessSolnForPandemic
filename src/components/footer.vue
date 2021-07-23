<template>
  <div>
    <el-footer>
        <div id="socialMediaDiv">
            <el-row :gutter="4">
              <el-col :span="4">
                    <div class="grid-content bg-purple-dark">
                        <a href="https://www.facebook.com"><img id="mysocialImg" src="../assets/imgs/fb.png" width="50px" height="50px" alt="gitHub" class="rounded-circle"></a>
                    </div>
                </el-col>
                <el-col :span="4" :offset="1">
                    <div class="grid-content bg-purple-dark">
                        <a href="https://www.twitter.com"><img id="mysocialImg" src="../assets/imgs/tw.png" width="50px" height="50px" alt="twitter" class="rounded-circle"></a>
                    </div>
                </el-col>
                <el-col :span="4" :offset="1">
                    <div class="grid-content bg-purple-dark">
                        <a href="https://www.youtube.com"><img id="mysocialImg" src="../assets/imgs/yTube.png" width="50px" height="50px" alt="youtube" class="rounded-circle"></a>
                    </div>
                </el-col>
                <el-col :span="4" :offset="1">
                    <div class="grid-content bg-purple-dark">
                        <a href="https://www.baidu.com"><img id="mysocialImg" src="../assets/imgs/bdu.png" width="50px" height="50px" alt="baidu" class="rounded-circle"></a>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div class="grid-content bg-purple-dark">
                        <a href="https://www.github.com"><img id="mysocialImg" src="../assets/imgs/gith.png" width="50px" height="50px" alt="gitHub" class="rounded-circle"></a>
                    </div>
                </el-col>
            </el-row>
        </div>
        <el-row>
          <el-col :span="24">
            <div class="grid-content bg-purple-dark">
                    <div id="footerBottom">
                        <p><u>Designed by JustNET from SWUST - P. R. CHINA</u></p>
                        <p class="h6">Copyright © {{currentYear}}. All rights reserved.</p>
                    </div>
            </div>
          </el-col>
        </el-row>
    </el-footer>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  data () {
    return {}
  },
  computed: {
    currentYear () {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
/* .el-footer{
    background-color: #d6e1f0;
} */
#socialMediaDiv{
    margin: 0.2rem 30rem;
}
#footer h5{
  padding-left: 10px;
    border-left: 3px solid #eeeeee;
    padding-bottom: 2px;
    margin-bottom: 0.5px;
    color:#ffffff;
}
#footer a {
    color: #ffffff;
    text-decoration: none !important;
    background-color: transparent;
    -webkit-text-decoration-skip: objects;
}
#footer ul.social li{
    padding-top: 1.5%;
    padding-bottom: 0.5%;
    margin-right: 4%;
}
#footer ul.social li a i {
    margin-right: 5px;
  font-size:25px;
  -webkit-transition: .5s all ease;
  -moz-transition: .5s all ease;
    transition: .5s all ease;
}
#footer ul.social li:hover a i {
  font-size:30px;
    margin-top:-10px;
}

#footer ul.social li a:hover{
    color:#eeeeee;
}

#mysocialImg:hover{
    transform: scale(1.1); /* Negative value rotates and decreases size.*/
}

</style>
