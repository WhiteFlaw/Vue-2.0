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

# 页面层
管理单个页面的状态, 将自己的namespaced, mutations, actions, state导出, 然后在组层的index集中引入组合为组对象一起导出为该组的Vuex.
组织结构是常见的Vuex结构, 分为state, mutations, actions部分, 操作state必须经由mutations, 这虽然非必须但是不经由mutations之手操作state, vuex将无法监测变动.
对state进行的数据处理操作放到actions.
```javascript
/**
 * @description 经营财务-^*^&^*
 * @author Wang ShuYu
 * @date 2022-09-20
 */

import { EBEB203RBranchSearch } from '@/api/EBE/EBEB203R'

const state = {
  reportId: 'ebeb203r', // 报表id
  reportTitle: '费用集计明细月度表（一）', // 报表标题
  dataTotal: 0,
  reportDataNoPag: [], // 报表全部记录无分页
  reportDataPag: [], // 报表全部数据分页
  rawReportDataPag: [],
  reportTableData: [], // 报表当前数据
  columnTotal: [], // 纵向总计
  rawRow: [],
  pageSize: 50,
  pageTotal: 0,
  pageIndex: 1,
  tableDate: '',
  sonEvent: [],
  tableLoading: false,
  formRow: { label: '会计机构', value: '大宇造船海洋（山东）有限公司' },
  reportTableEvent: [
    [
      { label: '序号', colspan: 1, rowspan: 2, minWidth: '40px;' },
      { label: '区分', colspan: 2, rowspan: 1 },
      { label: '合计', colspan: 1, rowspan: 1 },
      { label: '小计', colspan: 1, rowspan: 1 },
      { label: '制造费用', colspan: 18, rowspan: 1, minWidth: '20px;' }
    ],
    [
      { label: '费用明细', colspan: 1, rowspan: 1, minWidth: '150px' }
    ]
  ],
  // //////以下勿动
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
  SET_RAW_REPORT_DATA_PAG(state, data) { // 无小计已分页数据
    state.rawReportDataPag = data
  },
  SET_REPORT_DATA_PAG(state, data) { // 已分页数据
    state.reportDataPag = data
  },
  SET_REPORT_DATA_NO_PAG(state, data) { // 未分页数据
    state.reportDataNoPag = data
  },
  SET_REPORT_TABLE_DATA(state, data) { // 报表当前数据
    state.reportTableData = data
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
  SET_RAW_ROW (state, data) { // 原始行数据
    state.rawRow = data
  },
  SET_TABLE_LOADING(state, data) { // 加载控制
    state.tableLoading = data
  },
  SET_TABLE_DATE(state, data) { // 报表日期
    state.tableDate = data
  },
  SET_TABLE_EVENT (state, event) { // 表头(仅初始化使用)
    state.reportTableEvent[1] = [
      { label: '费用明细', colspan: 2, rowspan: 1, minWidth: '300px;' },
      ...event
    ]
    state.reportTableEvent[0][4].colspan = event.length
  },
  SET_SON_EVENT(state, data) { // 分类占位
    state.sonEvent = data
  },
  SET_COLUMN_TOTAL(state, data) { // 纵向总计
    state.columnTotal = data
  },
  SET_BEFORE_OUT_DATA(state, data) { // Excel待导出数据, 全部对象的数组
    state.beforeOutData = data
  },
  SET_REPORT_PRINT_DATA(state, data) { // 待打印数据, 各页的数据数组构成的二维数组
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

const actions = {
  generateTableEvent ({ commit }, headerArr) { // 构建表头
    const temArr0 = []
    headerArr.forEach((item) => {
      temArr0.push({
        label: item.oganNameKor,
        props: item.oganCode,
        colspan: 1,
        rowspan: 1,
        minWidth: '150px'
      })
    })
    commit('SET_SON_EVENT', headerArr)
    commit('SET_TABLE_EVENT', temArr0)
  },

  generateRow ({ commit }, [saccNameKorArr, mainSearchRes, headerArr]) { // 合成行数据
    const rowArr = []
    saccNameKorArr.forEach((saccNameKor, si) => {
      const rowObj = {}
      rowObj.saccNameKor = saccNameKor
      mainSearchRes.forEach((item) => {
        if (item.saccNameKor === saccNameKor) {
          rowObj.saccName = item.saccName
          headerArr.forEach((headerObj) => {
            if (item.oganCode === headerObj.oganCode) {
              rowObj[headerObj.oganCode] = item.trxnAmt
            }
          })
        }
      })
      rowArr[si] = { ...rowObj }
    })
    commit('SET_RAW_ROW', rowArr)
  },

  getDataNoPagWithTotalInside ({ commit }, [saccNameArr, headerArr]) { // 未分页数据
    const partArr = []
    const reportDataNoPag = []
    saccNameArr.forEach((saccName, saccNameIndex) => {
      partArr.push([])
      state.rawRow.forEach((row) => {
        if (row.saccName === saccName) { // 必须在此处提前规定id和tag, 二次分段添加会导致id重排
          row.id = saccNameIndex + 1
          row.tag = row.saccName
          partArr[saccNameIndex].push(row)
        }
      })

      const totalObj = {} // 段生成后小计推入段末, 段推入partArr直接组织未分页数据
      headerArr.forEach((headerObj) => {
        const total = partArr[saccNameIndex].reduce((prevVal, currVal) => { // 段小计
          if (currVal[headerObj.oganCode] !== null) {
            return prevVal + Number(currVal[headerObj.oganCode])
          } else {
            return prevVal + 0
          }
        }, 0)
        totalObj[headerObj.oganCode] = total === 0 ? '' : total.toFixed(2)
      })
      totalObj.xj = true
      totalObj.id = saccNameIndex + 1
      totalObj.saccNameKor = `-- 小计 --`
      partArr[saccNameIndex].push(totalObj)
      reportDataNoPag.push(...partArr[saccNameIndex])
    })
    commit('SET_REPORT_DATA_NO_PAG', reportDataNoPag)
    commit('SET_DATA_TOTAL', reportDataNoPag.length)
  },

  getDataPagWithTotalInside ({ commit, state }) { // 原始分页数据_无法直接使用
    let totalPage
    if (state.reportDataNoPag.length < state.pageSize) {
      totalPage = 1
    }
    if (state.reportDataNoPag.length % state.pageSize === 0) {
      totalPage = state.reportDataNoPag.length / state.pageSize
    } else {
      totalPage = parseInt(state.reportDataNoPag.length / state.pageSize) + 1
    }
    const rawReportDataPag = []
    for (let i = 0; i <= state.reportDataNoPag.length; i += state.pageSize) {
      rawReportDataPag.push(state.reportDataNoPag.slice(i, i + state.pageSize))
    }
    commit('SET_RAW_REPORT_DATA_PAG', rawReportDataPag)
    commit('SET_PAGE_TOTAL', totalPage)
  },

  // ////////////////////////////////////////////////////////////////////////
  // 重新组织当前页的saccNameArr以正确添加tagRowSpan和idRowSpan, 但是新的saccNameIndex不能用作id, 所以id在首次分段添加

  generateReportDataNow({ state, commit }) { // 生成可用分页数据
    const reportDataPag = []
    state.rawReportDataPag.forEach((page, pageIndex) => {
      const idArrNow = Array.from(new Set(page.map(item => item.id)))
      reportDataPag.push([])
      idArrNow.forEach((id) => {
        // 所有行都具备id, 可以避免特殊情况
        const temArr = []
        page.forEach((row) => {
          if (row.id === id) {
            temArr.push(row)
          }
        })
        temArr[0].tagRowSpan = temArr[temArr.length - 1].xj === undefined ? temArr.length : temArr.length - 1 // 防止最后一段无小计行的情况下被占位
        // 可以跟据本段最后一条是否为小计判定减不减1?
        temArr[0].idRowSpan = temArr.length
        reportDataPag[pageIndex].push(...temArr)
      })
    })
    commit('SET_REPORT_TABLE_DATA', reportDataPag[0])
    commit('SET_REPORT_DATA_PAG', reportDataPag)
  },

  // 用分页数据算, 所有小计求和
  getFinalTotal ({ commit }, headerArr) { // 构建底部总计数组
    const allXj = []
    const finalTotal = []
    state.reportDataPag.forEach((page) => {
      page.forEach((row) => {
        if (row.xj === true) {
          allXj.push(row)
        }
      })
    })
    headerArr.forEach((headerObj) => {
      const total = allXj.reduce((prevVal, currVal) => {
        if (currVal[headerObj.oganCode] !== '') { // 合计小计有前空格,trim()
          return prevVal + Number(currVal[headerObj.oganCode])
        } else {
          return prevVal + 0
        }
      }, 0)
      finalTotal.push(total === 0 ? '' : total.toFixed(2))
    })
    commit('SET_COLUMN_TOTAL', finalTotal)
  },

  async initTableData ({ commit, dispatch }, queryParams) { // 初始化报表数据
    commit('SET_TABLE_LOADING', true)
    const mainSearchRes = await EBEB203RBranchSearch(queryParams)
    if (mainSearchRes.length > 0) { // 空数组会崩
      const allOganCode = mainSearchRes.map((item) => {
        return { 'oganCode': item.oganCode, 'oganNameKor': item.oganNameKor }
      })
      const headerArr = [...new Set(allOganCode.map(item => JSON.stringify(item)))].map(json => JSON.parse(json))
      const saccNameKorArr = Array.from(new Set(mainSearchRes.map(item => item.saccNameKor)))
      const saccNameArr = Array.from(new Set(mainSearchRes.map(item => item.saccName)))
      dispatch('generateTableEvent', headerArr)
      dispatch('generateRow', [saccNameKorArr, mainSearchRes, headerArr])
      dispatch('getDataNoPagWithTotalInside', [saccNameArr, headerArr])
      dispatch('getDataPagWithTotalInside')
      await dispatch('generateReportDataNow')
      dispatch('getFinalTotal', headerArr)
      commit('SET_TABLE_LOADING', false)
    }
  },

  updateTableData ({ commit, state }, pageIndex) { // 更新报表数据
    // 每次触发重组当前页数据, 防止同段遭分页导致格式错误
    commit('SET_PAGE_INDEX', pageIndex)
    const temArr = state.reportDataPag[pageIndex - 1]
    commit('SET_REPORT_TABLE_DATA', temArr) // 更新当前页数据
  },

  initActions ({ commit, state }) { // 初始化行为
    if (state.reportDataNoPag && state.printFlag) {
      commit('SET_REPORT_PRINT_DATA', state.reportDataPag)
    }
    if (state.reportDataNoPag && state.excelOutFlag) {
      commit('SET_BEFORE_OUT_DATA', state.reportDataNoPag)
    }
  },

  resetData ({ commit }, params) { // 重置报表
    let copy
    if (params === 'copy') {
      copy = Object.assign(state)
      localStorage.setItem('rawState203', JSON.stringify(copy))
    } else {
      copy = JSON.parse(localStorage.getItem('rawState203'))
      commit('RESET_STATE', () => {
        for (const key in state) {
          state[key] = copy[key]
        }
        localStorage.removeItem('rawState203')
      })
    }
  }
}

export default {
  namespaced: true,
  mutations,
  actions,
  state
}

```

# 页面层-index.js
组合各页面状态, 整体导出.
```javascript
/**
 * @Description 会计管理-%&*^*(&^*%$%&
 * @Author Wang ShuYu
 * @Date 2022-09-20
 */

import EBEB201R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB201R'
import EBEB202R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB202R'
import EBEB203R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB203R'
import EBEB204R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB204R'
import EBEB205R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB205R'
import EBEB206R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB206R'
import EBEB207R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB207R'
import EBEB208R from '@/store/modules/report/EBE_1/E_C_ZZZ/modules/EBEB208R'

export const E_C_ZZZReportModule = {
  EBEB201R, // $%#$%#$$
  EBEB202R, // &^*%%^$
  EBEB203R, // $^%$^%^
  EBEB204R, // )(*(*&&*^&
  EBEB205R, // #$^%%&%^
  EBEB206R, // %^&%*&^*&^&*
  EBEB207R, //$%&^^
  EBEB208R // ^&%*^&
}

```

# 模块层-index.js
同页面层结构, 将该模块下所有页面层集中导入然后一起导出, 同时可以把该模块适用的配置文件一并导出.
```javascript
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
```

---

# 系统层&配置文件&全局状态
## 配置文件-权限
```javascript
import {asyncRoutes, constantRoutes, lastRoutes} from '@/router'
import {loadAccessedMenu, loadMenuByCatalog} from '@/api/BASE/menu'
import {ROLE_ALL, ROLE_GOD, ROLE_SYSTEM} from '@/utils/Constant'
import {deepClone} from '@/utils'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 根据导航栏过滤侧边栏菜单
 * @param catalog
 * @param route
 * @returns {boolean} true: 表示应该显示
 */
function filterCatalog(catalog, route) {
  if (route.meta && route.meta.catalog) {
    return catalog === route.meta.catalog
  } else {
    return false
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = {...route}
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * 根据导航栏nav过滤路由表，生成侧边栏菜单
 * @param routes
 * @param nav: 只能是系统菜单三位标识符
 * @returns {*[]} 侧边栏菜单
 */
function filterRoutesByNav(routes, nav) {
  const res = []
  routes.forEach(route => {
    const copiedRoute = {...route}
    if (filterCatalog(nav, copiedRoute)) {
      filterEmptyMenu(copiedRoute) // 过滤路由中的空白菜单
      res.push(copiedRoute)
    }
  })
  return res
}

/**
 * 过滤路由中的空白菜单
 * @param routerObj
 */
function filterEmptyMenu(routerObj = {}) {
  const children = routerObj.children
  if (children) { // 如果路由对象中有子路由
    if (children.length === 0) { // 如果子路由的个数为0，父路由不显示
      routerObj.hidden = true
    } else { // 如果子路由的个数不为零，递归判断每个子路由是否需要显示
      children.forEach(child => {
        filterEmptyMenu(child)
      })
      // 过滤后，如果路由下所有的子路由全部隐藏则该路由本身也设置为隐藏
      if (children.every(child => child.hidden)) {
        routerObj.hidden = true
      }
    }
  }
}

/**
 * 拉平带有权限的路由
 * @param routes 路由数组
 * @param breadcrumb 可选
 * @param baseUrl 可选
 * @returns {*[]}
 */
function flatAsyncRoutes(routes, breadcrumb = [], baseUrl = '') {
  const res = []
  routes.forEach(route => {
    const tmp = {...route}
    if (tmp.children) {
      let childrenBaseUrl = ''
      if (baseUrl === '') {
        childrenBaseUrl = tmp.path
      } else if (tmp.path !== '') {
        childrenBaseUrl = `${baseUrl}/${tmp.path}`
      }
      const tmpRoute = deepClone(route)
      tmpRoute.path = childrenBaseUrl
      delete tmpRoute.children
      res.push(tmpRoute)
      const childrenRoutes = flatAsyncRoutes(tmp.children, [], childrenBaseUrl)
      childrenRoutes.map(item => {
        // 如果 path 一样则覆盖，因为子路由的 path 可能设置为空，导致和父路由一样，直接注册会提示路由重复
        if (res.some(v => v.path === item.path)) {
          res.forEach((v, i) => {
            if (v.path === item.path) {
              res[i] = item
            }
          })
        } else {
          res.push(item)
        }
      })
    } else {
      if (baseUrl !== '') {
        if (tmp.path !== '') {
          tmp.path = `${baseUrl}/${tmp.path}`
        } else {
          tmp.path = baseUrl
        }
      }
      res.push(tmp)
    }
  })
  return res
}

/**
 * 将路由列表重新组合成2级路由，以便页面缓存
 * @param list 路由列表
 * @returns {*[]|*}
 */
function formatTwoStageRoutes(list) {
  if (list.length <= 0) return list
  const routerList = []
  list.forEach(v => {
    if (v.path === '/') {
      routerList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      })
    } else if (['*', '/redirect', '/login', '/loginByMail', '/404'].includes(v.path)) {
      // 不需要配置layout的页面
      routerList.push(v)
    } else {
      routerList[0].children.push({...v})
    }
  })
  return routerList
}

/**
 * 将拉平后的路由进行重新组合
 * @param accessedRoutes
 * @returns {*[]}
 */
function generateFlatRoutes(accessedRoutes) {
  let flatRoutes = []
  try {
    // 将所有权限路由展平，用于缓存页面
    const flatAccessRoutes = flatAsyncRoutes(accessedRoutes)
    // 合并静态路由表
    const routes = constantRoutes.concat(flatAccessRoutes)
    // 将合并后的总路由表，处理成2层结构
    flatRoutes = formatTwoStageRoutes(routes)
    // 必须最后添加404路由
    flatRoutes.push(lastRoutes)
  } catch (e) {
    console.err(e)
  }
  return flatRoutes
}

/**
 * 递归查找路由数组中最后一级是否有isFav标记位，并设为false
 * @param routes
 * @returns {*[]}
 */
function recurveMenu(routes = []) {
  const menus = []
  if (routes.length) {
    routes.forEach((item, index) => {
      if (item.children && item.children.length) {
        recurveMenu(item.children)
      } else if (item.meta.isFav === '1') {
        item.meta.isFav = '0'
      }
      menus[index] = item
    })
  }
  return menus
}

/**
 * 为所有菜单的路由添加系统角色权限
 * @param routes 动态路由
 * @param roles 所有系统角色
 */
function addRolesForRoutes(routes = [], roles) {
  routes.forEach(route => {
    if (route.alwaysShow) {
      if (route.meta) {
        route.meta.roles = route.meta.roles || []
        route.meta.roles.push(...roles)
      }
      if (route.children) addRolesForRoutes(route.children, roles)
    }
  })
}

const state = {
  routes: [],
  sidebarRoutes: [],
  favRoutes: [],
  currentMemu: ''
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.routes = constantRoutes.concat(routes)
  },
  SET_SIDEBAR_ROUTES: (state, routes) => {
    state.sidebarRoutes = constantRoutes.concat(routes)
  },
  SET_FAV_ROUTES: (state, routes) => {
    state.favRoutes = constantRoutes.concat(routes)
  },
  SET_CURRENT_MENU: (state, data) => {
    state.currentMemu = data
  }
}

const actions = {
  /**
   * 根据用户id和角色获取所有可以访问的路由清单
   * @param commit
   * @param usrId
   * @param systemRole
   * @returns {Promise<Array>} 可以访问的路由清单
   */
  generateRoutes({commit}, {usrId, systemRole}) {
    // 为所有菜单的路由添加系统角色权限
    addRolesForRoutes(asyncRoutes, ROLE_ALL)
    return new Promise(resolve => {
      let accessedRoutes = []
      if (systemRole === ROLE_GOD || systemRole === ROLE_SYSTEM) {
        accessedRoutes = asyncRoutes
        commit('SET_ROUTES', accessedRoutes)
        resolve(generateFlatRoutes(accessedRoutes))
      } else {
        loadAccessedMenu(usrId).then(menuList => {
          const menuRoles = menuList
          if (usrId.length > 4) menuRoles.push(systemRole)
          accessedRoutes = filterAsyncRoutes(asyncRoutes, menuRoles)
          commit('SET_ROUTES', accessedRoutes)
          resolve(generateFlatRoutes(accessedRoutes))
        })
      }
    })
  },
  /**
   * 根据用户id，角色，顶部导航菜单生成侧边菜单列表
   * @param commit
   * @param state
   * @param catalog
   * @param usrId
   * @param systemRole
   */
  generateSidebar({commit, state}, {catalog, usrId, systemRole}) {
    if (catalog.length === 3) { // 只针对顶部导航栏点击，生成侧边栏菜单
      let sidebarRoutes = filterRoutesByNav(state.routes, catalog)
      sidebarRoutes = recurveMenu(sidebarRoutes) // 递归查找当前加载菜单，去除收藏标记位
      commit('SET_SIDEBAR_ROUTES', sidebarRoutes)
    } else {
      loadMenuByCatalog(catalog, usrId).then(menuList => {
        const menuRoles = menuList.map(menu => menu.pgmid)
        menuRoles.push(systemRole)
        const sidebarRoutes = filterAsyncRoutes(flatAsyncRoutes(asyncRoutes), menuRoles)
          .filter(route => !route.alwaysShow)
        sidebarRoutes.forEach(menu => { // 初始化时加载收藏标记位
          if (!menu.hidden) menu.meta.isFav = '1'
        })
        commit('SET_FAV_ROUTES', sidebarRoutes)
        commit('SET_SIDEBAR_ROUTES', sidebarRoutes)
      })
    }
  },
  // 获取收藏列表
  getFavSidebar({commit, state}, {usrId, systemRole}) {
    loadMenuByCatalog(usrId, usrId).then(menuList => {
      const menuRoles = menuList.map(menu => menu.pgmid)
      menuRoles.push(systemRole)
      const sidebarRoutes = filterAsyncRoutes(flatAsyncRoutes(asyncRoutes), menuRoles)
        .filter(route => !route.alwaysShow)
      sidebarRoutes.forEach(menu => { // 初始化时加载收藏标记位
        if (!menu.hidden) menu.meta.isFav = '1'
      })
      commit('SET_FAV_ROUTES', sidebarRoutes)
      // 判断当前是否显示收藏夹菜单，是，则更新，否，则不直接更新
      if (!state.currentMemu || /^[0-9]*$/g.test(state.currentMemu)) {
        commit('SET_SIDEBAR_ROUTES', sidebarRoutes)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

```

---

## 全局状态
```javascript
import Cookies from 'js-cookie'
import {getLanguage} from '@/lang'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  language: getLanguage(),
  appContainerHeight: 0,
  tagsViewFlag: false,
  dashboardSettingFlag: false,
  skeletonLoading: false,
  showDialogDashboard: false,
  customLayoutDashboardFlag: false,
  dashboardSettingData: [],
  fromMail: false
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_LANGUAGE: (state, language) => {
    state.language = language
    Cookies.set('language', language)
  },
  SET_APPCONTAINER_HEIGHT: (state, height) => {
    state.appContainerHeight = height
  },
  SET_TAGSVIEWS_FLAG: (state, flag) => {
    state.tagsViewFlag = flag
  },
  SET_DASHBOARD_FLAG: (state, flag) => {
    state.dashboardSettingFlag = flag
  },
  SET_SKELETON_LOADING: (state, flag) => {
    state.skeletonLoading = flag
  },
  SET_SHOW_DIALOG_DASHBOARD: (state, flag) => {
    state.showDialogDashboard = flag
  },
  SET_CUSTOM_LAYOUT_DASHBOARD_FLAG: (state, flag) => {
    state.customLayoutDashboardFlag = flag
  },
  SET_DASHBOARD_SETTING_DATA: (state, data) => {
    state.dashboardSettingData = data
  },
  SET_FROM_MAIL: (state, data) => {
    state.fromMail = data
  }
}

const actions = {
  toggleSideBar({commit}) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({commit}, {withoutAnimation}) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({commit}, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setLanguage({commit}, language) {
    commit('SET_LANGUAGE', language)
  },
  changeAppContainerHeight({commit}, height) {
    commit('SET_APPCONTAINER_HEIGHT', height)
  }
}

const getters = {
  sidebar: state => state.sidebar,
  device: state => state.device,
  language: state => state.language,
  appContainerHeight: state => state.appContainerHeight,
  fromMail: state => state.fromMail
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

```

---

## 系统层-index.js
将所有页面, 全局配置, 全局状态导出为store, 在main.js传入`new Vue()`
```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import permission from './modules/permission'
import settings from './modules/settings'
import tagsView from './modules/tagsView'
import user from './modules/user'
import { reportModule } from '@/store/modules/report'

Vue.use(Vuex)

/**
 * 添加 modules 自动装配
 * @author (*&(*&&&^&^
 * @date 2021/11/30 10:15
 */
const modules = {}
const require_module = require.context('./modules', false, /.js$/)
require_module.keys().forEach((file_name) => {
  modules[file_name.slice(2, -3)] = require_module(file_name).default
})

const store = new Vuex.Store({
  modules: {
    app,
    permission,
    settings,
    tagsView,
    user,
    ...reportModule
  }
})

export default store

```

