import IMProto from '../protobuf/IMProto_pb'
import store from '../store/index'

class WsSocket {
  // WebSocket对象
  socket;

  url = 'ws://127.0.0.1:9988/ws';

  vueRef = null;

  setVueRef(ref) {
    this.vueRef = ref;
  }

  isConnectionOK() {
    return this.isSocketOpen;
  }

  /*
  * 连接建立时回调函数
  * */
  openCallback = () => {
    this.isSocketOpen = true;
    // 重置重连剩余尝试次数
    this.reconnectLimit = this.reconnectMax;
    // 启动心跳机制
    this.idleHeartBeat();
    // 周期性处理消息id缓存
    this.checkMsgIdCache();

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
      case 5:
        let msgCancel = IMProto.MsgCancel.deserializeBinary(packetData);
        store.commit('msgCanceled', msgCancel);
        break;
      // pong回应
      case 222:
        console.log('receive pong from server')
        this.hasReceivePong = true;
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

  sendMsgCancelPacket(msgId, type, toId) {
    let msg = new IMProto.MsgCancel();
    msg.setMsgid(msgId);
    msg.setType(type);
    msg.setToid(toId)
    this.sendWS(5, msg);
  }

  /*
  * 发送消息
  * */
  sendChatMsgPacket(type, fromUid, toId, content, msgId, time, isFile) {
    let chatMsg = new IMProto.ChatMsg();
    // 0-单聊 1-群聊
    chatMsg.setType(type);
    chatMsg.setMsgid(msgId);
    chatMsg.setFromuid(fromUid);
    chatMsg.setToid(toId);
    chatMsg.setContent(content);
    chatMsg.setTime(time);
    chatMsg.setUsername(store.state.userInfo.name);
    if (isFile)
      chatMsg.setContenttype(2)
    else
      chatMsg.setContenttype(1);

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
    if (!this.isSocketOpen) {
      this.vueRef.$message.error('当前连接异常');
      return;
    }
    let packet = new IMProto.IMPacket();
    packet.setType(type);

    if (data !== null)
      packet.setData(data.serializeBinary());

    this.socket.send(packet.serializeBinary());
  }
  //============================send<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  //=======================handler>>>>>>>>>>>>>>>>>>>>>>
  /*
  * 缓存收到的消息的id msgId-count
  * */
  msgIdCache = new Map();
  handleChatMsg(msg) {
    // console.log("收到消息：" + msg.getContent())
    let receivedAck = new IMProto.MsgReceivedAck();
    receivedAck.setUid(store.state.userInfo.uid);
    let msgId = msg.getMsgid();
    receivedAck.setMsgid(msgId);
    this.sendWS(6, receivedAck);

    // 缓存中没有才进行处理，否则表示之前已经收到过，不进行处理
    if (!this.msgIdCache.has(msgId)) {
      store.dispatch('handleChatMsg', msg);
      this.msgIdCache.set(msgId, 0);
    }
  }

  /*
  * 周期性处理消息id缓存，6个周期后删除掉消息id缓存
  * */
  checkMsgIdCache() {
    let thisRef = this;
    setTimeout(() => {
      let remove = [];
      let increment = [];
      for (let [key, value] of thisRef.msgIdCache) {
        if (value == 6)
          remove.push(key);
        else
          increment.push({key, value});
      }

      remove.forEach(value => thisRef.msgIdCache.delete(value));
      increment.forEach(item => thisRef.msgIdCache.set(item.key, item.value + 1))
      thisRef.checkMsgIdCache()
    }, 4000);
  }

  //=======================handler<<<<<<<<<<<<<<<<<<<<


  logout() {
    this.socket.close();
    this.socket = null;
  }


  //============================心跳、断线重连>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  /*
  * 心跳机制：
  *   在连接正常的情况下，每过若干秒发送一个心跳包，
  *   并检测是否收到pong回应，若收到则正常执行进程；否则记录未收到次数
  *   当达到指定次数时，视为连接已断开，主动关闭连接，触发自动重连
  *   若连接不正常（isSocketOpen为false），则停止心跳检测
  * */
  // 标识在心跳检测的计时期间，是否收到pong回应，初始置true
  hasReceivePong = true;
  // 没用收到pong回应的次数
  unReceivePongCount = 0;
  /*
  * 标识是否正在进行心跳检测，用以避免多次启动心跳检测，也可以理解为一个启动心跳的锁
  *
  * */
  inHeartBeating = false;
  idleHeartBeat() {
    /*
    * 该函数只能执行一次，否则会有多个heartBeating函数同时在循环
    * 当断线重连在heartBeating的setTimeout指定的时间内完成时，就会重新启动一个heartBeating函数
    * 通过isHeartBeating标志来防止多次执行
    * */
    if (this.inHeartBeating)
      return;
    this.inHeartBeating = true;
    let thisRef = this;
    let heartBeating = () => {
      setTimeout(() => {
        // 若socket连接正常
        if (thisRef.isSocketOpen) {
          // 若收到pong回应，则正常发送ping包
          if (thisRef.hasReceivePong) {
            thisRef.unReceivePongCount = 0;
          } else {
            /*
            * 没有收到pong回应，计数，若达到指定次数，则视为连接已断开，
            * 主动关闭，触发重连
            * */
            thisRef.unReceivePongCount++;
            if (thisRef.unReceivePongCount === 2) {
              console.log('服务端长时间无回应，连接已断开...');
              thisRef.vueRef.$message.error('服务端长时间无回应，连接已断开...');
              thisRef.socket.close();
              // 重置2个变量
              thisRef.hasReceivePong = true;
              thisRef.unReceivePongCount = 0;
              // 释放锁
              thisRef.inHeartBeating = false;
              return;
            }
          }

          // 发送ping，进入下一个循环
          thisRef.hasReceivePong = false;
          console.log('send ping...');
          thisRef.sendWS(111, null);
          heartBeating();
        } else {
          thisRef.inHeartBeating = false;
        }
      }, 10000)
    };

    heartBeating();
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
        thisRef.vueRef.$message.success('与服务器重连成功');
        thisRef.lockReconnect = false;
        return;
      }

      // 重连次数到达限制，停止重连
      if (thisRef.reconnectLimit === 0) {
        console.log('重连失败，与服务端断开连接，请检查网络设置');
        thisRef.vueRef.$message.error('重连失败，与服务端断开连接，请检查网络设置');
        return;
      }

      // 重连次数减一
      thisRef.reconnectLimit--;
      console.log('第' + (thisRef.reconnectMax - thisRef.reconnectLimit) + '次重连中...');
      thisRef.vueRef.$message.warning('连接已断开，第' + (thisRef.reconnectMax - thisRef.reconnectLimit) + '次重连中...');
      // 重连
      thisRef.initWebSocket();
      // 周期性执行，直到满足终止条件
      setTimeout(() => reconnectFunc(), 4000);
    };

    reconnectFunc();
  }

  //============================心跳、断线重连<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

}

export default WsSocket;