import {get, post} from './axios/axios'

export function doLogin(phone, password) {
  return post(
    '/user/login',
    {phone, password},
  );
}

export function getUserInfo(uid) {
  return get(
    '/user/info',
    {uid}
  )
}

export function doRegistry(username, phone, password) {
  return post(
      '/user/registry',
      {username, phone, password}
  )
}

export function editInfo(uid, name, phone, intro) {
  return post(
      '/user/edit',
      {uid, name, phone, intro}
  )
}

export function editPwd(uid, oldPwd, newPwd) {
  return post(
      '/user/editPwd',
      {uid, oldPwd, newPwd}
  )
}


