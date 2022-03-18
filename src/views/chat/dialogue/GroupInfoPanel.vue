<template>
  <!-- 加个v-if防止空指针异常 -->
  <div style="margin: 0 5%;" v-if="groupInfo !== null">
    <el-descriptions :column="1">
      <el-descriptions-item label="群名称 ">{{ groupInfo.name }}</el-descriptions-item>
      <el-descriptions-item label="群主 ">{{ groupInfo.masterName }}</el-descriptions-item>
      <el-descriptions-item label="成员数量 ">{{ memberCount }}</el-descriptions-item>
    </el-descriptions>
    <div style="width: 90%;display: flex;justify-content: center;margin-top: 5px">
      <el-button type="primary" round icon="el-icon-plus">邀请好友</el-button>
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
      <el-button type="danger" round icon="el-icon-delete-solid">解散群聊</el-button>
    </div>
  </div>
</template>

<script>
import {deleteGroupMember} from "../../../utils/network/friend";
import {getGroupInfo} from "../../../utils/network/chat";

export default {
  name: "GroupInfoPanel",
  data() {
    return {
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

    /*
    * row是el-table的cell-mouse-enter事件自带的参数
    * */
    itemMouseover(row) {
      this.mouseoverNum = row.uid;
    },

    itemMouseleave() {
      this.mouseoverNum = null;
    },
  },

  mounted() {
    this.loadData();
  }
}
</script>

<style scoped>

</style>