<template>
  <Table ref="new-el-table" v-bind="$attrs" v-on="$listeners" @header-dragend="headerDragend" v-table-resize>
    <slot></slot>
    <template slot="append">
      <slot name="append"></slot>
    </template>
  </Table>
</template>

<script>
import {Table} from 'element-ui'

export default {
  name: 'NewElTable',
  components: {Table},
  directives: {
    tableResize: {
      bind: function (el, binding, vnode, oldVnode) {

      },
      inserted: function (el, binding, vnode, oldVnode) {
        if (vnode.componentInstance.$refs['headerWrapper'] && vnode.componentInstance.$refs['headerWrapper'].offsetHeight) {
          if (vnode.componentInstance.$refs['bodyWrapper']) {
            vnode.componentInstance.$refs['bodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
          if (vnode.componentInstance.$refs['rightFixedBodyWrapper']) {
            vnode.componentInstance.$refs['rightFixedBodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
          if (vnode.componentInstance.$refs['fixedBodyWrapper']) {
            vnode.componentInstance.$refs['fixedBodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
        }
      },
      update: function (el, binding, vnode, oldVnode) {
        if (vnode.componentInstance.$refs['headerWrapper'] && vnode.componentInstance.$refs['headerWrapper'].offsetHeight) {
          if (vnode.componentInstance.$refs['bodyWrapper']) {
            vnode.componentInstance.$refs['bodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
          if (vnode.componentInstance.$refs['rightFixedBodyWrapper']) {
            vnode.componentInstance.$refs['rightFixedBodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
          if (vnode.componentInstance.$refs['fixedBodyWrapper']) {
            vnode.componentInstance.$refs['fixedBodyWrapper'].style.top = vnode.componentInstance.$refs['headerWrapper'].offsetHeight + 'px'
          }
        }
      },
      componentUpdated: function (el, binding, vnode, oldVnode) {

      }
    }
  },
  mounted() {
    this.layoutTable()
  },
  activated() {
    this.layoutTable()
  },

  methods: {
    // 强制表格重绘
    layoutTable() {
      const data = this.$attrs.data
      if (Array.isArray(data) && data.length) {
        this.$refs['new-el-table'].doLayout()
      }
      // console.log(this.$refs['new-el-table'])
      // this.$refs['new-el-table'].$refs['bodyWrapper'].style.top = this.$refs['new-el-table'].$refs['headerWrapper'].offsetHeight + 'px'
      // if (this.$refs['new-el-table'].$refs['rightFixedBodyWrapper']) {
      //   this.$refs['new-el-table'].$refs['rightFixedBodyWrapper'].style.top = this.$refs['new-el-table'].$refs['headerWrapper'].offsetHeight + 'px'
      // }
      // if (this.$refs['new-el-table'].$refs['fixedBodyWrapper']) {
      //   this.$refs['new-el-table'].$refs['fixedBodyWrapper'].style.top = this.$refs['new-el-table'].$refs['headerWrapper'].offsetHeight + 'px'
      // }
      // this.$nextTick(() => {
      //   const tables = document.getElementsByClassName('el-table__header-wrapper')
      //   console.log(tables)
      //   for (let i = 0; i < tables.length; i++) {
      //     console.log(tables[i], tables[i].clientHeight)
      //     const tableHeader = tables[i].parentElement.getElementsByClassName('el-table__body-wrapper')
      //     if (tableHeader && tableHeader.length) {
      //       tableHeader[0].style.top = tables[i].clientHeight + 'px'
      //     }
      //     const fixedBody = tables[i].parentElement.getElementsByClassName('el-table__fixed-body-wrapper')
      //     if (fixedBody && fixedBody.length) {
      //       fixedBody[0].style.top = tables[i].clientHeight + 'px'
      //     }
      //   }
      // })
    },
    // 统一处理表头拖拽
    headerDragend(newWidth, oldWidth, column, event) {
      this.$emit('header-dragend', newWidth, oldWidth, column, event)
      this.layoutTable()
    },
    // 传递el-table原生方法
    clearSelection() {
      this.$refs['new-el-table'].clearSelection()
    },
    toggleRowSelection(row, selected) {
      this.$refs['new-el-table'].toggleRowSelection(row, selected)
    },
    toggleAllSelection() {
      this.$refs['new-el-table'].toggleAllSelection()
    },
    toggleRowExpansion(row, expanded) {
      this.$refs['new-el-table'].toggleRowExpansion(row, expanded)
    },
    setCurrentRow(row) {
      this.$refs['new-el-table'].setCurrentRow(row)
    },
    clearSort() {
      this.$refs['new-el-table'].clearSort()
    },
    clearFilter(columnKey) {
      this.$refs['new-el-table'].clearFilter(columnKey)
    },
    doLayout() {
      this.$refs['new-el-table'].doLayout()
    },
    sort(prop, order) {
      this.$refs['new-el-table'].sort(prop, order)
    }
  }

}
</script>

<style scoped lang="scss">

</style>
