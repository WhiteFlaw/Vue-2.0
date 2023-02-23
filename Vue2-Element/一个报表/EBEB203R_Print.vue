<!--
  @Description: 经营财务-会计管理-财务月度结算报表-费用报表-制造费用明细表
  @Author: Wang ShuYu
  @Date: 2022-10-10
-->
<template>
  <section class="report-print-container">
    <template v-for="(item, index) in reportDataPag">
      <Ebeb203r-preview
        :print-data="item"
        :index="index + 1"
        :key="'info' + index"
        is-print
      />
      <!-- <div class="page-size-span" :key="index">Page : {{ index + 1 }}</div> -->
    </template>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import Ebeb203rPreview from '@/views/finance/EBE_1/E_C_ZZZ/E_C_ZZZ_A/EBEB203R/report/EBEB203R_Preview.vue'

export default {
  name: 'Ebeb203rPrint',
  components:{
    Ebeb203rPreview
  },
  computed: {
    ...mapState('EBEB203R', [
      'reportDataPag'
    ])
  }
}
</script>
————————————————
版权声明：本文为CSDN博主「白瑕」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/qq_52697994/article/details/128200447
