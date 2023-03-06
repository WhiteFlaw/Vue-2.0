@[TOC](文章目录)

---

# 前言
需要原生Javascript + three.js的数据标注平台加入Vue框架.
本来挺顺利的, 我直接在`mounted`周期做了初始化, 然后剩下的操作还是交给JavaScript文件执行, 最后发现里面有很明显的事件触发问题.
这其实是一个很白痴的解决方案, 但是能用.

---

# 一、事件未绑定的原因
找了整一天也没找着这事件为什么触发不了, 在这中间还把代码简化掉只留下事件触发逻辑执行了好几次.

第二天意识到原生代码里的`template`可能有问题, 在原生环境中`template`标签内部的东西是不会渲染出来的, 虽然解析器在加载页面的时候确实会处理这部分代码片段.

取自MDN:
```
将模板视为一个可存储在文档中以便后续使用的内容片段. 
虽然解析器在加载页面时确实会处理 <template> 元素的内容,
但这样做只是为了确保这些内容有效, 元素内容不会被渲染.
```
但是放到vue里(这里特指Vue2), 如果`template`标签在Vue实例绑定的元素内部存在(即不是根元素外的那个`template`), 那么在DOM中该`template`的子元素是正常存在并显示的, 我以前经常拿`template`做`v-for`容器.

然后联想前面几次结构简化demo, 大概不是没绑定而是绑错了目标.

这个原生项目的HTML代码很多, 所以作者做了一些优化, 在需要某个模块的时候才将其`appendChild`加入DOM, 其余的时候这些模块都被放在`template`标签内, 而vue把这些东西都出来渲染了, 那么初始化的时候事件大概率就已经被绑到了`template`里面的那些代码里, 等到这些模块被`appendChild`的时候, 事件绑定已经结束了, 所以`appendChild`是将没有事件绑定的DOM加到了正确位置.

我在控制台把视口里的DOM都删掉之后发现下面还有一层被挤出去的DOM, 那是有事件绑定的DOM.
的确是这样.

---

# 二、如何处理原生template标签
我是想把他`appendChild`这个优化留下来的, 我觉得在原生环境里能有这种封装的思想挺好, 不过看起来不好办...
我打算把原来那几个模块抽到组件里, 提前把组件写到后面会插入到的位置, 然后用这种结构控制显示隐藏:

```html
<template v-if="isShow">
  <aaa></aaa>
</template>
```

这样挺好的其实, 如果这个项目的结构再简单一点我绝对会用组件方案的, 结果我发现我要传回调函数, 传4层干扰到3个很重要的类, 只是为了在合适的时机回调改变组件的状态, 我觉得很糟糕.
而且, 如果后面会有...或者现在就有我没有察觉到的需求是增加不定数量个这种模块, 我把组件直接注册到这里用就算是写死了, 恐怕会不好改.

需要这种操作的组件有三个, 我想起来学后端渲染的时候给前端发的html模板, 那...能不能把这些html转成字符串存到一个单独的js文件, 然后在需要的地方导入后`appendChild`呢? 这样对源代码改动最小, 不用改`appendChild`, 也让html文档那边更简洁一些.

```javascript
export const batchEditorToolsTemplate = `
  <div id="batch-editor-tools-wrapper" class="non-selectable">
	<div id="batch-editor-tools">
	  <div class="menu-button" id="exit">退出</div>
	  <div class="menu-button" id="prev">上一页</div>
	  <div class="menu-button" id="next">下一页</div>
	  <div class="menu-button" id="trajectory">轨迹</div>
	  <div class="menu-button" id="auto-annotate">自动</div>
	  <div class="menu-button" id="auto-annotate-translate-only">自动（无旋转）</div>
	  <div class="menu-button" id="interpolate">插值</div>
	  <div class="menu-button" id="reload">重新加载</div>
	  <div class="menu-button" id="finalize">定稿</div>
	</div>
  </div>
`
```

然后用这个工具函数把`appendChild`替换掉:

```javascript
function analyseDomStr(str, target) { // dom字符串, 目标元素
  const template = document.createElement('template');
  template.innerHTML = str;
  target.appendChild(template.content);
}
```
这样性能不如之前好, 不过——事件绑定看起来没什么问题了.

本来想用`Document.createDocumentFragment()`API的, 所以初版就写成这样了:
```javascript
function analyseDomStr(str, target) { // dom字符串, 目标元素
  const fragment = document.createDocumentFragment();
  const template = document.createElement('template');
  template.innerHTML = str;
  fragment.appendChild(template.content); // 此处还是要按照原生template的那套来的, 这个template不会被vue特殊解析
  target.appendChild(fragment);
}
```
很遗憾并不能直接使用`innerHTML`向`DocumentFragment`内写入DOM, 仍旧需要`appendChild`来完成, 所以完全没有必要创建`DocumentFragment`, 我认为这个API更加适合用于对频繁DOM操作进行优化, 比如用户点击按钮后就要插入100条`tips`, 那就更适合先使用这个API生成一个文档内容分段, 然后把成品分段加入DOM.
这个初版和旧版也都是回流一次...

```
因为文档片段存在于内存中, 并不在 DOM 树中, 所以将子元素插入到文档片段时不会引起页面回流(对元素位置和几何上的计算).
因此, 使用文档片段通常会带来更好的性能.
```

完全可以把:

```javascript
const ul = document.querySelector('ul');
const li = document.createElement('li');

for (let i = 0; i < 100; i++) {
  ul.appendChild('li');
}
```
这种会引起页面频繁回流的写法
改成
```javascript
const ul = document.querySelector('ul');
const li = document.createElement('li');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  fragment.appendChild('li');
}
ul.appendChild(fragment);
```
这样页面只会在`fragment`被`appendChild`后回流一次.

---

# 总结
...