import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import store from '@/store'
import router from '@/router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30 * 60 * 1000 // request timeout, 系统中存才查询缓慢的问题，所以延长请求过期时间
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    const token = getToken()
    const language = store.state.app.language

    if (token) {
      // let each request carry token
      // ['Authorization'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = token
      config.headers['DSSC-ERP-Language'] = language
    }
    return config
  },
  error => {
    // do something with request error
    console.log('requestErr:', error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res.code === '0000') { // When the sent request responds successfully
      return res.data
    } else if (res.code === '9997') { // Failed to send a request if the corresponding language code exists in the background
      if (res.data && Object.keys(res.data).length > 0) {
        // 当后台返回报错信息中携带额外的报错信息，需要将整个res返回给前端
        return res
      } else {
        return res.msg
      }
    } else if (res.code === '8999') { // token 过期，重新登录
      store.dispatch('user/resetToken').then(() => {
        location.reload()
      })
    } else {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res.msg || 'Server Error')
    }
  },
  error => {
    console.log('responseErr:', error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    router.push('/server-error')
    return Promise.reject(error)
  }
)

export default service

