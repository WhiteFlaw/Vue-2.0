<template>
  <div id="demo">
    <button @click="changeComputed">changeComputed</button>
    <input type="text" v-model="firstName" />
    <input type="text" v-model="lastName" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstName: "John",
      lastName: "Doe",
    };
  },
  computed: {
    fullName: {
      // getter
      get() {
        return this.firstName + " " + this.lastName;
      },
      // setter
      set(newValue) {
        // 注意：我们这里使用的是解构赋值语法
        this.firstName = newValue;
        this.lastName = newValue.split(" ");
      },
    },
  },
  methods: {
    changeComputed() {
      this.fullName = "bai X";
    },
  },
};
</script>
