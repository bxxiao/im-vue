<template>
  <el-table
      :data="groups"
      style="width: 100%">
    <el-table-column
        label="群聊列表">
      <template slot-scope="scope">
        <div style="display: flex;width: 100%" @mouseover="itemMouseover(scope.row.id)" @mouseleave="itemMouseleave">
          <el-avatar style="margin: 2px 5px" :src="scope.row.avatar"/>
          <div style="width: 80%;">
            <div>
              <span style="font-size: 14px;margin-right: 5px">{{scope.row.name}}</span>
              <!--暂时不搞-->
              <!--<el-tag size="mini" type="warning">群主</el-tag>-->
            </div>
            <div style="font-size: 13px;color: #8f959e;margin-top: 2px">
              ------
            </div>
          </div>
          <div style="float: right;display: flex;align-items: center;justify-content: center" v-if="mouseoverNum === scope.row.id">
            <el-button size="mini" type="primary" icon="el-icon-s-promotion" @click="openChatPage(scope.row.id)">发送消息</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="quitBtnClick(scope.row.id)">退出群聊</el-button>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import {deleteFriend, listGroups, quitGroup} from "../../../utils/network/friend";

export default {
  name: "GroupList",
  data() {
    return {
      // {id name avatar}
      groups: null,
      mouseoverNum: null,
      inLoading: false,
    }
  },
  methods: {
    openChatPage(groupId) {
      let id = 'session' + 2 + '-' + groupId;
      this.$router.push({
        name: '聊天',
        params: {
          sessionRef: id
        }
      })
    },

    loadPage() {
      this.inLoading = true;
      let uid = this.$store.state.userInfo.uid;
      /*
      * 若uid为空（可能是页面刷新），等半s后再重新获取uid（等待FriendView的mounted函数加载完userinfo）发送请求
      * */
      if (uid === null) {
        setTimeout(() => {
          uid = this.$store.state.userInfo.uid;
          this.loadGroups(uid);
        }, 500)
      } else
        this.loadGroups(uid)
    },

    loadGroups(uid) {
      listGroups(uid).then(result => {
        if (result !== undefined && result.data.code === 200) {
          this.groups = result.data.data;
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

    quitBtnClick(groupId) {
      this.$confirm('确认退出群聊?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        quitGroup(this.$store.state.userInfo.uid, groupId).then(result => {
          if (result !== undefined && result.data.code === 200) {
            this.$message.success('退出群聊成功');
            this.loadGroups(this.$store.state.userInfo.uid);
          }
        })
      });
    }
  },

  mounted() {
    this.loadPage()
  }
}
</script>

<style scoped>

</style>