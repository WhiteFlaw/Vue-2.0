<template>
  <div class="son" v-show="nowVisible">
    <p>{{ nowVisible }}</p>
    <!-- p应该需要绑定vue指令达到响应式 -->
    <p v-for="(item, index) in info" :key="index">{{ item.name }}</p>
    <!-- p应该需要绑定vue指令达到响应式 -->
    <button @click="closeSon">click to close</button>
  </div>
</template>

<script>
export default {
  name: "son",
  props: {
    visible: {
      type: Boolean,
      default: () => false,
    },
    sonInfo: {
      type: Array,
      default: () => "",
    },
  },
  data() {
    return {
      info: this.sonInfo,
      nowVisible: this.visible,
    };
  },
  watch: {
    sonInfo: {
      handler(newVal) {
        this.info = newVal;
      },
    },
    visible: {
      handler(newVal) {
        this.nowVisible = newVal;
      },
    },
  },
  created() {
    this.initSon();
  },
  methods: {
    initSon() {
      this.$emit("initSon", { params: 1 });
    },

    closeSon() {
      this.$emit('update:visible', false)
      this.nowVisible = false
    }
  },
};
</script>

<style>
</style>