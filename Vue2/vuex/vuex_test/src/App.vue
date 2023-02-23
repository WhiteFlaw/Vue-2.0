<template>
  <div>
    <my-addition></my-addition>

    <p>----------------------------------</p>

    <my-substraction></my-substraction>
  </div>
</template>

<script>
import Addition from "./components/Addition.vue"
import Substraction from "./components/Substraction.vue"

export default {
  data() {
    return {}
  },
  components: {
    "my-addition": Addition,
    "my-substraction": Substraction,
  },
}
</script>

<style>
</style>
