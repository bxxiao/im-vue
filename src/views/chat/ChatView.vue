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
                 :ref="getSessionRef(session)"
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
                    <span style="float: right;margin-right: 4px;" class="chat-item-time">{{
                        parseTime(session.time)
                      }}</span>
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

    /*
    * 计算会话项的ref属性值
    * */
    getSessionRef(session) {
      let id = session.type + '-' + session.toId;
      return 'session' + id;
    },

    clickSessionAfterRoute() {
      /*
      * 在好友或群聊列表点击发送信息时会通过路由传送参数，在这里触发对应会话项的点击事件进入聊天
      * */
      let refName = this.$route.params.sessionRef;
      if (refName !== undefined && refName != null) {
        /*
        * 这里this.$refs[refName]获取到的是个数组（原因不明），第一个元素就是对应的dom对象，执行其click事件
        * （若明确ref值，则可以直接 this.$refs.refName获取，这里是动态绑定的，所以用方括号语法）
        * TODO：判断会话项是否存在，若不存在则先创建会话项
        * */
        let sessionDOM = this.$refs[refName];
        sessionDOM[0].click();
        // 点击后要置空，防止该函数重复执行
        this.$route.params.sessionRef = null;
      }
    }
  },

  /*
  * 若会话列表未初始化，从服务器拉取数据执行初始化（http）
  * */
  mounted() {
    let token = localStorage.getItem('JWT');
    if (token !== null && !this.$store.state.sessionList.hasInit) {
      let uid = localStorage.getItem('UID');
      getSessionList(uid).then(result => {
        if (result !== undefined && result.data.code == 200) {
          this.$store.commit('initSessionList', result.data.data);
          this.$store.commit('initWS');
        }
      })
    } else if (token === null) {
      this.$router.push('/login')
    } else
      /*
      * 只有页面已被加载过才能进行会话项点击，若没有加载过（比如在friends页面刷新后再点击发送消息跳到该界面
      * 这时需要先通过getSessionList加载数据后触发updated函数，再执行该函数
      * */
      this.clickSessionAfterRoute();
  },


  updated() {
    this.clickSessionAfterRoute();
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