<template>
  <!-- 在整个组件的div搞一个click事件，用来将右键菜单关掉... -->
  <div style="height: 100%" @click="closeRightMenu">
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
                  <el-button size="small" @click="friendSearchVisible = true">添加</el-button>
                  <el-button size="small" @click="groupCreateDialog = true">创建群聊</el-button>
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
                   @contextmenu.prevent="showRightMenu($event, session)"
                   v-for="session in $store.state.sessionList.list">
                <el-row style="height: 100%">
                  <el-col :span="5" class="avatar-box"
                          style="height: 100%;display: flex;align-items: center;justify-content: center">
                    <!--<el-avatar class="chat-list-item-avatar"-->
                    <!--           :src="session.avatar"/>-->
                    <Avatar :username="session.name" :src="session.avatar" :size="42"></Avatar>
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

    <!-- 添加好友 对话框   -->
    <el-dialog title="添加好友" :visible.sync="friendSearchVisible"
               @close="clearDialog()"
               width="25%">
      <FriendSearchPanel ref="friendSearchDialog"></FriendSearchPanel>
    </el-dialog>

    <!-- 会话项右键菜单 -->
    <div :style="{left: menuLeft + 'px', top: menuTop + 'px'}"
         v-if="menuVisible"
         style="position: fixed;padding: 3px;">
      <div style="width: 100%">
        <el-button size="mini" style="width: 100%" disabled>置顶</el-button>
      </div>
      <div style="width: 100%">
        <el-button size="mini" style="width: 100%" @click="doRemoveSession">移除会话</el-button>
      </div>
      <div style="width: 100%">
        <el-button size="mini" style="width: 100%" :disabled="rightClickSession.unread === 0" @click="setSessionRead">
          全部已读
        </el-button>
      </div>
      <div style="width: 100%">
        <el-button size="mini" style="width: 100%" :disabled="rightClickSession.unread > 0" @click="setSessionUnread">
          标为未读
        </el-button>
      </div>
    </div>

    <!-- 创建群聊对话框
        @opened指定打开动画结束后的回调，这时GroupCreatePanel组件已经挂载完毕
     -->
    <el-dialog title="创建群"
               :visible.sync="groupCreateDialog"
               @opened="openGroupCreatePanel"
               width="30%">
      <GroupCreatePanel ref="groupCreatePanel" @createFinished="groupCreateDialog = false"></GroupCreatePanel>
    </el-dialog>
  </div>
</template>

<script>
import MainLayout from "../MainLayout";
import ChatPanel from "./child/ChatPanel";
import moment from "moment";
import {getSessionList, getDialogueData, deleteSession, createSession} from "../../utils/network/chat";
import FriendSearchPanel from "./dialogue/FriendSearchPanel";
import GroupCreatePanel from "./dialogue/GroupCreatePanel";
import Avatar from 'vue-avatar'

export default {
  name: "ChatView",
  components: {GroupCreatePanel, FriendSearchPanel, ChatPanel, MainLayout, Avatar},
  data() {
    return {
      input: '',
      badgeValue: 0,
      maxValue: 99,
      // 添加好友 对话框可见性
      friendSearchVisible: false,
      /*
      * 右键菜单的左上距离
      * */
      menuLeft: 0,
      menuTop: 0,
      // 右键菜单可见性
      menuVisible: false,
      // 唤醒右键菜单时点击的会话项对象
      rightClickSession: null,
      // 创建群聊对话框可见性
      groupCreateDialog: false,
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
      if (timeStr === null || timeStr === undefined || timeStr.trim() === '')
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

    /*
    * 在好友或群聊列表点击发送信息时会通过路由传送参数，在这里触发对应会话项的点击事件进入聊天
    *
    * 调用该函数的情况：从好友列表或群列表点击【发送消息】跳转搞该页面时，触发 mounted：
    *     若会话列表已初始化，则直接调用该函数
    *     否则先初始化会话列表，随后触发updated调用该函数
    * */
    clickSessionAfterRoute() {
      // gouba
      // let refName = this.$route.params.sessionRef;
      // if (refName !== undefined && refName != null) {
      //   /*
      //   * 这里this.$refs[refName]获取到的是个数组（原因不明），第一个元素就是对应的dom对象，执行其click事件
      //   * （若明确ref值，则可以直接 this.$refs.refName获取，这里是动态绑定的，所以用方括号语法）
      //   * TODO：判断会话项是否存在，若不存在则先创建会话项
      //   * */
      //   let sessionDOM = this.$refs[refName];
      //   sessionDOM[0].click();
      //   // 点击后要置空，防止该函数重复执行
      //   this.$route.params.sessionRef = null;
      // }

      let key = this.$route.params.sessionRef;
      if (key !== undefined && key !== null) {
        let session = this.$store.state.sessionList.maps.get(key);
        // 若会话不存在
        if (session === undefined) {
          let strs = key.split('-');
          let type = Number(strs[0]);
          let toId = Number(strs[1]);
          // 发送请求创建新的会话
          createSession(this.$store.state.userInfo.uid, toId, type).then(result => {
            if (result !== undefined && result.data.code === 200) {
              let info = result.data.data;
              let newSession = {
                toId,
                name: info.name,
                type,
                // TODO：后端创建后再返回一个lastMsg？
                lastMsg: '',
                time: '',
                unread: 0,
                avatar: info.avatar,
              };
              this.$store.commit('pushNewSession', newSession);
              this.clickSession(newSession);
              this.$route.params.sessionRef = null;
            }
          });
        } else {
          // 点击会话项
          this.clickSession(session);
          // 移除路由中的数据
          this.$route.params.sessionRef = null;
        }
      }
    },

    /*
    * 添加好友对话框关闭时清空其数据
    * */
    clearDialog() {
      this.$refs.friendSearchDialog.clearData();
    },

    // 右键点击会话项，显示右键菜单
    showRightMenu(event, session) {
      this.rightClickSession = session;
      this.menuVisible = false;
      this.menuVisible = true;
      this.menuLeft = event.clientX;
      this.menuTop = event.clientY;
    },

    // 关闭右键菜单
    closeRightMenu() {
      this.menuVisible = false;
    },

    // 移除会话项
    doRemoveSession() {
      if (this.rightClickSession == null) {
        this.closeRightMenu();
        return;
      }
      console.log(this.rightClickSession.toId, " ", this.rightClickSession.type)

      deleteSession(this.rightClickSession.toId, this.rightClickSession.type).then(result => {
        if (result !== undefined && result.data.code == 200) {
          this.$message.success("删除会话成功");
          // 删除后重新加载会话（或者直接从state中移除掉？）
          getSessionList(this.$store.state.userInfo.uid).then(result => {
            if (result !== undefined && result.data.code == 200) {
              this.$store.commit('initSessionList', result.data.data);
              // 若当前打开的聊天面板对应被删除的会话，重置dialogue
              if (this.$store.state.selectedSession.id === this.rightClickSession.toId && this.$store.state.selectedSession.type === this.rightClickSession.type) {
                this.$store.commit('resetDialogue')
              }
            }
          })
        }
      })
    },

    // 会话项设置为未读
    setSessionUnread() {
      this.$store.commit('setSessionUnread', {type: this.rightClickSession.type, toId: this.rightClickSession.toId});
    },

    // 会话项设置为已读
    setSessionRead() {
      this.$store.commit('setSessionRead', {type: this.rightClickSession.type, toId: this.rightClickSession.toId});
    },

    openGroupCreatePanel() {
      this.$refs.groupCreatePanel.loadData();
    },

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
        * 只有页面已被加载过才能进行会话项点击，若没有加载过（比如在friends页面刷新后再点击发送消息跳到该界面）
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