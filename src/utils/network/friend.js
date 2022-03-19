import {get, post} from './axios/axios';

/*
* 获取好友申请
* */
export function listApply(uid) {
  return get(
    '/friend/listApply',
    {uid},
  )
}

export function dealApply(applyId, dealResult) {
  return post(
    '/friend/dealApply',
    {applyId, dealResult},
  )
}

/*
* online表示是否要查询好友是否在线
* */
export function listFriends(uid, online) {
  return get(
    '/friend/listFriends',
    {uid, online}
  )
}

export function listGroups(uid) {
  return get(
    '/friend/listGroups',
    {uid}
  )
}

export function deleteGroupMember(uid, groupId, deleted) {
  return post(
      '/friend/delete/groupMember',
      {uid, groupId, deleted},
  )
}

export function deleteFriend(uid, friendUid) {
  return post(
      '/friend/delete/friend',
      {uid, friendUid},
  )
}

export function quitGroup(uid, groupId) {
  return post(
      '/friend/quitGroup',
      {uid, groupId},
  )
}

export function sendApply(targetId, type) {
  return post(
      '/friend/apply',
      {targetId, type},
  )
}
