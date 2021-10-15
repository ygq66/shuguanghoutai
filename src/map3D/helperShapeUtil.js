// 辅助工具
import {Model} from "./map3d";

let helperShapeUtil = {
  gid: 'HELPER',
  instance: null,
  // 绘制辅助工具
  createHelperShape(location = {x: 0, y: 0, z: 0}) {
    this.instance = {
      gid: this.gid, // 自定义gid，可以设置自定义前缀，用于点选匹配不同的对象
      type: 'cone',
      style: 'SplineOrangeHighlight1',
      radius: 100.0,    // 半径
      height: 120.0,    // 高
      // style: 'red',  // style 样式优先于color
      color: '#FF0000',
      location: Model.formatPos(location)
    };
    setTimeout(() => {
      window.$view3d.OverLayerCreateObject(this.instance);
    }, 500);
  },
  getHelperShape() {
    return this.instance;
  },
  updateHelperShapePos(pos) {
    let posNew = Model.formatPos(pos);
    let shape = this.getHelperShape()
    // console.log(shape)
    if (shape && posNew && window.$view3d) {
      shape.location = posNew;
      shape.location.pitch = 180;
      shape.location.z += 200;
      console.log('标注位置', posNew);
      window.$view3d.OverLayerUpdateObject(shape);
    }
  }
}
export default helperShapeUtil;