<template>
  <Form ref="new-el-form" v-bind="$attrs" v-on="$listeners" @submit.native.prevent>
    <slot></slot>
  </Form>
</template>

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

<style scoped>

</style>
