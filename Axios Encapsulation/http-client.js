/**
 * @Description: request封装
 * @Author: %%$%^$^^*(&*
 * @Date: 21/12/4
 */
import request from '@/utils/request'

/**
 * 发送GET请求
 * @param url
 * @param params
 * @returns {AxiosPromise}
 * @constructor
 */
export function GET(url, params = {}) {
  return request({
    url,
    params,
    method: 'get'
  })
}

/**
 * 发送POST请求
 * @param url
 * @param data
 * @param params
 * @returns {AxiosPromise}
 * @constructor
 */
export function POST(url, data = {}, params = {}) {
  return request({
    url,
    data,
    params,
    method: 'post'
  })
}

/**
 * 发送PUT请求
 * @param url
 * @param data
 * @param params
 * @returns {AxiosPromise}
 * @constructor
 */
export function PUT(url, data = {}, params = {}) {
  return request({
    url,
    data,
    params,
    method: 'put'
  })
}

/**
 * 发送DELETE请求
 * @param url
 * @param data
 * @param params
 * @returns {AxiosPromise}
 * @constructor
 */
export function DELETE(url, data = {}, params = {}) {
  return request({
    url,
    data,
    params,
    method: 'delete'
  })
}

/**
 * 上传文件请求
 * @param formData formData中必须包含files, targetFolder参数
 * @returns {AxiosPromise}
 */
export function UPLOAD_FILE(formData) {
  return request({
    method: 'POST',
    url: '/base/upload/files',
    data: formData
  })
}

