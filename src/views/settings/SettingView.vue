<template>
  <div style="padding: 15px;width: 50%">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="用户名">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="电话号码">
          <el-input v-model="form.phone"></el-input>
      </el-form-item>
      <el-form-item label="个人简介">
        <el-input v-model="form.intro" type="textarea"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">修改</el-button>
      </el-form-item>
    </el-form>
    <hr style="margin-top: 30px;margin-bottom: 40px"/>
    <el-form :model="password" label-width="110px" size="small" style="width: 60%">
      <el-form-item label="输入当前密码">
        <el-input v-model="password.oldPwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="输入新密码">
        <el-input v-model="password.newPwd" type="password"></el-input>
      </el-form-item>
      <el-form-item label="再次确认密码">
        <el-input v-model="password.confirmPwd" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="changePwd">修改密码</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import MainLayout from "../MainLayout";
import {getUserInfo, editInfo, editPwd} from "../../utils/network/auth";

export default {
  name: "SettingView",
  components: {MainLayout},
  data() {
    return {
      form: {
        name: '',
        phone: '',
        intro: ''
      },
      password: {
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
      }
    }
  },
  methods: {
    changePwd() {
      if (this.password.oldPwd === '' || this.password.newPwd === '' || this.password.confirmPwd === '') {
        this.$message.error('密码不能为空');
        return;
      }

      if (this.password.newPwd !== this.password.confirmPwd) {
        this.$message.error('密码校对错误');
        this.password.confirmPwd = '';
        return;
      }

      editPwd(this.$store.state.userInfo.uid, this.password.oldPwd, this.password.newPwd).then(result => {
        if (result && result.data.code === 200) {
          this.$message.success('密码修改成功');
          this.password.oldPwd = '';
          this.password.newPwd = '';
          this.password.confirmPwd = '';
        }
      })

    },

    onSubmit() {
      this.$confirm('是否要修改信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        editInfo(this.$store.state.userInfo.uid, this.form.name, this.form.phone, this.form.intro).then(result => {
          if (result && result.data.code === 200) {
            this.$message.success('修改成功');
            getUserInfo(this.$store.state.userInfo.uid).then(result => {
              if (result && result.data.code === 200) {
                let info = result.data.data;
                this.form.name = info.name;
                this.form.phone = info.phone;
                this.form.intro = info.intro;
              }
            })
          }
        })
      })
    }
  },

  mounted() {
    let token = localStorage.getItem('JWT');
    let uid = localStorage.getItem('UID');
    /*
    * 若用户信息未初始化，发送请求获取用户信息，并初始化WebSocket连接
    * */
    if (token !== null && this.$store.state.userInfo.uid === null) {
      getUserInfo(uid).then(result => {
        if (result !== undefined && result !== null && result.data.code === 200) {
          this.$store.commit('initUserInfo', result.data.data);
          this.$store.commit('initWS');
        }
      })
    } else if (token === null) {
      this.$router.push('/login')
      return;
    }

    getUserInfo(uid).then(result => {
      if (result && result.data.code === 200) {
        let info = result.data.data;
        this.form.name = info.name;
        this.form.phone = info.phone;
        this.form.intro = info.intro;
      }
    })
  }
}
</script>

<style scoped>

</style>