<template>
  <div class="out-div">
    <div id="login-form">
      <el-form ref="form" label-width="80px">
        <el-form-item label="电话号码">
          <el-input clearable v-model="phone" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item label="电话号码">
          <el-input placeholder="请输入密码" v-model="password" show-password label="密码" style="width: 400px"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">登录</el-button>
          <el-button>注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {doLogin} from "../../utils/network/auth";

export default {
  name: "Login",
  data() {
    return {
      phone: '',
      password: '',
    }
  },
  methods: {
    onSubmit() {
      doLogin(this.phone, this.password).then(result => {
        if (result.data.code === 200) {
          let userDTO = result.data.data;
          localStorage.setItem('JWT', userDTO.token);
          localStorage.setItem('UID', userDTO.id);
          this.$router.push('/main')
        }
      }).catch(err => {
        this.$notify.error({
          title: '网络出错',
          message: '请检测是否连接网络'
        });
      });
    }
  },
  mounted() {
    let token = localStorage.getItem('JWT');
    if (token !== null) {
      this.$router.push('/main')
    }
  }
}
</script>

<style scoped>
#login-form {
  position: fixed;
  width: 40%;
  height: 40%;
  background-color: white;
  padding: 10px;
  left: 30%;
  top: 10%;
  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)
}

.out-div {
  background-color: #dee9f5;
  width: 100%;
  height: 100%;
}
</style>