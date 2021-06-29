import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
// import { ChromePicker } from "react-color";
import { createMap, Model, Build } from "../../../map3D/map3d";
import { getBuildList, getFloorList, getBedList, setBedTouchin, setBedRoom, delBed, delBedRoom } from '../../../api/mainApi';
import { Tree, message } from 'antd';
class BedManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOne: false,//是否第一次
      bedList: [],
      flagNum: 0,
      NodeTreeItem: null,//当前选中的数据
      flag_Node: false,//是否编辑操作区域
      name: "",//房间or床位 名称
      nameNumber: "",//房间编号
      oldbuildId: "",//上一个建筑id
      buildId: "",//建筑id
      floorId: "",//楼层id
      buildList: [],//建筑列表
      floorList: [],//楼层列表
      ModelPolygon: null,//当前绘制的object
      flag_edit: false,//是否编辑
      oldBedName: "",//上一个床位名称
      oldRoomName: "",//上一个房间名称
    };
    BedManagement.this = this;
  }
  componentDidMount() {
    this.GetBuildList();
    this.getBedList();
    $(document).on("click", () => {
      BedManagement.this.setState({
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
  // v-model数据绑定---房间编号
  setOnChangeNumber = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
  }
  // 获取床位信息
  getBedList = () => {
    getBedList().then(res => {
      let item = res.data;
      let roomArry = [];
      item.forEach((obj, index) => {
        let bedArry = [];
        if (obj.children) {
          obj.children.forEach((obj2, index2) => {
            let json2 = { ...obj2, key: index + "-" + index2, title: obj2.bed_name };
            bedArry.push(json2);
          })
        }
        let json = { ...obj, key: String(index), title: obj.room_name, children: bedArry };
        roomArry.push(json);
      })
      BedManagement.this.setState({
        bedList: roomArry
      })
    })
  }
  // 获取建筑列表
  GetBuildList = () => {
    getBuildList().then(res => {
      BedManagement.this.setState({
        buildList: res.data
      });
      res.data.length > 0 && BedManagement.this.GetFloorList(res.data[0].build_id);
    })
  }
  // 获取楼层列表
  GetFloorList = (id) => {
    BedManagement.this.showFloorAll();
    getFloorList({ build_id: id }).then(res => {
      BedManagement.this.setState({
        floorList: res.data,
        floorId: res.data[0].floor_id,
        buildId: res.data[0].build_id,
        oldbuildId: res.data[0].build_id
      })
      setTimeout(() => {
        if (BedManagement.this.state.isOne) {
          BedManagement.this.showFloor();
        }
        BedManagement.this.setState({ isOne: true })
      }, 100)
    })
  }
  // 楼层切换事件
  floorQiehuan = (e) => {
    this.setState({ floorId: e.target.value });
    setTimeout(() => {
      BedManagement.this.showFloor();
    }, 0)
  }
  // 楼层全部展示
  showFloorAll = () => {
    const { floorList, oldbuildId } = this.state;
    let floor = [];
    floorList.forEach(res => {
      let floor_id = res.floor_id.split("#")[1];
      floor.push(floor_id);
    })
    Build.showFloor(oldbuildId, "all", floor);
  }
  // 楼层掀层
  showFloor = () => {
    const { floorList, floorId, buildId } = this.state;
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
  onSelect = (selectedKeys, info) => {
    const { ModelPolygon } = this.state;
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid)
    };
    $('.ant-tree-node-selected').removeClass("ant-tree-node-selected");
    // console.log('selected', selectedKeys, info);
    if (info.selected) {
      BedManagement.this.showPolygon(info.node.positions);
    }
    this.setState({
      flag_Node: false,
      NodeTreeItem: info.node
    });
  }
  // 展示面
  showPolygon = (item) => {
    const { ModelPolygon } = this.state;
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid);
    }
    createMap.FlyToPosition(item.center)
    Model.createPolygon(item.points, res => {
      BedManagement.this.setState({
        ModelPolygon: JSON.parse(res)
      });
    });
  }
  // 右键点击事件
  onRightClick = ({ event, node }) => {
    event.preventDefault();
    $('.ant-tree-node-selected').removeClass("ant-tree-node-selected");
    $(event.currentTarget).addClass("ant-tree-node-selected");
    var x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth;
    var y = event.currentTarget.offsetTop;
    this.setState({
      flag_Node: true,
      NodeTreeItem: {
        ...node,
        pageX: x,
        pageY: y,
      }
    });
  }
  // 右键操作面板
  getNodeTreeMenu() {
    const { pageX, pageY, pid } = { ...this.state.NodeTreeItem };
    const tmpStyle = {
      left: `${pageX + 55}px`,
      top: `${pageY}px`,
      display: "flex"
    };
    const menu = (
      <div className="Alert" style={tmpStyle}>
        {!pid && <p onClick={() => this.addBtn(1, this.state.NodeTreeItem)}>新建</p>}
        <p onClick={() => this.editBtn(pid ? 1 : 0, this.state.NodeTreeItem)}>修改</p>
        <p onClick={pid ? () => this.delBed(this.state.NodeTreeItem) : () => this.delBedRoom(this.state.NodeTreeItem)}>删除</p>
      </div>
    );
    return menu;
  }
  // 显示/隐藏操作栏
  setOperatingArea = (flag) => {
    if (flag) {
      $(".BedManagement").find(".ContractionArea").slideDown();
      BedManagement.this.setState({
        oldBedName: "",
        oldRoomName: ""
      });
    } else {
      $(".BedManagement").find(".ContractionArea").slideUp();
      $('.ant-tree-node-selected').removeClass("ant-tree-node-selected");
      this.clearData();
    }
  }
  // 新建房间/床位
  addBtn = (flagNum, item) => {
    this.setState({
      flagNum: flagNum,
      flag_edit: true
    });
    this.clearData();
    if (flagNum === 0) {
      $('.ant-tree-node-selected').removeClass("ant-tree-node-selected");
    } else {
      this.setState({
        buildId: item.build_id,
        floorId: item.floor_id
      })
    };
    setTimeout(() => {
      BedManagement.this.setOperatingArea(true);
      BedManagement.this.showFloor();
    }, 100)
  }
  // 修改房间/床位
  editBtn = (flagNum, item) => {
    this.showPolygon(item.positions);
    this.setState({
      flagNum: flagNum,
      name: item.title,
      nameNumber: item.room_code,
      flag_edit: false
    });
    if (flagNum === 0) {
      BedManagement.this.GetFloorList(item.build_id);
      setTimeout(() => {
        BedManagement.this.setState({
          buildId: item.build_id,
          floorId: item.floor_id
        });
      }, 100);
    }
    setTimeout(() => {
      BedManagement.this.setOperatingArea(true);
    }, 100)
  }
  // 清空
  clearData = () => {
    const { buildList, ModelPolygon } = this.state;
    if (ModelPolygon !== null) {
      Model.removeGid(ModelPolygon.gid);
      BedManagement.this.setState({
        ModelPolygon: null
      })
    }
    this.setState({
      isOne: false,
      name: "",
      nameNumber: ""
    });
    if (buildList.length > 0) {
      BedManagement.this.GetFloorList(buildList[0].build_id);
    }
    Model.endEditing();
  }
  // 绘制区域
  drawPolygon = () => {
    const { ModelPolygon } = this.state;
    message.warning("鼠标右键结束绘制");
    if (ModelPolygon !== null) {
      Model.removeGid(ModelPolygon.gid);
      BedManagement.this.setState({
        ModelPolygon: null
      })
    }
    Model.playPolygon(res => {
      BedManagement.this.setState({
        ModelPolygon: JSON.parse(res)
      })
    })
  }
  // 添加or修改床位信息
  setBedTouchin = (flag) => {
    const { oldBedName, name, ModelPolygon, NodeTreeItem } = this.state;
    if (name === "") {
      message.error("请先填写床位号");
      return;
    } else if (flag && ModelPolygon === null) {
      message.error("请先绘制区域");
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        bed_name: name,
        positions: { ...ModelPolygon, center: JSON.parse(msg) },
      }
      if (flag) {
        json["room_id"] = NodeTreeItem.id;
      } else {
        json["id"] = NodeTreeItem.id;
        json["room_id"] = NodeTreeItem.pid;
      }
      if (oldBedName === name) {
        return;
      }
      setBedTouchin(json).then(res => {
        message.success(flag ? "床位添加成功" : "床位修改成功");
        BedManagement.this.getBedList();
        BedManagement.this.setOperatingArea(false);
        BedManagement.this.setState({
          oldBedName: name
        });
      })
    })
  }
  // 添加or修改房间信息
  setBedRoom = (flag) => {
    const { oldRoomName, name, nameNumber, buildId, floorId, ModelPolygon, NodeTreeItem } = this.state;
    if (name === "") {
      message.error("请先填写房间名称");
      return;
    } else if (nameNumber === "") {
      message.error("请先填写房间编号");
      return;
    } else if (flag && ModelPolygon === null) {
      message.error("请先绘制区域");
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        room_name: name,
        room_code: nameNumber,
        build_id: buildId,
        floor_id: floorId,
        positions: { ...ModelPolygon, center: JSON.parse(msg) }
      }
      if (!flag) {
        json["id"] = NodeTreeItem.id;
      }
      if (oldRoomName === name) {
        return;
      }
      setBedRoom(json).then(res => {
        message.success(flag ? "房间添加成功" : "房间修改成功");
        BedManagement.this.getBedList();
        BedManagement.this.setOperatingArea(false);
        BedManagement.this.setState({
          oldRoomName: name
        });
      })
    })
  }
  // 删除床位
  delBed = (item) => {
    delBed({ id: item.id }).then(res => {
      message.success("床位删除成功");
      BedManagement.this.getBedList();
      BedManagement.this.setOperatingArea(false);
    })
  }
  // 删除房间
  delBedRoom = (item) => {
    delBedRoom({ id: item.id }).then(res => {
      message.success("房间删除成功");
      BedManagement.this.getBedList();
      BedManagement.this.setOperatingArea(false);
    })
  }
  setMoudleId = () => {
    const { ModelPolygon } = this.state;
    BedManagement.this.showFloorAll();
    if (ModelPolygon) {
      Model.removeGid(ModelPolygon.gid);
    };
    this.props.setMoudleId("");
  }
  render() {
    const { flagNum, bedList, NodeTreeItem, flag_Node, name, nameNumber, buildList, floorList, buildId, floorId, ModelPolygon, flag_edit } = this.state;
    return (
      <div className="BedManagement">
        <div className="RightTitle">
          <span>床位管理</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.setMoudleId()} alt="" />
        </div>
        <div className="CreateLayer_button">
          <button className="CreateLayerbutton" onClick={() => this.addBtn(0)}>新建图层</button>
        </div>
        <div className="domtree">
          <Tree
            showLine={{
              showLeafIcon: false,
            }}
            showIcon={false}
            // defaultExpandedKeys={['0']}
            onRightClick={this.onRightClick}
            onSelect={this.onSelect}
            treeData={bedList}
          />
          {NodeTreeItem !== null && flag_Node ? this.getNodeTreeMenu() : ""}
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.setOperatingArea(false)}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
          </div>
          {flagNum === 0 && <div className="RoomName" >
            <div style={{ paddingTop: "20px", display: "flex", alignItems: "center" }}>
              <span style={{ color: 'white' }}>房间名称：</span><input type="text" className="inputAll" value={name} onChange={(e) => this.setOnChange(e, "name")}></input>
            </div>
            <div style={{ paddingTop: "20px", display: "flex", alignItems: "center" }}>
              <span style={{ color: 'white' }}>房间编号：</span><input type="text" className="inputAll" value={nameNumber} onChange={(e) => this.setOnChangeNumber(e, "nameNumber")}></input>
            </div>
            <div className="BuildFloor" style={{ marginTop: "20px", display: "flex", alignItems: "center" }}>
              <span style={{ color: 'white' }}>建筑：</span>
              <select className="sleAll" value={buildId} onChange={(e) => this.GetFloorList(e.target.value)}>
                {buildList.map(item => {
                  return (
                    <option key={item.id} value={item.build_id}>{item.build_name}</option>
                  )
                })}
              </select>
              <span style={{ color: 'white', marginLeft: "10px" }}>楼层：</span>
              <select className="sleAll" value={floorId} onChange={(e) => this.floorQiehuan(e)}>
                {floorList.map(item => {
                  return (
                    <option key={item.id} value={item.floor_id}>{item.floor_name}</option>
                  )
                })}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 0 20px 0" }}>
              <div className="Draw" style={{ borderRadius: "5px", marginLeft: "80px", fontSize: "14px", cursor: "pointer" }} onClick={() => this.drawPolygon()}>{ModelPolygon !== null ? "重新绘制" : "绘制"}</div>
              <div className="Save" style={{ borderRadius: "5px", marginRight: "80px", fontSize: "14px", cursor: "pointer" }} onClick={() => this.setBedRoom(flag_edit)}>保存</div>
            </div>
          </div>
          }
          {flagNum === 1 && <div className="BedNumber" style={{ textAlign: "center" }} >
            <div style={{ paddingTop: "20px", display: "flex", alignItems: "center" }}>
              <span style={{ color: 'white' }}>床位号：</span><input type="text" className="inputAll" value={name} onChange={(e) => this.setOnChange(e, "name")}></input>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "40px 0 20px 0" }}>
              <div className="Draw" style={{ borderRadius: "5px", marginLeft: "80px", fontSize: "14px", cursor: "pointer" }} onClick={() => this.drawPolygon()}>{ModelPolygon !== null ? "重新绘制" : "绘制"}</div>
              <div className="Save" style={{ borderRadius: "5px", marginRight: "80px", fontSize: "14px", cursor: "pointer" }} onClick={() => this.setBedTouchin(flag_edit)}>保存</div>
            </div>
          </div>}

        </div>
      </div >
    );
  }
}

export default BedManagement;