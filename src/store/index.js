import Vue from 'vue'
import Vuex from 'vuex'
import {createSession} from "../utils/network/chat";

import state from "./state";
import mutations from "./mutations";

/*
* TODO：把部分状态尝试转移到对应的组件的data
* */

Vue.use(Vuex)

/*
 * 每2s进行检查，若有消息状态还是发送中（或者重发但是次数还没到上限），则进行重发，并增加重发次数
 * 达到5次时视为发送失败，把消息从sendingMsgMap中移除，放进sendFailMsgMap
 * */
function checkCirculation(context) {
  setTimeout(() => {
    context.commit('check');
    // 还有消息正在重试发送，则继续调用进行循环
    if (context.state.isInCheckCirculation)
      checkCirculation(context);
  }, 2000)
}

export default new Vuex.Store({
  state,
  mutations,
  getters: {},
  actions: {
    handleChatMsg(context, chatMsg) {
      let payload = {
        chatMsg,
        newSession: null
      }
      // 若会话不存在，发送请求创建会话并获取对应的头像和名字，创建新的会话项
      if (context.state.sessionList.maps.get((chatMsg.getType() + 1) + '-' + chatMsg.getFromuid()) === undefined) {
        // 对于 ChatMsg.proto，type为0表示单聊，1表示群聊；对于其它地方，1表示单聊，2表示群聊。。。所以这里type+1才能对应上
        createSession(context.state.userInfo.uid, chatMsg.getFromuid(), chatMsg.getType() + 1).then(result => {
          let info = result.data.data;
          let newSession = {
            toId: chatMsg.getFromuid(),
            name: info.name,
            type: chatMsg.getType() + 1,
            lastMsg: '',
            time: '',
            unread: 0,
            avatar: info.avatar,
          };
          payload.newSession = newSession;
          context.commit('handleChatMsg', payload);
        });
      } else
        context.commit('handleChatMsg', payload);

    },

    /*
    * 每2s进行检查，若有消息状态还是发送中（或者重发但是次数还没到上限），则进行重发，并增加重发次数
    * 达到5次时视为发送失败，把消息从sendingMsgMap中移除，放进sendFailMsgMap
    * */
    checkAndResendMsg(context) {
      // 若已经在循环中，则返回
      if (context.state.isInCheckCirculation)
        return;

      context.commit('setCirculationTrue');
      checkCirculation(context);
    },
  },

  modules: {},
})
