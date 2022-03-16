<template>
  <div style="height: 100%"
       v-loading="$store.state.dialogue.isLoading"
       element-loading-text="加载中"
       element-loading-spinner="el-icon-loading">
    <el-container style="height: 100%;" v-if="$store.state.dialogue.isInit">
      <!-- el-container的标签的height设置在style属性才能生效 -->
      <!-- 头部 -->
      <el-header class="panel-header" style="height: 7%;">
        <div style="display: flex;align-items: center">
          <el-tag size="mini" style="margin-right: 3px;" v-if="$store.state.dialogue.type === 1">好友</el-tag>
          <el-tag size="mini" style="margin-right: 3px;" type="danger" v-else>群聊</el-tag>
          {{$store.state.dialogue.name}}
        </div>

        <div style="color: #29c924;font-size: 15px;" v-if="$store.state.dialogue.type === 1 && $store.state.dialogue.isOnline">在线</div>
        <div style="color: #ccc;font-size: 15px;" v-else-if="$store.state.dialogue.type === 1 && !$store.state.dialogue.isOnline">离线</div>

        <div style="">
          <el-tooltip style="margin: 0 8px" class="item" effect="dark" content="历史消息" placement="bottom-start">
            <i class="el-icon-time" style="font-size: 25px;color: #828f95;"/>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="群设置" placement="bottom-start"
                      v-if="$store.state.dialogue.type === 2">
            <i class="el-icon-setting" style="font-size: 25px;color: #828f95;" @click="drawer = true"/>
          </el-tooltip>
          <el-drawer
              title="群信息"
              :visible.sync="drawer"
              @open="openGroupInfoDrawer"
              direction="rtl">
            <GroupInfoPanel :group-info="groupInfo"/>
          </el-drawer>
        </div>
      </el-header>

      <!-- 消息记录 -->
      <el-main  style="height: 70%;" class="panel-main" id="chat-list">
        <div v-if="$store.state.dialogue.isLoadingTop" style="width: 100%;height: 20px;" v-loading="$store.state.dialogue.isLoadingTop" element-loading-spinner="el-icon-loading">
        </div>
        <div v-if="$store.state.dialogue.noMoreMsg" style="display: flex;justify-content: center;font-size: 8px;color: #C0C4CC">
          <span>没有更多消息了</span>
        </div>
        <MsgBubble @msgMounted="bindScrollEvent" @msgUpdated="scrollToBottom"></MsgBubble>
      </el-main>

      <!-- 编辑面板 -->
      <el-footer class="panel-footer" style="height: 23%;margin: 0;padding: 0;">
        <el-container style="height: 100%;">
          <!-- 工具栏 -->
          <el-header class="edit-header" style="height: 16%">
            <!-- 表情包 -->
            <div class="toolbar-item-div">
              <span class="el-icon-lollipop edit-toolbar-item"></span>
            </div>
            <!-- 文件 -->
            <div class="toolbar-item-div">
              <span class="el-icon-folder edit-toolbar-item"></span>
            </div>
            <!-- 图片 -->
            <div class="toolbar-item-div">
              <span class="el-icon-picture-outline edit-toolbar-item"></span>
            </div>
          </el-header>
          <!-- 输入文本框 -->
          <el-main style="height: 84%;padding: 0;overflow: hidden">
            <textarea class="edit-area" v-model="inputContent"></textarea>
          </el-main>
        </el-container>
        <el-button type="primary" size="small" @click="sendMsg" plain style="position: fixed;right: 10px;bottom: 10px;">
          发送
          <span class="el-icon-top"/>
        </el-button>
      </el-footer>
    </el-container>
    <!-- 没有选择聊天对象时的展示界面 -->
    <div style="height: 100%;display: flex;align-items: center;justify-content: center" v-else>
      <span style="font-size: 25px"><i class="el-icon-magic-stick"></i></span>
    </div>
  </div>
</template>

<script>
import MsgBubble from "./MsgBubble";
import GroupInfoPanel from "./GroupInfoPanel";
import {getGroupInfo} from "../../utils/network/chat";

export default {
  name: "ChatPanel",
  components: {GroupInfoPanel, MsgBubble},
  data() {
    return {
      inputContent: "",
      // id=chat-list 对应的DOM元素
      chatListDOM: null,
      // 上滑加载新消息之前的滚动条高度，用于上滑加载消息后将滚动条定位到加载前的第一条消息的位置
      lastScrollHeight: null,
      // 标记chatListDOM中的滚动条是不是第一次滑到顶
      firstToTop: true,
      loading: false,

      // 群消息抽屉的变量
      drawer: false,
      // 抽屉中群消息数据
      groupInfo: null,
    }
  },
  methods: {
    openGroupInfoDrawer() {
      if (!this.$store.state.dialogue.isInit || this.$store.state.dialogue.type !== 2)
        return;

      getGroupInfo(this.$store.state.userInfo.uid, this.$store.state.dialogue.id).then(result => {
        if (result !== undefined && result.data.code === 200)
          this.groupInfo = result.data.data;
      })
    },

    // 滚动到底部
    scrollToBottom() {
      if (this.$store.state.dialogue.afterUnshiftMsg) {
        /*
        * push消息后，将当前的scrollHeight减去加载消息前的高度（lastScrollHeight），
        * 就可以滚动到加载消息前的第一条消息
        * */
        this.chatListDOM.scrollTop = this.chatListDOM.scrollHeight - this.lastScrollHeight;
        this.$store.commit('changeAfterUnshiftMsg');
      }
      else
        /*
        * scrollTop是滚动块距离滚动条顶部的距离，scrollHeight是整个滚动条的高度，
        * 将scrollTop设为scrollHeight，就滚到底？
        * */
        this.chatListDOM.scrollTop = this.chatListDOM.scrollHeight;
    },

    // 监听滚动到顶部
    scrollListener() {
      // 第一次滚到顶不触发，否则触发，防止chatList刚加载时触发该部分代码
      // 再点击会话项切换聊天界面时，firstToTop会重新置true
      if (this.chatListDOM.scrollTop === 0 && !this.firstToTop) {
        if (!this.$store.state.dialogue.noMoreMsg) {
          this.lastScrollHeight = this.chatListDOM.scrollHeight;
          this.$store.dispatch('loadMsgs');
        }
      }

      // 滚动了之后firstToTop置false，即后面再滚到顶可以触发
      if (this.chatListDOM.scrollTop !== 0)
        this.firstToTop = false;
    },

    /*
    * MsgBubble子组件挂载时，绑定滚动条监听事件；并滑到底
    * */
    bindScrollEvent() {
      this.chatListDOM = document.getElementById('chat-list');
      // 为消息面板添加滚动监听函数
      this.chatListDOM.addEventListener('scroll', this.scrollListener, true);
      /*
      * 通过导航栏路由到其它页面，再回来时，不会触发MsgBubble的updated函数（没有数据更新）
      * 但会触发其mounted函数，在这里让滚动条滑动到底
      * */
      this.scrollToBottom()
    },

    sendMsg() {
      if (this.inputContent.trim() === '')
        return;
      this.$store.commit('sendMsg', this.inputContent);
      this.inputContent = '';
      this.$store.dispatch('checkAndResendMsg');
    }
  },
}
</script>

<style scoped>

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom-style: solid;
  border-width: 1px;
  border-color: #dbdfe7;
  /* 减掉边框多出的1px */
  margin-top: -1px;
}

.panel-main {
  border-bottom-style: solid;
  border-width: 1px;
  border-color: #dbdfe7;
  /* 减掉边框多出的1px */
  margin-top: -1px;
  overflow-y: scroll;
}

/* 消息记录面板的滚动条样式 */
/*=============================================*/
.panel-main::-webkit-scrollbar {
  width: 7px;
}

.panel-main::-webkit-scrollbar-thumb { /*滚动条里面小方块*/
  /*border-radius: 10px;*/
  -webkit-box-shadow: inset 0 0 5px rgb(255, 255, 255);
  background: #535353;
}

.panel-main::-webkit-scrollbar-track { /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  /*border-radius: 10px;*/
  background: #EDEDED;
}

/*=============================================*/

.panel-footer {

}

.edit-header {
  border-bottom-style: solid;
  border-width: 1px;
  border-color: #dbdfe7;
  margin-top: -1px;

  display: flex;
  align-items: center;
  padding-left: 0px;
}

.edit-toolbar-item {
  font-size: 20px;
  color: #828f95;
}

.toolbar-item-div {
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
}

.toolbar-item-div:hover {
  background-color: #eff0f1;
}

.edit-area {
  width: 100%;
  height: 100%;
  /* 去掉轮廓、边框 */
  border: 0 none;
  outline: none;
  /* 关闭可以自动调整大小 */
  resize: none;
  font-size: 15px;
  overflow-y: auto;
  color: #464545;
  padding: 5px;
  position: relative;
}
</style>