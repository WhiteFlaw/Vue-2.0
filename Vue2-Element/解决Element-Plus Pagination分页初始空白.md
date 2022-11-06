
@[TOC](文章目录)

---

# 前言
我已经鸽了好久好久...
当我回来, 发现已经有这么多人看过我的博客, 真的很高兴.
其实去年年底已经开始回来写代码了, 但都是些零碎的小问题, 感觉实在是没什么好记的....

---

# 一、问题场景
使用Pagination组件制作翻页, 但是初始情况下(在第一页), 书页显示为空白,要点击其他页码才会展示出来.

就像这样:
![在这里插入图片描述](https://img-blog.csdnimg.cn/5149823eee774910afce1f967cdbc592.png#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/5e268189a971440285732315e410f3c0.png#pic_center)
体验比较糟糕, 但是觉得也不是很严重就先去做别的部分了.

两天后我发现, 在我创建一个新的用户, 总文章数不足以达到两页(即本处6篇时), 无论怎样都无法显示, 包括点击页码, 因为点击页和当前页相同, 回调会被阻止:
![在这里插入图片描述](https://img-blog.csdnimg.cn/2b1a4f6e1fda4095871086476e9ea219.png#pic_center)
终于决定要修一修了.

---


# 二、解决过程
因为已经对数据做了watch监听, 所以肯定不是异步的问题
如果是, 那点击也不应该能显示出来才对.

那么问题就出在我二次封装的pagination了.

我首先想到要不要模拟一下翻页, 在mounted完之后自动调用一下current-change对应的方法, 亲自帮用户翻一下.


```html
<!--我删掉了多余的属性 -->

    <el-pagination
      @current-change="currentChange"
    />
```

```javascript
//updated周期调用currentChange

    onUpdated(() => {
      currentChange();
    }),
```
跑一下看看
![在这里插入图片描述](https://img-blog.csdnimg.cn/85242db8b3eb4da1aadac39289f856fc.png#pic_center)
解决.

---

# 三、解决方法
在Updated周期手动调用一下current-change事件对应的方法.

---


# 总结
记了个寂寞呀真是(捂脸).