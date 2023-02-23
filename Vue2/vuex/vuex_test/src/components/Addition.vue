<template>
  <div>
    <!-- <h3>当前最新的值为:{{ num }}</h3> -->
    <label for="name">向count增加: </label>
    <input type="text" name="name" />
    <h3>当前最新的值为:{{ this.$store.state.count }}</h3>
    <button @click="btnClick">增加</button>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex"

export default {
  // ...
  methods: {
    /* ...mapActions([
      'increment', // 将 `this.increment()` 映射为 `this.$store.dispatch('increment')`

      // `mapActions` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy', amount)`
    ]), */
    ...mapActions({
      adr: "increment", // 将 `this.add()` 映射为 `this.$store.dispatch('increment')`
    }),
    btnClick() {
      this.adr(4)
    },
  },
}
</script>
