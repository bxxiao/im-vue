<!--
TODO：Apply、FriendList、GroupList可以尝试抽取一个组件模板出来
-->
<template>
  <!--
    el-table：data绑定一个数组，在<template>中通过 scope.row.xxx 调用绑定的数组的元素对应的属性值
  -->
  <el-table
      :data="applies"
      style="width: 100%"
      v-loading="inLoading">
    <el-table-column label="好友申请">
      <template slot-scope="scope">
        <div style="display: flex;width: 100%" @mouseover="itemMouseover(scope.row.id)" @mouseleave="itemMouseleave">
          <el-avatar style="margin: 2px 5px;" :src="scope.row.senderAvatar"/>
          <div style="width: 82%;">
            <div>
              <span style="font-size: 14px;margin-right: 5px" v-if="scope.row.type === 1">{{scope.row.senderName}}</span>
              <span style="font-size: 14px;margin-right: 5px" v-else-if="scope.row.type === 2">
                {{scope.row.senderName}} 邀请你加入群聊 [{{scope.row.groupName}}]
              </span>
              <el-tag size="mini" v-if="scope.row.status === 1">已同意</el-tag>
              <el-tag size="mini" type="danger" v-else-if="scope.row.status === 2">已拒绝</el-tag>
              <el-tag size="mini" type="warning" v-else-if="scope.row.status === 0">待处理</el-tag>
            </div>
            <div style="font-size: 13px;color: #8f959e;margin-top: 2px">
              [申请时间] {{parseTime(scope.row.time)}}
            </div>
          </div>
          <div style="float: right;display: flex;align-items: center;justify-content: center;width: 10%" v-if="scope.row.status === 0 && mouseoverNum === scope.row.id">
            <el-button size="mini" type="primary" icon="el-icon-check" @click="handleApply(scope.row.id, 1)">同意</el-button>
            <el-button size="mini" type="danger" icon="el-icon-close" @click="handleApply(scope.row.id, 2)">拒绝</el-button>
          </div>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import {listApply, dealApply} from "../../utils/network/friend";
import moment from "moment";

export default {
  name: "Apply",
  data() {
    return {
      /*
      * 元素属性：id senderUid senderAvatar senderName toUid groupId groupName type status time
      * type：1-好友申请；2-群聊邀请；status：0-待处理；1-已同意；2-已拒绝
      * */
      applies: null,
      mouseoverNum: null,
      inLoading: true,
    }
  },
  methods: {
    /*
    * 加载页面
    * */
    loadPage() {
      this.inLoading = true;
      let uid = this.$store.state.userInfo.uid;
      /*
      * 若uid为空（可能是页面刷新），等半s后再重新获取uid（等待FriendView的mounted函数加载完userinfo）发送请求
      * */
      if (uid === null) {
        setTimeout(() => {
          uid = this.$store.state.userInfo.uid;
          this.loadApplyList(uid);
        }, 500)
      } else
        this.loadApplyList(uid)
    },

    loadApplyList(uid) {
      listApply(uid).then(result => {
        if (result !== undefined && result !== null && result.data.code === 200) {
          this.applies = result.data.data;
          this.inLoading = false;
        } else {
          this.$notify.error({
            title: '错误',
            message: '请求错误，请刷新或稍后再试'
          });
        }
      })
    },

    /*
    * 处理申请请求，同意或拒绝
    * */
    handleApply(id, type) {
      dealApply(id, type).then(result => {
        if (result.data.code === 200) {
          this.$message({
            message: '操作成功',
            type: 'success'
          });
          this.loadPage();
        }
      })
    },

    itemMouseover(id) {
      this.mouseoverNum = id;
    },

    itemMouseleave() {
      this.mouseoverNum = null;
    },

    parseTime(timeStr) {
      if (timeStr === null || timeStr === undefined)
        return '';
      moment.locale('zh-cn');
      return moment(timeStr).calendar();
    }
  },

  mounted() {
    this.loadPage();
  }
}
</script>

<style scoped>
</style>


