import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { createMap, Model, Build } from "../../../map3D/map3d";
import {
  getBuildList,
  getFloorList,
  getPeopleLocation,
  setPeopleLocation,
  delPeopleLocation
} from '../../../api/mainApi';
import { message } from 'antd';

class PerPosition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOne: false,
      perList: [],
      flagNum: 0,
      listNum: -1,
      NodeTreeItem: null,//当前选中的数据
      flag_Node: false,//是否编辑操作区域
      name: "",//区域名称
      buildId: "",//建筑id
      floorId: "",//楼层id
      center:null,
      oldbuildId: "",//上一个建筑id
      buildList: [],//建筑列表
      floorList: [],//楼层列表
      ModelPolygon: null,//当前绘制的object
      flag_edit: false,//是否编辑
      oldName: ""//上一个名称
    };
    PerPosition.this = this;

    this.listContainerRef = React.createRef()
  }

  componentDidMount() {
    this.GetBuildList();
    this.getPeopleLocation();
    $(document).on("click", () => {
      PerPosition.this.setState({
        flag_Node: false
      });
    })
  }

  // v-model数据绑定
  setOnChange = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
  }
  // 获取床位信息
  getPeopleLocation = () => {
    getPeopleLocation().then(res => {
      console.log(res,"查询到了啥");
      let item = res.data;
      // debugger
      console.log(item,"item有什么");
      PerPosition.this.setState({
        perList: item
      })
    })
  }
  // 获取建筑列表
  GetBuildList = () => {
    getBuildList().then(res => {
      PerPosition.this.setState({
        buildList: res.data
      });
      res.data.length > 0 && PerPosition.this.GetFloorList(res.data[0].build_id);
    })
  }
  // 获取楼层列表
  GetFloorList = (id) => {
    PerPosition.this.showFloorAll();
    getFloorList({build_id: id}).then(res => {
      PerPosition.this.setState({
        floorList: res.data,
        floorId: res.data[0].floor_id,
        buildId: res.data[0].build_id,
        oldbuildId: res.data[0].build_id
      })
      setTimeout(() => {
        if (PerPosition.this.state.isOne) {
          PerPosition.this.showFloor();
        }
        PerPosition.this.setState({isOne: true})
      }, 100)
    })
  }
  // 楼层切换事件
  floorQiehuan = (e) => {
    debugger
    this.setState({floorId: e.target.value});
    setTimeout(() => {
      PerPosition.this.showFloor();
    }, 0)
  }
  // 楼层全部展示
  showFloorAll = () => {
    // const {
    //   floorList,
    //   oldbuildId
    // } = this.state;
    // let floor = [];
    // floorList.forEach(res => {
    //   let floor_id = res.floor_id.split("#")[1];
    //   floor.push(floor_id);
    // })
    // Build.showFloor(oldbuildId, "all", floor);
    Build.showAllBuilding()
  }
  // 楼层掀层
  showFloor = () => {
    const {
      floorList,
      floorId,
      buildId
    } = this.state;
    let floor = [];
    floorList.forEach(res => {
      let floor_id = res.floor_id.split("#")[1];
      floor.push(floor_id);
    })
    let build_id = buildId;
    let floor_id = floorId;
    floor_id = floor_id.split("#")[1];
    Build.showFloor(build_id, floor_id, floor);
  }
  // 左键点击事件
  onSelect = (item, index) => {
    debugger
    console.log(item,"111");
    const {ModelPolygon} = this.state;
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid)
    }
    PerPosition.this.showPolygon(item)
    this.setState({
      flag_Node: false,
      NodeTreeItem: item,
      listNum: index
    });
  }
  // 展示面
  showPolygon = (item) => {
    debugger
    console.log(item,"面item")
    // this.setState({floorId: item.floorid});
    const {ModelPolygon} = this.state;
    debugger
    // Build.showFloor(item.build_id, item.floor_id, item.floorid);
    this.setState({floorId: item.floorid});
    setTimeout(() => {
      PerPosition.this.showFloor();
    }, 0)
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid);
    }
    // const pos = {
    //   x: item[0].x,
    //   y: item[0].y,
    //   z: item[0].z,
    //   pitch: 40,  // 俯仰角 0——90度
    //   yaw: 0,   // 偏航角 0-360度
    //   roll: 0     // 翻滚角
    // };
    createMap.FlyToPosition({
      distance: 100,
      pitch: 74.98384857177734,
      roll: 0,
      x: -675.12451171875,
      y: 6571.580078125,
      yaw: 94.12491607666016,
      z: 13819.7255859375
    })
    Model.createPolygon(item.content, res => {
      PerPosition.this.setState({
        ModelPolygon: JSON.parse(res)
      });
    });
  }
  // 右键点击事件
  onRightClick = (event, item, index) => {
    event.preventDefault();
    var x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
    var y = event.currentTarget.offsetTop;
    const containerScrollTop = this.listContainerRef.current.scrollTop
    this.setState({
      flag_Node: true,
      NodeTreeItem: {
        ...item,
        pageX: x,
        pageY: y - containerScrollTop
      },
      listNum: index
    });
    // console.log(x, y, item, "item")
  }

  // 右键操作面板
  getNodeTreeMenu() {
    const {
      pageX,
      pageY
    } = {...this.state.NodeTreeItem};
    const tmpStyle = {
      left: `${pageX + 5}px`,
      top: `${pageY}px`,
      display: "flex"
    };
    const menu = (
      <div className="Alert" style={tmpStyle}>
        <p onClick={() => this.editBtn(this.state.NodeTreeItem)}>修改</p>
        <p onClick={() => this.delPeopleLocation(this.state.NodeTreeItem)}>删除</p>
      </div>
    );
    return menu;
  }

  // 显示/隐藏操作栏
  setOperatingArea = (flag) => {
    if (flag) {
      $(".PerPosition").find(".ContractionArea").slideDown();
      PerPosition.this.setState({
        oldName: ""
      });
    } else {
      $(".PerPosition").find(".ContractionArea").slideUp();
      this.clearData(true);
    }
  }
  // 新建房间/床位
  addBtn = () => {
    this.setState({
      flag_edit: true
    });
    this.clearData();
    setTimeout(() => {
      PerPosition.this.setOperatingArea(true);
    }, 100)
  }
  // 修改房间/床位
  editBtn = (item) => {
    this.showPolygon(item);
    console.log(item,"修改床位");
    this.setState({
      name: item.location_name,
      flag_edit: false
    });
    PerPosition.this.GetFloorList(item.build_id);
    setTimeout(() => {
      PerPosition.this.setState({
        buildId: item.build_id,
        floorId: item.floor_id
      });
    }, 100);
    setTimeout(() => {
      PerPosition.this.setOperatingArea(true);
    }, 100)
  }
  // 清空
  clearData = (flag) => {
    const {
      buildList,
      ModelPolygon
    } = this.state;
    if (ModelPolygon !== null) {
      Model.removeGid(ModelPolygon.gid);
      PerPosition.this.setState({
        ModelPolygon: null
      })
    }
    this.setState({
      name: "",
      listNum: -1
    });
    if (flag) {
      this.showFloorAll();
    } else {
      this.GetFloorList(buildList[0].build_id);
    }
    Model.endEditing();
  }
  // 绘制区域
  drawPolygon = () => {
    const {ModelPolygon} = this.state;
    message.warning("鼠标右键结束绘制");
    if (ModelPolygon !== null) {
      Model.removeGid(ModelPolygon.gid);
      PerPosition.this.setState({
        ModelPolygon: null
      })
    }
    Model.playPolygon(res => {
      console.log(res, "面")
      PerPosition.this.setState({
        ModelPolygon: JSON.parse(res)
      })
    })
  }
  // 添加or修改人员定位信息
  setPeopleLocation = (flag) => {
    const {
      oldName,
      name,
      buildId,
      floorId,
      ModelPolygon,
      NodeTreeItem,
      perList,

    } = this.state;
    if (name === "") {
      message.error("请先填写区域名称");
      return;
    } else if (ModelPolygon === null) {
      message.error("请先绘制区域");
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        location_name: name,
        build_id: buildId,
        floor_id: floorId,
        order: perList.length,

        positions: {
          ...ModelPolygon,
          center: JSON.parse(msg)
        }
      }
      if (!flag) {
        json["id"] = NodeTreeItem.id;
      }
      if (oldName === name) {
        return;
      }
      console.log(json,"json")
      setPeopleLocation({
        indoor:true,
        floorid:json.floor_id,
        buildid:json.build_id,
        name:json.location_name,
        content:json.positions.points,

      }).then(res => {
        message.success(flag ? "添加成功" : "修改成功");
        PerPosition.this.getPeopleLocation();
        PerPosition.this.setOperatingArea(false);
        PerPosition.this.setState({
          oldName: name
        });
      })
    })

  }
  // 删除房间
  delPeopleLocation = (item) => {
    delPeopleLocation({id: item.id}).then(res => {
      message.success("删除成功");
      PerPosition.this.getPeopleLocation();
      PerPosition.this.setOperatingArea(false);
    })
  }
  setMoudleId = () => {
    const {ModelPolygon} = this.state;
    PerPosition.this.showFloorAll();
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid);
    }
    this.props.setMoudleId("");
  }

  render() {
    const {
      listNum,
      perList,
      NodeTreeItem,
      flag_Node,
      name,
      buildList,
      floorList,
      buildId,
      floorId,
      ModelPolygon,
      flag_edit
    } = this.state;
    return (
      <div className="PerPosition">
        <div className="RightTitle">
          <span>区域定位</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.setMoudleId()} alt=""/>
        </div>
        <div className="CreateLayer_button">
          <button className="CreateLayerbutton" onClick={() => this.addBtn()}>新建区域</button>
        </div>
        <div className="domtree2">
          <ul ref={this.listContainerRef}>
            {perList.map((item, index) => {
              
              return (
                <li key={index}>
                  <span
                    className={listNum === index ? "active" : ""}
                    onContextMenu={(e) => this.onRightClick(e, item, index)}
                    onClick={() => this.onSelect(item, index)}>{index + 1}.&nbsp;&nbsp;&nbsp;{item.name}
                  </span>
                </li>
              )
            })}
          </ul>
          {NodeTreeItem !== null && flag_Node ? this.getNodeTreeMenu() : ""}
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.setOperatingArea(false)}><img
              src={require("../../../assets/images/shousuojt.png").default} alt=""/></p>
          </div>
          <div className="RoomName">
            <div style={{
              paddingTop: "20px",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{color: 'white'}}>区域名称：</span>
              <input
                type="text"
                className="inputAll" value={name}

                onChange={(e) => this.setOnChange(e, "name")}
              />
            </div>
            <div className="BuildFloor" style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "center"
            }}>
              <span style={{color: 'white'}}>建筑：</span>
              <select className="sleAll" value={buildId} onChange={(e) => this.GetFloorList(e.target.value)}>
                {buildList.map(item => {
                  return (
                    <option key={item.id} value={item.build_id}>{item.build_name}</option>
                  )
                })}
              </select>
              <span style={{
                color: 'white',
                marginLeft: "10px"
              }}>楼层：</span>
              <select className="sleAll" value={floorId} onChange={(e) => this.floorQiehuan(e)}>
                {floorList.map(item => {
                  return (
                    <option key={item.id} value={item.floor_id}>{item.floor_name}</option>
                  )
                })}
              </select>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "40px 0 20px 0"
            }}>
              <div className="Draw" style={{
                borderRadius: "5px",
                marginLeft: "80px",
                fontSize: "14px",
                cursor: "pointer"
              }} onClick={() => this.drawPolygon()}>{ModelPolygon !== null ? "重新绘制" : "绘制"}</div>
              <div className="Save" style={{
                borderRadius: "5px",
                marginRight: "80px",
                fontSize: "14px",
                cursor: "pointer"
              }} onClick={() => this.setPeopleLocation(flag_edit)}>保存
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PerPosition;