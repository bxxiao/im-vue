<template>
  <el-container>
    <el-header>
      <el-row style="margin-top: 10px;margin-bottom: 10px" class="search-header" :gutter="10">
        <el-col class="search-header-item" :span="20">
          <el-input size="small" placeholder="搜索好友/群..." v-model="keyword"></el-input>
        </el-col>
        <el-col class="search-header-item" :span="4">
          <el-button size="small" icon="el-icon-search" circle @click="doSearch"></el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main style="padding: 0;margin: 0;">
      <el-table
          :data="results"
          v-loading="searching"
          :cell-style="{padding:'5px'}"
          border
          style="width: 100%">
        <el-table-column
            label="搜索结果">
          <template slot-scope="scope">
            <div style="display: flex;align-content: center;">
              <el-avatar style="margin: 2px 5px" :src="scope.row.avatar" size="medium"/>
              <div style="">
                <div>
                  <span style="font-size: 13px;">{{scope.row.name}}</span>
                </div>
                <div style="font-size: 9px;color: #8f959e;">
                  <span v-if="scope.row.type === 1">
                    [手机号码] {{scope.row.phone}}
                  </span>
                  <span v-else-if="scope.row.type === 2">
                    [群号] {{scope.row.groupNumber}}
                  </span>
                </div>
              </div>
              <div style="float: right;">
                <el-button size="mini" round
                           style="position: absolute;right: 4%;top: 20%"
                           @click="doSendApply(scope.row)"
                           plain icon="el-icon-plus"></el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script>
import {searchUserAndGroup} from "../../../utils/network/chat";
import {sendFriendApply} from "../../../utils/network/friend";

export default {
  name: "FriendSearchPanel",
  data() {
    return {
      keyword: '',
      searching: false,
      // {id type(1-user;2-group) avatar name phone(for user) groupNumber(for group)}
      results: [],
    }
  },

  methods: {
    doSearch() {
      if (this.keyword.trim() === '') {
        this.results = [];
        return;
      }
      this.searching = true;
      searchUserAndGroup(this.keyword).then(result => {
        if (result != undefined && result.data.code === 200) {
          this.results = result.data.data;
        }
        this.searching = false;
      })
    },

    clearData() {
      this.keyword = '';
      this.results = [];
      this.searching = false;
    },

    doSendApply(item) {
      let tipStr = item.type === 1 ? ('确定向【' + item.name + '】发出好友申请?') : ('确定申请加入群聊【' + item.name + '】?');
      this.$confirm(tipStr, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        console.log('okk')
        // sendFriendApply(item.id).then(result => {
        //   if (result != undefined && result.data.code === 200) {
        //     this.$message.success("已发出好友申请");
        //   }
        // })
      });
    }
  },
}
</script>

<style scoped>

</style>