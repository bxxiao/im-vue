<template>
  <el-container style="height: 100%">
    <!-- 侧边导航栏 -->
    <el-aside class="el-aside" width="" style="height: 100%;margin: 0;padding: 0">
      <el-menu :collapse-transition="false" default-active="1" class="el-menu-vertical-demo" background-color="#545c64" :collapse="isCollapse"
               style="height: 100%;">
        <div>
          <img style="border-radius: 50%;width: 80%;height: 80%;padding: 10%;" :src="$store.state.userInfo.avatar">
        </div>
        <router-link to="/main/chat">
          <el-menu-item index="1" >
            <i class="el-icon-chat-dot-square"></i>
            <span slot="title">消息</span>
          </el-menu-item>
        </router-link>
        <router-link to="/main/friend">
          <el-menu-item index="2">
            <i class="el-icon-user-solid"></i>
            <span slot="title">联系人</span>
          </el-menu-item>
        </router-link>
        <router-link to="/main/settings">
          <el-menu-item index="3">
            <i class="el-icon-setting"></i>
            <span slot="title">设置</span>
          </el-menu-item>
        </router-link>
      </el-menu>
    </el-aside>

    <el-main class="el-main" style="height: 100%;margin: 0;padding: 0;">
      <router-view/>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: "MainLayout",
  data() {
    return {
      isCollapse: true
    };
  },
}
</script>

<style scoped>
/*.el-menu-vertical-demo:not(.el-menu--collapse) {*/
/*  width: 200px;*/
/*  min-height: 400px;*/
/*}*/
</style>