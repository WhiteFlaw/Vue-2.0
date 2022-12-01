# 基本结构
每个页面有一个专属的js文件存储自己的状态, 一个模块有一个index文件引入收集并集中导出该模块内所有页面状态文件.

```
页面A.js----
           |
页面B.js--- ---页面层--组1-index.js---
           |                        |
页面C.js----                        |
                                    |---模块层--模块1-index.js
                                    |                |
                                    |                |
页面D.js-----------------------------                 |
                                                     |-------------系统A-index.js
                                                     |                   |
                                                     |                   |
页面F.js----                                         |                   |
           |---页面层--组2-index.js---模块层--模块2-index.js              |
页面J.js----                                                             |
                                                                         |
                                    app.js-------------------------------|----index.js
                                                                         | 
 页面I.js----------------------------                                    |
                                     |                                   |
                                     |---模块层--模块3-index.js           |
                                     |                |                  |
页面G.js----                         |                |                   |
           |---页面层--组5-index.js---                |                   |
页面K.js----                                          |-------------系统B-index.js
                        模块配置.js-----              |
                                       |             |
页面L.js----                           |              |
           |---页面层--组6-index.js--------模块层--模块4-index.js
页面M.js----    
---
```

---

# 页面
最弱小的一层, 管理单个页面的状态, 将自己的namespaced, mutations, actions, state导出, 然后在组层的index集中引入组合为组对象一起导出为该组的Vuex.
组织结构是常见的Vuex结构, 分为state, mutations, actions部分, 操作state必须经由mutations, 这虽然非必须但是不经由mutations之手操作state, vuex将无法监测变动.
对state进行的数据处理操作放到actions.
```javascript
/**
 * @description 经营财务
 * @author Wang ShuYu
 * @date 2022-09-20
 */

import {
  EBEB201RBranchSearch
  // EBEB201RMainSearch
} from '@/api/EBE/EBEB201R'

const state = {
  reportId: 'ebeb201r', // 报表id
  reportTitle: '费用月度表（一）', // 报表标题
  dataTotal: 0,
  reportDataNoPag: [], // 报表全部记录无分页
  reportTableAllData: [],
  reportTableData: [], // 报表当前数据
  columnTotal: [], // 纵向总计
  pageSize: 0,
  pageTotal: 0,
  pageIndex: 1,
  tableDate: '',
  tableLoading: false,
  sonEvent: 0,
  formRow: { label: '会计机构', value: '公司' },
  reportTableEvent: [
    [
      { label: '序号', colspan: 1, rowspan: 2, minWidth: '50px' },
      { label: '区分', colspan: 1, rowspan: 1, minWidth: '150px' },
      { label: '合计', colspan: 1, rowspan: 2, minWidth: '100px' },
      { label: '小计', colspan: 1, rowspan: 2, minWidth: '100px' },
      { label: '制造费用', colspan: 14, rowspan: 1, minWidth: '80px' }
    ],
    [
      { label: '费用明细', colspan: 1, rowspan: 1, minWidth: '150px' }
    ]
  ],
  excelOutFlag: false,
  beforeOutData: [],
  printFlag: false,
  reportPrintData: [[]],
  printConfig: {
    size: 'A4 landscape',
    zoom: 0.4
  }
}

const mutations = {
  SET_REPORT_TABLE_DATA(state, data) { // 报表当前数据
    state.reportTableData = data
  },
  SET_REPORT_TABLE_ALL_DATA(state, data) { // 报表全部数据
    state.reportTableAllData = data
  },
  SET_REPORT_DATA_NO_PAG(state, data) { // 报表全部记录
    state.reportDataNoPag = data
  },
  SET_PAGE_SIZE(state, data) { // 每页记录数
    state.pageSize = data
  },
  SET_PAGE_TOTAL(state, data) { // 总页数
    state.pageTotal = data
  },
  SET_DATA_TOTAL(state, data) { // 总页数
    state.dataTotal = data
  },
  SET_PAGE_INDEX (state, data) { // 当前页
    state.pageIndex = data
  },
  SET_TABLE_LOADING(state, data) { // 加载控制
    state.tableLoading = data
  },
  SET_TABLE_DATE(state, data) { // 报表日期
    state.tableDate = data
  },
  SET_TABLE_EVENT (state, event) { // 表头(仅初始化使用)
    state.reportTableEvent[1] = [
      { label: '费用明细', colspan: 1, rowspan: 1, minWidth: '150px' },
      ...event
    ]
    state.reportTableEvent[0][4].colspan = state.sonEvent = event.length
  },
  SET_COLUMN_TOTAL(state, data) { // 纵总计
    state.columnTotal = data
  },
  SET_BEFORE_OUT_DATA(state, data) { // Excel未分页数据
    state.beforeOutData = data
  },
  SET_REPORT_PRINT_DATA(state, data) { // 打印分页数据
    state.reportPrintData = data
  },
  SET_PRINT_FLAG(state, data) { // 打印判定
    state.printFlag = data
  },
  SET_EXCEL_OUT_FLAG(state, data) { // excel导出判定
    state.excelOutFlag = data
  },
  RESET_STATE (state, callback) { // 重置报表
    callback()
  }
}

const actions = { ////action
  generateTableEvent ({ commit }, branchSearchRes) { // 生成表头
    const headerArr = Array.from(new Set(branchSearchRes.map(item => item.oganNameKor)))
    const temArr0 = []
    headerArr.forEach((item) => {
      temArr0.push({ label: item, colspan: 1, rowspan: 1, minWidth: '80px' })
    })
    commit('SET_TABLE_EVENT', temArr0)
  },

  getDataNoPaging ({ state, commit }, branchSearchRes) { // 构建行
    const temArr1 = []
    for (let i = 0; i <= branchSearchRes.length; i += state.reportTableEvent[0][4].colspan) {
      temArr1.push(branchSearchRes.slice(i, i + state.reportTableEvent[0][4].colspan))
    }
    const temArr2 = []
    for (let i = 0; i < temArr1.length - 1; i++) {
      const temObj = {}
      temObj.id = i + 1
      temObj.hj = temArr1[i][0].hj
      temObj.maccNameKor = temArr1[i][0].maccNameKor
      for (let j = 0; j <= temArr1[i].length - 1; j++) {
        temObj['trxnAmt' + j] = temArr1[i][j].trxnAmt
      }
      temArr2.push(temObj)
    }
    commit('SET_DATA_TOTAL', temArr2.length)
    commit('SET_REPORT_DATA_NO_PAG', temArr2)
  },

  getEventTotalRow ({ commit }) { // 计算横向小计
    let sum
    const fakeReportDataNoPag = state.reportDataNoPag.slice()
    fakeReportDataNoPag.forEach((obj) => {
      sum = 0
      for (let j = 0; j < state.reportTableEvent[0][4].colspan; j++) {
        if (obj['trxnAmt' + j] !== '') {
          sum += Number(obj['trxnAmt' + j])
        }
      }
      obj['xj'] = sum.toFixed(2)
    })
    commit('SET_REPORT_DATA_NO_PAG', fakeReportDataNoPag)
  },

  getEventTotalColumn ({ commit }) { // 计算纵向总计
    let sum = 0
    const allColumnTotal = {}
    const allProperties = Object.keys(state.reportDataNoPag[0])
    allProperties.forEach((item) => {
      sum = state.reportDataNoPag.reduce((previousValue, currentValue) => {
        return previousValue + Number(currentValue[item])
      }, 0)
      allColumnTotal[item] = sum.toFixed(2)
    })
    commit('SET_COLUMN_TOTAL', allColumnTotal)
  },

  getDataPaging ({ state, commit }) { // 构建页
    let totalPage
    const page = []
    const fakeReportTableAllData = []
    const fakeReportDataNoPag = state.reportDataNoPag.slice()
    if (fakeReportDataNoPag.length <= state.pageSize) {
      totalPage = 1
      fakeReportTableAllData.push(fakeReportDataNoPag)
    } else {
      totalPage = fakeReportDataNoPag.length % state.pageSize === 0
        ? parseInt(fakeReportDataNoPag.length / state.pageSize)
        : parseInt((fakeReportDataNoPag.length / state.pageSize) + 1)
      for (let i = 0; i <= fakeReportDataNoPag.length; i += state.pageSize) {
        page.push(fakeReportDataNoPag.slice(i, i + state.pageSize))
        fakeReportTableAllData.push(page)
      }
    }
    commit('SET_PAGE_TOTAL', totalPage)
    commit('SET_REPORT_TABLE_ALL_DATA', fakeReportTableAllData)
  },

  async initTableData({ commit, state, dispatch }, queryParams) { // 初始化报表
    commit('SET_TABLE_LOADING', true)
    commit('SET_PAGE_SIZE', 50)
    // const mainSearchRes = await EBEB201RMainSearch(queryParams)
    const branchSearchRes = await EBEB201RBranchSearch(queryParams)
    if (branchSearchRes.length > 0) { // 空数组会崩
      branchSearchRes.forEach((item) => {
        for (const key in item) {
          item[key] === null && (item[key] = '')
        }
      })
      await dispatch('generateTableEvent', branchSearchRes)
      await dispatch('getDataNoPaging', branchSearchRes)
      await dispatch('getEventTotalRow')
      await dispatch('getEventTotalColumn')
      await dispatch('getDataPaging')
      commit('SET_REPORT_TABLE_DATA', state.reportTableAllData[0]) // 初始化第一页数据
      commit('SET_TABLE_LOADING', false)
    } else {
      await dispatch('resetData')
    }
  },

  updateTableData ({ commit, state }, pageIndex) { // 更新报表数据
    commit('SET_TABLE_LOADING', true)
    const temArr = state.reportTableAllData[pageIndex - 1]
    commit('SET_REPORT_TABLE_DATA', temArr)
    commit('SET_PAGE_INDEX', pageIndex)
    commit('SET_TABLE_LOADING', false)
  },

  initActions ({ commit, state }) { // 初始化行为
    if (state.reportDataNoPag && state.printFlag) {
      commit('SET_REPORT_PRINT_DATA', state.reportTableAllData)
    }
    if (state.reportDataNoPag && state.excelOutFlag) {
      commit('SET_BEFORE_OUT_DATA', state.reportDataNoPag)
    }
  },

  resetData ({ commit }, params) { // 重置报表
    let copy
    if (params === 'copy') {
      copy = Object.assign(state)
      localStorage.setItem('rawState201', JSON.stringify(copy))
    } else {
      copy = JSON.parse(localStorage.getItem('rawState201'))
      commit('RESET_STATE', () => {
        for (const key in state) {
          state[key] = copy[key]
        }
        localStorage.removeItem('rawState201')
      })
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

```

# 页面层

