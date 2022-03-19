<template>
  <!-- 加个v-if防止空指针异常 -->
  <div style="margin: 0 5%;" v-if="groupInfo !== null">
    <el-descriptions :column="1">
      <el-descriptions-item label="群名称 ">{{ groupInfo.name }}</el-descriptions-item>
      <el-descriptions-item label="群主 ">{{ groupInfo.masterName }}</el-descriptions-item>
      <el-descriptions-item label="成员数量 ">{{ memberCount }}</el-descriptions-item>
    </el-descriptions>
    <div style="width: 90%;display: flex;justify-content: center;margin-top: 5px">
      <el-button type="primary" round icon="el-icon-plus" @click="invitePanelVisible = true">邀请好友</el-button>
      <!--<el-drawer-->
      <!--    title="我是里面的"-->
      <!--    :append-to-body="true"-->
      <!--    size="20%"-->
      <!--    :visible.sync="invitePanelVisible">-->
      <!--  <p>_(:зゝ∠)_</p>-->
      <!--</el-drawer>-->
    </div>
    <!--  TODO：把群主排在第一个并标注出来  -->
    <el-table
        :data="groupInfo.members"
        stripe
        @cell-mouse-enter="itemMouseover"
        @cell-mouse-leave="itemMouseleave"
        style="width: 90%">
      <el-table-column label="群成员">
        <template slot-scope="scope">
          <div style="display: flex;align-content: center;">
            <el-avatar style="margin: 2px 5px" :src="scope.row.avatar" size="small"/>
            <span style="margin-top: 1%;">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          <span class="el-icon-delete"
                style="font-size: 8px;color: red;cursor:pointer;"
                @click="removeMember(scope.row.uid)"
                v-if="$store.state.userInfo.uid === groupInfo.masterId && mouseoverNum === scope.row.uid">
            踢出群聊
          </span>
        </template>
      </el-table-column>
    </el-table>
    <div style="width: 90%;display: flex;justify-content: center;margin-top: 25px">
      <el-button type="danger" round icon="el-icon-delete-solid" @click="doDissolve">解散群聊</el-button>
    </div>

    <!-- 邀请好友对话框 -->
    <el-dialog title="邀请好友入群"
               :visible.sync="invitePanelVisible"
               append-to-body
               @open="loadFriends"
               @close="resetData"
               width="25%">
      <el-table
          :data="friends"
          stripe
          width="30"
          @selection-change="selectionChange"
          style="width: 90%">
        <el-table-column
            type="selection">
        </el-table-column>
        <el-table-column label="我的好友">
          <template slot-scope="scope">
            <div style="display: flex;align-content: center;">
              <el-avatar style="margin: 2px 5px" :src="scope.row.avatar" size="small"/>
              <span style="margin-top: 1%;">{{ scope.row.name }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex;justify-content: center;margin-top: 8px">
        <el-button size="small" @click="doInvite">邀请</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {deleteGroupMember, listFriends} from "../../../utils/network/friend";
import {getGroupInfo} from "../../../utils/network/chat";
import {inviteFriend, dissolveGroup} from "../../../utils/network/group";

export default {
  name: "GroupInfoPanel",
  data() {
    return {
      invitePanelVisible: false,
      mouseoverNum: null,
      /*
      * 属性值：
      *   id
      *   name
      *   masterId
      *   masterName
      *   members: [{uid, name, avatar}, {...}]
      * */
      groupInfo: {},
      /*
      * 当前用户的好友（不包含已在群主的好友）
      * {id, name, avatar, (intro)}
      * */
      friends: [],
      // 选中的好友
      selectedFriends: []
    }
  },

  computed: {
    memberCount() {
      if (this.groupInfo.members !== undefined)
        return this.groupInfo.members.length;
      return 0;
    }
  },

  methods: {
    loadData() {
      getGroupInfo(this.$store.state.userInfo.uid, this.$store.state.dialogue.id).then(result => {
        if (result !== undefined && result.data.code === 200)
          this.groupInfo = result.data.data;
      })
    },

    // 踢
    removeMember(deleted) {
      // 确认框
      this.$confirm('确认将该用户踢出群聊吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 踢走用户
        deleteGroupMember(this.$store.state.userInfo.uid, this.groupInfo.id, deleted).then(result => {
          if (result !== undefined && result.data.code === 200) {
            this.$message.success("已踢出群聊")
            this.loadData();
          }
        })
      });
    },

    loadFriends() {
      listFriends(this.$store.state.userInfo.uid, false).then(result => {
        if (result !== undefined && result.data.code == 200) {
          let allFriends = result.data.data;
          // 把群成员的id放入set
          let members = this.groupInfo.members;
          let memberIdSet = new Set();
          for (let i = 0; i < members.length; i++)
            memberIdSet.add(members[i].uid);
          // 从所有好友中过滤掉已在群中的好友
          let targetFriends = allFriends.filter(item => !memberIdSet.has(item.id));
          this.friends = targetFriends;
        }
      })
    },

    doInvite() {
      if (this.selectedFriends.length === 0) {
        this.$message.error("未选择好友")
        return;
      }

      let ids = this.selectedFriends.map(item => item.id);
      inviteFriend(ids, this.groupInfo.id).then(result => {
        if (result !== undefined && result.data.code === 200) {
          this.invitePanelVisible = false;
          this.friends = [];
          this.selectedFriends = [];
          this.$message.success("已发出邀请")
        }
      })
    },

    doDissolve() {
      this.$confirm('确认要删除该群聊，群消息将会被删除且不可恢复?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        dissolveGroup(this.$store.state.userInfo.uid, this.groupInfo.id).then(result => {
          if (result !== undefined && result.data.code === 200) {
            this.$message.success("群已解散")
            window.location.reload();
          }
        })
      })
    },

    resetData() {
      this.friends = [];
      this.selectedFriends = [];
    },

    /*
    * row是el-table的cell-mouse-enter事件自带的参数
    * */
    itemMouseover(row) {
      this.mouseoverNum = row.uid;
    },

    itemMouseleave() {
      this.mouseoverNum = null;
    },

    selectionChange(val) {
      this.selectedFriends = val;
    },
  },

  mounted() {
    this.loadData();
  },
}
</script>

<style scoped>

</style>