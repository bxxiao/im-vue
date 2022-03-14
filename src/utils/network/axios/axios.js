import axios from 'axios'
import Qs from 'qs'
import Vue from "vue";

const request = axios.create({
  baseURL: 'http://localhost:8484/api',
  timeout: 5000,
  // headers: {}
});

// 保存一个vue组件中的this引用，在App.vue中通过当前js文件导出的函数进行设置
let vueRef = null;

// 请求拦截
request.interceptors.request.use(config => {

  /*
  * 检查参数，请求需要携带某些信息（如token）
  * ...
  * */
  let jwt = localStorage.getItem('JWT');
  config.headers.Authorization = 'Bearer ' + jwt;

  // 返回config表示放行
  return config;
}, error => {
  /*
  * error handle
  * */
  console.log(error);
})

// 响应拦截
request.interceptors.response.use(res => {
  // 返回结果：返回的结果就是下面then函数中的res
  if (res.data !== null && res.data !== undefined && res.data.code !== 200) {
    vueRef.$message.error(res.data.message);
  }
  return res;
}, err => {
  if (err.response.status === 403) {
    vueRef.$notify.error({
      title: '重新登录',
      message: '未登录或会话过期，请重新登录'
    });
    localStorage.removeItem('JWT')
    localStorage.removeItem('UID')
    vueRef.$router.push("/login")
  }
});

export const get = (url, params, options) => {
  return request({
    url,
    method: 'get',
    // 路径参数
    params,
    ...options,
  })
}

export const post = (url, data, options) => {
  return request({
    url,
    method: 'post',
    /*
    * 需要用Qs库解析一下，让后端可以以 application/x-www-form-urlencoded 的形式收到参数
    * */
    data: Qs.stringify(data)
    /*
    * 设置content-type后，后端也不能以application/x-www-form-urlencoded 的形式收到参数
    * 仍需要以 application/json 格式接收，即需要使用 @RequestBody 来转化参数
    * */
    // headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
}

export const isRefInit = () => {
  return vueRef !== null;
}

export const initRef = (ref) => {
  vueRef = ref;
}




















