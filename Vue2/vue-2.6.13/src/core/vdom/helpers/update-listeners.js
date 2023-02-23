/* @flow */

import {
  warn,
  invokeWithErrorHandling
} from 'core/util/index'
import {
  cached,
  isUndef,
  isTrue,
  isPlainObject
} from 'shared/util'

const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function,
  params?: Array<any>
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})

export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
  // fns参数为一个事件对应的所有回调函数, 即cur
  function invoker () {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      //一个事件可以对应多个回调函数所以遍历
      for (let i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  invoker.fns = fns // invoker.fns = cur
  return invoker
}

export function updateListeners (
  on: Object, // listeners
  oldOn: Object, // oldListeners
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  // 如果listeners对象中存在某个key（即事件名）而oldListeners中不存在，
  // 则说明这个事件是需要新增的；反之，如果oldListeners对象中存在某个key（即事件名）而listeners中不存在，
  // 则说明这个事件是需要从事件系统中卸载的
  let name, def, cur, old, event
  for (name in on) {
    // 遍历on(即listeners)单独处理每个事件名
    def = cur = on[name] // 新listener中的一个事件对应的所有回调函数, 多个的话为数组
    old = oldOn[name] // 旧listener中的同名事件对应的所有回调函数, 多个的话为数组
    event = normalizeEvent(name) // 处理时间名(见下)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    if (isUndef(cur)) { // 判断事件名对应的值是否存在, 不存在则警告(就是有事件没回调函数时候的警告)
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // 如果oldListener中不存在该方法则调用add注册新方法
      add(event.name, cur, event.capture, event.passive, event.params)
    } else if (cur !== old) { // 第二次执行updateListeners时如果cur !== old
      // 用cur中当前事件名对应的所有回调函数覆盖掉createFnInvoker规定并赋值给上一轮cur的invoker
     // 注意上一轮invoker的fns属性就是createFnInvoker设置的invoker, 是oldListener中这个事件对应的所有回调函数
     // 现在用这个事件对应的最新的所有回调函数来覆盖掉这个事件对应的所有旧回调函数
     old.fns = cur
      on[name] = old
      // 通过 on[name] = old 保留引用关系, 保证事件回调只添加一次，之后仅仅去修改它的回调函数的引用
    }
  }
  for (name in oldOn) {
    // 遍历oldOn每一个事件名, 如果在on中不存在说明新的事件回调中没有该函数, 需要卸载
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      //根据不同的修饰符给事件名前面添加不同的符号以作标识，其实这个normalizeEvent 函数就是个反向操作，根据事件名前面的不同标识反向解析出该事件所带的何种修饰符
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
