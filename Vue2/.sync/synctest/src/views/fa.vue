<template>
  <div class="fa">
    <button @click="showSon">click to show</button>
    <son :visible="faNowVisible" @update:visible="hideSon" @initSon="initSon" :sonInfo="sonInfo"></son>
  </div>
</template>

<script>
import son from "../components/son";
export default {
  name: "fa", // 名字错了会导致栈溢出, 不可忽视
  components: {
    // 就是要加s, 一个也要加
    son,
  },
  data() {
    return {
      sonInfo: [],
      faNowVisible: false,
    };
  },
  methods: {
    mockReq(params) {
      const res = {
        code: 0,
        data: [
          { name: "xxxx", si: "xxxx" },
          { name: "xxx", si: "xxx" },
          { name: "xx", si: "xx" },
          { name: "x", si: "x" },
        ],
      };
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (params.params === 1) {
            resolve(res);
          }
        }, 1000);
      });
    },

    initSon(params) {
      this.mockReq(params).then((res) => {
        this.sonInfo = res.data;
      });
    },

    showSon() {
      this.faNowVisible = true;
    },

    hideSon(params) {
       this.faNowVisible = params;
    }
  },
};
</script>

<style>
</style>