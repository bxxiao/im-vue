<template>
  <el-container style="height: 100%;width: 100%;padding: 0;margin: 0">
    <el-aside style="height: 100%;padding: 0;margin: 0;width: 13%">
      <el-menu
          :default-active="activeItem"
          :router="true"
          class="el-menu-vertical-demo"
          style="height: 100%;">
        <el-menu-item index="/main/friend/apply">
          <!--<i class="el-icon-menu"></i>-->
          <span slot="title">新的联系人</span>
        </el-menu-item>
        <el-menu-item index="/main/friend/friendList">
          <!--<i class="el-icon-setting"></i>-->
          <span slot="title">我的好友</span>
        </el-menu-item>
        <el-menu-item index="/main/friend/groupList">
          <!--<i class="el-icon-setting"></i>-->
          <span slot="title">我的群组</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-main style="height: 100%;padding: 0;margin: 0;width: 87%">
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
import MainLayout from "../MainLayout";
import {getUserInfo} from "../../utils/network/auth";

export default {
  name: "FriendView",
  components: {MainLayout},
  data() {
    return {
      position: 'left',
    }
  },

  computed: {
    // 返回当前路径，让el-menu根据该路径选中对应项
    activeItem() {
      return this.$route.path;
    }
  },

  mounted() {
    let token = localStorage.getItem('JWT');
    /*
    * 若用户信息未初始化，发送请求获取用户信息，并初始化WebSocket连接
    * */
    if (token !== null && this.$store.state.userInfo.uid === null) {
      let uid = localStorage.getItem('UID');
      getUserInfo(uid).then(result => {
        if (result !== undefined && result !== null && result.data.code === 200) {
          this.$store.commit('initUserInfo', result.data.data);
          this.$store.commit('initWS');
        }
      })
    } else if (token === null) {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
a {
  text-decoration: none
}

a:hover {
  text-decoration: none
}
</style>