// editor.js
import { Header } from './header.js';

function Editor(editorUi) {
    this.init = function () {
      console.log(editorUi);
      this.header = new Header(editorUi.querySelector("#header"), (e) => {
        this.scene_changed();
      });
    }
    this.scene_changed = function() {
        console.log('1111');
    };
    this.init();
  }
  
  export { Editor };