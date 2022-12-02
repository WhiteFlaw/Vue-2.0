# 仿Element多选表

```html
<table class="pure-table" id="ebec051i-table-excel">
  <thead v-if="tableData.length > 0">
    <tr class="td-bg">
      <th>
        <input type="checkbox" @click="doCheckAll">
      </th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <template v-for="(row, rowIndex) in tableData">
      <tr>
        <td :rowspan="4">
          <input type="checkbox" name="select" :value="rowIndex" @input="clickCheckBox(rowIndex)">
        </td>
        <td></td>
        <td></td>
      </tr>
    </template>
  </tbody>
</table>
```

```javascript
doCheckAll() {
  this.checkAll = !this.checkAll
  this.allCheckBox.forEach((checkBox) => {
    checkBox.checked = this.checkAll
  })
},
clickCheckBox(rowIndex) { // 单选
  const temArr = []
  this.allCheckBox.forEach((checkBox) => {
    if (checkBox.checked) {
      temArr.push(this.tableData[rowIndex + 1])
    }
  })
  this.multipleSelection = temArr
},
EBEC051ISearch(info).then((res) => {
  this.tableData = res.voList
  this.$nextTick(() => {
    this.allCheckBox = document.querySelectorAll('table input[type=checkbox]')
  })
})
```
