<!-- 该组件打印方法需要基于vue-print-nb -->
<template>
  <page-card class="report-dialog-wrapper" is-report is-scroll-y is-scroll-x>
    <template v-slot:button-group>
      <div class="button-group">
        <el-button type="primary" icon="el-icon-search" @click="reportQuery" v-if="!noSearchBtn">{{
          $t('SEARCH')
        }}
        </el-button>
        <el-button type="primary" icon="el-icon-printer" @click="reportPrint" :disabled="disablePrint" v-if="!noPrintBtn">{{
          $t('HMG_PRINT')
        }}
        </el-button>
        <el-button plain id="do-print-btn" v-print="printObj"
                   :ref="`${reportId}-report-btn`"/>
        <el-button type="primary" icon="el-icon-download" @click="reportExcelOut" v-if="!noExcelOutBtn">
          {{ $t('EXCEL_OUT') }}
        </el-button>
        <slot name="report-other-button"/>
      </div>
    </template>
    <section class="report-body-wrapper" v-if="!printFlag" :id="`${reportId}-report-preview`">
      <slot name="report-preview-container"/>
    </section>
    <section class="report-body-wrapper print-container" v-else :id="`${reportId}-report-print`">
      <slot name="report-print-container"/>
    </section>
  </page-card>
</template>

<script>
import PageCard from '@/components/PageCard/index'

export default {
  name: 'ReportPageWrapper',
  components: {PageCard},
  props: {
    reportId: { // 接收打印区域id名称，用于打印除按钮外所有报表内容
      type: String,
      default: ''
    },
    reportTitle: { // 接收名称，用于打印除按钮外所有报表内容
      type: String,
      default: ''
    },
    disablePrint:{ // 无数据时，禁用打印按钮
      type: Boolean,
      default: false
    },
    noSearchBtn: { // 查询按钮显示隐藏，默认显示
      type: Boolean,
      default: false
    },
    noPrintBtn: { // 打印按钮显示隐藏，默认显示
      type: Boolean,
      default: false
    },
    noExcelOutBtn: { // Excel导出按钮显示隐藏，默认显示
      type: Boolean,
      default: false
    },
    printConfig: {
      type: Object,
      default: () => {
        return {
          size: 'A4 landscape',
          zoom: '0.6',
          fontSize:'12pt'
        }
      }
    }
  },
  data() {
    return {
      printFlag: false,
      excelOutLoading: false
    }
  },
  computed: {
    printObj() {
      return {
        id: `${this.reportId}-report-print`,
        preview: false, // 显示预览窗口
        previewTitle: `${this.reportId}-${this.reportTitle}`, // 打印预览页面的标题
        // extraCss: 'https://unpkg.com/element-ui/lib/theme-chalk/index.css',
        beforeOpenCallback(vue) { // 打印页面打开之前，回调
          vue.printLoading = true
        },
        openCallback(vue) { // 执行了打印后，回调
        },
        closeCallback(vue) { // 关闭了打印工具后，回调
          vue.printFlag = false
          vue.$emit('report-print', vue.printFlag)
          vue.removePrintStyle()
        }
      }
    }
  },
  methods: {
    // 报表数据查询
    reportQuery() {
      this.$emit('report-query')
    },
    //  打印触发方法暴露给父级
    reportPrint() {
      this.printFlag = true
      this.addPrintStyle()
      this.$nextTick(() => {
        this.$emit('report-print', this.printFlag)
      })
    },
    // 动态添加打印样式
    addPrintStyle() {
      const head = document.getElementsByTagName('head')[0]
      const style = document.createElement('style')
      style.setAttribute('type', 'text/css')
      style.setAttribute('id', `${this.reportId}-style`)
      style.innerText = `@media print { @page { size: ${this.printConfig.size}; margin: 8mm; } #p-${this.reportId} { zoom: ${this.printConfig.zoom} } #p-${this.reportId} .pure-table { font-size: ${this.fontSize || '12pt'} } }`
      head.appendChild(style)
    },
    // 动态删除打印样式
    removePrintStyle() {
      document.getElementById(`${this.reportId}-style`).remove()
    },
    //  Excel导出触发方法暴露给父级
    reportExcelOut() {
      this.excelOutLoading = true
      this.$emit('report-excel-out')
      setTimeout(() => {
        this.excelOutLoading = false
      }, 2000)
    }
  }
}
</script>

<style scoped lang="scss">
.report-body-wrapper {
  margin: 0 1px;
}
#do-print-btn {
  display: none;
}
</style>
