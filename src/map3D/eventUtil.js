import {Model} from "./map3d";

let eventUtil = {
  // 设置
  setMousedown() {
    window.onmousedown = function (e) {
      Model.getModel();
    }
  },
  // 取消设置
  unSetMousedown() {
    window.onmousedown = () => { }
  }
}

export default eventUtil