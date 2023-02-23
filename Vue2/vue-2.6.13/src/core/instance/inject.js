/* @flow */

import { hasOwn } from 'shared/util'
import { warn, hasSymbol } from '../util/index'
import { defineReactive, toggleObserving } from '../observer/index'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}

export function initInjections (vm: Component) {
  const result = resolveInject(vm.$options.inject, vm) 
  // 将inject中的数据转换成键值对的形式赋值给result
  /* result格式: {
    依赖名: 依赖
    ...
  } */
  if (result) {
    toggleObserving(false)
    Object.keys(result).forEach(key => { 
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          //将result内全部依赖名转为数组, 调用defineReactive将其添加至当前实例vm
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
    toggleObserving(true)
  }
}

export function resolveInject (inject: any, vm: Component): ?Object {
  //inject
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    const result = Object.create(null) 
    // 生成一个原型为null的对象, 没有也继承任何对象并且作为原型链顶端不能继承任何对象

    const keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject)
    // 参考hasSymbol为false下的情况这里是要获取inject项的全部key构成的数组
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // #6574 in case the inject object is observed...
      if (key === '__ob__') continue
      const provideKey = inject[key].from 
      // inject[key]即inject项的值, 获取其中的from属性, inject[key].from即上一级父级提供的源属性
      // inject[key].from, inject[key]来自..., 只能查到上一级
      let source = vm
      while (source) { 
        // 父级组件使用provide注入数据时会将注入的数据存入自己实例的_provide属性内
        // 查找到源属性source._provided, 然后用provideKey源属性收集它的源属性值赋值到result对象构成键值对
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey]
          break
        }
        source = source.$parent
      }
      if (!source) { // 如果找到最后source没了还没能break, 那么直接去检查inject[key].default当前遍历的inject[key]里是否有设置默认值
        // 有的话将默认值作为provide源属性值
        if ('default' in inject[key]) {
          const provideDefault = inject[key].default
          result[key] = typeof provideDefault === 'function'
            ? provideDefault.call(vm)
            : provideDefault
        } else if (process.env.NODE_ENV !== 'production') { // 连默认值也没有, 直接报错
          warn(`Injection "${key}" not found`, vm)
        }
      }
    }
    return result
  }
}
