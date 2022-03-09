import IMProto from '../protobuf/IMProto_pb'
import store from '../store/index'

class WsSocket {
  // WebSocket对象
  socket;

  url = 'ws://127.0.0.1:9988/ws';

  // FileReader对象，用于将二进制WebSocket帧中的Blob对象转换为ArrayBuffer对象（用于protobuf解析）—— 可以直接指定为 ArrayBuffer 类型
  // fileReader;

  openCallback = () => {
    console.log('已连接到服务器，登录中...');

    let uid = store.state.userInfo.uid;
    let login = new IMProto.Login();
    login.setUid(uid);
    let token = localStorage.getItem('JWT')
    login.setToken(token);
    this.sendWS(0, login);
    // TODO：发送后服务端回复一个确定信息
  };

  initWebSocket() {
    this.socket = new WebSocket(this.url);
    /*
    * 收到二进制帧默认转为Blob类型，指定为ArrayBuffer类型
    * */
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = this.openCallback;

    this.socket.onclose = (evt) => {
      console.log('已断开连接');
    }

    this.socket.onmessage = this.msgCallback;
  }

  /*
    收到消息时的回调函数
  */
  msgCallback = (evt) => {
    let wsData = evt.data;
    let packet = IMProto.IMPacket.deserializeBinary(wsData);
    let packetData = packet.getData();

    let dataType = packet.getType();
    /*
     * 0 - Login
     * 1 - ChatMsg
     * 2 - MsgAck
     * 3 - MsgAckedNotice
     * 4 - MsgRead
     * */
    switch (dataType) {
      case 1:
        let msg = IMProto.ChatMsg.deserializeBinary(packetData);
        this.handleChatMsg(msg);
        break;
      case 2:
        let ack = IMProto.MsgAck.deserializeBinary(packetData);
        store.commit('setMsgSent', ack);
        break;
      case 4:
        let msgRead = IMProto.MsgRead.deserializeBinary(packetData);
        // 当前打开的聊天面板对应的用户是发出消息已被读的用户
        if (msgRead.getUid() === store.state.dialogue.id) {
          store.commit('msgReadHandler', msgRead.getMsgidsList())
        }
        break;
      case 401:
        console.log('token 错误，请重新登录');
        localStorage.removeItem('JWT');
        localStorage.removeItem('UID');
        break;
    }
  }

  //======================================send=====================
  /*
  * 发送消息已读包
  * */
  sendMsgReadPacket(uid, toId, msgIds) {
    let msgRead = new IMProto.MsgRead();
    msgRead.setUid(uid);
    msgRead.setToid(toId);
    msgRead.setMsgidsList(msgIds);
    this.sendWS(4, msgRead);
  }

  /*
  * 发送消息
  * */
  sendChatMsgPacket(type, fromUid, toId, content, msgId, time) {
    let chatMsg = new IMProto.ChatMsg();
    // 0-单聊 1-群聊
    chatMsg.setType(type);
    chatMsg.setMsgid(msgId);
    chatMsg.setFromuid(fromUid);
    chatMsg.setToid(toId);
    chatMsg.setContent(content);
    chatMsg.setTime(time);

    this.sendWS(1, chatMsg);
  }

  /*
     * 0 - Login
     * 1 - ChatMsg
     * 2 - MsgAck
     * 3 - MsgAckedNotice
     * 4 - MsgRead
     * */
  /*
  * 将数据封装为IMPacket发送
  * */
  sendWS(type, data) {
    let packet = new IMProto.IMPacket();
    packet.setType(type);
    packet.setData(data.serializeBinary());
    this.socket.send(packet.serializeBinary());
  }
  //=========================================================================

  handleChatMsg(msg) {
    store.dispatch('handleChatMsg', msg);
  }

  logout() {
    this.socket.close();
    this.socket = null;
  }

}

export default WsSocket;