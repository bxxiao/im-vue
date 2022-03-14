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

export function listFriends(uid) {
  return get(
    '/friend/listFriends',
    {uid}
  )
}

export function listGroups(uid) {
  return get(
    '/friend/listGroups',
    {uid}
  )
}