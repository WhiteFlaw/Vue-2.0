# $emit回调获取父组件参数

## 父组件:
```javascript
async EBED074MAddReq(params, callback) {
  const res = await EBED074MDoAdd(params)
  if (res === 'Y') {
    this.syMessageBox('M@EBE_SUCCESS', 'success')
    this.doSearch()
    callback(res)
  }
},
```

---

`$emit()`的传一个回调函数到父组件(第几个参数无所谓, 类型any), 父组件传一个实参, 在子组件使用形参即可取到父组件传的值
如果子组件不依靠回调直接在$emit之后执行会出现异步, 即后续步骤已执行完毕后才执行$emit(), 就此例来讲, 会先遍历清理表单数据对象再$emit()发送事件, 会发送一个空表单对象给父组件.

## 子组件
```javascript
handleEnsure() { // 事件: 确认
  if (this.EBED074MAddForm.checkType === '') {
    this.syMessageBox(convertVariateFromTips(this.$t('M@EBE_FLD_ENTER'), [this.$t('EBE_PJLX')]))
    return false
  }
  this.$refs['EBED074MAddForm'].validate((valid) => {
    if (valid) {
      this.$emit('EBED074MAddReq', this.EBED074MAddForm, (res) => {
        if (res === 'Y') {
          for (const key in this.EBED074MAddForm) {
            this.EBED074MAddForm[key] = ''
          }
        }
      }) // 到组件外请求增加, 并将本条加入展示
    }
  })
},
```
