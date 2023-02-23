/**
 * @Description: 经营财务-会计管理-财务月度结算报表-费用报表-制造费用明细表
 * @Author: Wang ShuYu
 * @Date: 2022-10-10
 */
import { ALIGN_LEFT, ALIGN_RIGHT, ALIGN_CENTER } from '@/utils/Constant'

const fileName = 'EBEB203R.xlsx'

const EBEB203R_Excel_Setting = [
  { width: { wch: 10 }, label: '序号', align: ALIGN_CENTER},
  { width: { wch: 18 }, label: '区分', align: ALIGN_CENTER},
  { width: { wch: 18 }, label: '合计', align: ALIGN_RIGHT},
  { width: { wch: 18 }, label: '小计', align: ALIGN_RIGHT},
  { width: { wch: 18 }, label: '制造费用', align: ALIGN_RIGHT },
  { width: { wch: 25 }, label: '费用明细', align: ALIGN_LEFT },
  { width: { wch: 18 }, label: '合计', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '小计', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '组立一部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '舾装涂装部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '品质管理部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '建设工务部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '建设管理部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '组立二部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '搭载部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '加工部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '建设工务部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '资材部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '设计技术部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: 'IT部', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '生产担当', align: ALIGN_RIGHT },
  { width: { wch: 18 }, label: '支援担当', align: ALIGN_RIGHT }
]

const colWidthSetting = EBEB203R_Excel_Setting.map(setting => setting.width)

// Excel中每一列的对齐配置信息
const dataAlignSetting = EBEB203R_Excel_Setting.map(setting => setting.align)

// 默认表头，列标题（距离数据最近的一行表头）
const header = EBEB203R_Excel_Setting.map(setting => setting.label)

export const EBEB203R_EXCEL_SETTING = {
  isSingleHeader: true,
  dataAlignSetting,
  colWidthSetting,
  fileName,
  header
}

