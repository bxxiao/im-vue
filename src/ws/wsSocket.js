import IMProto from '../protobuf/IMProto_pb'
import store from '../store/index'

/*
* TODO：protobuf的类型抽象出一个js文件
* */

class WsSocket {
  // WebSocket对象
  socket;

  url = 'ws://127.0.0.1:9988/ws';

  /*
  * 连接建立时回调函数
  * */
  openCallback = () => {
    this.isSocketOpen = true;
    // 重置重连剩余尝试次数
    this.reconnectLimit = this.reconnectMax;
    // 启动心跳机制
    this.idleHeartBeat();

    let uid = store.state.userInfo.uid;
    let login = new IMProto.Login();
    login.setUid(uid);
    let token = localStorage.getItem('JWT')
    login.setToken(token);
    this.sendWS(0, login);
    // TODO：发送后服务端回复一个确定信息
  };

  initWebSocket() {
    let thisRef = this;
    this.socket = new WebSocket(this.url);
    /*
    * 收到二进制帧默认转为Blob类型，指定为ArrayBuffer类型
    * */
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = this.openCallback;

    this.socket.onclose = (evt) => {
      thisRef.isSocketOpen = false;
      console.log('连接断开...');
      thisRef.doReconnecting();
    }

    this.socket.onerror = (evt) => {
      thisRef.isSocketOpen = false;
      console.log('连接出现错误')
      thisRef.doReconnecting();
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
      // pong回应
      case 222:
        console.log('receive pong from server')
        break;
      case 401:
        console.log('token 错误，请重新登录');
        localStorage.removeItem('JWT');
        localStorage.removeItem('UID');
        this.reconnectLimit = 0;
        this.socket = null;
        break;
    }
  }

  //======================================send>>>>>>>>>>>>>>>>>>>>>>>>
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

    if (data !== null)
      packet.setData(data.serializeBinary());

    this.socket.send(packet.serializeBinary());
    this.hasSendPacket = true;
  }
  //============================send<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //=======================handler>>>>>>>>>>>>>>>>>>>>>>
  handleChatMsg(msg) {
    store.dispatch('handleChatMsg', msg);
  }

  //=======================handler<<<<<<<<<<<<<<<<<<<<


  logout() {
    this.socket.close();
    this.socket = null;
  }


  //============================心跳、断线重连>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  /*
  * 心跳机制：
  *   在连接正常的情况下，每过若干秒进行一次检测，若在此期间发送过数据（hasSendPacket为true），
  *   则不用发送心跳包，否则发送一个心跳包
  *   若连接不正常（isSocketOpen为false），则停止心跳检测
  * */
  // 标志在心跳检测到达之前，是否通过socket发送过数据
  hasSendPacket = false;
  idleHeartBeat() {
    let thisRef = this;
    setTimeout(() => {
      // 若socket连接正常
      if (thisRef.isSocketOpen) {

        // 在检测到达期间没有发送数据，则要发送心跳包
        if (!thisRef.hasSendPacket) {
          console.log('send ping...')
          thisRef.sendWS(111, null);
        }

        /*
        * 若检测期间有发送数据，则该标志会在sendWS中置true
        * 若没有并在这里发了一个ping包，也会在sendWS中置true
        * 2种情况都要置false
        * */
        thisRef.hasSendPacket = false;
        thisRef.idleHeartBeat();
      } else
        thisRef.hasSendPacket = false;
    }, 20000)
  }

  /*
  * 重连机制：
  *   在连接关闭或出现错误时（onclose或onerror被触发），执行重连操作
  *   每若干秒进行一次重连，直到重连成功或到达重连上限
  * */
  // 重连尝试最大次数
  reconnectMax = 7;
  // 重连剩余尝试次数
  reconnectLimit = this.reconnectMax;
  // 在进行重连时该标志置true，防止多个重连操作进行（onclose或onerror被触发时会执行doReconnecting）
  lockReconnect = false;
  // 表示websocket连接是否正常
  isSocketOpen = false;

  doReconnecting() {
    // 已经在进行重连，返回
    if (this.lockReconnect)
      return;
    // 上锁
    this.lockReconnect = true;

    let thisRef = this;
    // 重连操作的函数
    let reconnectFunc = () => {
      // 重连成功
      if (thisRef.isSocketOpen) {
        console.log('重连成功...')
        thisRef.lockReconnect = false;
        return;
      }

      // 重连次数到达限制，停止重连
      if (thisRef.reconnectLimit === 0) {
        console.log('重连失败，与服务端断开连接，请检查网络设置');
        return;
      }

      // 重连次数减一
      thisRef.reconnectLimit--;
      console.log('第' + (thisRef.reconnectMax - thisRef.reconnectLimit) + '次重连中...');
      // 重连
      thisRef.initWebSocket();
      // 周期性执行，直到满足终止条件
      setTimeout(() => reconnectFunc(), 5000);
    };

    reconnectFunc();
  }

  //============================心跳、断线重连<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

}

export default WsSocket;