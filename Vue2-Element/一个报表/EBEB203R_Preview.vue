<!--
  @Description: 经营财务-会计管理-财务月度结算报表-费用报表-制造费用明细表
  @Author: %^&^&*^&
  @Date: 2022-10-10
-->
<template>
  <order-report-layout :layout-setting="layoutSetting">
    <template v-slot:order-header>
      <report-header-row>
        <template v-slot:report-header-row-center>
          <div style="margin: 0 auto;">
            <div style="display:flex; flex-direction:column; align-items:center;">
              <report-title-wrapper :report-title="reportTitle" class="tableTitle"/>
              <div v-if="tableDate !== ''" style="font-size: 18px;">{{ tableDate }}</div>
            </div>
          </div>
        </template>
        <template v-slot:report-header-row-right>
          <report-signature-area :signature-data="reportSignatureData"/>
        </template>
      </report-header-row>
    </template>
    <template v-slot:order-num>
      会计机构：大宇造船海洋（山东）有限公司
    </template>
    <template v-slot:page-number>
      单位：元
    </template>
    <template v-slot:order-data-table>
      <table class="pure-table" :id="excelOutFlag ? `${reportId}-table-excel` : ''" style="font-size:14px;">
        <thead>
          <tr v-for="(tr, trIndex) in reportTableEvent" :key="trIndex" class="report-table-header-row">
            <th v-for="(th, thIndex) in tr" :key="thIndex" :colspan="th.colspan" :rowspan="th.rowspan" :style="`min-width: ${th.minWidth}`">
              {{ th.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in stableTableData" :key="rowIndex" :class="`report-table-body-row ${row.xj ? `row_yel` : ''}`">
            <td v-if="row.idRowSpan" :rowspan="row.idRowSpan" class="text-align-center">{{ row.id }}</td>
            <td v-if="row.tagRowSpan" :rowspan="row.tagRowSpan" class="text-align-center">{{ row.tag }}</td> <!-- v-show会导致excel导出格式错误 -->
            <td :class="row.xj ? `text-align-center` : `text-align-left`" :colspan="row.xj ? 2 : 1">{{ row.saccNameKor }}</td>
            <template v-for="(son, sonIndex) in sonEvent">
              <td class="text-align-right" :key="sonIndex">{{ numberToCurrencyNo(row[son.oganCode], 2, true) }}</td>
            </template>
          </tr>
          <tr v-if="pageIndex == pageTotal">
            <td colspan="3" class="text-align-center">-- 总计 --</td>
            <td v-for="(item, indexs) in columnTotal" :key="indexs" class="text-align-right">
              {{ item === '' ? '' : numberToCurrencyNo(item) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>
    <template v-slot:pagination>
      <Pagination
        v-show="!printFlag"
        v-if="dataTotal > 0"
        :total="dataTotal"
        :page="pageIndex"
        :limit="pageSize"
        @pagination="changePage"
      />
    </template>
    <template v-slot:order-footer>
      <report-pagination :page.sync="stablePageNumber" :total-page="pageTotal">
        <div slot="pagination-right">
          大宇造船海洋（山东）有限公司
        </div>
      </report-pagination>
    </template>
  </order-report-layout>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import { numberToCurrencyNo } from '@/utils/tools'
import OrderLayout from '@/views/material/components/report/OrderLayout'
import ReportPagination from '@/views/finance/components/ReportPagination'
import ReportHeaderRow from '@/components/ReportComponents/ReportHeaderRow'
import ReportTitleWrapper from '@/components/ReportComponents/ReportTitleWrapper'
import ReportSignatureArea from '@/components/ReportComponents/ReportSignatureArea'
import OrderReportLayout from '@/views/material/components/report/OrderReportLayout'

export default {
  name: 'Ebeb203rPreview',
  components: {
    Pagination,
    ReportHeaderRow,
    ReportPagination,
    OrderReportLayout,
    ReportTitleWrapper,
    ReportSignatureArea
  },
  props: {
    printData: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: () => 1
    },
    layoutSetting: {
      type: OrderLayout,
      default: () => {
        const setting = new OrderLayout()
        setting.showOrderNum = true
        setting.showOrderDetail = false
        return setting
      }
    }
  },
  data() {
    return {
      reportSignatureData: [ // 右侧签名区
        {
          columns: [this.$t('ELE_LIBDV_6F'), this.$t('ECCH_KZ'), this.$t('ECCH_BZ'), this.$t('总经理')]
        }
      ]
    }
  },
  computed: {
    ...mapState('EBEB203R', [
      'reportId',
      'pageSize',
      'tableDate',
      'pageIndex',
      'pageTotal',
      'dataTotal',
      'sonEvent',
      'printFlag',
      'reportTitle',
      'columnTotal',
      'allRowTotal',
      'excelOutFlag',
      'reportTableData',
      'reportTableEvent'
    ]),
    stableTableData() {
      return this.printFlag ? this.printData : this.reportTableData
    },
    stablePageNumber() {
      return this.printFlag ? this.index : this.pageIndex
    }
  },
  methods:{
    numberToCurrencyNo,
    ...mapActions('EBEB203R', ['updateTableData', 'initTableData']),
    changePage(page) { // 翻页事件
      this.updateTableData(page.page)
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/views/finance/EBE_1/E_C_ZZZ/components/E_C_ZZZColor';

::v-deep .page-num-row {
  & > .el-col.el-col-24 {
    &:first-child {
      width: 90%;
    }

    &:last-child {
      width: 10%;
      line-height: 30px;
    }
  }
}

.row_yel {
  background-color: $sheet_yel;
}
</style>

