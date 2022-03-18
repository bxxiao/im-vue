<template>
  <div>
    <el-form label-width="20%" style="width: 50%;">
      <el-form-item label="群名">
        <el-input size="small" placeholder="输入群名" v-model="groupName"></el-input>
      </el-form-item>
    </el-form>
    <el-table
        :data="friends"
        tooltip-effect="dark"
        border
        @selection-change="handleSelectionChange">
      <el-table-column
          type="selection">
      </el-table-column>
      <el-table-column
          label="选择好友">
        <template slot-scope="scope">
          <div style="display: flex;align-content: center;">
            <el-avatar style="margin: 2px 5px" :src="scope.row.avatar" size="small"/>
            <span style="margin-top: 1%;">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div style="display: flex;justify-content: center;margin-top: 8px">
      <el-button round size="small" @click="submit">创建</el-button>
    </div>
    {{multipleSelection}}
  </div>
</template>

<script>
import {listFriends} from "../../../utils/network/friend";

export default {
  name: "GroupCreatePanel",
  data() {
    return {
      /*
      * 创建群聊对话框中选中好友后，整个scope.row将会加入到该数组
      * */
      multipleSelection: [],
      friends: [],
      groupName: '',
    }
  },

  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    loadData() {
      listFriends(this.$store.state.userInfo.uid, false).then(result => {
        if (result !== undefined && result.data.code === 200) {
          this.friends = result.data.data;
        }
      })
    },

    submit() {
      if (this.groupName.trim() === '') {
        this.$message.error("群名不能为空");
        return;
      }


    }
  }
}
</script>

<style scoped>

</style>