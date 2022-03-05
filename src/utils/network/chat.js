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


