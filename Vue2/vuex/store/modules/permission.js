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