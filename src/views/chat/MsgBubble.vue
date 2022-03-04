<!-- 聊天气泡 -->
<!-- TODO：把左右气泡抽象出一个模板 -->
<template>
  <div>
    <!-- {msgId, msgSeq, fromUid, toId, type, content, time, hasRead} -->
    <div v-for="msg in $store.state.dialogue.msgRecords">
      <!-- 左气泡 -->
      <div class="msg-item" v-if="msg.fromUid !== $store.state.userInfo.uid">
        <el-avatar class="chat-list-item-avatar"
                   :src="$store.state.dialogue.avatar"
                   style="margin-right: 10px;margin-top: 13px"/>
        <div class="msg-item-content">
          <div class="msg-time msg-time-left"><i class="el-icon-time"></i><span
              class="msg-time-text">{{parseTIme(msg.time)}}</span></div>
          <div class="msg-bubble-left"><span>{{msg.content}}</span>
          </div>
        </div>
      </div>

      <!-- 右气泡 -->
      <div class="msg-item" style="justify-content: flex-end" v-else>
        <!-- 正在发送图标 -->
        <div style="display: flex;align-items: center;margin-right: 3px" v-if="msg.sendStatus !== undefined && (msg.sendStatus === -2 || msg.sendStatus > 0)">
          <span style="font-size: 19px" class="el-icon-loading"></span>
        </div>
        <!-- 发送失败图标，点击重新发送 -->
        <div style="display: flex;align-items: center;margin-right: 3px" v-else-if="msg.sendStatus !== undefined && msg.sendStatus === -1">
          <span style="font-size: 19px" class="el-icon-refresh-right" @click="resendMsg(msg.msgId)"></span>
        </div>
        <div class="unread-text" v-else-if="msg.type === 1 && !msg.hasRead">未读</div>
        <div class="read-text" v-else-if="msg.type === 1 && msg.hasRead">已读</div>

        <div class="msg-item-content">
          <div class="msg-time msg-time-right">
            <i class="el-icon-time"></i>
            <span class="msg-time-text">{{parseTIme(msg.time)}}</span>
          </div>
          <div class="msg-bubble-right">
            <span>{{msg.content}}</span>
          </div>
        </div>
        <el-avatar class="chat-list-item-avatar"
                   :src="$store.state.userInfo.avatar"
                   style="margin-left: 10px;margin-top: 13px"/>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "_moment@2.29.1@moment";

export default {
  name: "MsgBubble",
  methods: {
    parseTIme(timeStr) {
      if (timeStr === null || timeStr === undefined)
        return '';
      moment.locale('zh-cn');
      return moment(timeStr).calendar();
    },

    resendMsg(msgId) {
      this.$store.commit('resendFailedMsg', [msgId]);
      this.$store.dispatch('checkAndResendMsg');
    }
  },
  mounted() {
    this.$emit('msgMounted');
  },
  updated() {
    this.$emit('msgUpdated');
  }
}
</script>

<style scoped>
.unread-text {
  font-size: 12px;
  color: #909399;
  margin-top: 30px;
  margin-right: 5px;
}

.read-text {
  font-size: 12px;
  color: #29c924;
  margin-top: 30px;
  margin-right: 5px;
}

.msg-time-text {
  margin-left: 3px;
}

.msg-item-content {
}

.msg-item {
  display: flex;
  margin-bottom: 10px;
  /*align-items: center;*/
}

.msg-time {
  font-size: 6px;
  color: #8f959e;
}

/* 让右边消息气泡上方的时间靠右（使用float不行） */
.msg-time-right {
  display: flex;
  justify-content: flex-end;
  margin-right: 3px;
  align-items: center;
}

.msg-time-left {
  margin-left: 3px;
}


/* 聊天气泡样式（分左右） */
/*===================================================================*/
.msg-bubble-left {
  background-color: #d2d1d1;
  font-size: 14px;
  position: relative;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  padding: 15px;

  display: flex;
  align-items: center;
  /* 到达最大宽度自动换行 */
  max-width: 500px;
  word-break: break-all;
}

.msg-bubble-left::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-right: 8px solid #d2d1d1;
  border-bottom: 5px solid transparent;
  /*margin: -50% 0 0 -23px;*/
  top: 15px;
  left: -8px;
}

.msg-bubble-right {
  background-color: #2cdc26;
  font-size: 14px;
  position: relative;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  padding: 15px;

  display: flex;
  align-items: center;

  max-width: 500px;
  word-break: break-all;
}

.msg-bubble-right::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-left: 8px solid #2cdc26;
  border-bottom: 5px solid transparent;
  /*margin: -50% 0 0 -23px;*/
  top: 15px;
  right: -8px;
}

/*===================================================================*/

</style>