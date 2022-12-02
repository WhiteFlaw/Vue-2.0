/**
* @description 报表弹窗容器组件
* @author M.Ming
* @date 2022/3/11 15:18
*/
<template>
  <el-dialog fullscreen class="report-dialog-wrapper"
             :visible="reportDialogVisible"
             destroy-on-close
             :modal="false"
             @open="openDialog"
             @close="closeReportDialog"
             @closed="dialogClosed">
    <header slot="title" v-if="reportDialogVisible">
      <el-tooltip class="item" effect="light" :content="$t('SEARCH')" placement="bottom" v-if="!noSearchBtn">
        <el-button plain @click="reportQuery" class="print-btn">
          <svg-icon icon-class="search"/>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="light" :content="$t('HMG_PRINT')" placement="bottom" v-if="!noPrintBtn">
        <el-button plain @click="reportPrint" :disabled="disablePrint" class="print-btn">
          <svg-icon icon-class="print"/>
        </el-button>
      </el-tooltip>
      <el-button plain id="do-print-btn" v-print="printObj"
                 :ref="`${reportId}-report-btn`"/>
      <el-tooltip class="item" effect="light" :content="$t('EXCEL_OUT')" placement="bottom" v-if="!noExcelOutBtn">
        <el-button plain @click="reportExcelOut" class="excel-output" :loading="excelOutLoading">
          <svg-icon icon-class="excel"/>
        </el-button>
      </el-tooltip>
      <slot name="report-other-button"/>
    </header>
    <template v-if="!printFlag">
      <section class="report-body-wrapper" :id="`${reportId}-report-preview`">
        <slot name="report-preview-container"/>
      </section>
    </template>
    <template v-else>
      <section class="report-body-wrapper print-container" :id="`${reportId}-report-print`">
        <slot name="report-print-container"/>
      </section>
    </template>
  </el-dialog>
</template>
<script>

export default {
  name: 'ReportDialogWrapper',
  props: {
    reportDialogVisible: { // 弹窗显示隐藏
      type: Boolean,
      default: false
    },
    noSearchBtn: { // 查询按钮显示隐藏，默认显示
      type: Boolean,
      default: false
    },
    disablePrint: { // 无数句时禁用打印按钮
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
    reportId: { // 接收打印区域id名称，用于打印除按钮外所有报表内容
      type: String,
      default: ''
    },
    reportTitle: { // 接收名称，用于打印除按钮外所有报表内容
      type: String,
      default: ''
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
        openCallback(vue) { // 打印窗口弹出后的回调
        },
        closeCallback(vue) { // 关闭了打印工具后，回调
          vue.printFlag = false
          vue.$emit('report-print', vue.printFlag)
          vue.removePrintStyle()
          // console.log('close-print-dialog')
        }
      }
    }
  },
  methods: {
    // 打开弹窗时触发方法暴露给父级
    openDialog() {
      this.$emit('open-dialog')
    },
    // 关闭报表弹窗
    closeReportDialog() {
      this.$emit('close-report-dialog', false)
    },
    dialogClosed() {
      this.$emit('report-dialog-closed')
    },
    // 查询触发事件传给父级
    reportQuery() {
      this.$emit('report-query')
    },
    // 打印触发方法暴露给父级
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
    // Excel导出触发方法暴露给父级
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
  height: 100%;
  margin: 0 1px;
}

#do-print-btn {
  display: none;
}
</style>
