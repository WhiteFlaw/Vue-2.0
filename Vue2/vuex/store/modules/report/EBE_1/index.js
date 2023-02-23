/**
* @author %^&(^&^^&
* @date 2022/7/4 13:47
* @description index
* @update 2022/7/4 13:47
*/

import { EBECCReportModules } from '@/store/modules/report/EBE_1/EBEC_C'
import { EBECReportModule } from '@/store/modules/report/EBE_1/EBEC'
import { EBEBReportModule } from '@/store/modules/report/EBE_1/EBEB'
import { EBEBBReportModule } from '@/store/modules/report/EBE_1/EBEBB'
import { EBEWReportModule } from '@/store/modules/report/EBE_1/EBEW'
import { EBEYReportModule } from '@/store/modules/report/EBE_1/EBEY'
import { E_C_ZZZReportModule } from '@/store/modules/report/EBE_1/E_C_ZZZ' // 上述页面层

export const EBE1ReportModules = {
  ...EBECReportModule,
  ...EBEBReportModule,
  ...EBECCReportModules,
  ...EBEWReportModule,
  ...EBEYReportModule,
  ...EBEBBReportModule,
  ...E_C_ZZZReportModule
}