import helperShapeUtil from "./helperShapeUtil";
import eventUtil from "./eventUtil";

var view3d;
var createObj = null;
var Polygon = null;
var allBuildModelObj = {};
//创建地图类
export const createMap = {
  createMap(options, callback) {
    //创建实例
    /* global MapVision */
    view3d = new MapVision.View3d({
      id: options.id,
      url: options.url,
      projectId: options.projectId,
      token: options.token,
    });
    view3d.Open((res) => {
      console.log("MapVision View3d " + res);
      view3d.OverLayerRemoveAll();
      createObj = null;
      view3d.OverLayerStopEdit();
      view3d.SetNorthControl(true, 0, 0, 0.5);
      window.$view3d = view3d; // 绑定实例
      [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
      ].forEach((item, index) => {
        window.addEventListener(item, function () {
          setTimeout(function () {
            SetResolution(options, view3d);
          }, 500);
        });
      });
      SetResolution(options, view3d);
      Build.getBuild((res) => {
        let buildObj = JSON.parse(res);
        if (buildObj.length > 0) {
          (function loopBuild(index) {
            Build.getFloor(buildObj[index].id, (msg2) => {
              // console.log(buildObj, index)
              // 处理一下index越界的可能
              if (index < buildObj.length) {
                allBuildModelObj[buildObj[index].id] = JSON.parse(msg2);
                if (++index < buildObj.length) {
                  loopBuild(index);
                } else {
                  // console.log(allBuildModelObj, "所有建筑楼层数据")
                }
              }
            });
          })(0);
        }
      });

      // 点击时, 设置鼠标事件
      // eventUtil.setMousedown();

      if (callback) {
        callback();
      }
    });
    // setTimeout(function () {
    //     Model.getModel();
    // }, 1000)
    window.onkeydown = function (event) {
      if (event.code === "F11") {
        event.preventDefault();
        fullScreen();
      }
      if (event.code === "F5") {
        window.location.reload();
      }
      if (event.code === "F10") {
        console.log("重新布局");
        SetResolution({ id: "mapv3dContainer" }, view3d);
      }
    };
    return view3d;
  },
  //设置屏幕
  SetResolution(id) {
    if (view3d) {
      var divObj = document.getElementById(id);
      if (!divObj) {
        return;
      }
      var width = divObj.clientWidth;
      var height = divObj.clientHeight;
      view3d.SetResolution(width, height);
    }
  },
  // 获取当前视角位置
  getCurrent(callback) {
    view3d.GetCurrentPosition((pos) => {
      var strPos = JSON.stringify(pos);
      callback(strPos);
    });
  },
  // 点击获取坐标值
  getMousePosition(callback) {
    view3d.SetMousePositionCallback((res) => {
      callback(res);
    });
  },
  //返回初始位置
  initialPosition() {
    view3d.ResetHome();
  },
  enableKeyboard() {
    if (view3d) {
      view3d.enableKeyboard = true;
      view3d.enableMouse = true;
    }
  },
  disableKeyboard() {
    if (view3d) {
      view3d.enableKeyboard = false;
      view3d.enableMouse = true;
    }
  },
  //飞到位置点
  FlyToPosition(pos) {
    // const pos = {
    //     x : -4843.27783203125,
    //     y : 2181.056640625,
    //     z : 2000,
    //     pitch : 90,  // 俯仰角 0——90度
    //     yaw : 0,   // 偏航角 0-360度
    //     roll : 0     // 翻滚角
    // };
    view3d.FlyToPosition(pos);
  },
  SetPosition(pos) {
    console.log("摄像机定位的");
    view3d.SetPosition(pos);
  },
  // 计算相对位置
  flyTo(pos, distance = 300, isBefore = true) {
    if (pos.x && pos.y && pos.z) {
      let posNew = Model.formatPos(pos);
      console.log("定位", posNew);

      if (isBefore) {
        posNew.yaw = (posNew.yaw + 180) % 360;
      }

      // 定位到相对位置
      posNew.pitch = 45;
      posNew.x -= Math.cos((posNew.yaw / 180) * Math.PI) * distance;
      posNew.y -= Math.sin((posNew.yaw / 180) * Math.PI) * distance;
      posNew.z += distance;
      console.log("定位计算后的相对位置", posNew);

      view3d.FlyToPosition(posNew);
    } else {
      console.error("设备未上图", pos);
      window.$message.error(`设备未上图 pos:${JSON.stringify(pos)}`);
    }
  },
  // 根据id飞到位置点
  flyToObjectById(item) {
    view3d.FlyToObjectById(
      item.gid,
      false,
      item.pitch && item.pitch,
      item.height && item.height
    );
  },
  // 获取所有门禁数据
  getEntranceGuard(callback) {
    let EntranceGuard = [];
    view3d.GetObjectsVisible((res) => {
      (function loop(index) {
        let gid = res[index].gid;
        if (gid.indexOf("DOOR") !== -1) {
          createMap.FindObjectById(gid, (msg2) => {
            EntranceGuard.push(msg2);
            if (++index < res.length) {
              loop(index);
            } else {
              callback(EntranceGuard);
            }
          });
        } else {
          if (++index < res.length) {
            loop(index);
          } else {
            callback(EntranceGuard);
          }
        }
      })(0);
    });
  },
  FindObjectById(gid, callback) {
    // 注意,此功能为异步操作
    view3d.FindObjectById(gid, (res) => {
      callback(res);
    });
  },

  // 设置对象的显示/隐藏
  updateObjectVisible(gid, visible) {
    view3d.UpdateObjectVisible(gid, visible);
  },

  getObjectsVisible(callback) {
    view3d.GetObjectsVisible((res) => {
      callback && callback(res);
    });
  },

  setObjectsVisible(objects) {
    view3d.SetObjectsVisible(objects);
  },
};
//模型标注类
export const Model = {
  //创建模型
  creatmodel(videoType, callback) {
    var obj = {
      type: "model",
      filename: videoType.fileName, // box, capsule, cone, cube, cylinder, pipe, pyramid, sphere, capsule
      radius: 1,
      scale: 1,
      attr: videoType.attr,
    };
    view3d.OverLayerStartEdit(obj, (res) => {
      var strObj = JSON.stringify(res);
      createObj = res;
      // var myDate = new Date()
      view3d.OverLayerStopEdit();
      // return strObj
      callback(strObj);
    });
  },
  //关闭编辑
  endEditing() {
    view3d.OverLayerStopEdit();
  },
  //修改坐标
  modify(obj) {
    // if (!createObj) {
    //     // alert("请先创建对象！");
    //     return;
    // }
    // var location = {
    //     x: locations.x,
    //     y: locations.y,
    //     z: locations.z,
    //     pitch: 0,
    //     yaw: locations.yaw,
    //     roll: 0
    // }
    // obj.location = location
    view3d.OverLayerUpdateObject(obj);
  },
  //删除所有模型
  allmove() {
    view3d.OverLayerRemoveAll();
    createObj = null;
    view3d.OverLayerStopEdit();
  },
  //加载模型
  modelLoading(strObj, callback) {
    var obj = {
      gid: strObj.gid,
      type: "model",
      filename: strObj.filename, // box, capsule, cone, cube, cylinder, pipe, pyramid, sphere, capsule
      radius: 1,
      scale: 1,
      attr: strObj.attr,
      location: {
        x: strObj.location.x,
        y: strObj.location.y,
        z: strObj.location.z,
        pitch: 0,
        yaw: strObj.location.yaw,
        roll: 0,
      },
    };
    // 注意,此功能为异步操作
    // console.log(obj,"strObj")
    view3d.OverLayerCreateObject(obj, (res) => {
      view3d.SetMouseCallback(null);
      createObj = res;
      // var strObj = JSON.stringify(createObj);
      callback(res);
      // alert(strObj);
    });
  },
  //加载标注
  labelLoading(strObj, callback) {
    const obj = {
      gid: strObj.gid,
      type: "label",
      text: strObj.text,
      font: "黑体",
      fontcolor: strObj.fontcolor,
      fontsize: strObj.fontsize,
      halign: "left", // left center right
      valign: "top", // bottom center top
      location: strObj.location,
      attr: strObj["attr"] ? strObj.attr : {},
    };
    view3d.OverLayerCreateObject(obj, (res) => {
      view3d.SetMouseCallback(null);
      callback(res);
    });
  },
  //删除当前模型对象
  delectObj(obj) {
    if (!createObj) {
      // alert("请先创建对象！");
      return;
    }

    view3d.OverLayerRemoveObject(obj);
    createObj = null;
    view3d.OverLayerStopEdit();
  },
  //创建文本模型
  LabelModel(strObj, callback) {
    const obj = {
      type: "label",
      text: strObj.text,
      font: "黑体",
      fontcolor: strObj.color,
      fontsize: strObj.size,
      halign: "left", // left center right
      valign: "top", // bottom center top
      attr: strObj["attr"] ? strObj.attr : {},

      // strObj["center"] ? {
      //     center: strObj.center
      // } : {}
    };
    view3d.OverLayerStartEdit(obj, (res) => {
      callback && callback(res);
      view3d.OverLayerStopEdit();
    });
  },

  // 添加模型。
  addExistModel(config) {
    view3d.OverLayerCreateObject(config);
  },

  // 编辑文本模型
  updeteLabelModel(obj) {
    view3d.OverLayerUpdateObject(obj);
  },
  //绘制面
  playPolygon(callback) {
    const obj = {
      type: "polygon",
      color: "#00ff00",
      points: [],
    };
    view3d.OverLayerStartEdit(obj, (res) => {
      var strObj = JSON.stringify(res);
      Polygon = res;
      view3d.OverLayerStopEdit();
      callback(strObj);
    });
  },
  //创建面
  createPolygon(point, callback, Color) {
    const obj = {
      type: "polygon",
      color: Color ? Color : "#00ff00",
      points: point,
    };
    view3d.OverLayerCreateObject(obj, (res) => {
      createObj = res;
      callback && callback(JSON.stringify(res));
    });
  },
  // 绘制多边形
  playPolygon2(item, callback) {
    const obj = {
      type: "polygon",
      color: item.color,
      linecolor: item.lineColor || "",
      linestyle: item.lineStyle || "",
      linevisible: true,
      linewidth: item.lineWidth || "",
      points: [],
    };
    view3d.OverLayerStartEdit(obj, (res) => {
      Polygon = res;
      view3d.OverLayerStopEdit();
      callback && callback(res);
    });
  },
  //删除面
  delectPolygon() {
    if (!Polygon) {
      // alert("请先创建对象！");
      return;
    }

    view3d.OverLayerRemoveObject(Polygon);
    Polygon = null;
    view3d.OverLayerStopEdit();
  },
  // 删除单个覆盖物
  delectMulch(selObj) {
    if (!selObj) {
      // alert("请先创建/选择对象！");
      return;
    }
    // alert("删除对象：" + selObj.gid);
    view3d.OverLayerRemoveObjectById(selObj.gid);
    // view3d.OverLayerRemoveObject(selObj);
    selObj = null;
  },
  removeGid(gid) {
    view3d && view3d.OverLayerRemoveObjectById(gid);
  },
  // 显示隐藏模型
  showModel(id, flag) {
    view3d.UpdateObjectVisible(id, flag);
  },
  //点击获取当前模型信息
  getModel() {
    // 过滤 对象  prefix 对象名称前缀   ，path 路径前缀
    var paramers = {
      prefix: "MP,T,J,V",
      path: "",
      speedroute: 10,
      showmouse: false,
    };
    view3d.SetParameters(paramers);
    // console.log("我被执行了");
    view3d.SetMouseCallback((res) => {
      // var strObj = JSON.stringify(res);
      console.log(res, "我被点击了");
      if (res.length === 0) {
        return;
      }
      let data = {};
      if (res.typename === "model") {
        data = {
          switchName: "model",
          Personnel: res,
        };
        helperShapeUtil.updateHelperShapePos(res.location); // 创建标注
      } else if (res.gid.split("_")[0] === "MP") {
        let buildarr = res.gid.split("_");
        buildarr.shift();
        let buildId = buildarr.join("_");
        buildId = buildId.substring(0, buildId.length - 3);
        console.log(buildarr, buildId, "我是被点击的建筑id");
        data = {
          switchName: "buildLable",
          Personnel: buildId,
        };
      }
      window.parent.postMessage(data, "*");
      // callback(strObj)
    });
  },
  addModelClickEvent() {
    var paramers = {
      prefix: "MP,TEMP,J",
      path: "",
      speedroute: 10,
    };
    view3d.SetParameters(paramers);
    view3d.SetMouseCallback((res) => {
      console.log(res);
    });
  },

  // 修改模型高亮颜色
  updateModelStyle(gid, style) {
    view3d.UpdateObjectStyle(gid, style);
  },
  // 绘制折线
  drawLine(callback) {
    const obj = {
      type: "linestring",
      color: "#ff0f00",
      points: [],
    };
    view3d.OverLayerStartEdit(obj, (res) => {
      console.log(res);
      if (callback) {
        callback(res);
      }
    });
  },
  // 创建折线
  carteLine(points, callback) {
    // 注意,此功能为异步操作
    const obj = {
      type: "linestring",
      style: "red",
      linewidth: 40.0,
      points: points,
    };
    view3d.OverLayerCreateObject(obj, (res) => {
      if (callback) {
        callback(res);
      }
    });
  },

  // 添加图片
  drawImageModel(config, callback) {
    const objConfig = {
      gid: config.gid || "",
      type: "image", // 10102  或  image
      style: config.src || "default",
      scale: config.scale || 1,
      attr: config,
    };
    view3d.OverLayerStartEdit(objConfig, (res) => {
      view3d.OverLayerStopEdit();
      callback && callback(res);
    });
  },

  // 高亮对象
  setObjectHighlight(modelAttribute) {
    if (view3d) {
      view3d.ClearHighlight();
      setTimeout(() => {
        view3d.SetObjectHighlight(modelAttribute.gid);
      }, 10);
    }
  },
  // 格式化坐标点
  formatPos(pos) {
    let posNew = { ...pos };
    posNew.x = parseFloat(posNew.x.toString());
    posNew.y = parseFloat(posNew.y.toString());
    posNew.z = parseFloat(posNew.z.toString());
    posNew.pitch = posNew.pitch ? parseFloat(posNew.pitch.toString()) : 0;
    posNew.yaw = posNew.yaw ? parseFloat(posNew.yaw.toString()) : 0;
    posNew.roll = posNew.roll ? parseFloat(posNew.roll.toString()) : 0;
    return posNew;
  },
};
//网格类
export const grid = {};
// 建筑楼层类
export const Build = {
  //地面显示隐藏
  showDM(groundVisible, view3d) {
    view3d && view3d.SetGroundVisible(groundVisible);
  },

  getBuild(callback) {
    view3d &&
      view3d.GetBuildingNames((res) => {
        callback && callback(JSON.stringify(res));
      });
  },
  getFloor(buildingName, callback) {
    view3d.GetFloorNames(buildingName, (res) => {
      var strObj = JSON.stringify(res);
      callback(strObj);
    });
  },

  /**
   * 提取楼层号
   * @param floorId V001_JZ0002#F003
   * @returns {number} 数字格式的楼层号
   */
  getFloorNumberByFloorId(floorId) {

    let floorName = floorId.split('#')[1]
    if (floorName) {
      return Build.getFloorNumberByName(floorName)
    }
    return
  },

  /**
   * 提取楼层号
   * @param floorNameString F001,B001的格式
   * @returns {number|number} 数字格式的楼层号
   */
  getFloorNumberByName(floorNameString) {
    let floorReg = /\d+/;
    let floorNumString = floorNameString.match(floorReg)[0];
    let isUnderFloor = floorNameString.startsWith("B");
    return floorNumString
      ? isUnderFloor
        ? Number(floorNumString) * -1
        : Number(floorNumString)
      : 1;
  },

  showAllFloor(buildId, floorList) {
    view3d.SetBuildingVisible(buildId, true);

    Array.isArray(floorList) && floorList.forEach(floorName => {
      view3d.SetFloorVisible(buildId  , floorName, true)
    })
  },

  // 楼层显示隐藏
  showFloor(buildingName, floorName, floor) {
    // let floorNum =
    //   Number(floorName.substring(floorName.length - 2)) >= 10
    //     ? Number(floorName.substring(floorName.length - 2))
    //     : Number(floorName.slice(-1));
    // var FLOOR = floorName.substr(0, 1);
    // floorName 的格式为：B001，F001之类的

    floorName = floorName.split("#")[1];
    let floorNum = Build.getFloorNumberByName(floorName);
    let isCurrentFloorUnderground = floorName.startsWith("B");

    if (isCurrentFloorUnderground) {
      floorNum = -floorNum;
      // 显示地下的情况时,把地面隐藏掉
      Build.showDM(false, view3d);
    } else {
      Build.showDM(true, view3d);
    }

    view3d.SetBuildingVisible(buildingName, floorName === "all" ? true : false);

    // floor undefined 的报错处理。
    if (!floor) {
      return;
    }

    floor.forEach((item, index) => {
      let FNum = Build.getFloorNumberByName(item);
      var ItmFloor = item.substr(0, 1);
      if (ItmFloor === "B") {
        FNum = -FNum;
      }

      let floorVisible = true;
      if (FNum > floorNum) {
        floorVisible = false;
      }

      view3d.SetFloorVisible(buildingName, item, floorVisible);

      if (index === floor.length - 1) {
        console.log("call get model");
        setTimeout(() => {
          Model.getModel(view3d);
        }, 1000);
      }
    });
    //猜测是这里
    // Model.getModel(view3d);
  },

  showAllBuilding() {
    if (view3d) {
      Build.getBuild((res) => {
        Array.from(JSON.parse(res)).forEach((item) => {
          view3d.SetBuildingVisible(item.id, true);
        });
      });
    }
  },
};
// 功能块
export const Event = {
  // 创建路线
  createRoute(routeData) {
    view3d.CreateRoute(routeData);
  },
  // 路径迅游
  patrolPath(routeData) {
    view3d.StartRoute(routeData);
  },
  // 路径迅游清除
  clearPatrolPath() {
    view3d.Clear();
  },
};

//设置屏幕
function SetResolution(options, view3d) {
  if (view3d) {
    var divObj = document.getElementById(options.id);
    if (!divObj) {
      // alert("error");
      return;
    }
    var width = divObj.clientWidth;
    var height = divObj.clientHeight;
    view3d.SetResolution(width, height);
  }
}

function fullScreen() {
  let el = document.documentElement;
  let rfs =
    el.requestFullScreen ||
    el.webkitRequestFullScreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  if (typeof rfs != "undefined" && rfs) {
    rfs.call(el);
  }
  return;
}
