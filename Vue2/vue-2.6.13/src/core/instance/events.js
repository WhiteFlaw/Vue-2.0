/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

// 父组件给子组件的注册事件中，把自定义事件传给子组件，在子组件实例化的时候进行初始化；而浏览器原生事件是在父组件中处理。
export function initEvents (vm: Component) {
  vm._events = Object.create(null)
  // 创建一个原型为null的空对象, vm._events用于存放事件, 此处指父组件绑定在当前组件上的事件.
  // 即<son @hover="xxx" @hook:created="xxx">, 此时会有hover:created和hover在_events内(即@hook:钩子函数名="函数")
  vm._hasHookEvent = false // 父组件是否通过@hook把钩子函数绑定在当前组件上, 即@hook:钩子函数名="函数"
 /* 
   export function callHook (vm: Component, hook: string) {
    const handlers = vm.$options[hook]
    if (handlers) { 
      //非通过hook绑定的钩子函数, 回调方法在执行时,需要找到vm上的hook函数然后call它的回调
      for (let i = 0, j = handlers.length; i < j; i++) {
        try {
          handlers[i].call(vm)
        } catch (e) {
          handleError(e, vm, `${hook} hook`)
        }
      }
    }
    // 通过hook绑定的钩子函数直接$emit(), 这种方法效率高
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
}
 */
 
  // init parent attached events
  const listeners = vm.$options._parentListeners
  if (listeners) {
    // 若父组件在当前子组件上绑定了事件, 那么执行updateComponentsListeners
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add (event, fn) {
  target.$on(event, fn)
}

function remove (event, fn) {
  target.$off(event, fn)
}

function createOnceHandler (event, fn) {
  const _target = target
  return function onceHandler () {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm 
  // 保留对vm实例的引用, 保证在执行updateListeners时依旧可以访问到vm(remove需要访问target)
  // oldListeners: 绑定在当前组件上的旧事件对象
  // listeners: 绑定于当前组件上的事件对象
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = undefined
}

export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    // 若events为数组, 那么进入递归(如果里面还有子数组再进), 把每个事件单独选取出来传入$on, 如此循环直到不满足条件进入else
    const vm: Component = this
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else { // 将一个事件和它的回调方法加到_events对象中, 事件名对应方法
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
        // _hasHookEvent表示父组件有没有直接绑定钩子函数在当前组件上(即@hook:created="hookFormParent"式)
      }
    }
    return vm
  }

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    // 监听一个自定义事件, 但是只触发一次, 第一次触发后移除监听器
    const vm: Component = this
    function on () { // on是"只触发一次"的关键
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (!fn) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
