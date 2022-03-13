import {get, post} from './axios/axios';

/*
* 获取好友申请
* */
export function listApply(uid) {
  return get(
    '/friend/list',
    {uid},
  )
}

export function dealApply(applyId, dealResult) {
  return post(
    '/friend/dealApply',
    {applyId, dealResult},
  )
}