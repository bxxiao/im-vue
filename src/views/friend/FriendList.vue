<template>
  <el-table
      :data="tableData"
      style="width: 100%">
    <el-table-column
        label="好友列表">
      <template slot-scope="scope">
        <div style="display: flex;width: 100%" @mouseover="itemMouseover(scope.row.num)" @mouseleave="itemMouseleave">
          <el-avatar style="margin: 2px 5px" src="https://pic1.zhimg.com/v2-48fdaebd7895bdffe22448e5193c62fa_r.jpg"/>
          <div style="width: 80%;">
            <div>
              <span style="font-size: 14px;margin-right: 5px">四手霸王</span>
              <el-tag size="mini" >在线</el-tag>
              <el-tag size="mini" type="info">离线</el-tag>
            </div>
            <div style="font-size: 13px;color: #8f959e;margin-top: 2px">
              我是这条街最靓的崽
            </div>
          </div>
          <div style="float: right;display: flex;align-items: center;justify-content: center" v-if="mouseoverNum === scope.row.num">
            <el-button size="mini" type="primary" icon="el-icon-s-promotion">发送消息</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除好友</el-button>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "FriendList",
  data() {
    return {
      tableData: [{
        num: 1,
        date: '2016-05-02',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1518 弄'
      }, {
        num: 2,
        date: '2016-05-04',
        name: '王小虎',
        address: '上海市普陀区金沙江路 1517 弄'
      }],
      mouseoverNum: null,
    }
  },
  methods: {
    itemMouseover(num) {
      this.mouseoverNum = num;
    },
    itemMouseleave() {
      this.mouseoverNum = null;
    }
  }
}
</script>

<style scoped>

</style>