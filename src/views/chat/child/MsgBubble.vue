<!-- 聊天气泡 -->
<!-- TODO：把左右气泡抽象出一个模板 -->
<template>
  <div>
    <!-- {msgId, msgSeq, fromUid, toId, type, content, time, hasRead} -->
    <div v-for="msg in $store.state.dialogue.msgRecords">
      <!-- 消息已撤回 -->
      <div style="display: flex;justify-content: center;margin-top: 5px;margin-bottom: 5px" v-if="msg.hasCancel">
        <div style="font-size: 10px;background-color: #E4E7ED;padding: 5px">{{getCancelName(msg)}} 撤回了一条消息</div>
      </div>

      <!-- 左气泡-文本消息 -->
      <div class="msg-item" v-else-if="msg.fromUid !== $store.state.userInfo.uid && !msg.isFile">
        <el-avatar class="chat-list-item-avatar"
                   :src="$store.getters.getAvatar(msg.fromUid)"
                   style="margin-right: 10px;margin-top: 13px"/>
        <div class="msg-item-content">
          <div class="msg-time msg-time-left">
            <span style="color: black;font-size: 13px" v-if="$store.state.dialogue.type === 2">{{msg.username}} </span>
            <i class="el-icon-time"></i>
            <span class="msg-time-text">{{parseTIme(msg.time)}}</span>
          </div>
          <div class="msg-bubble-left"><span style="font-size: 16px">{{msg.content}}</span>
          </div>
        </div>
      </div>

      <!-- 左气泡-文件 -->
      <div class="msg-item" style="" v-else-if="msg.fromUid !== $store.state.userInfo.uid && msg.isFile">
        <el-avatar class="chat-list-item-avatar"
                   :src="$store.getters.getAvatar(msg.fromUid)"/>
        <div class="msg-item-content" style="margin-left: 10px;width: 300px">
          <div class="msg-time msg-time-left">
            <span style="color: black;font-size: 11px" v-if="$store.state.dialogue.type === 2">{{msg.username}} </span>
            <i class="el-icon-time"></i><span class="msg-time-text">{{parseTIme(msg.time)}}</span>
          </div>
          <div style="background-color: white;-moz-border-radius: 10px;
            -webkit-border-radius: 10px;border-radius: 10px;padding: 15px;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)">
            <div><span class="el-icon-document"></span> <span style="cursor:pointer" @click="downloadFile(msg)">{{msg.fileName}}</span></div><br/>
            <!--<div>size</div>-->
          </div>
        </div>
      </div>

      <!-- 右气泡-文件 -->
      <div class="msg-item" style="justify-content: flex-end" v-else-if="msg.isFile">

        <div class="msg-item-content">
          <!--<div class="msg-time msg-time-right">-->
          <!--  <i class="el-icon-time"></i>-->
          <!--  <span class="msg-time-text"></span>-->
          <!--</div>-->
          <div style="background-color: white;-moz-border-radius: 10px;width: 300px;
            -webkit-border-radius: 10px;border-radius: 10px;padding: 15px;box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04)">
            <div>
              <span v-if="msg.sendingFile">
                <span class="el-icon-document"></span> {{msg.file.name}}
              </span>
              <span v-else>
                <span class="el-icon-document"></span> {{msg.fileName}}
              </span>
            </div>
            <br/>
            <el-progress :percentage="msg.file.percent"
                         v-if="msg.sendingFile"
                         status="success" style="width: 250px"></el-progress>
            <span v-else style="cursor:pointer;color: #909399;font-size: 10px" @click="downloadFile(msg)">下载</span>
          </div>
        </div>
        <el-avatar class="chat-list-item-avatar"
                   :src="$store.state.userInfo.avatar"
                   style="margin-left: 10px;margin-top: 13px"/>
      </div>


      <!-- 有气泡-文本消息 -->
      <div class="msg-item" style="justify-content: flex-end" v-else>
        <!-- 正在发送图标 -->
        <div style="display: flex;align-items: center;margin-right: 3px" v-if="msg.sendStatus !== undefined && (msg.sendStatus === -2 || msg.sendStatus > 0)">
          <span style="font-size: 19px" class="el-icon-loading"></span>
        </div>
        <!-- 发送失败图标，点击重新发送 -->
        <div style="display: flex;align-items: center;margin-right: 3px" v-else-if="msg.sendStatus !== undefined && msg.sendStatus === -1">
          <span style="font-size: 19px" class="el-icon-refresh-right" @click="resendMsg(msg.msgId)"></span>
        </div>
        <div class="unread-text" v-else-if="msg.type === 1 && !msg.hasRead">
          未读
          <div v-if="canCancel(msg)" style="cursor: pointer" @click="doCancel(msg)">
            撤回
          </div>
        </div>
        <div class="read-text" v-else-if="msg.type === 1 && msg.hasRead">
          已读
          <div v-if="canCancel(msg)" style="cursor: pointer;color: #8f959e" @click="doCancel(msg)">
            撤回
          </div>
        </div>

        <div v-if="msg.type === 2 && canCancel(msg)"
             style="cursor: pointer;color: #8f959e;margin-top: 30px;font-size: 13px;margin-right: 3px"
             @click="doCancel(msg)" >
          撤回
        </div>

        <div class="msg-item-content">
          <div class="msg-time msg-time-right">
            <i class="el-icon-time"></i>
            <span class="msg-time-text">{{parseTIme(msg.time)}}</span>
          </div>
          <div class="msg-bubble-right">
            <span style="font-size: 18px">{{msg.content}}</span>
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
    doCancel(msg) {
      if (!moment(msg.time).isAfter(moment().subtract(3, 'minute'))) {
        this.$message.warning('已发送超过3分钟，不能撤回');
        this.$forceUpdate();
        return;
      }
      this.$store.commit('setMsgCanceled', msg.msgId);
      // 强制渲染页面
      this.$forceUpdate();
    },

    // 判断能否撤回
    canCancel(msg) {
      // 该消息是否是3分钟内发送的
      return moment(msg.time).isAfter(moment().subtract(3, 'minute'));
    },

    getCancelName(msg) {

      if (msg.fromUid === this.$store.state.userInfo.uid)
        return '你'
      else {
        if (this.$store.state.dialogue.type === 2)
          return msg.username;
        else
          return this.$store.state.dialogue.name
      }

    },

    parseTIme(timeStr) {
      if (timeStr === null || timeStr === undefined)
        return '';
      moment.locale('zh-cn');
      return moment(timeStr).calendar();
    },

    resendMsg(msgId) {
      this.$store.commit('resendFailedMsg', [msgId]);
      this.$store.dispatch('checkAndResendMsg');
    },

    downloadFile(item) {
      let xhr = new XMLHttpRequest();
      // xhr.open("GET", item.url, true);
      xhr.open("GET", item.content, true);
      xhr.responseType = 'blob';
      xhr.onload = function (e) {
        let url = window.URL.createObjectURL(xhr.response)
        let a = document.createElement('a');
        a.href = url
        a.download = item.fileName //下载后的文件名
        a.click()
      }
      xhr.send();
    }
  },
  mounted() {
    this.$emit('msgMounted');
  },
  updated() {
    this.$emit('msgUpdated');
    // this.$forceUpdate();
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