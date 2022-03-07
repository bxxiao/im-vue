import {createSession, loadMsgs} from "../utils/network/chat";

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

export default {
  handleChatMsg(context, chatMsg) {
    let payload = {
      chatMsg,
      newSession: null
    }
    // 若会话不存在，发送请求创建会话并获取对应的头像和名字，创建新的会话项
    let chatMsgType = chatMsg.getType();
    // 单聊，则id对应的就是发送者；群聊，则id对应的是群的id，即chatMsg中的toId
    let toId = chatMsgType === 0 ? chatMsg.getFromuid() : chatMsg.getToid();
    if (context.state.sessionList.maps.get((chatMsgType + 1) + '-' + toId) === undefined) {

      // 对于 ChatMsg.proto，type为0表示单聊，1表示群聊；对于其它地方，1表示单聊，2表示群聊。。。所以这里type+1才能对应上
      createSession(context.state.userInfo.uid, toId, chatMsgType + 1).then(result => {
        let info = result.data.data;
        let newSession = {
          toId: toId,
          name: info.name,
          type: chatMsgType + 1,
          lastMsg: '',
          time: '',
          unread: 0,
          avatar: info.avatar,
        };
        payload.newSession = newSession;
        // 注意createSession是异步的，必须在这里面commit，否则会造成payload.newSession为null
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

  loadMsgs(context) {
    context.commit('dialogueLoadingTop')
    let state = context.state;
    loadMsgs(state.userInfo.uid, state.dialogue.id, state.dialogue.type, state.dialogue.msgRecords[0].msgSeq).then(result => {
      if (result !== null && result.data.code === 200) {
        context.commit('unShiftMsgs', result.data.data)
      }
    })
  }
}