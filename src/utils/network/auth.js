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


