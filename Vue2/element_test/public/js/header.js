// header.js
var Header = function (ui, onSceneChange) {
    this.sceneSelectorUi = ui.querySelector("#scene-selector");
    this.sceneSelectorUi.onchange= ((e) => {
      onSceneChange();
    })
  };
  
  export { Header };