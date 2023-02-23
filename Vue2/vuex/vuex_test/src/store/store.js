import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //count: 0
  },
  mutations: {
    add(state, payload) {
      console.log(payload);
    },
    cut(state, cutValue) {
      state.count -= cutValue;
    }

  },
  actions: {
    /* AsyncFun: function (context, cutValue) {
      setTimeout(function () {
        context.commit("cut", cutValue);
      }, 2000)                               //5s后cutValue
    },
    AsyncFun2: function (context, addValue) {
      setTimeout(function () {
        context.commit("add", addValue);
      }, 2000)                             //5s后addValue
    } */
    increment: function (context, payload) {
      setTimeout(function () {
        context.commit("add", payload);
      })
    }
  },
  getters: {
    /* showNum(state) {
      return '当前字符:' + state.count;
    } */
  },
  modules: {
  }
})
