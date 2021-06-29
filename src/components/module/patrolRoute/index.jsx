import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { Checkbox, message } from "antd";
// import { ChromePicker } from "react-color";
import { createMap, Model } from "../../../map3D/map3d";
import { getBuildList, getFloorList, getLineSelectCamera, setPatrolLine, getPatrolLine, getPatrolLineAll, delPatrolLine, updatePatrolLine } from '../../../api/mainApi';
// import { message } from 'antd';
class PatrolRoute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routeGid: "",//当前绘制路线的gid
      showRouteGid: "",//当前展示路线的gid
      routeList: [],//所有巡逻路线列表
      routeName: "",//路线名称
      indoor: false,//室内外
      buildId: "",//建筑id
      floorId: "",//楼层id
      bufferH: 0,//缓冲区域高度
      flagNum: 0,
      flag_tab: false,//当前绘制区域所含设备表
      buildList: [],//建筑信息
      floorList: [],//楼层信息
      geom: [],//当前绘制路线的坐标
      cameraList: [],//查询后的相机列表
      cameraPosition: {},//当前点击编辑状态下的路线相机坐标
      oldRouteName: "",//上一个路线名称
    };
    PatrolRoute.this = this;
  }
  componentDidMount() {
    this.getPatrolLine();
    $(document).on("click", () => {
      $('.Alert').hide();
    })
  }
  // v-model数据绑定
  setOnChange = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
  }
  // 获取巡逻路线
  getPatrolLine = () => {
    getPatrolLine().then(res => {
      PatrolRoute.this.setState({
        routeList: res.data
      })
    })
  }
  // 巡逻路线编辑查看
  editView = (ev, item) => {
    $(ev.currentTarget).parent("li").siblings("li").removeClass("tr-color-btn-active");
    $(ev.currentTarget).parent("li").addClass("tr-color-btn-active");
    getPatrolLineAll({ id: item.id }).then(res => {
      PatrolRoute.this.setState({
        cameraPosition: res.data,
        routeName: res.data.line_name,
        cameraList: res.data.patrol_line_subsection,
        flagNum: 1
      });
      PatrolRoute.this.setOperatingArea(true);
      let postion = []
      res.data.patrol_line_subsection.forEach((msg, index) => {
        let obj = {
          x: msg.options.noodles[0][0],
          y: msg.options.noodles[0][1],
          z: 380
        };
        postion.push(obj)
        if (index === res.data.patrol_line_subsection.length - 1) {
          let obj2 = {
            x: msg.options.noodles[0][2],
            y: msg.options.noodles[0][3],
            z: 380
          };
          postion.push(obj2);
        }
      })
      PatrolRoute.this.showRoute(postion, res.data.remark);
    })
  }
  // 展示漫游线
  showRoute = (geom, center) => {
    const { showRouteGid } = this.state;
    createMap.FlyToPosition(JSON.parse(center));
    Model.removeGid(showRouteGid);
    Model.carteLine(geom, res => {
      PatrolRoute.this.setState({
        showRouteGid: res.gid
      })
    })
  }
  // 删除漫游线
  hideRoute = () => {
    const { showRouteGid } = this.state;
    Model.removeGid(showRouteGid);
    this.setState({ showRouteGid: "" })
  }
  // 室内切换
  indoorChange = (e) => {
    this.setState({
      indoor: e.target.checked,
      buildList: [],
      floorList: []
    })
    e.target.checked && this.GetBuildList();
  }
  // 获取建筑列表
  GetBuildList = () => {
    getBuildList().then(res => {
      PatrolRoute.this.setState({
        buildList: res.data
      });
      res.data.length > 0 && PatrolRoute.this.GetFloorList(res.data[0].build_id);
    })
  }
  // 获取楼层列表
  GetFloorList = (id) => {
    getFloorList({ build_id: id }).then(res => {
      PatrolRoute.this.setState({
        floorList: res.data,
        floorId: res.data[0].floor_id,
        buildId: res.data[0].build_id
      })
    })
  }
  // 取消当前绘制路线记录
  closeRoute = () => {
    const { routeGid } = this.state;
    PatrolRoute.this.hideRoute();
    Model.removeGid(routeGid);
    this.setOperatingArea(false);
    this.clearAll();
    $('.tr-color-btn-active').removeClass("tr-color-btn-active");
  }
  // 绘制路线
  drawRoute = () => {
    const { routeGid } = this.state;
    message.warning("鼠标右键结束绘制");
    Model.removeGid(routeGid);
    PatrolRoute.this.setState({
      geom: [],
      flag_tab: false
    });
    Model.drawLine(res => {
      let positions = [];
      Model.endEditing();
      this.setState({
        geom: res.points,
        routeGid: res.gid
      })
      for (let i = 0; i < res.points.length - 1; i++) {
        let arr = []
        let points = res.points[i];
        let points2 = res.points[i + 1];
        let mian = this.getLinePoy(points, points2, "+");
        let mian2 = this.getLinePoy(points, points2, "-");
        arr = [
          {
            index: i,
            NoodlesLineZ: 0,
            line: [points.x, points.y],
            noodles: [mian, mian2],
            orientation: false
          }
        ];
        positions.push(arr);
      }
      this.getLineSelectCamera(positions);
    })
  }
  // 计算线段面
  getLinePoy = (postion, postion2, type) => {
    const { bufferH } = this.state;
    let hcY1;
    let hcY2;
    if (type === "+") {
      hcY1 = Number(postion.y) + bufferH * 500;
      hcY2 = Number(postion2.y) + bufferH * 500;
    } else {
      hcY1 = Number(postion.y) - bufferH * 500;
      hcY2 = Number(postion2.y) - bufferH * 500;
    }
    let noodles = [postion.x, postion.y, postion2.x, postion2.y, postion.x, hcY1, postion2.x, hcY2];
    return noodles;
  }
  // 查询相机
  getLineSelectCamera = (positions) => {
    const { indoor, buildId, floorId } = this.state;
    let json = {
      positions: positions,
      indoor: indoor
    }
    if (indoor) { json["build_id"] = buildId; json["floor_id"] = floorId; }
    getLineSelectCamera(json).then(res => {
      PatrolRoute.this.setState({
        cameraList: res.data,
        flag_tab: true
      })
    })
  }
  // 结束绘制路线
  drawRouteOver = () => {
    Model.endEditing();
    PatrolRoute.this.setState({
      flag_tab: true,
    });
  }
  // 是否启用方法
  setEnable = (item, type, flag) => {
    let { cameraList } = this.state;
    item[type] = flag;
    this.setState({
      cameraList: cameraList
    })
  }
  // 保存添加路线
  setPatrolLine = () => {
    const { oldRouteName, routeName, bufferH, indoor, buildId, floorId, cameraList } = this.state;
    if (routeName === "") {
      message.error("请先填写路线名称")
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        line_name: routeName,
        buffer: bufferH,
        indoor: indoor,
        patrol_line_subsection: cameraList,
        build_id: "",
        floor_id: "",
        remark: msg
      }
      if (indoor) { json["build_id"] = buildId; json["floor_id"] = floorId; }
      if (oldRouteName === routeName) {
        return;
      }
      setPatrolLine(json).then(res => {
        message.success("添加成功");
        PatrolRoute.this.getPatrolLine();
        PatrolRoute.this.clearAll();
        PatrolRoute.this.setOperatingArea(false);
        PatrolRoute.this.setState({
          oldRouteName: routeName
        });
      })
    })
  }
  // 编辑修改巡逻路线
  updatePatrolLine = () => {
    const { oldRouteName, cameraPosition, routeName, cameraList } = this.state;
    if (routeName === "") {
      message.error("请先填写路线名称")
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        id: cameraPosition.id,
        line_name: routeName,
        buffer: cameraPosition.buffer,
        indoor: cameraPosition.indoor,
        build_id: cameraPosition.build_id,
        floor_id: cameraPosition.floor_id,
        patrol_line_subsection: cameraList,
        remark: msg
      }
      if (oldRouteName === routeName) {
        return;
      }
      updatePatrolLine(json).then(res => {
        message.success("修改成功");
        PatrolRoute.this.getPatrolLine();
        PatrolRoute.this.clearAll();
        PatrolRoute.this.hideRoute();
        PatrolRoute.this.setOperatingArea(false);
        $('.tr-color-btn-active').removeClass("tr-color-btn-active");
        PatrolRoute.this.setState({
          oldRouteName: routeName
        });
      })
    })
  }
  // 删除巡逻路线
  delPatrolLine = (e, item) => {
    e.preventDefault();
    delPatrolLine({ id: item.id }).then(res => {
      message.success("删除成功")
      PatrolRoute.this.getPatrolLine();
      PatrolRoute.this.hideRoute();
      PatrolRoute.this.setState({ showRouteGid: "" });
      PatrolRoute.this.setOperatingArea(false);
    })
  }
  // 显示/隐藏操作栏
  setOperatingArea = (flag) => {
    if (flag) {
      $(".PatrolRoute").find(".ContractionArea").slideDown();
      PatrolRoute.this.setState({
        oldRouteName: ""
      });
    } else {
      $(".PatrolRoute").find(".ContractionArea").slideUp();
    }
  }
  // 添加新路线
  addRouteBtn = () => {
    this.hideRoute();
    this.clearAll();
    this.setOperatingArea(true);
  }
  // 清空
  clearAll = () => {
    const { routeGid } = this.state;
    Model.removeGid(routeGid);
    this.setState({
      flagNum: 0,
      routeName: "",
      bufferH: 0,
      indoor: false,
      buildId: "",
      floorId: "",
      buildList: [],
      floorList: [],
      geom: [],
      cameraList: [],
      flag_tab: false,
      routeGid: "",
    });
    $('.tr-color-btn-active').removeClass("tr-color-btn-active");
  }
  // 右键事件
  onContextMenu = (e) => {
    e.preventDefault();
    $('.Alert').hide();
    $(e.currentTarget).siblings(".Alert").show();
    $(e.currentTarget).parent("li").siblings("li").removeClass("tr-color-btn-active");
    $(e.currentTarget).parent("li").addClass("tr-color-btn-active");
  }
  render() {
    const { routeList, flagNum, routeName, bufferH, indoor, flag_tab, buildList, floorList, geom, cameraList } = this.state;
    return (
      <div className="PatrolRoute">
        <div className="RightTitle">
          <span>巡逻路线</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
        </div>
        <div className="PatrolRoute_list">
          <div className="PatrolRoute_list_button">
            <button className="ConfirmButton" onClick={() => this.addRouteBtn()}>设置新路线</button>
          </div>
          <ul>
            {routeList.map((item, index) => {
              return (
                <li key={item.id}><span onClick={(e) => this.editView(e, item)} onContextMenu={(e) => this.onContextMenu(e)}>{index + 1}.&nbsp;&nbsp;&nbsp;{item.line_name}</span>
                  <div className="Alert" style={{ display: "none" }}>
                    <p onClick={(e) => this.delPatrolLine(e, item)}>删除</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.closeRoute()}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
          </div>
          {flagNum === 0 && <div className="rootline" style={{ background: "#343434" }}>
            <div className="total-root">
              <div style={{ paddingTop: "10px" }}>
                <p style={{ color: "white" }}>路线名称:<input type="text" value={routeName} onChange={(e) => this.setOnChange(e, "routeName")} className="inputAll" style={{ marginLeft: "10px" }} /></p>
              </div>
              <div style={{ paddingTop: "10px" }}>
                <p style={{ color: "white" }}>缓冲区域宽度:<input type="number" value={bufferH} onChange={(e) => this.setOnChange(e, "bufferH")} className="inputAll" style={{ width: "100px", marginLeft: "10px" }} /></p>
              </div>
              <div style={{ paddingTop: "10px" }}>
                <p style={{ color: "white" }}>室内:<Checkbox onChange={(e) => this.indoorChange(e)} checked={indoor} style={{ marginLeft: "10px" }}></Checkbox>
                  <select className="sleAll" style={{ marginLeft: "10px" }} onChange={(e) => this.GetFloorList(e.target.value)}>
                    {buildList.map(item => {
                      return (
                        <option key={item.id} value={item.build_id}>{item.build_name}</option>
                      )
                    })}
                  </select>
                  <select className="sleAll" style={{ marginLeft: "10px" }} onChange={(e) => { this.setState({ floorId: e.target.value }) }}>
                    {floorList.map(item => {
                      return (
                        <option key={item.id} value={item.floor_id}>{item.floor_name}</option>
                      )
                    })}
                  </select>
                </p>
              </div>
            </div>
            <div className="DrawRoute_button">
              <button className="ConfirmButton" onClick={() => this.drawRoute()}>{geom.length > 0 ? "重新绘制路线" : "绘制路线"}</button>
            </div>
            {flag_tab && < div className="body-table">
              <div className="table-view">
                <div className="table-mode">
                  <div className="table-tds">
                    <div className="table-td-item">段落</div>
                    <div className="table-td-item">名称</div>
                    <div className="table-td-item">是否启用</div>
                    <div className="table-td-item">是否重用</div>
                  </div>
                  <div className="table-trs-lists">
                    {cameraList.map((item, index) => {
                      return (
                        <div className="table-trs" key={index}>
                          <div className="table-tr-item" style={{ height: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px", lineHeight: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px" }}>第{index + 1}段</div>
                          <div className="table-tr-item-camera-list">
                            {item.patrol_camera.length > 0 ? item.patrol_camera.map((item2, index2) => {
                              return (
                                <div className="table-tr-item-camera" key={index2}>
                                  <div className="table-tr-item-camera-item" title={item2.camera_name}>{item2.camera_name}</div>
                                  <div className="table-tr-item tr-color-btn"><span className={item2.enable ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "enable", true)}>是</span><span className={!item2.enable ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "enable", false)}>否</span></div>
                                  <div className="table-tr-item tr-color-btn"><span className={item2.key ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "key", true)}>是</span><span className={!item2.key ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "key", false)}>否</span></div>
                                </div>
                              )
                            }) : <div className="table-tr-item-camera">
                              <div className="table-tr-item-camera-item">--</div>
                              <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                              <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                            </div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="table-btn">
                  <div className="table-ok" onClick={() => this.setPatrolLine()} style={{ marginRight: "20px" }}>保存</div>
                  <div className="table-cancel" onClick={() => this.closeRoute()}>取消</div>
                </div>
              </div>
            </div>
            }
          </div>}
          {flagNum === 1 && <div className="rootline" style={{ background: "#343434" }}>
            <div className="total-root">
              <div style={{ paddingTop: "10px" }}>
                <p style={{ color: "white" }}>路线名称:<input type="text" value={routeName} onChange={(e) => this.setOnChange(e, "routeName")} className="inputAll" style={{ marginLeft: "10px" }} /></p>
              </div>
              {/* <div style={{ paddingTop: "10px" }}>
                <p style={{ color: "white" }}>缓冲区域宽度:<input type="number" value={bufferH} onChange={(e) => this.setOnChange(e, "bufferH")} className="inputAll" style={{ width: "100px", marginLeft: "10px" }} /></p>
              </div> */}
              < div className="body-table">
                <div className="table-view">
                  <div className="table-mode">
                    <div className="table-tds">
                      <div className="table-td-item">段落</div>
                      <div className="table-td-item">名称</div>
                      <div className="table-td-item">是否启用</div>
                      <div className="table-td-item">是否重用</div>
                    </div>
                    <div className="table-trs-lists">
                      {cameraList.map((item, index) => {
                        return (
                          <div className="table-trs" key={index}>
                            <div className="table-tr-item" style={{ height: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px", lineHeight: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px" }}>第{index + 1}段</div>
                            <div className="table-tr-item-camera-list">
                              {item.patrol_camera.length > 0 ? item.patrol_camera.map((item2, index2) => {
                                return (
                                  <div className="table-tr-item-camera" key={index2}>
                                    <div className="table-tr-item-camera-item" title={item2.camera_name}>{item2.camera_name}</div>
                                    <div className="table-tr-item tr-color-btn"><span className={item2.enable ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "enable", true)}>是</span><span className={!item2.enable ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "enable", false)}>否</span></div>
                                    <div className="table-tr-item tr-color-btn"><span className={item2.key ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "key", true)}>是</span><span className={!item2.key ? "tr-color-btn-active" : ""} onClick={() => this.setEnable(item2, "key", false)}>否</span></div>
                                  </div>
                                )
                              }) : <div className="table-tr-item-camera">
                                <div className="table-tr-item-camera-item">--</div>
                                <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                                <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                              </div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="table-btn">
                    <div className="table-ok" onClick={() => this.updatePatrolLine()}>保存</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          }
        </div>

      </div >

    );
  }
}

export default PatrolRoute;