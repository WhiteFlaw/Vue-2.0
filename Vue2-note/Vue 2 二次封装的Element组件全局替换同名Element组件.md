倒也不难吧, 说白了就是把自己的组件全局注册为element组件的名字, 然后element不注册到全局而是仅在二次封装的文件引入.
Element组件并不能满足所有的需求, 现在的项目虽然基于Element, 但常用的组件基本上都是基于Element进行二次封装得到的.
刚开始我以为做这些公共组件的人到Element源码里去修改了它们, 因为这些组件虽然很明显和原始的Element组件有区别, 但是却和Element组件重名, 比如项目里使用的el-table具备自动的强制表格重绘,
和一些插槽.

后来也是去找了这些组件的封装, 基本是引入element原生组件之后开插槽, 然后穿透修改样式之类的.

比如基于element原生组件封了两个组件`NewELTable`和`NewELForm`, 现在用他俩全局替换原生的element组件.
```html
<template>
  <Form ref="new-el-form" v-bind="$attrs" v-on="$listeners" @submit.native.prevent>
    <slot></slot>
  </Form>
</template>
```
```javascript
<script>
import {Form} from 'element-ui'

export default {
  name: 'NewELForm',
  components: {Form},
  methods: {
    // 传递el-form原生方法
    validate(callback) {
      this.$refs['new-el-form'].validate(callback)
    },
    validateField(props, cb) {
      this.$refs['new-el-form'].validateField(props, cb)
    },
    resetFields() {
      this.$refs['new-el-form'].resetFields()
    },
    clearValidate(props) {
      this.$refs['new-el-form'].clearValidate(props)
    }
  }
}
</script>
```
main.js全局注册:
```javascript
import NewELTable from '@/components/NewELTable'
import NewELForm from '@/components/NewELForm'

Vue.component('el-table', NewELTable)
Vue.component('el-form', NewELForm)
```
但是这个项目里的element原生组件并未进行全局注册, 仅在需要二次封装的文件引入后进行封装, 将封装后的组件注册到全局为`el-table`之类即可达到目的.
全局引入element的项目, 使用这种方法该是不行的?
