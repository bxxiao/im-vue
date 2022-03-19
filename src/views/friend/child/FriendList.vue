<template>
  <el-table
        :data="friends"
        style="width: 100%"
        v-loading="inLoading">
      <el-table-column
          label="好友列表">
        <template slot-scope="scope">
          <div style="display: flex;width: 100%" @mouseover="itemMouseover(scope.row.id)" @mouseleave="itemMouseleave">
            <el-avatar style="margin: 2px 5px" :src="scope.row.avatar"/>
            <div style="width: 80%;">
              <div>
                <span style="font-size: 14px;margin-right: 5px">{{scope.row.name}}</span>
                <el-tag size="mini" v-if="scope.row.isOnline">在线</el-tag>
                <el-tag size="mini" type="info" v-else>离线</el-tag>
              </div>
              <div style="font-size: 13px;color: #8f959e;margin-top: 2px">
                {{scope.row.intro}}
              </div>
            </div>
            <div style="float: right;display: flex;align-items: center;justify-content: center" v-if="mouseoverNum === scope.row.id">
              <el-button size="mini" type="primary" icon="el-icon-s-promotion" @click="openChatPage(scope.row.id)">发送消息</el-button>
              <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteBtnClick(scope.row.id)">删除好友</el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
</template>

<script>
import {deleteFriend, listFriends} from "../../../utils/network/friend";

export default {
  name: "FriendList",
  data() {
    return {
      // 元素属性：{id name avatar intro isOnline}
      friends: null,
      mouseoverNum: null,
      inLoading: false,
      btnRef: 'btn2',
      str: 'str',
    }
  },
  methods: {
    loadPage() {
      this.inLoading = true;
      let uid = this.$store.state.userInfo.uid;
      /*
      * 若uid为空（可能是页面刷新），等半s后再重新获取uid（等待FriendView的mounted函数加载完userinfo）发送请求
      * */
      if (uid === null) {
        setTimeout(() => {
          uid = this.$store.state.userInfo.uid;
          this.loadFriends(uid);
        }, 500)
      } else
        this.loadFriends(uid)
    },

    loadFriends(uid) {
      listFriends(uid, true).then(result => {
        if (result !== undefined && result.data.code === 200) {
          this.friends = result.data.data;
          this.inLoading = false;
        }
      })
    },

    itemMouseover(num) {
      this.mouseoverNum = num;
    },
    itemMouseleave() {
      this.mouseoverNum = null;
    },

    /*
    * 跳转到ChatView界面并点击对应会话项
    * 所有的会话项都放在state.sessionList中，并放在一个map，这里创建一个key，
    * 再通过路由传送到ChatView，进行会话项点击
    * */
    openChatPage(uid) {
      let key = 1 + '-' + uid;
      this.$router.push({
        name: '聊天',
        params: {
          sessionRef: key
        }
      })
    },

    deleteBtnClick(friendUid) {
      this.$confirm('确认删除好友?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteFriend(this.$store.state.userInfo.uid, friendUid).then(result => {
          if (result !== undefined && result.data.code === 200) {
            this.$message.success("删除好友成功");
            this.loadFriends(this.$store.state.userInfo.uid);
            // 删除好友后会删除群聊会话，将sessionList的hasInit置false，跳转到ChatView时会重新加载
            this.$store.commit('setSessionNotInit');
          }
        })
      });
    }
  },

  mounted() {
    this.loadPage();
  }
}
</script>

<style scoped>

</style>