<template>
  <el-container style="height: 100%;">
    <!-- 侧边会话列表 -->
    <el-aside style="width: 20%;border-right-style: solid;border-width: 1px;border-color: #dbdfe7;">
      <el-container style="height: 100%;">
        <!-- 搜索框 -->
        <el-header height="">
          <!-- Layout布局 -->
          <el-row style="margin-top: 10px;margin-bottom: 10px" class="search-header" :gutter="10">
            <el-col class="search-header-item" :span="16">
              <el-input size="small" v-model="input" placeholder="搜索会话..."></el-input>
            </el-col>
            <el-col class="search-header-item" :span="4">
              <el-button size="small" icon="el-icon-search" circle></el-button>
            </el-col>
            <!-- 弹出框 -->
            <el-popover placement="bottom" trigger="click">
              <!-- 该按钮组是弹出内容 -->
              <el-button-group>
                <el-button size="small">添加好友</el-button>
                <el-button size="small">创建群聊</el-button>
              </el-button-group>
              <el-button slot="reference" circle icon="el-icon-plus" size="small"/>
            </el-popover>
          </el-row>
        </el-header>
        <!-- title -->
        <el-header height="" class="chat-list-title">
          会话列表({{ $store.state.sessionList.list.length }})
        </el-header>

        <!-- 会话列表 -->
        <el-scrollbar style="height: 100%;">
          <el-main style="height: 100%;padding: 0;"
                   v-if="$store.state.sessionList.hasInit">
            <!-- 会话项 -->
            <div @click="clickSession(session)" class="chat-item"
                 :class="{'active-chat-item': $store.state.selectedSession.id === session.toId && $store.state.selectedSession.type === session.type}"
                 v-for="session in $store.state.sessionList.list">
              <el-row style="height: 100%">
                <el-col :span="5" class="avatar-box"
                        style="height: 100%;display: flex;align-items: center;justify-content: center">
                  <el-avatar class="chat-list-item-avatar"
                             :src="session.avatar"/>
                </el-col>
                <el-col :span="19" class="card-box">
                  <div style="margin-top: 6px;">
                    <span style="font-size: 14px;margin-right: 2px;">{{ session.name }}</span>
                    <!-- 标识是群聊 -->
                    <el-tag size="mini" v-if="session.type == 2">群组</el-tag>
                    <el-badge :value="session.unread" :max="maxValue" :hidden="session.unread == 0"/>
                    <span style="float: right;margin-right: 4px;" class="chat-item-time">{{ parseTime(session.time) }}</span>
                  </div>
                  <div style="font-size: 13px;color: #8f959e;margin-top: 2px">
                    {{ parseLastMsg(session.lastMsg) }}
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-main>
          <div v-else class="session-list-loading">
            <span><i class="el-icon-loading"></i>加载中</span>
          </div>
        </el-scrollbar>
      </el-container>
    </el-aside>
    <!-- 聊天面板 -->
    <el-main style="width: 80%;margin: 0;padding: 0;">
      <ChatPanel ref="chatPanel"></ChatPanel>
    </el-main>
  </el-container>
</template>

<script>
import MainLayout from "../MainLayout";
import ChatPanel from "./ChatPanel";
import moment from "moment";
import {getSessionList, getDialogueData} from "../../utils/network/chat";

export default {
  name: "ChatView",
  components: {ChatPanel, MainLayout},
  data() {
    return {
      input: '',
      badgeValue: 0,
      maxValue: 99,
    }
  },
  methods: {
    /*
    * 点击会话项
    * */
    clickSession(session) {
      if (this.$store.state.selectedSession.id === session.toId && this.$store.state.selectedSession.type === session.type)
        return;
      this.$refs.chatPanel.firstToTop = true;
      // 会话项中保存的id、头像等信息设置在dialogue中
      this.$store.commit('loadChatPanelHeader', session);
      // 拉取聊天记录(http)
      getDialogueData(this.$store.state.userInfo.uid, session.toId, session.type).then(result => {
        if (result.data.code === 200) {
          this.$store.commit('setDialogueData', result.data.data);
        } else {
          console.log('服务器出错')
        }
      })
    },

    parseTime(timeStr) {
      if (timeStr === null || timeStr === undefined)
        return '';
      moment.locale('zh-cn');
      return moment(timeStr).calendar();
    },

    parseLastMsg(msg) {
      if (msg === null)
        return ''
      else
        return msg.substring(0, 11) + (msg.length > 10 ? '...' : '');
    },
  },

  /*
  * 若会话列表未初始化，从服务器拉取数据执行初始化（http）
  * */
  mounted() {
    let token = localStorage.getItem('JWT');
    if (token !== null && !this.$store.state.sessionList.hasInit) {
      console.log('mounted...')
      let uid = localStorage.getItem('UID');
      getSessionList(uid).then(result => {
        // TODO: 返回的数据新增当前用户信息
        if (result === undefined)
          console.log('出错');
        else if (result.status === 200 && result.data.code == 200) {
          this.$store.commit('initSessionList', result.data.data);
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
.session-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}
.chat-item {
  height: 60px;
  padding-top: 2px;
}

/* 隐藏el滚动条的水平滚动条... */
/* https://blog.csdn.net/weixin_41192489/article/details/113875367 */
/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}

/* 设置搜索框部分垂直居中 */
.search-header {
  display: flex;
  align-items: center;
}

.search-header-item {
  display: inline;
}

.chat-list-title {
  font-size: 12px;
  margin-left: -10px;
  font-weight: bold;
}

.chat-item-time {
  color: #8f959e;
  font-size: 12px;
}

.active-chat-item {
  background-color: #eff0f1;
  border-left: 3px solid transparent;
  border-color: #3370ff;
}
</style>