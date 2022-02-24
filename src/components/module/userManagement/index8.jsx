import React, {Component} from 'react';
import './style.scss';
import {Build, createMap, Model} from '../../../map3D/map3d';
import $ from "jquery";
import {message, Checkbox} from 'antd';
import axios from 'axios';
import {getMapBulid, getMapFloor} from "../../../api/mainApi";
import helperShapeUtil from "../../../map3D/helperShapeUtil";
import eventUtil from "../../../map3D/eventUtil";

// import FloorList from "../floorList/index"
class UserManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldbuildId: "",
      flagText: "",
      list: [
        {
          img: require("../../../assets/images/EquipmentAbove/shexiangji.png").default,
          text: "摄像机"
        },
        {
          img: require("../../../assets/images/EquipmentAbove/menjin-4.png").default,
          text: "门禁"
        },
        {
          img: require("../../../assets/images/EquipmentAbove/duijiang-2.png").default,
          text: "对讲"
        },
        {
          img: require("../../../assets/images/EquipmentAbove/guangbo-3.png").default,
          text: "广播"
        },
        {
          img: require("../../../assets/images/EquipmentAbove/xiaofangsheshi-2.png").default,
          text: "消防设施"
        }
      ],
      xValue: "",
      yValue: "",
      zValue: "",
      pitchValue: "",
      yawValue: "",
      rollValue: "",
      videoList: {},
      videoType: '121',//相机类型,sxt为枪机
      name: "",//相机名称
      keshi: {},
      code: "",
      inputflag: false,
      treelist: [],
      nameValue: "",
      pid: "0",
      addflag: true,
      title: '',
      selectId: '0',
      playvideo: false,
      thisId: "",
      selectTree: [],
      Focus: false,
      selectname: "",  // 所属组织
      onMouse: false,
      checkbox: false,
      gid: "",
      polygonId: "",
      buildList: [],//建筑列表
      floorList: [],//楼层列表
      modelList: this.props.modellist,
      typeName: "",
      modelName: "",
      isEdit: false,//是否编辑
      modelObj: {},//当前编辑的模型对象

      deviceTreeStructureData: [],     // 设备的树形结构数据。N维数组。

      // 相机列表
      cameraList: [],

      floorId: '', // 楼层ID
      buildId: ''  // 楼层ID
    };
    UserManagement.this = this;

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      modelList: nextProps.modellist
    })
  }

  componentDidMount() {
    axios.get(global.Url + "/device/category/list").then((res) => {
      console.log('获取设备种类', res)
      const result = res.data;
      if (result.msg === "success") {
        this.setState({
          list: result.data
        })
      } else {
      }
    })
    console.log('关闭地图键盘事件')
    createMap.disableKeyboard(); // 输入框spin需要禁用这个功能
    eventUtil.unSetMousedown();
  }

  isload(id) {
    const data = {
      category_id: id
    }
    axios.post(global.Url + "/device/type/list", data).then((res) => {
      const result = res.data;
      if (result.msg === "success") {
        this.setState({
          videoList: result.data
        })
      } else {
        message.error("获取相机类型失败");
      }

    })
  }

  xChange(e) {
    // eslint-disable-next-line
    const {
      modelObj,
      yValue,
      zValue,
      pitchValue,
      yawValue,
      rollValue,
      modelName
    } = this.state
    const location = {
      "x": e.target.value,
      "y": yValue,
      "z": zValue,
      "pitch": 0,
      "yaw": yawValue,
      "roll": 0
    }
    let model = {...modelObj};
    model.location = location;
    model.filename = modelName
    Model.modify(model);
    this.setState({
      xValue: e.target.value
    })
  }

  yChange(e) {
    // eslint-disable-next-line
    const {
      modelObj,
      xValue,
      zValue,
      pitchValue,
      yawValue,
      rollValue,
      modelName
    } = this.state
    const location = {
      "x": xValue,
      "y": e.target.value,
      "z": zValue,
      "pitch": 0,
      "yaw": yawValue,
      "roll": 0
    }
    let model = {...modelObj};
    model.location = location;
    model.filename = modelName
    Model.modify(model);
    this.setState({
      yValue: e.target.value
    })
  }

  zChange(e) {
    // eslint-disable-next-line
    const {
      modelObj,
      xValue,
      yValue,
      pitchValue,
      yawValue,
      rollValue,
      modelName
    } = this.state;
    const location = {
      "x": xValue,
      "y": yValue,
      "z": e.target.value,
      "pitch": 0,
      "yaw": yawValue,
      "roll": 0
    }
    let model = {...modelObj};
    model.location = location;
    model.filename = modelName
    Model.modify(model);
    this.setState({
      zValue: e.target.value
    })
  }

  yawChange(e) {
    // eslint-disable-next-line
    const {
      modelObj,
      xValue,
      yValue,
      pitchValue,
      zValue,
      rollValue,
      modelName
    } = this.state
    const location = {
      "x": xValue,
      "y": yValue,
      "z": zValue,
      "pitch": 0,
      "yaw": e.target.value,
      "roll": 0
    }
    let model = {...modelObj};
    model.location = location;
    model.filename = modelName
    Model.modify(model);
    this.setState({
      yawValue: e.target.value
    })
  }

  //保存入库
  baocun() {
    const {
      modelName,
      typeName,
      title,
      checkbox,
      name,
      xValue,
      yValue,
      zValue,
      pitchValue,
      yawValue,
      rollValue,
      videoType,
      keshi,
      code,
      selectId,
      thisId,
      flagText,
      gid,
      polygonId
    } = this.state
    if (gid !== "" && name !== "" && videoType !== "0") {
      const self = this
      createMap.getCurrent(msg => {
        setTimeout(() => {
          const location = {
            x: xValue,
            y: yValue,
            z: zValue,
            pitch: pitchValue,
            yaw: yawValue,
            roll: rollValue
          }
          const data = {
            model_name: modelName,
            category_name: title,
            type_name: typeName,
            device_name: name,
            region_id: selectId,
            type_id: videoType,
            model_url: gid,
            center: JSON.parse(msg),
            list_style: location,
            position: keshi,
            device_code: code,
            category_id: flagText,
            indoor: checkbox,
            // build_id: $("#buildId").find("option:selected").val(),
            build_id: self.state.buildId,
            // floor_id: $("#floorId").find("option:selected").val()
            floor_id: self.state.floorId
          }
          if (thisId !== "") {
            data['id'] = thisId
          }
          const url = flagText === "10001" ? "/device/camera/touchin" : "/device/info/touchin";
          axios.post(global.Url + url, data).then((res) => {
            const result = res.data;
            if (result.msg === "success") {
              this.onloadtree(flagText);
              message.success("保存成功");
              // Model.showModel(polygonId, false);
              Model.removeGid(polygonId);
              // this.loadingModel()
              UserManagement.this.setState({
                xValue: "",
                yValue: "",
                zValue: "",
                yawValue: "",
                videoType: "",
                name: "",
                keshi: {},
                thisId: "",
                code: "",
                gid: "",
                playvideo: false,
                indoor: false,
                buildList: [],
                floorList: []
              })
              $(".EquipmentAbove").find(".ContractionArea").slideUp()
            } else {
              message.error("获取相机类型失败");
            }
          })
        }, 10)
      })
    } else {
      message.error("请补全内容");
    }
  }

  // 选择模型
  selsctChange(e) {
    const {modelObj} = this.state
    const videoType = e.target.value
    const typeName = $(e.currentTarget).find("option:selected").text()
    const modelName = $(e.currentTarget).find("option:selected").attr("model")
    this.setState({
      videoType,
      typeName,
      modelName
    })
    let modelCopy = JSON.parse(JSON.stringify(modelObj))
    modelCopy.model_name = modelName
    modelCopy.type_name = typeName
    modelCopy.type_id = videoType

    // 修改地图上实际的模型 @2021/08/04
    Model.modify({
      ...modelCopy,
      filename: modelCopy.model_name
    });
  }

  nameChange(e) {
    this.setState({
      name: e.target.value
    })
  }

  //创建模型
  handleCreate() {
    const {
      modelName,
      thisId,
      name,
      code
    } = this.state;
    // id
    let modelList = this.state.modelList;
    // console.log(modelName, name, code, "ssaass")
    if (modelName !== "" && name !== "" && code !== "") {
      const _this = this
      const data = {
        device_name: name,
        device_code: code
      }
      Model.creatmodel({
        fileName: modelName,
        attr: data
      }, function (obj) {
        console.log(JSON.parse(obj).gid)
        if (modelList[thisId]) {
          modelList[thisId].gid = JSON.parse(obj).gid
        }
        _this.setState({
          modelList: modelList,
          xValue: JSON.parse(obj).location.x,
          yValue: JSON.parse(obj).location.y,
          zValue: JSON.parse(obj).location.z,
          yawValue: JSON.parse(obj).location.yaw,
          gid: JSON.parse(obj).gid,
          playvideo: true,
          modelObj: JSON.parse(obj)
        })
      })
    } else {
      message.warning("相机名称和相机编码或相机类型未填写")
    }
  }

  againUpMoel = () => {
    this.setState({
      isEdit: false
    })
    setTimeout(() => {
      UserManagement.this.delectModel();
    }, 100);
  }

  delectModel() {
    const {
      modelList,
      thisId
    } = this.state;
    if (this.state.polygonId !== "") {
      Model.removeGid(this.state.polygonId)
    }
    const {
      gid,
      isEdit
    } = this.state
    if (!isEdit) {
      Model.removeGid(gid)
    } else {
      const model = modelList[thisId];
      Model.modify(model);
    }
    this.setState({
      xValue: "",
      yValue: "",
      zValue: "",
      yawValue: "",
      gid: "",
      // thisId: "",
      // code:"",
      playvideo: false,
      keshi: {}
    })
  }

  // 点击设备类别
  btnListXz = (obj) => {
    console.log('点击设备类别', obj)
    this.setState({flagText: obj.id, title: obj.category_name})
    this.onloadtree(obj.id);
    this.isload(obj.id)
  }

  // 获取树状图
  onloadtree(id) {
    console.log('生成树状列表', id)
    const data = {category_id: id}
    var list = []
    axios.post(global.Url + "/device/region/list", data).then((res) => {
      console.log('获取设备列表', res)
      const result = res.data;
      const data2 = res.data.data;
      if (result.msg === "success") {
        // console.log(data2, "data2")
        this.setState({selectTree: data2})
        data2.forEach(element => { list.push(element); });
        if (list.length > 0) {
          axios.post(global.Url + "/device/camera/listS").then((res1) => {
            const result1 = res1.data;
            const data1 = res1.data.data
            if (result1.msg === "success") {
              data1.forEach(element => {
                var arr =
                  {
                    id: element.id,
                    pid: element.region_id,
                    region_name: element.device_name,
                    node_type: "details",
                    category_id: element.category_id,
                    type_id: element.type_id,
                    center: element.center,
                    device_code: element.device_code,
                    gid: element.model_url,
                    position: element.position,
                    indoor: element.indoor,
                    build_id: element.build_id,
                    floor_id: element.floor_id,
                    model_name: element.model_name,
                    list_style: element.list_style
                  }
                list.push(arr);
              });
              this.setState({
                treelist: list,
                cameraList: data1,
                deviceTreeStructureData: this.AnalyticFormat(list)
              })
            } else {
              message.error(result1.msg);
            }
          })
        } else {
          this.setState({treelist: []})
        }

      } else {
        message.error(result.msg);
      }
    })
  }

  shrinkageBtn = (ev, flag) => {
    $(".EquipmentAbove").find(".ContractionArea").slideUp();
    if (!flag) {
      UserManagement.this.showFloorAll();
    }
    this.delectModel();
  }

  playPolygon() {
    const {xValue} = this.state
    const _this = this
    if (xValue !== "") {
      message.warning("右键结束绘制");
      Model.playPolygon(function (obj) {
        // console.log(JSON.parse(obj));
        message.success("绘制成功");
        _this.setState({
          keshi: JSON.parse(obj),
          polygonId: JSON.parse(obj).gid
        })
      })
    } else {
      message.warning("未添加模型");
    }
  }

  resetPolygon() {
    if (this.state.polygonId !== "") {
      Model.removeGid(this.state.polygonId)
    }
    this.setState({
      keshi: {}
    })
    // Model.removeGid(polygonId);
  }

  codeChange(e) {
    // console.log(e.target.value)
    this.setState({
      code: e.target.value
    })
  }

  componentWillUnmount() {
    // Model.delectObj();
    // Model.delectPolygon();
    console.log('开启地图键盘事件')
    createMap.enableKeyboard();
    eventUtil.setMousedown();
  }

  hanldeinputflag() {
    this.setState({
      inputflag: true
    })
  }

  closeWgname() {
    this.setState({
      inputflag: false,
      nameValue: ""
    })
  }

  addGridRegion() {
    const {
      nameValue,
      flagText,
      pid,
      addflag
    } = this.state
    // console.log(nameValue,flagText)
    const data = {
      category_id: flagText,
      region_name: nameValue
    }
    if (!addflag) {
      data["id"] = pid;
    } else {
      data["pid"] = pid;
    }
    axios.post(global.Url + "/device/region/touchin", data).then((res) => {
      const result = res.data;
      // console.log(res)
      if (result.msg === "success") {
        this.onloadtree(flagText)
        this.setState({
          inputflag: false,
          nameValue: ""
        })
      } else {
        message.error("");
      }
    })
  }

  nameValueChange(e) {
    this.setState({
      nameValue: e.target.value
    })
  }

  // 对象没有上图, 或者是父节点
  isObjNoPosition(menuObj) {
    if (menuObj.center && Object.keys(menuObj.center).length !== 0) {
      return false;
    } else if (!menuObj.gid) { // 不存在gid, 就是父节点
      return false;
    }
    return true;
  }

  // 获取菜单图标
  getMenuIcon(menuObj) {
    return menuObj.node_type === "details"
      ? require("../../../assets/images/playVideo.png").default
      : menuObj.node_type === "group"
        ? require("../../../assets/images/wenjianjia.png").default
        : require("../../../assets/images/wgtp.png").default
  }

  // 生成树dom
  generateMenu(data) {
    let menuObj = data
    for (let i = 0; i < menuObj.length; i++) {
      const tiem = menuObj[i];
      let obj = {num: 0}
      this.count(tiem, obj)
    }
    let vdom = [];
    // const { changeName } = this.state;
    if (menuObj instanceof Array) {
      let list = [];
      for (let item of menuObj) {
        list.push(this.generateMenu(item));
      }
      vdom.push(<ul key="single">{list}</ul>);
    } else {
      if (!menuObj) {
        return;
      }
      // console.log(menuObj)
      vdom.push(
        <li key={menuObj.id} className="addAlert" id={'addAlert' + menuObj.id}
            onContextMenu={(e) => this.onContextMenu(e, menuObj.node_type)}>
          <h2 onClick={(e) => this.onMenuClicked(e, menuObj)} title={menuObj.region_name}>
            <img src={this.getMenuIcon(menuObj)} alt=""/>&nbsp;
            {/* 未上图标记灰色 */}
            <span style={{color: this.isObjNoPosition(menuObj) ? 'gray' : ''}}>{menuObj.region_name}</span>
            {menuObj.node_type !== "details" && <span className="geshu">({menuObj.count ? menuObj.count : 0})</span>}
          </h2>
          {/* <input type='text' style={{ 'display': 'none' }} defaultValue={menuObj.region_name} onFocus={(e) => e.stopPropagation()} onChange={(e) => this.listName(e)} /> */}
          {this.generateMenu(menuObj.children)}
          <div className="Alert" id={'Alert' + menuObj.id} style={{display: "none"}}>
            {menuObj.node_type === "group" && <p onClick={(e) => this.addXinxi(e, menuObj.id, true)}>添加</p>}
            {(menuObj.node_type === "group" || menuObj.node_type === "grid") &&
            <p onClick={(e) => this.addXinxi(e, menuObj.id, false, menuObj.region_name)}>修改</p>}
            {(menuObj.node_type === "group" && JSON.stringify(menuObj.children) === "[]") &&
            <p onClick={(e) => this.wgzjDel(e, menuObj.id)}>删除</p>}
            {(menuObj.node_type === "details") && <p onClick={(e) => this.gridaddXinxi(e, menuObj)}>修改</p>}
            {(menuObj.node_type === "details" && JSON.stringify(menuObj.children) === "[]") &&
            <p onClick={(ev) => this.gridwgzjDel(ev, menuObj)}>删除</p>}
          </div>
        </li>
      );
    }
    return vdom;
  }

  gridwgzjDel = (e, obj) => {
    if (this.state.polygonId !== "") {
      Model.removeGid(this.state.polygonId);
    }
    e.stopPropagation();
    const data = {
      id: obj.id
    }
    const url = obj.category_id === "10001" ? "/device/camera/delete" : "/device/info/delete"
    axios.post(global.Url + url, data).then((res) => {
      const result = res.data;
      // console.log(res)
      if (result.msg === "success") {
        if (this.state.modelList[obj.id]) {
          Model.removeGid(this.state.modelList[obj.id].gid)
        } else {
          Model.removeGid(obj.gid)
        }
        // this.loadingModel();
        this.onloadtree(this.state.flagText)

      } else {
        message.error("");
      }
    })
    this.closeBtn();
  }

  // 右键修改树形菜单的叶子节点
  gridaddXinxi = (ev, menuObj) => {
    console.log('修改的叶子节点：', menuObj)
    const {modelList} = this.state;
    Model.removeGid(this.state.polygonId);
    createMap.flyTo(menuObj.list_style ? menuObj.list_style : menuObj.center)
    helperShapeUtil.updateHelperShapePos(menuObj.list_style ? menuObj.list_style : menuObj.center)
    if (menuObj.position) {
      // Model.showModel(this.state.polygonId, true)
      Model.createPolygon(menuObj.position.points, (msg) => {
        this.setState({
          polygonId: JSON.parse(msg).gid
        })
      })
    }
    $(ev.currentTarget).parents(".EquipmentAbove").find(".ContractionArea").slideDown();
    let gid = this.state.modelList[menuObj.id] ? this.state.modelList[menuObj.id].gid : menuObj.gid;
    // console.log(menuObj,modelList[menuObj.id],"modelList[menuObj.id]")

    // 查找当前修改对象所属的组织
    let treeRootNode = menuObj
    const regionListData = this.state.selectTree
    while (Number(treeRootNode.pid) !== 0) {
      treeRootNode = regionListData.find((region) => region.id === treeRootNode.pid)
      // 避免死循环
      if (!treeRootNode) {
        break
      }
    }

    this.setState({
      isEdit: true,
      thisId: menuObj.id,
      xValue: menuObj.list_style ? menuObj.list_style.x : menuObj.center.x,
      yValue: menuObj.list_style ? menuObj.list_style.y : menuObj.center.y,
      zValue: menuObj.list_style ? menuObj.list_style.z : menuObj.center.z,
      pitchValue: menuObj.list_style ? menuObj.list_style.pitch : menuObj.center.pitch,
      yawValue: menuObj.list_style ? menuObj.list_style.yaw : menuObj.center.yaw,
      rollValue: menuObj.list_style ? menuObj.list_style.roll : menuObj.center.roll,
      name: menuObj.region_name,
      modelName: menuObj.model_name,
      code: menuObj.device_code,
      videoType: menuObj.type_id,
      selectId: menuObj.pid,
      playvideo: true,
      keshi: menuObj.position,
      checkbox: menuObj.indoor,
      gid: gid,
      modelObj: modelList[menuObj.id],

      // 所选组织，为当前叶子节点的根节点
      selectname: treeRootNode.region_name
    }, () => {
      if (menuObj.indoor) {
        this.GetMapBulid()

        setTimeout(() => {
          // $("#buildId").val(menuObj.build_id)
          // $("#floorId").val(menuObj.floor_id)
          // console.log('当前楼层：', $("#floorId").val(), menuObj.floor_id)
          this.setState({
            floorId: menuObj.floor_id,
            buildId: menuObj.build_id
          }, () => {
            UserManagement.this.GetMapFloor(menuObj.build_id)
          })
        }, 200)
      }
    })

    this.closeBtn();
  }

  // 树结构生成
  AnalyticFormat(vdom) {
    // debugger
    let menuObj = vdom;
    menuObj.sort((a, b) => a.region_name.localeCompare(b.region_name))

    //转成树
    function getTree(data, Pid) {
      let result = [];
      let temp;
      for (let i = 0; i < data.length; i++) {
        if (data[i].pid === Pid) {
          temp = getTree(data, data[i].id);
          data[i].children = temp
          result.push(data[i])
        }
      }
      return result
    }

    return getTree(menuObj, "0");
  }

  wgzjDel(e, id) {
    e.stopPropagation();
    const {flagText} = this.state
    const data = {
      id: id
    }
    axios.post(global.Url + "/device/region/delete", data).then((res) => {
      const result = res.data;
      // const data=res.data.data
      // console.log(res)
      if (result.msg === "success") {
        message.success("删除成功")
        this.onloadtree(flagText)
      } else {
        message.error("");
      }
    })
  }

  addXinxi = (e, id, flag, name) => {
    console.log('修改')
    e.stopPropagation();
    this.setState({
      inputflag: true,
      pid: id,
      nameValue: name,
      addflag: flag
    })
    this.shrinkageBtn();
    this.closeBtn();
  }
  closeBtn = () => {
    $(".Alert").hide();
  }

  handeaddModel(ev) {
    if (this.state.polygonId !== "") {
      // Model.showModel(this.state.polygonId, false);
      Model.removeGid(this.state.polygonId)
    }
    this.setState({
      isEdit: false,
      xValue: "",
      yValue: "",
      zValue: "",
      pitchValue: "",
      yawValue: "",
      rollValue: "",
      videoType: "",
      name: "",
      thisId: "",
      code: "",
      gid: "",
      playvideo: false,
      checkbox: false,
      buildList: [],
      floorList: [],
      inputflag: false,
      nameValue: ""
    })
    $(ev.currentTarget).parents(".EquipmentAbove").find(".ContractionArea").slideDown()
  }

  onContextMenu = (e, type) => {
    e.stopPropagation();
    e.preventDefault();
    $(e.currentTarget).parents("ul").find("h2").css("color", "white");
    $(e.currentTarget).children("h2").css("color", "#ea9310");
    $(".Alert").hide();
    $(e.currentTarget).children(".Alert").show();
  }
  onMenuClicked = (e, item) => {
    console.log('点击节点', item)
    if (item.node_type === "details") {
      if (item.indoor) {
        Build.showFloor(item.build_id, item.floor_id);
        UserManagement.this.setState({
          oldbuildId: item.build_id
        })
      }
      createMap.flyTo(item.list_style ? item.list_style : item.center);
      if (this.state.polygonId !== "") {
        // Model.showModel(this.state.polygonId, false);
        Model.removeGid(this.state.polygonId);
      }
      const _this = this;
      _this.setState({polygonId: item.position.gid, isEdit: false});
      setTimeout(() => {
        // Model.showModel(this.state.polygonId, true)
        Model.createPolygon(item.position.points, (msg) => {
          this.setState({
            polygonId: JSON.parse(msg).gid
          })
        })
      }, 100);
      UserManagement.this.shrinkageBtn(e, item.indoor);
      // console.log('click camera: ', item)
      Model.setObjectHighlight(item);
      helperShapeUtil.updateHelperShapePos(item.list_style ? item.list_style : item.center);
    } else {
      UserManagement.this.shrinkageBtn(e);
    }

    e.stopPropagation();
    $(".Alert").hide();
    $(e.currentTarget).parents("ul").find("h2").css("color", "white");
    $(e.currentTarget).css("color", "#ea9310");
    if ($(e.currentTarget).parent("li").children("ul").css("display") === "none") {
      $(e.currentTarget).parent("li").children("ul").slideDown();
    } else {
      $(e.currentTarget).parent("li").children("ul").slideUp();
    }
  }

  jigouChange(e) {
    // console.log(e.target.value)
    // this.setState({
    //     selectId:e.target.value
    // })
  }

  generateMenu2(menuObj) {
    // debugger
    let vdom = [];
    // const { changeName } = this.state;
    if (menuObj instanceof Array) {
      let list = [];
      for (var item of menuObj) {
        list.push(this.generateMenu2(item));
      }
      vdom.push(
        <ul key="single"> {list} </ul>
      );
    } else {
      if (menuObj == null) {
        return;
      }
      // console.log(menuObj)
      vdom.push(
        <li key={menuObj.id} className="addAlertq" id={'addAlertq' + menuObj.id}>
          <h2 onClick={(e) => this.onMenuClicked2(e, menuObj)} title={menuObj.region_name}>
            <img
              src={menuObj.node_type === "details" ? require("../../../assets/images/details.png").default : menuObj.node_type === "group" ? require("../../../assets/images/wenjianjia.png").default : require("../../../assets/images/wgtp.png").default}
              alt=""
            />
            {menuObj.region_name}
          </h2>
          {this.generateMenu2(menuObj.children)}
        </li>
      );
    }
    return vdom;
  }

  onMenuClicked2 = (e, item) => {
    if (item.node_type === "details") {
    } else {
      // this.shrinkageBtn(e);
    }
    // console.log(item)
    e.stopPropagation();
    $(e.currentTarget).parents("ul").find("h2").css("color", "white");
    $(e.currentTarget).css("color", "#ea9310");
    if ($(e.currentTarget).parent("li").children("ul").css("display") === "none") {
      $(e.currentTarget).parent("li").children("ul").slideDown();
    } else {
      $(e.currentTarget).parent("li").children("ul").slideUp();
    }
    this.setState({
      Focus: false,
      selectId: item.id,
      selectname: item.region_name
    })
    // if ($(e.currentTarget).parent("li").children("ul").css("display") === "none") {
    //     $(e.currentTarget).parent("li").children("ul").slideDown();
    // } else {
    //     $(e.currentTarget).parent("li").children("ul").slideUp();
    // }
  }

  inputOnFocus() {
    this.setState({
      Focus: true
    })
  }

  inputOnBlur() {
    this.setState({
      Focus: false
    })
  }

  onMouthin() {
    this.setState({
      onMouse: true
    })
  }

  onMouseLeave() {
    this.setState({
      onMouse: false
      // Focus:false
    })
  }

  // 所属组织失去焦点，关掉下拉树形菜单
  handleOrganizationInputBlur = () => {
    this.setState({
      Focus: false
    })
  }

  /**
   * 设置数量
   * @param {object} node 树节点
   * @param {object} obj 数量
   */
  count(node, obj) {
    if (node.children.length > 0) {
      const before = obj.num;
      node.children.forEach(item => {
        this.count(item, obj);
      });
      node.count = obj.num - before;
    } else {
      if (node.node_type === "details") {
        obj.num++;
      }
    }
  }

  handlecheck(e) {
    this.setState({
      checkbox: e.target.checked
    })
    if (e.target.checked) {
      this.GetMapBulid();
    } else {
      UserManagement.this.showFloorAll();
      this.setState({
        buildList: [],
        floorList: [],
        oldbuildId: ""
      })
    }
  }

  // 获取建筑
  GetMapBulid = () => {
    getMapBulid().then(res => {
      if (res.msg === "success") {
        this.setState({
          buildList: res.data,
          oldbuildId: res.data[0].build_id
        })
        this.GetMapFloor(res.data[0].build_id)
      }
    })
  }
  // 获取楼层
  GetMapFloor = (id) => {
    console.log('获取楼层', id)
    UserManagement.this.showFloorAll();
    getMapFloor({build_id: id}).then(res => {
      console.log('获取楼层响应', res)
      if (res.msg === "success") {
        this.setState({
          floorList: res.data,
          oldbuildId: id,
          buildId: id,
        });
        setTimeout(() => {
          UserManagement.this.showFloor();
        }, 100)
      }
    })
  }
  // 楼层全部展示
  showFloorAll = () => {
    const {
      floorList,
      oldbuildId
    } = this.state;
    let floor = [];
    floorList.forEach(res => {
      let floor_id = res.floor_id.split("#")[1];
      floor.push(floor_id);
    })
    Build.showAllFloor(oldbuildId, floor);
  }
  // 楼层掀层
  showFloor = (selectedFloorId) => {
    const {
      floorList,
      cameraList
    } = this.state;
    let floor = [];
    floorList.forEach(res => {
      let floor_id = res.floor_id.split("#")[1];
      floor.push(floor_id);
    })
    let build_id = this.state.buildId
    let floor_id = selectedFloorId || this.state.floorId;

    if (!floor_id) {
      console.log('floor_id为空, 无法显示楼层', floor_id)
      return;
    }
    let originFloorId = floor_id
    if (build_id && floor_id) {
      Build.showFloor(build_id, floor_id, floor);
    }

    // 只显示当前楼层的相机，其他层的隐藏
    cameraList.forEach(camera => {
      if (camera.indoor) {
        let cameraVisible = false

        if (camera.floor_id === originFloorId) {
          cameraVisible = true
        }
        // 单个改变对象的visible属性。这样对地图的操作次数太频繁。
        // 但是，SetObjectsVisible对相机模型无效。所以目前没有更好的办法。
        createMap.updateObjectVisible(camera.model_url, cameraVisible)
      }
    })
    if (selectedFloorId) {
      this.setState({
        floorId: selectedFloorId
      })
    }
  }
  closeChuang = () => {
    UserManagement.this.showFloorAll();
    this.props.setMoudleId("");
    console.log('开启地图键盘事件')
    createMap.enableKeyboard();
  }

  render() {
    const {
      buildList,
      floorList,
      checkbox,
      onMouse,
      Focus,
      list,
      flagText,
      xValue,
      yValue,
      zValue,
      yawValue,
      videoList,
      videoType,
      name,
      keshi,
      code,
      inputflag,
      treelist,
      nameValue,
      title,
      selectname,
      playvideo,
      selectTree,
      buildId,
      floorId
    } = this.state
    return (
      <div className="EquipmentAbove">
        {/* <FloorList></FloorList> */}
        <div className="RightTitle">
          <span>设备点位上图</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.closeChuang()}
               alt=""/>
        </div>
        <div className="EquipmentCategory">
          <p>设备类别</p>
          <ul>
            {list.map((item, i) => (
                <li key={i} className={flagText === item.id ? 'ative' : null} onClick={() => this.btnListXz(item)}>
                  <img src={item.img} alt=""/>
                  <span>{item.category_name}</span>
                </li>
              )
            )}
          </ul>
        </div>
        <div className="listTree">
          {flagText !== "" && <div className="buttonTitle">
            {treelist.length === 0 &&
            <button className="ConfirmButton" onClick={() => this.hanldeinputflag()}>添加组织结构</button>}
            <button className="ConfirmButton" onClick={(ev) => this.handeaddModel(ev)}>添加设备</button>
          </div>}
          {inputflag && <div className="TextWb Gridinput">
            <span>名称：</span>
            <input type="text" className="inputAll" id="wgName" value={nameValue}
                   onChange={(e) => this.nameValueChange(e)}/>
            <button className="ConfirmButton" onClick={() => this.addGridRegion()}>保存</button>
            <button className="ConfirmButton" onClick={() => this.closeWgname()}>取消</button>
          </div>}
          <div className="TreeList" style={{'height': '300px'}}>
            {this.generateMenu(this.state.deviceTreeStructureData)}
          </div>
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={(e) => this.shrinkageBtn(e)}>
              <img src={require("../../../assets/images/shousuojt.png").default} alt=""/>
            </p>
          </div>
          <div className="EquipmentOperation">
            <p>{title}</p>
            <div className="Operation_div">
              <span>名称：</span>
              <input type="text" value={name} onChange={(e) => this.nameChange(e)}/>
            </div>
            <div className="Operation_div">
              <span>编码：</span>
              <input type="text" value={code} onChange={(e) => this.codeChange(e)}/>
            </div>
            <div className="Operation_div">
              <span>模型：</span>
              <select className="sleAll" value={videoType} onChange={(e) => this.selsctChange(e)}>
                <option value="0">请选择</option>
                {videoList.length > 0 && videoList.map((item) => (
                  <option key={item.id} value={item.id} model={item.model_name}>{item.type_name}</option>
                ))}
              </select>
            </div>
            <div className="Operation_div">
              <span>所属组织：</span>
              <input
                className="sleAll"
                maxLength="0"
                onFocus={() => this.inputOnFocus()}
                defaultValue={selectname}
                onBlur={this.handleOrganizationInputBlur}
              />
              {(Focus || onMouse) &&
              <div
                className="option_thisdix"
                style={checkbox ? {top: "49.5%"} : {top: "55%"}}
                onMouseEnter={() => this.onMouthin()}
                onMouseLeave={() => this.onMouseLeave()}
              >
                {this.generateMenu2(this.AnalyticFormat(selectTree))}
              </div>
              }
            </div>
            <div className="Operation_div2">
              <span style={{width: "68px"}}>室内：</span>
              <Checkbox checked={checkbox} onChange={(e) => this.handlecheck(e)}/>
            </div>
            <div className="Operation">
              {checkbox &&
              <div className="Operation_div">
                <span>楼：</span>
                <select
                  className="Operation_sle"
                  id="buildId"
                  onChange={(e) => this.GetMapFloor(e.target.value)}
                  value={buildId}
                >
                  {buildList.map(item => {
                    return (
                      <option key={item.build_id} value={item.build_id}>{item.build_name}</option>
                    )
                  })}
                </select>
              </div>
              }
              {
                checkbox &&
                <div className="Operation_div">
                  <span>层：</span>
                  <select
                    id="floorId"
                    className="Operation_sle"
                    onChange={(e) => this.showFloor(e.target.value)}
                    value={floorId}
                  >
                    {floorList.map(item => {
                      return (
                        <option key={item.floor_id} value={item.floor_id}>{item.floor_name}</option>
                      )
                    })}
                  </select>
                </div>
              }
              <div className="Operation_div">
                <span>X：</span>
                <input
                  type="number"
                  value={xValue}
                  onChange={(e) => this.xChange(e)}
                />
              </div>
              <div className="Operation_div">
                <span>Y：</span>
                <input
                  type="number"
                  value={yValue}
                  onChange={(e) => this.yChange(e)}
                />
              </div>
              {/* <div className="Operation_div"><span>偏转角：</span><input type="text" value={zValue} onChange={(e)=>this.zChange(e)}/></div> */}
              <div className="Operation_div">
                <span>Z：</span>
                <input
                  type="number"
                  value={zValue}
                  onChange={(e) => this.zChange(e)}
                />
              </div>
              {/* <div className="Operation_div"><span>pitch:：</span><input  type="number"   value={pitchValue} onChange={(e)=>this.pitchChange(e)}/></div> */}
              <div className="Operation_div">
                <span>yaw：</span>
                <input
                  type="number"
                  value={yawValue}
                  onChange={(e) => this.yawChange(e)}
                />
              </div>
              {/* <div className="Operation_div"><span>roll：</span><input type="number"  value={rollValue} onChange={(e)=>this.rollChange(e)}/></div> */}
            </div>
          </div>
          <div className="EquipmentPanelBtn">
            {keshi.points && keshi.points.length > 0 ?
              <button className="ConfirmButton" onClick={() => this.resetPolygon()}>重置区域</button> :
              <button className="ConfirmButton" onClick={() => this.playPolygon()}>绘制可视区域</button>
            }
            {
              playvideo ? <button className="ConfirmButton" onClick={() => this.againUpMoel()}>重新上图</button>
                : <button className="ConfirmButton" onClick={() => this.handleCreate()}>上图</button>
            }
            <button className="ConfirmButton"
                    onClick={() => this.baocun()}>{this.state.thisId === "" ? "保存" : "修改"}</button>
          </div>
        </div>
      </div>
    );
  }
}


export default UserManagement;