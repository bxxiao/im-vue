<template>
  <div id="app">
    <router-view/>
  </div>
</template>
<script>
import {isRefInit, initRef} from "./utils/network/axios/axios";

export default {
  data() {
    return {
      instance: this
    }
  },
  methods: {
    notice() {
      this.$notify.error({
        title: '登录失败',
        message: '账号或密码错误'
      });
    }
  },
  mounted() {
    if (!isRefInit())
      initRef(this);
  }

}
</script>

<style>
</style>