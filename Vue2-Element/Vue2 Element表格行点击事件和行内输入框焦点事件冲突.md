# 场景
Element表格需要给每一行倒数第3列的单元格添加输入框, 并且使用`v-model`绑定到该行数据对象的`currAmt`属性, 即 允许使用者通过对输入框执行输入操作直接改变行数据对象的`currAmt`属性值.
但是行选取事件通过`row-click`实现, 点击行尝试选取后如果输入框为空则需要阻止选取并且弹出提示文.输入框的点击聚焦事件现在会事件冒泡导致触发element行的`row-click`事件,
导致使用者一旦尝试聚焦一个空输入框就会弹出提示文.

```html
<el-table
  :data="tableData"
  @row-click="rowClick"
>
  <el-table-column
    width="40"
    align="center"
    type="selection"
  >
  </el-table-column>
  <el-table-column
    :key="index"
    :prop="item.props"
    :align="item.align"
    :label="$t(item.labels)"
    :min-width="item.minWidth"
    v-else-if="item.props === 'amtRmb'"
  >
    <template slot-scope="scope">
      <el-input v-model="scope.row.amtRmb" style="width: 100%" @blur="scope.row.amtRmb = numberToCurrencyNo(scope.row.amtRmb)"></el-input>
    </template>
  </el-table-column>
</table>
```

```javascript
rowClick(row) { // 事件: 单选
  if (row.currRate === null) {
    this.syMessageBox('请先输入存款适用汇率.')
  }
  this.$refs.tableEBGC501M.toggleRowSelection(row)
}
```

---

## 解决办法
为`el-input`添加一个空点击事件, 然后为该事件添加修饰符`native.stop`阻止事件冒泡.

```html
<el-table-column
  :key="index"
  :prop="item.props"
  :align="item.align"
  :label="$t(item.labels)"
  :min-width="item.minWidth"
  v-if="item.props === 'currRate'"
>
  <template slot-scope="scope">
    <el-input v-model="scope.row.currRate" style="width: 100%" class="center-needed" @click.native.stop="() => {}"></el-input>
  </template>
</el-table-column>
```
