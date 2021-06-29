import axios from 'axios'
// import qs from 'qs'
import {
  message
} from 'antd';

// 创建axios实例
const service = axios.create({
  timeout: 60 * 1000 // 请求超时时间
})
// 添加请求拦截器)
service.interceptors.request.use(
  config => {
    // 给请求加上请求头
    if (sessionStorage.token && sessionStorage.token !== 'undefined') {
      config.headers.Authorization = sessionStorage.token
    }
    // removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发的请求
    // addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中
    // 在发送请求之前做某件事，譬如这里可以把参数序列化
    if (config.method === 'post') {
      // config.data = qs.stringify(config.data);
    }
    return config
  },
  error => {
    console.log('错误的传参')
    // Do something with request error
    return Promise.reject(error)
  }
)
// respone拦截器，返回状态判断(添加响应拦截器)
service.interceptors.response.use(
  response => {
    // removePendingRequest(response.config); // 从pendingRequest对象中移除请求
    if (response.data.msg !== "success") {
      message.error(response.data.data || '接口异常');
      return '';
    } else {
      return response.data;
    }
  },
  error => {
    // removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求
    message.error("接口未知错误");
    // if (error.response.status === 504 || error.response.status === 404) {
    //     message.error('"服务器失去响应！');
    // } else if (error.response.status === 401) {
    //     message.error("登录信息已经失效！");
    // } else if (error.response.status === 500) {
    //     message.error("服务器不可用！");
    // }else {
    //   message.error("接口位置错误");
    // }
    return Promise.reject(error)
  }
)
export default service;