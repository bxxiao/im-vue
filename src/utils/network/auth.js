import {get, post} from './axios/axios'

export function doLogin(phone, password) {
  // let param = new URLSearchParams();
  // param.append('phone', phone);
  // param.append('password', password);
  return post(
    '/user/login',
    {phone, password},
  );
}


