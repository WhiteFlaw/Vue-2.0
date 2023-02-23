/*
 * @author %^&(^&^^&
 * @date 2022/7/4 13:47
 * @description index
 */

import { EBEReportModules } from '@/store/modules/report/EBE'
import { EBE_1ReportModule } from '@/store/modules/report/EBE_1'
import { EBFReportModule } from '@/store/modules/report/EBF'

export const ReportModules = {
  ...EBEReportModules,
  ...EBE_1ReportModule,
  ...EBFReportModule
}