/**
 * 巡逻路线
 */
import React, {Component} from 'react'
import $ from "jquery"
import {Checkbox, message} from "antd"
import {Build, createMap, Model} from "../../../map3D/map3d"
import {
  getBuildList,
  getFloorList,
  getLineSelectCamera,
  setPatrolLine,
  getPatrolLine,
  getPatrolLineAll,
  delPatrolLine,
  updatePatrolLine
} from '../../../api/mainApi'
import './style.scss'

let handleKeyDown = null
let keydownLock = false

class PatrolRoute extends Component {
  constructor(props) {
    super(props)
    this.state = {
      routeGid: "",       //当前绘制路线的gid
      showRouteGid: "",   //当前展示路线的gid
      routeList: [],      //所有巡逻路线列表
      routeName: "",      //路线名称
      indoor: false,      //室内外
      buildId: "",        //建筑id
      floorId: "",        //楼层id
      bufferH: 10,         //缓冲区域高度
      flagNum: 0,
      flag_tab: false,    //当前绘制区域所含设备表
      buildList: [],      //建筑信息
      floorList: [],      //楼层信息
      geom: [],           //当前绘制路线的坐标
      cameraList: [],     //查询后的相机列表
      cameraPosition: {}, //当前点击编辑状态下的路线相机坐标
      oldRouteName: ""    //上一个路线名称
    }
    PatrolRoute.this = this
  }

  componentDidMount() {
    this.getPatrolLine()

    $(document).on("click", () => {
      $('.Alert').hide()
    })
  }

  componentWillUnmount() {
    this.closeRoute()
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
    console.log('显示路线', ev, item)
    $(ev.currentTarget).parent("li").siblings("li").removeClass("tr-color-btn-active");
    $(ev.currentTarget).parent("li").addClass("tr-color-btn-active");

    let floorId = item.floor_id
    let baseRouteZ = window.$config.baseRouteZ;

    // 根据路线所在楼层，计算一下 Z 值
    if (floorId) {
      // "V001_JZ0002#F003" => 3
      let floorNumber = Build.getFloorNumberByFloorId(floorId)
      baseRouteZ *= floorNumber
    }

    getPatrolLineAll({id: item.id}).then(res => {
      PatrolRoute.this.setState({
        cameraPosition: res.data,
        routeName: res.data.line_name,
        cameraList: res.data.patrol_line_subsection,
        flagNum: 1
      });
      PatrolRoute.this.setOperatingArea(true);
      let postion = [];
      res.data?.patrol_line_subsection?.forEach((msg, index) => {
        console.log('线坐标', msg)
        for (let index = 0; index < msg.options.length; index++) {
          const element = msg.options[index];
          let obj = {
            x: element.x,
            y: element.y,
            z: baseRouteZ
          };
          postion.push(obj)
        }
        // if (index === res.data.patrol_line_subsection.length - 1) {
        //   let obj2 = {
        //     x: msg.options.noodles[0][6],
        //     y: msg.options.noodles[0][7],
        //     z: baseRouteZ
        //   };
        //   postion.push(obj2);
        // }
      })
      PatrolRoute.this.showRoute(postion, res.data.remark);
    })

    // 室内的路线，要额外进行楼层分层处理
    if (item.indoor && item.build_id) {
      let buildName = item.build_id    // V001_JZ0001
      let floorId = item.floor_id      // V001_JZ0001#F001
      this.GetFloorList(item.build_id, () => {
        Build.showFloor(buildName, floorId, this.state.floorList.map(floor => floor.floor_name))
      })
    }
  }
  // 展示漫游线
  showRoute = (geom, center) => {
    console.log('线的数据', geom)
    const {showRouteGid} = this.state;

    createMap.FlyToPosition(JSON.parse(center));

    Model.removeGid(showRouteGid);

    setTimeout(() => {
      Model.carteLine(geom, res => {
        PatrolRoute.this.setState({
          showRouteGid: res.gid
        })
      })
    }, 20)
  }
  // 删除漫游线
  hideRoute = () => {
    const {showRouteGid} = this.state;
    Model.removeGid(showRouteGid);
    this.setState({showRouteGid: ""})
  }
  // 室内切换
  indoorChange = (e) => {
    this.setState({
      indoor: e.target.checked,
      buildList: [],
      floorList: []
    })
    e.target.checked && this.GetBuildList();

    // 室内切室外，显示所有的建筑外壳
    if (!e.target.checked) {
      Build.showAllBuilding()
    }
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
  GetFloorList = (id, cb) => {
    Build.showAllBuilding()

    getFloorList({build_id: id}).then(res => {
      PatrolRoute.this.setState({
        floorList: res.data,
        floorId: res.data[0].floor_id,
        buildId: res.data[0].build_id
      }, () => {
        cb && cb()
      })
    })
  }

  handleFloorChange = (e) => {
    let selectedFloorId = e.target.value

    const {
      buildId,
      floorList
    } = this.state

    Build.showFloor(buildId, selectedFloorId, floorList.map(floor => floor.floor_name))

    this.setState({floorId: selectedFloorId})
  }

  // 取消当前绘制路线记录
  closeRoute = () => {
    const {
      routeGid,
      showRouteGid
    } = this.state;
    PatrolRoute.this.hideRoute();
    Model.removeGid(routeGid);
    Model.removeGid(showRouteGid);
    this.setOperatingArea(false);
    this.clearAll();

    Build.showAllBuilding()

    Build.showDM(true)

    $('.tr-color-btn-active').removeClass("tr-color-btn-active");
  }

  // 绘制路线
  drawRoute = () => {
    const {routeGid} = this.state;
    message.warning("鼠标右键结束绘制");
    Model.removeGid(routeGid);
    PatrolRoute.this.setState({
      geom: [],
      flag_tab: false
    });

    // if(handleKeyDown) {
    //   window.removeEventListener('keydown', handleKeyDown)
    // }
    //
    // handleKeyDown = (e) => {
    //     console.log(e)
    //     // 按下键盘
    //     if(e.keyCode == 17) {
    //         keydownLock = true
    //     }
    // }

    // window.addEventListener('keydown', handleKeyDown)

    Model.drawLine(res => {
      console.log('end edit', res)

      let positions = [];
      Model.endEditing();
      this.setState({
        geom: res.points,
        routeGid: res.gid,
      })

      // for (let i = 0; i < res.points.length - 1; i++) {
      //   let arr = []
      //   let points = res.points[i];
      //   let points2 = res.points[i + 1];
      // let mian = this.getLinePoy(points, points2, "+");
      // let mian2 = this.getLinePoy(points, points2, "-");
      // arr = [
      //   {
      //     index: i,
      //     NoodlesLineZ: 0,
      //     line: [points.x, points.y],
      //     noodles: [mian, mian2],
      //     orientation: false
      //   }
      // ];
      // positions.push(arr);

      // }
      // positions.forEach(element => {
      //   element[0].noodles.forEach(element2 => {
      //     let newArr = []
      //     newArr.push({
      //       x: element2[0],
      //       y: element2[1],
      //       z: 380
      //     })
      //     newArr.push({
      //       x: element2[2],
      //       y: element2[3],
      //       z: 380
      //     })
      //     newArr.push({
      //       x: element2[4],
      //       y: element2[5],
      //       z: 380
      //     })
      //     newArr.push({
      //       x: element2[6],
      //       y: element2[7],
      //       z: 380
      //     })
      //     Model.createPolygon(newArr)
      //   });
      // });
      this.getLineSelectCamera(res.points);
    })
  }
  // 计算线段面
  getLinePoy = (postion, postion2, type) => {
    const {bufferH} = this.state;
    let hcY1;
    let hcY2;
    if (type === "+") {
      hcY1 = Number(postion.y) + bufferH * 500;
      hcY2 = Number(postion2.y) + bufferH * 500;
    } else {
      hcY1 = Number(postion.y) - bufferH * 500;
      hcY2 = Number(postion2.y) - bufferH * 500;
    }
    let noodles = [
      postion.x, postion.y,
      postion.x, hcY1,
      postion2.x, hcY2,
      postion2.x, postion2.y
    ];
    return noodles;
  }
  // 查询相机
  getLineSelectCamera = (positions) => {
    const {
      indoor,
      buildId,
      floorId,
      bufferH
    } = this.state;
    let json = {
      positions: positions,
      indoor: indoor,
      buffer: bufferH
    }
    if (indoor) {
      json["build_id"] = buildId;
      json["floor_id"] = floorId;
    }
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
      flag_tab: true
    });
  }
  // 是否启用方法
  setEnable = (item, type, flag) => {
    let {cameraList} = this.state;
    item[type] = flag;
    this.setState({
      cameraList: cameraList
    })
  }
  // 保存添加路线
  setPatrolLine = () => {
    const {
      oldRouteName,
      routeName,
      bufferH,
      indoor,
      buildId,
      floorId,
      cameraList
    } = this.state;
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
      if (indoor) {
        json["build_id"] = buildId;
        json["floor_id"] = floorId;
      }
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

        // 如果添加了室内的路线，保存成功后，应该显示所有楼层
        if (indoor) {
          Build.showAllBuilding()
        }
      })
    })
  }
  // 编辑修改巡逻路线
  updatePatrolLine = () => {
    const {
      oldRouteName,
      cameraPosition,
      routeName,
      cameraList,
      indoor
    } = this.state;
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

        // 如果修改了室内的路线，保存成功后，应该显示所有楼层
        if (indoor) {
          Build.showAllBuilding()
        }
      })
    })
  }
  // 删除巡逻路线
  delPatrolLine = (e, item) => {
    e.preventDefault();
    delPatrolLine({id: item.id}).then(res => {
      message.success("删除成功")
      PatrolRoute.this.getPatrolLine();
      PatrolRoute.this.hideRoute();
      PatrolRoute.this.setState({showRouteGid: ""});
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

  changeBool = (item, type, flag) => {
    flag = !flag;
    let {cameraList} = this.state;
    item[type] = flag;
    this.setState({
      cameraList: cameraList
    })
  }

  //向上向下排序
  towhere = (where, item) => {
    /**
     * 分析一下逻辑
     * //item拿到了当前项，where代表调整的方向
     *
     *
     */
    console.log('向哪里', where, item)

    let cameraList = this.state.cameraList;
    console.log('原始总数据', cameraList);

    let patrol_camera = [];
    let a1, a2;

    for (let index = 0; index < cameraList.length; index++) {
      const element = cameraList[index];
      for (let j = 0; j < element.patrol_camera.length; j++) {
        const element1 = element.patrol_camera[j];
        if (JSON.stringify(item) == JSON.stringify(element1)) {
          a1 = index;
          a2 = j;
          patrol_camera.push(element);
        }
      }
    }

    console.log('我是选中的那项', patrol_camera, item);

    let newCamera = JSON.parse(JSON.stringify(patrol_camera));
    console.log('我是深拷贝的新数组', newCamera);

    //调换顺序
    let newData = newCamera[0]

    for (let i = 0; i < newData.patrol_camera.length; i++) {
      const element2 = newData.patrol_camera[i];
      if (JSON.stringify(item) == JSON.stringify(element2)) {
        console.log('我是需要调换顺序的那项', item);
        console.log('点击的第几项', i);
        if (where == 'top') {
          if (i != 0) {
            newData.patrol_camera[i] = newData.patrol_camera[i - 1];
            newData.patrol_camera[i - 1] = item;
          } else {
            message.error("到顶了");
          }
        }


      }
    }
    console.log('看下1', newData.patrol_camera);
    newData.patrol_camera = newData.patrol_camera.filter(res => { return res != "undefined" });
    console.log('看下', newData.patrol_camera);

    console.log('顺序换了之后的', newCamera, a1, cameraList[a1]);
    //最终拿到的值，对的,newCamera
    cameraList[a1] = newCamera[0];
    console.log('最终切换的', cameraList)
    this.setState({
      cameraList: cameraList
    })
  }

  // 清空
  clearAll = () => {
    const {routeGid} = this.state;
    Model.removeGid(routeGid);
    this.setState({
      flagNum: 0,
      routeName: "",
      bufferH: 10,
      indoor: false,
      buildId: "",
      floorId: "",
      buildList: [],
      floorList: [],
      geom: [],
      cameraList: [],
      flag_tab: false,
      routeGid: ""
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
    const {
      routeList,
      flagNum,
      routeName,
      bufferH,
      indoor,
      flag_tab,
      buildList,
      floorList,
      geom,
      cameraList
    } = this.state;
    return (
      <div className="PatrolRoute">
        <div className="RightTitle">
          <span>巡逻路线</span>
          <img
            src={require("../../../assets/images/closeWhite.png").default}
            onClick={() => this.props.setMoudleId("")}
            alt=""
          />
        </div>
        <div className="PatrolRoute_list">
          <div className="PatrolRoute_list_button">
            <button className="ConfirmButton" onClick={() => this.addRouteBtn()}>设置新路线</button>
          </div>
          <ul>
            {routeList.map((item, index) => {
              return (
                <li key={item.id}>
                  <span
                    onClick={(e) => this.editView(e, item)}
                    onContextMenu={(e) => this.onContextMenu(e)}
                  >
                    {index + 1}.&nbsp;&nbsp;&nbsp;{item.line_name}
                  </span>
                  <div className="Alert" style={{display: "none"}}>
                    <p onClick={(e) => this.delPatrolLine(e, item)}>删除</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.closeRoute()}>
              <img src={require("../../../assets/images/shousuojt.png").default} alt=""/>
            </p>
          </div>
          {flagNum === 0 && <div className="rootline" style={{background: "#343434"}}>
            <div className="total-root">
              <div style={{paddingTop: "10px"}}>
                <p style={{color: "white"}}>
                  路线名称:
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => this.setOnChange(e, "routeName")}
                    className="inputAll" style={{marginLeft: "10px"}}
                  />
                </p>
              </div>
              <div style={{paddingTop: "10px"}}>
                <p style={{color: "white"}}>
                  缓冲区域宽度:
                  <input
                    type="number"
                    value={bufferH}
                    onChange={(e) => this.setOnChange(e, "bufferH")}
                    className="inputAll"
                    style={{
                      width: "100px",
                      marginLeft: "10px"
                    }}
                  />
                </p>
              </div>
              <div style={{paddingTop: "10px"}}>
                <p style={{color: "white"}}>
                  室内:
                  <Checkbox
                    onChange={(e) => this.indoorChange(e)} checked={indoor}
                    style={{marginLeft: "10px"}}
                  />
                  <select
                    disabled={!indoor}
                    className="sleAll"
                    style={{marginLeft: "10px", width: '180px'}}
                    onChange={(e) => this.GetFloorList(e.target.value)}
                  >
                    {buildList.map(item => {
                      return (
                        <option key={item.id} value={item.build_id}>{item.build_name}</option>
                      )
                    })}
                  </select>
                  <select
                    disabled={!indoor}
                    className="sleAll"
                    style={{marginLeft: "10px", width: '100px'}}
                    onChange={this.handleFloorChange}
                  >
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
              <button className="ConfirmButton" onClick={() => this.drawRoute()}>
                {geom && geom.length > 0 ? "重新绘制路线" : "绘制路线"}
              </button>
            </div>
            {flag_tab && < div className="body-table">
              <div className="table-view">
                <div className="table-mode">
                  <div className="table-tds">
                    <div className="table-td-item">段落</div>
                    <div className="table-td-item">名称</div>
                    <div className="table-td-item">是否启用</div>
                    {/* <div className="table-td-item">是否重用</div> */}
                    <div className="table-td-item">顺序调整</div>
                  </div>
                  <div className="table-trs-lists">
                    {cameraList.map((item, index) => {
                      return (
                        <div className="table-trs" key={index}>
                          <div
                            className="table-tr-item"
                            style={{
                              height: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px",
                              lineHeight: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px"
                            }}>
                            第{index + 1}段
                          </div>
                          <div className="table-tr-item-camera-list">
                            {item.patrol_camera.length > 0 ? item.patrol_camera.map((item2, index2) => {
                                return (
                                  <div className="table-tr-item-camera" key={index2}>
                                    <div className="table-tr-item-camera-item" title={item2.camera_name}>
                                      {item2.camera_name}
                                    </div>
                                    <div className="table-tr-item tr-color-btn">
                                    <span className='tr-color-btn-active' onClick={() => this.changeBool(item2, "enable", item2.enable)}>
                                      {item2.enable ? '是' : '否'}
                                    </span>
                                    </div>
                                    <div className="table-tr-item tr-color-btn">
                                      <span onClick={() => this.towhere('top', item2)}>向上</span>
                                    </div>
                                  </div>
                                )
                              }) :
                              <div className="table-tr-item-camera">
                                <div className="table-tr-item-camera-item">--</div>
                                <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                                <div className="table-tr-item tr-color"><span>是</span><span>否</span></div>
                              </div>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="table-btn">
                  <div className="table-ok" onClick={() => this.setPatrolLine()} style={{marginRight: "20px"}}>保存</div>
                  <div className="table-cancel" onClick={() => this.closeRoute()}>取消</div>
                </div>
              </div>
            </div>
            }
          </div>}
          {flagNum === 1 && <div className="rootline" style={{background: "#343434"}}>
            <div className="total-root">
              <div style={{paddingTop: "10px"}}>
                <p style={{color: "white"}}>
                  路线名称:
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => this.setOnChange(e, "routeName")}
                    className="inputAll"
                    style={{marginLeft: "10px"}}
                  />
                </p>
              </div>
              < div className="body-table">
                <div className="table-view">
                  <div className="table-mode">
                    <div className="table-tds">
                      <div className="table-td-item">段落</div>
                      <div className="table-td-item">名称</div>
                      <div className="table-td-item">是否启用</div>
                      <div className="table-td-item">顺序调整</div>
                    </div>
                    <div className="table-trs-lists">
                      {cameraList && cameraList.length > 0 && cameraList.map((item, index) => {
                        return (
                          <div className="table-trs" key={index}>
                            <div
                              className="table-tr-item"
                              style={{
                                height: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px",
                                lineHeight: item.patrol_camera.length > 0 ? item.patrol_camera.length * 25 + "px" : "25px"
                              }}>
                              第{index + 1}段
                            </div>
                            <div className="table-tr-item-camera-list">
                              {item.patrol_camera.length > 0 ? item.patrol_camera.map((item2, index2) => {
                                return (
                                  <div className="table-tr-item-camera" key={index2}>
                                    <div className="table-tr-item-camera-item" title={item2.camera_name}>
                                      {item2.camera_name}
                                    </div>
                                    <div className="table-tr-item tr-color-btn">
                                      <span className='tr-color-btn-active' onClick={() => this.changeBool(item2, "enable", item2.enable)}>
                                        {item2.enable ? '是' : '否'}
                                      </span>
                                    </div>
                                    <div className="table-tr-item tr-color-btn">
                                      <span onClick={() => this.towhere('top', item2)}>向上</span>
                                    </div>
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
          </div>}
        </div>
      </div>
    )
  }
}

export default PatrolRoute;
