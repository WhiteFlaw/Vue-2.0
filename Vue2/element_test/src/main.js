import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as tf from '@tensorflow/tfjs';

Vue.config.productionTip = false
Vue.use(tf);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
