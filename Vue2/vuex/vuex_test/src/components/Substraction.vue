<template>
  <div>
    <label for="name">使count减小: </label>
    <input name="name" type="text" v-model="cutValue" />
    <h3>当前最新的值为:{{ this.$store.state.count }}</h3>
    <button @click="btnHandler1(cutValue)">减小</button>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex"
export default {
  name: "Substraction",
  data() {
    return {
      cutValue: "",
    }
  }, 
  methods: {
    //...mapActions(["AsyncFun"]),
    btnHandler1() {
      //this.AsyncFun(cutValue);
      this.$store.getters.cutCount();
      //console.log(this.$store.getters);
    },
  },
}
</script>
