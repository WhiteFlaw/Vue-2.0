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