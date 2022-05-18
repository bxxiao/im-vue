<template>
  <div class="out-div">
    <h3 style="position: absolute;left: 4%">注册新用户</h3>
    <div id="registry-form">
      <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" style="width: 90%">
        <el-form-item label="用户名" prop="username">
          <el-input v-model.number="ruleForm.username"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="phone">
          <el-input v-model.number="ruleForm.phone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">注册</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {doRegistry} from "../../utils/network/auth";

export default {
  name: "Registry",
  data() {
    let checkUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('用户名不能为空'));
      }
    };
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };

    let checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('电话号码不能为空'));
      }
    };

    return {
      ruleForm: {
        pass: '',
        checkPass: '',
        username: '',
        phone: '',
      },
      rules: {
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' }
        ],
        username: [
          { validator: checkUsername, trigger: 'blur' }
        ],
        phone: [
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    };
  },

  methods: {
    submitForm() {
      if (this.ruleForm.username === '' || this.ruleForm.phone === '' || this.ruleForm.pass === '') {
        this.$message.error('请正确填写参数')
        return;
      }
      doRegistry(this.ruleForm.username, this.ruleForm.phone, this.ruleForm.pass).then((result) => {
        if (result && result.data.code === 200) {
          this.$router.push('/login')
          this.$message.success("注册成功，请进行登录")
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
}
</script>

<style scoped>
#registry-form {
  position: fixed;
  width: 30%;
  height: 60%;
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