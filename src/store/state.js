export default {
  // 会话列表
  sessionList: {
    hasInit: false,
    /*
    * demo
    * {toId: 6, name: '彭于晏', type: 1, lastMsg: '哈哈哈哈', time: '昨天 15:56', unread: 20, avatar: 'https://pic1.zhimg.com/v2-48fdaebd7895bdffe22448e5193c62fa_r.jpg'},
    * type: 1-好友 2-群组
    * */
    list: [],
    /*
    * list中的元素以 【'type-toId' —— item】 的形式放入map，用于快速定位session
    * */
    maps: null
  },
  // 被选中的会话项
  selectedSession: {
    // 用户跟群聊的id可能是一样的，所以再用一个type来区分
    id: null,
    type: null
  },
  wsSocket: null,
  userInfo: {
    uid: null,
    // 'https://img.wenanjuzi.com/upload/3c2014079285n1944808001m26.jpg'
    avatar: '',
    phone: '',
    name: '',
    token: '',
  },
  // 聊天面板
  dialogue: {
    isInit: false,
    // 是否正在加载
    isLoading: false,
    // 好友或群组的id
    id: null,
    // 好友或群组的名字
    name: null,
    // 1-好友 2-群组
    type: null,
    // 仅对单聊，保存对端头像
    avatar: null,
    // 仅对群聊，保存群成员的头像（类型Map， uid——avatar）
    avatarMap: null,
    isOnline: false,
    /*
    * 聊天记录
    * sendStatus - 表示发送状态：
    * 0 - 已发送；
    * -1 - 发送失败
    * -2 - 发送中
    * 若为整数，则表示已重发的次数
    *
    * demo: {msgId, msgSeq, fromUid, toId, type, content, time, hasRead[, sendStatus]}
    * */
    msgRecords: [],
    /*
    * 当前用户发送的未被读的消息map，用于收到已读确认时快速定位到消息并置为已读，
    * 映射关系 【msgId - {msgRecords中的某条记录}】
    * */
    sendSelfMsgMap: null,
    // 标识是否有消息正在进行重试发送
    isInCheckCirculation: false,
  },
  // 记录正在发送中的消息
  sendingMsgMap: null,
  // 发送失败的消息
  sendFailMsgMap: null,
  // 是否正在进行消息重新发送循环
  // isInCheckCirculation: false
}