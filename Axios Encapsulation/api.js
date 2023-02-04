/**
 * @Description 经营财务-会计管理-财务月度结算报表-费用报表-制造费用明细累计表
 * @Author Wang ShuYu
 * @Date 2022-10-13
 */
import { GET, POST } from '@/utils/http-client'

/**
   * jasper 子查询
   * @param params
   * @returns { AxiosPromise }
   */
export function EBEB204RBranchSearch(params) {
  return GET('/ebe', params)
}

/**
   * 部门别录入错误查询
   * @param data
   * @returns { AxiosPromise }
   */
export function EBEB204RselEC010MDept(data) {
  return POST('/eb', data)
}


