import {get, post} from './axios/axios'
import * as url from "url";

export function getSessionList(uid) {
  return get(
    '/chat/getSessionList',
    {uid},
    null
    );
}

export function getDialogueData(uid, toId, type) {
  return get(
    '/chat/getDialogueData',
    {uid, toId, type},
    null
  )
}

export function createSession(uid, toId, type) {
  return post(
     '/chat/createSession',
    {uid, toId, type},
    null
  )
}

export function updateLastSeq(lastSeq, groupId, uid) {
  return post(
    '/chat/updateLastSeq',
    {lastSeq, groupId, uid},
    null
  )
}

export function loadMsgs(uid, toId, type, msgSeq) {
  return get(
    '/chat/loadMsgs',
    {uid, toId, type, msgSeq},
    null
  )
}

export function getGroupInfo(uid, groupId) {
  return get(
      '/chat/groupInfo',
      {uid,groupId},
  )
}

export function searchUserAndGroup(keyword) {
  return get(
      '/friend/search',
      {keyword}
  )
}

