@[TOC](文章目录)

---

# 前言


---


# 一、?
已经基本完成了此图上半部分, 现在需要解决数据生成视图的问题.

![在这里插入图片描述](https://img-blog.csdnimg.cn/52d9d8a531654670a208c328afaedf4b.png#pic_left)

---

# 二、Virtual Node
## 2.1. 什么是Virtual Node
Virtual Node是Vue中的类, 用以实例化不同类型的Virtual Node实例, 不同类型的Virtual Node实例各自表示不同类型的DOM元素, 比如元素节点文本节点注释节点各有不同的虚拟DOM类型.

对一个Node进行描述, 渲染可以根据描述进行, 就像甲方一样, 它描述一下自己需要一个具备什么功能什么样子的东西, 这些描述即是虚拟DOM.

Virtual Node类实例化而成的Virtual Node实例本质上是轻量级的、描述真实DOM节点的JavaScript对象
其内部包含且不限于该DOM元素所含有的属性及其值.

所有Node在渲染前都先创建Virtual Node, 基于Virtual Node渲染Node, 最后Node插入到页面渲染视图.

---

## 2.2.基于虚拟节点减少DOM操作
由此只要对Virtual DOM加以控制即可间接控制DOM, 那么本次渲染视图完毕后将本次Virtual DOM缓存下来, 在下次需要渲染视图之前先将当前Virtual DOM与缓存的Virtual DOM进行对比, 仅仅对Virtual DOM实例中发生变化的部分进行重新渲染, 达到减少DOM操作优化性能的目的, 减少DOM的操作是前端性能优化的重要一环.
Virtual DOM最初的目的是更好的跨平台. 比如`Node.js`实现SSR的方式之一就是借助虚拟DOM, VDOM本身是JavaScript对象.
当状态发生变化时, 通知到组件级别, 表示该组件内已发生变化, 组件内使用Virtual DOM来重新渲染.
如果组件内有一点点变化就需要重新渲染整个组件, 会造成大量性能浪费, 所以筛选差异节点十分必要.

---

## 2.3.Virtual Node
Virtual Node类型可分为 注释节点 文本节点 元素节点 组件节点 函数式节点 克隆节点

通过实例化Virtual Node类为Virtual Node实例设定属性时, 不应生效的属性直接被设置为`undefined`或者`false`.
Virtual Node类本身是固定的, 只是实例化Virtual Node类创建Virtual DOM时仅仅剔出一部分需要的来用, 每种Virtual Node实例仅仅需要类中的部分属性:

```javascript
src/core/vdom/vnode.js
```

```javascript
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}
```

如果一个节点仅需要`text`和`isComment`(注释节点的确只需要这两个), 那么其他是`undefiend`和`false`:

```javascript
{
  text: "注释节点",
  isComment: true
}
```

元素节点通常存在以下有效属性:
| 属性名 | 属性值 |
|--|--|
| tag | 节点名, 有端联想`<router-view/>`的`tag`属性. |
| data | 节点数据, `attrs` `class`等 |
| children | 当前节点的子节点数组 |
| context | 当前组件的Vue实例 |

```javascript
{
  children: [VNode, VNode],
  context: {},
  data: {},
  tag: "div",
  ...
}
```

---

### 2.3.1 注释节点

```javascript
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
```

---

### 2.3.2 文本节点

```javascript
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}
```

---

### 2.3.3 克隆节点?
复制一个已经存在的节点, 在编译时起到优化作用.
不过公司里的老前辈和我说过, 如果能够克隆节点的话尽量克隆, 克隆一个节点要比创建一个节省很多效能.

```javascript
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```

---

# 三、创建Virtual Node

## 3.1 Vue.prototype._render

```javascript
const vm = {
  $options: {
    render: '1',
    c: "3",
    _parentVnode: 2,
    d: ''
  }
}
const { render, _parentVnode, somea } = vm.$options
console.log(render) // 1
console.log(_parentVnode) // 2
console.log(somea) // undefined
```

`src/core/instance/render.js`

```javascript
Vue.prototype._render = function (): VNode {
  const vm: Component = this
  const { render, _parentVnode } = vm.$options 
  // 缓存vm.$options.render和vm.$options._parentVnode

  vm.$vnode = _parentVnode
  let vnode
  
  try {
    currentRenderingInstance = vm
    vnode = render.call(vm._renderProxy, vm.$createElement)
    // vm._renderProxy是在_init()中挂载
  } 
  // ...
  } finally {
    currentRenderingInstance = null
  }
  
  if (Array.isArray(vnode) && vnode.length === 1) {
    // 如果是vNode, 判断是否为数组, 如果是并且只有一个元素, 那么取那个元素为vnode
    vnode = vnode[0]
  }
  
  // 如果render出错就返回空节点
  if (!(vnode instanceof VNode)) { // 拿到vNode之后判断类型是否为vNode
    if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) { 
      // 如果是vNode, 判断是否为数组, 如果是则表明根元素有多个, 警告
      warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
      )
    }
    vnode = createEmptyVNode()
  }

  // set parent
  vnode.parent = _parentVnode // vnode父节点挂载到vnode, 返回vnode 
  return vnode
}
```

---

## 3.2  Vue.prototype._init
`Vue.prototype._render`中

```javascript
vnode = render.call(vm._renderProxy, vm.$createElement)
```
得到`vnode`, 之后直接返回, `vnode`应当由该步生成.

``src\core\instance\init.js``

```javascript
Vue.prototype._init = function (options?: Object) {
  if (process.env.NODE_ENV !== 'production') {
    // 判断能否设置vm._renderProxy为Proxy, 对vm拦截处理(当使用vm上没有的属性时会警告)
    // 内部也会挂载_renderProxy 到vm
    initProxy(vm)
  } else {
    vm._renderProxy = vm
    // 如果是生产环境，vm._renderProxy直接就是vm
  }
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}
```

---

# 3.3 initProxy 
`src\core\instance\proxy.js`
```javascript
initProxy = function initProxy (vm) {
  if (hasProxy) { // const hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy)
    // 依据对于ES6 Proxy的支持性判断是否使用proxy
    // determine which proxy handler to use
    const options = vm.$options
    const handlers = options.render && options.render._withStripped
      ? getHandler
      : hasHandler // 如果options.render存在但是内部没有_withStripped, 那么使用hasHandler
    vm._renderProxy = new Proxy(vm, handlers)
    // 支持proxy则实例化Proxy, 包装一个对象作为_vm的_renderProxy属性值, 每次通过vm._renderProxy访问vm时，都必须经过这层代理
  } else {
    vm._renderProxy = vm // 或者不支持Proxy的情况下直接将vm对象作为_renderProxy的属性值
  }
}
```

---

## 3.3.1 hasHandler && getHandler
判定vm实例上是否具备某个属性.

`src\core\instance\proxy.js`
```javascript
  const hasHandler = {
    has (target, key) {
      const has = key in target // 判断该属性是否在vm实例上存在
      const isAllowed = allowedGlobals(key) ||
      // 传一个属性名key和一堆字符串(用以生成特殊性属性名映射map), makeup会查找所列字符串中是否具备与该key对应者, 如果有则返回true
      (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
      // 当key是全局变量或者key是私有属性且key没有在$data中，允许访问该key
      if (!has && !isAllowed) { // vm中没有key对应的属性, 或者没权限的情况下
        // 这个属性如果还在data里存在, 那么警告
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }
```

针对 读取代理对象某个属性 的行为, 在开发者错误的读vm属性时发起提示.
```javascript
const getHandler = { // 针对 读取代理对象某个属性 的行为, 在开发者错误的读vm属性时，提供提示
  get (target, key) {
    if (typeof key === 'string' && !(key in target)) {
      if (key in target.$data) warnReservedPrefix(target, key)
      else warnNonPresent(target, key)
    }
    return target[key]
  }
}
```

---

## 3.3.2 allowedGlobals & makeMap
看起来是个变量但传了值, `allowedGlobals`接收`makeMap`的值, 但`makeMap`函数本身返回一个函数类型值, 所以`allowedGlobals`可以接受传参

`src\core\instance\proxy.js`多处皆存在该函数, 此为其一.
```javascript
const allowedGlobals = makeMap( // vue-2.6.13\packages\weex-vue-framework\factory.js
  'Infinity,undefined,NaN,isFinite,isNaN,' +
  'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
  'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
  'require' // for Webpack/Browserify
)
```

`makeMap`内写死了由诸多特殊属性名组合成的字符串, 用以拆分为数组后遍历添加属性生成特殊属性名映射表'map'.
`makeMap`返回值作为函数类型将接收`allowedGlobals`传入的值作为参数以向同在`makeMap`作用域内的特殊属性名映射表`map`进行查找, 如果找到, 则makeMap返回的函数将还会返回这个属性在特殊属性值映表中对应的属性值, 此处所有特殊属性的值都是`true`, 即如果传入`allowedGlobals`中的值在`vm`特殊属性映射表中存在, `allowedGlobals`就返回true.

```javascript
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null); // 将一个以null为原型的空对象赋值到map
  var list = str.split(','); // 将str以逗号分割拆分为数组(不是序列)赋值到list
  for (var i = 0; i < list.length; i++) { // list内的每个元素作为map对象内的属性, 全部赋默认值为true, 这个true将会在allowedGlobals
    map[list[i]] = true;
  }
  return expectsLowerCase  // 返回map对象中的一个属性值(如果传了expectsLowerCase就先将传入属性名转全小写再从map里查询值返回)
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}
```
那么`vm._renderProxy`要么为`new Proxy(vm, handlers)`, `handlers`为`has`或`get`函数, 要么就是在不支持ES6 Proxy的环境下被直接赋值了`vm`.

---

所以
```javascript
vnode = render.call(vm._renderProxy, vm.$createElement)`
```
等同于
```javascript
vnode = vm._renderProxy(vm.$createElement)
```
向`getHandler`的`get`或`hasHandler`的`has`传参`vm.$createElement`

---

## 3.4 createElement && _createElement
其内部的`_createElement`函数会返回vnode实例, 该函数也基于`_createElement`封装, 目的是允许更加灵活的传参.
`src\core\vdom\create-element.js`

```javascript
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}
```

`context`表示`VNode`的上下文环境, 接受`Component`类型;
`tag`表示标签, 类似`router-view`的`tag`参数, 可以是一个字符串, 也可以是一个 Component;
`data`表示`VNode`的数据, `VNodeData`类型, 可以在`flow/vnode.js`中找到它的定义;
`children`表示当前`VNode`的子节点, any类型, 需要接受`normalize`以规范为标准`VNode`一维数组；

这个函数接收一个`tag`参数, 类似`router-view`的`tag`参数, 这个字符串规定生成何种DOM元素.
这个函数十分复杂, 现在摘除与vnode生成操作不存在直接关联的部分, 那么所剩主要分为children规范化和虚拟节点生成两部分.

`src\core\vdom\create-element.js`
```javascript
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (!tag) { // 若tag参数不存在, 则直接返回一个注释节点
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // 规范化children
  // children接受any类型, 需要处理为vnode类型
  // 成型的dom结构必然存在包含关系, 同dom树形结构, 一个节点与其内部存在的子节点也将构成树形结构, 现在需要将其处理为一维数组.
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  
  // vnode生成
  let vnode, ns
  if (typeof tag === 'string') {
  
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
    
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```

---

## 3.5 children 的规范化
根据`normalizationType`的不同区分出`children`的两种处理方法.

### 3.5.1 simpleNormalizeChildren

```
1. When the children contains components - because a functional component
   may return an Array instead of a single root. In this case, just a simple
   normalization is needed - if any child is an Array, we flatten the whole
   thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
   because functional components already normalize their own children.
```

在`render`函数由编译生成的情况下调用, 理论上这种由编译生成的`children`应该是`VNode`类型, 除了`functional component`函数式组件, 它返回一个数组.
这种情况下只要调用`simpleNormalizeChildren`即可, 通过`Array.prototype.concat`把`children`数组打为一维数组.

```javascript
export function simpleNormalizeChildren (children: any) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children)
    }
  }
  return children
}
```

---

### 3.5.2 normalizeChildren
根据`normalizationType`的不同区分出`children`的两种处理方法之一.

```
2. When the children contains constructs that always generated nested Arrays,
   e.g. <template>, <slot>, v-for, or when the children is provided by user
   with hand-written render functions / JSX. In such cases a full normalization
   is needed to cater to all possible types of children values.
```

当编译会产生嵌套数组时调用`normalizeArrayChildren`方法.
比如编译`<template>`, `<slot>`, `v-for`, 或者用于生成`children`的函数是用户自己写的(比如手写`render`函数)这是两种会产生嵌套数组的情况. 
这种情况下需要一套完整的normalize化流程来处理各种类型的`children`.

不过嵌套数组并不由`normalizeChildren`处理, 此处只是对`children`只有一个节点并且属于基本类型的情况做了额外判定.
`normalizeArrayChildren`将会在`children`为数组时受到调用以处理嵌套数组`children`.

`src\core\vdom\helpers\normalize-children.js`
```javascript
export function normalizeChildren (children: any): ?Array<VNode> {
  return isPrimitive(children)
    ? [createTextVNode(children)]
    // 当`children`只有一个节点并且属于基本类型时, Vue从接口层面允许用户把`children`写成基础类型用来创建单个文本节点
    : Array.isArray(children) // 常规情况, 如果children不只有一个节点, 那么调用normalizeArrayChildren处理
      ? normalizeArrayChildren(children)
      : undefined
}
```

### 3.5.3 normalizeArrayChildren
`children`即需规范的`children`，对于多维数组的情况, 有`nestedIndex`表示多维数组子数组`child`的嵌套索引.
反复遍历以层层获取到节点`c`, 对`c`进行判定以决定是否递归, 最终获取到单个节点`c`, 如果其为基础类型则交由`createTextVNode`转换成`VNode `类型, 非基础类型则判定为已经转化过或者原本就是`VNode`类型, 如果`children`是一个列表并且列表存在嵌套情况则根据`nestedIndex`更新它的 key. 
在遍历的过程中，两个连续的`text`节点会被合并为一个`text`节点.

```javascript
function normalizeArrayChildren (children: any, nestedIndex?: string): Array<VNode> {
  const res = []
  let i, c, lastIndex, last
  for (i = 0; i < children.length; i++) {
    c = children[i]
    if (isUndef(c) || typeof c === 'boolean') continue
    lastIndex = res.length - 1
    last = res[lastIndex]
    //  nested
    if (Array.isArray(c)) { // 递归判定
    
      if (c.length > 0) {
        c = normalizeArrayChildren(c, `${nestedIndex || ''}_${i}`)
        // merge adjacent text nodes
        if (isTextNode(c[0]) && isTextNode(last)) { // 两个连续文本节点的合并
          res[lastIndex] = createTextVNode(last.text + (c[0]: any).text)
          c.shift()
        }
        res.push.apply(res, c)
      }
      
    } else if (isPrimitive(c)) {
    
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c) // 两个连续文本节点的合并
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c))
      }
      
    } else {
    
      if (isTextNode(c) && isTextNode(last)) { // 两个连续文本节点的合并
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text)
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) &&
          isDef(c.tag) &&
          isUndef(c.key) &&
          isDef(nestedIndex)) {
          c.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(c)
      }
      
    }
  }
  return res
}
```

---

## 3.6 VNode 的创建
前提`tag`是 string 类型.
并且`tag`是内置的节点, 则直接`new VNode`;
如果`tag`为已注册的组件名, 则通过`createComponent`创建组件类型的`VNode`
都不是就创建一个未知的标签`VNode`.

```javascript
// vnode生成
let vnode, ns
if (typeof tag === 'string') {
  
  let Ctor
  if (config.isReservedTag(tag)) {
    vnode = new VNode(
      config.parsePlatformTagName(tag), data, children,
      undefined, undefined, context
    )
  } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
    // component
    vnode = createComponent(Ctor, data, context, children, tag)
  } else {
    // unknown or unlisted namespaced elements
    // check at runtime because it may get assigned a namespace when its
    // parent normalizes children
    vnode = new VNode(
      tag, data, children,
      undefined, undefined, context
    )
  }

}
```

# 总结
-
