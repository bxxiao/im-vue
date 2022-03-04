import WsSocket from "../ws/wsSocket";
import moment from "_moment@2.29.1@moment";
import { v4 as uuidV4 } from 'uuid'

export default {
  initWS(state) {
    state.wsSocket = new WsSocket();
    state.wsSocket.initWebSocket();
  },

  /*
  * 初始化会话列表，同时更新用户信息（userInfo）
  * */
  initSessionList(state, payload) {
    state.sessionList.list = payload.sessionList;
    state.sessionList.hasInit = true;
    let list = state.sessionList.list;
    state.sessionList.maps = new Map();
    for (let i = 0; i < list.length; i++)
      state.sessionList.maps.set(list[i].type + '-' + list[i].toId, list[i]);

    let info = payload.userInfo;
    state.userInfo.uid = info.id;
    state.userInfo.name = info.name;
    state.userInfo.avatar = info.avatar;
    state.userInfo.phone = info.phone;

    state.sendingMsgMap = new Map();
    state.sendFailMsgMap = new Map();
  },

  /*
  * 根据选中的会话项信息填充dialogue信息
  * */
  loadChatPanelHeader(state, session) {
    state.dialogue.isInit = true;
    state.dialogue.isLoading = true;
    state.dialogue.avatar = session.avatar;
    state.dialogue.type = session.type;
    state.dialogue.name = session.name;
    state.dialogue.id = session.toId;
    state.selectedSession.id = session.toId;
    state.selectedSession.type = session.type;
    session.unread = 0;
  },

  /*
  * 通过http拉取聊天记录后（点开会话项时）进行相关数据设置
  * data: {
  *   isOnline,
  *   msgs
  * }
  * */
  setDialogueData(state, data) {

    let msgArray = data.msgs;
    state.dialogue.msgRecords = msgArray;
    state.dialogue.sendSelfMsgMap = null;
    state.dialogue.sendSelfMsgMap = new Map();

    // 单聊类型处理
    if (state.dialogue.type === 1) {
      state.dialogue.isOnline = data.isOnline;
      /*
      * 从后往前遍历消息，把当前用户已发送的但未读的消息放入map（msgId —— msg）
      * */

      for (let i = msgArray.length - 1; i >= 0; i--) {
        // 若当前消息是对端的，则往前的消息肯定已读
        if (msgArray[i].fromUid === state.dialogue.id)
          break;
        // 若当前消息是自己发的，并且已读，则往前的消息也已读
        if (msgArray[i].hasRead)
          break;
        state.dialogue.sendSelfMsgMap.set(msgArray[i].msgId, msgArray[i]);
      }

      /*
      * 从后往前遍历，找到未读的对端消息，发送消息已读包
      * */
      let readMsgIds = [];
      for (let i = msgArray.length - 1; i >= 0; i--) {
        // 若当前消息是自己发送的，则前面的对端消息都已读
        if (msgArray[i].fromUid === state.userInfo.uid)
          break;
        // 若当前消息是对端发送的且已读，则往前的也已读
        if (msgArray[i].hasRead)
          break;
        readMsgIds.push(msgArray[i].msgId);
        // 这行代码应该可以不用
        msgArray[i].hasRead = true;
      }

      if (readMsgIds.length > 0)
        state.wsSocket.sendMsgReadPacket(state.userInfo.uid, state.dialogue.id, readMsgIds);
    }
    // 群聊处理
    else if (state.dialogue.type === 2) {

    }

    // 停止加载状态
    state.dialogue.isLoading = false;
  },

  /*
  * 根据消息id将对应消息置为已读（自己发的消息）
  * */
  msgReadHandler(state, msgIds) {
    let map = state.dialogue.sendSelfMsgMap;
    for (let i = 0; i < msgIds.length; i++) {
      let msgId = msgIds[i];
      if (map.has(msgId)) {
        /*
        * 设置为已读，然后从map移除
        * */
        let msg = map.get(msgId);
        msg.hasRead = true;
        map.delete(msgId);
      }
    }
  },

  /*
  * 接收到消息时的逻辑
  * */
  // toId: 6, name: '彭于晏', type: 1, lastMsg: '哈哈哈哈', time: '昨天 15:56', unread: 20， avatar
  // {msgId, msgSeq, fromUid, toId, type, content, time, hasRead}  msg record
  handleChatMsg(state, payload) {
    let chatMsg = payload.chatMsg;
    let newSession = payload.newSession;
    // 创建了新的会话项，push进会话列表
    if (newSession !== null) {
      state.sessionList.list.push(newSession);
      state.sessionList.maps.set(newSession.type + '-' + newSession.toId, newSession);
    }

    // 处理单聊消息
    if (chatMsg.getType() === 0) {
      let type = chatMsg.getType() + 1;
      let session = state.sessionList.maps.get(type + '-' + chatMsg.getFromuid());

      // 1. 更新会话项
      session.lastMsg = chatMsg.getContent();
      session.time = chatMsg.getTime();
      // 2.1 对应的对话框没有打开，则其 未读 属性+1
      if (state.selectedSession !== session.toId)
        session.unread++;
      // 2.2 已打开，添加消息，并发送已读包
      else {
        let newMsg = {
          msgId: chatMsg.getMsgid(),
          msgSeq: chatMsg.getMsgseq(),
          fromUid: chatMsg.getFromuid(),
          toId: chatMsg.getToid(),
          type: chatMsg.getType(),
          content: chatMsg.getContent(),
          time: chatMsg.getTime(),
          hasRead: true
        };
        state.dialogue.msgRecords.push(newMsg);
        state.wsSocket.sendMsgReadPacket(state.userInfo.uid, newMsg.fromUid, [newMsg.msgId]);
      }
    } else if (chatMsg.getType() === 1) {

    } else {

    }
  },

  /*
  * 发送消息
  * */
  sendMsg(state, msgContent) {
    let msg = {
      msgId: uuidV4(),
      fromUid: state.userInfo.uid,
      toId: state.dialogue.id,
      type: state.dialogue.type,
      content: msgContent,
      time: moment().format(),
      hasRead: false,
      sendStatus: -2,
    };
    let curSession = state.sessionList.maps.get(state.selectedSession.type + '-' + state.selectedSession.id);
    curSession.lastMsg = msgContent;
    curSession.time = msg.time;
    // push进聊天记录，并放入map
    state.dialogue.msgRecords.push(msg);
    state.dialogue.sendSelfMsgMap.set(msg.msgId, msg);
    state.sendingMsgMap.set(msg.msgId, msg);
    // WebSocket发送消息
    state.wsSocket.sendChatMsgPacket(msg.type - 1, msg.fromUid, msg.toId, msgContent, msg.msgId, msg.time);
  },

  /*
  * 消息已发送回执处理
  * */
  setMsgSent(state, ack) {
    let msg = state.sendingMsgMap.get(ack.getMsgid());
    msg.sendStatus = 0;
    state.sendingMsgMap.delete(msg.msgId);
  },

  /*
  * 【check】循环中消息重发时调用的函数
  * */
  resendMsg(state, msgIds) {
    for (let i = 0; i < msgIds.length; i++) {
      let msg = state.sendingMsgMap.get(msgIds[i]);
      if (msg !== undefined) {
        console.log('resend: ' + msg.content)
        state.wsSocket.sendChatMsgPacket(msg.type, msg.fromUid, msg.toId, msg.content, msg.msgId, msg.time);
      }
    }
  },

  /*
  * 消息已发送失败，手动重发调用的函数
  * */
  resendFailedMsg(state, msgIds) {
    for (let i = 0; i < msgIds.length; i++) {
      let msg = state.sendFailMsgMap.get(msgIds[i]);
      if (msg !== undefined) {
        // 状态设置为正在发送
        msg.sendStatus = -2;
        state.sendFailMsgMap.delete(msgIds[i]);
        state.sendingMsgMap.set(msgIds[i], msg);
        state.wsSocket.sendChatMsgPacket(msg.type, msg.fromUid, msg.toId, msg.content, msg.msgId, msg.time);
      }
    }
  },

  /*
  * actions中checkAndResendMsg的主要逻辑函数，每过2s会调用该函数
  * 遍历sendingMsgMap中的消息，根据其状态进行重发或停止重发
  * */
  check(state) {
    // 需要重发的消息id
    let msgIds = [];
    for (let [id, msg] of state.sendingMsgMap) {
      // 状态为正在发送，进行第一次重发
      if (msg.sendStatus === -2) {
        // 置1表示已重发了1次
        msg.sendStatus = 1;
        msgIds.push(id);
        /*
        * sendStatus为正数，表示已重发了若干次，
        *   若不到5，则继续重发，增加计数；
        *   已重发了5次，则将消息从sendingMsgMap中移除，放入sendFailMsgMap，可以进行手动重发
        * */
      } else if (msg.sendStatus > 0) {
        if (msg.sendStatus === 5) {
          state.sendingMsgMap.delete(msg.msgId);
          // 发送失败
          msg.sendStatus = -1;
          state.sendFailMsgMap.set(msg.msgId, msg);
          console.log(msg.content, ' send failed')
        }
        // this.commit('setMsgSendFail', id);
        else {
          msg.sendStatus++;
          msgIds.push(id);
        }
      }
    }

    if (msgIds.length > 0) {
      this.commit('resendMsg', msgIds);
      // 若有消息重发，则还需要继续循环
      state.isInCheckCirculation = true;
    } else if (msgIds.length === 0)
      // 若没有表示已全部重发完成或重发失败（到达5次）
      state.isInCheckCirculation = false;
  },

  setCirculationTrue(state) {
    state.isInCheckCirculation = true;
  }

}