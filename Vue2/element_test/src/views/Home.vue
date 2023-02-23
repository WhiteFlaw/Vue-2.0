<template>
  <div id="home">
    <div id="main-editor"></div>
  </div>
</template>

<script>
import { Editor } from "../../public/js/editor.js";

export default {
  name: "Home",
  created() {
    this.$nextTick(() => {
      this.start();
    });
  },
  methods: {
    async start() {
      let mainEditor = await this.createMainEditor();
    },
    
    async createMainEditor() {
      let maindiv = document.querySelector("#main-editor");
      maindiv.appendChild(main_ui);

      let editor = new Editor(maindiv.lastElementChild);
      window["editor"] = editor;
      return editor;
    }
  },
};
</script>
