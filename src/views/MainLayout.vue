<template>
  <el-container style="height: 100%">
    <!-- 侧边导航栏 -->
    <el-aside class="el-aside" width="" style="height: 100%;margin: 0;padding: 0">
      <el-menu :collapse-transition="false"
               :default-active="activeItem"
               class="el-menu-vertical-demo"
               background-color="#545c64"
               :collapse="isCollapse"
               :router="true"
               style="height: 100%;position: relative">
        <div style="">
          <!--<img style="border-radius: 50%;width: 80%;height: 80%;padding: 10%;" :src="$store.state.userInfo.avatar">-->
          <Avatar :username="$store.state.userInfo.name" :src="$store.state.userInfo.avatar" :size="50" style="margin: 5px"></Avatar>
          <div style="display: flex;justify-content: center">
            <span style="font-size: 14px;color: white">{{$store.state.userInfo.name}}</span>
          </div>
        </div>
        <el-menu-item index="/main/chat" style="position: relative">
          <!--<el-badge is-dot class="item" style="position: absolute;left: 65%;top: -25%" />-->
          <i class="el-icon-chat-dot-square"></i>
          <span slot="title">消息</span>

        </el-menu-item>
        <el-menu-item index="/main/friend">
          <!--<el-badge is-dot class="item" style="position: absolute;left: 65%;top: -25%" />-->
          <i class="el-icon-user-solid"></i>
          <span slot="title">联系人</span>
        </el-menu-item>
        <el-menu-item index="/main/settings">
          <i class="el-icon-setting"></i>
          <span slot="title">设置</span>
        </el-menu-item>
        <div style="position: absolute;bottom: 5%;font-size: 15px;color: #C0C4CC;left: 10%;width: 80%">
          <div @click="logout">退出 <span class="el-icon-error"></span></div>
        </div>
      </el-menu>
    </el-aside>

    <el-main class="el-main" style="height: 100%;margin: 0;padding: 0;">
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
import Avatar from 'vue-avatar'

export default {
  name: "MainLayout",
  components: {Avatar},
  data() {
    return {
      isCollapse: true
    };
  },

  computed: {
    // 返回路径，让el-menu根据该路径选中对应项
    activeItem() {
      let part = this.$route.path.substring(6);
      if (part.startsWith('chat'))
        return '/main/chat'
      else if (part.startsWith('friend'))
        return '/main/friend'
      else if (part.startsWith('settings'))
        return '/main/settings'
    }
  },

  methods: {
    logout() {
      localStorage.removeItem("JWT");
      localStorage.removeItem("UID")
      this.$store.commit('closeWebSocket');
      this.$router.push('/login')
      // 刷新页面重置vuex state
      window.location.reload()
    }
  }
}
</script>

<style scoped>
/*.el-menu-vertical-demo:not(.el-menu--collapse) {*/
/*  width: 200px;*/
/*  min-height: 400px;*/
/*}*/
</style>