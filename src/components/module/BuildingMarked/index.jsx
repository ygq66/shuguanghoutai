import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { message } from "antd";
import { ChromePicker } from "react-color";
import { getBuildLabel, setBuildLabel, delBuildLabel } from "../../../api/mainApi";
import { createMap, Model } from '../../../map3D/map3d';
class BuildingMarked extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dId: "",
      list: [],
      textColorFlag: false,
      textColor: "#ffffff",
      liningColorFlag: false,
      liningColor: "#ffffff",

      buildName: "",
      fontSize: "",
      bksize: "",
      X: "",
      Y: "",
      Z: "",
      pitch: "",
      yaw: "",
      roll: "",
      model: {},
      element: {},//当前建筑
      buildLabel: this.props.buildlabel
    };
    BuildingMarked.this = this;
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      buildLabel: nextProps.buildlabel
    })

  }
  componentDidMount() {
    this.GetBuildLabel();
  }
  // 获取建筑列表
  GetBuildLabel = () => {
    getBuildLabel().then(res => {
      if (res.msg === "success") {
        this.setState({
          list: res.data
        })
      }
    })
  }
  addData = (ev) => {
    $(ev.currentTarget).parents(".BuildingMarked").find(".ContractionArea").slideDown()
  }
  shrinkageBtn = (ev) => {
    $(".BuildingMarked").find(".ContractionArea").slideUp()
  }
  handleChoosePalette = (type, color) => {
    if (type === "fontColor") {
      this.setState({ textColor: color.hex })
    } else if (type === "liningColor") {
      this.setState({ liningColor: color.hex })
    }
    setTimeout(() => {
      this.updeteLabelModel();
    }, 10);
  }
  colorOpen = (e, type) => {
    e.stopPropagation();
    let { textColorFlag, liningColorFlag } = this.state;
    if (type === "fontColor") {
      this.setState({ textColorFlag: !textColorFlag, liningColorFlag: false })
    } else if (type === "liningColor") {
      this.setState({ liningColorFlag: !liningColorFlag, textColorFlag: false })
    }
  }
  colorClose = () => {
    BuildingMarked.this.setState({ textColorFlag: false, liningColorFlag: false })
  }

  onContextMenu = (e) => {
    e.preventDefault();
    $('.Alert').hide();
    $(e.currentTarget).siblings(".Alert").show();
    $(e.currentTarget).css("color", "#ea9310");
    $(e.currentTarget).parents("li").siblings("li").find("span").css("color", "white");
  }
  leftClick = (e, item) => {
    $(e.currentTarget).css("color", "#ea9310");
    $(e.currentTarget).parents("li").siblings("li").find("span").css("color", "white");
    if (item.children) {
      createMap.FlyToPosition(item.children[0].center)
    } else {
      createMap.flyToObjectById({ gid: item.build_id, pitch: 50, height: 50 })
    }
  }
  AddOrEditBtn = (e, item, flag) => {
    const { buildLabel } = this.state;
    let Item = item;
    if (Item.children) {
      Item.children[0].position = buildLabel[Item.id]
    }
    this.setState({
      element: { ...Item }
    })
    this.addData(e);
    flag ? this.addEmpty(item) : this.updateEmpty(item);
  }
  // 添加/修改
  SetBuildLabel = () => {
    const { dId, element, buildName, textColor, liningColor, fontSize, bksize, model } = this.state;
    let buildLabel = this.state.buildLabel;

    if (buildName === "") {
      message.error("请先填写建筑名称");
      return;
    } else if (fontSize === "") {
      message.error("请先填写标注大小");
      return;
    } else if (bksize === "") {
      message.error("请先填写边框大小");
      return;
    } else if (JSON.stringify(model) === "{}") {
      message.error("请先绘制标注");
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        label_name: buildName,
        label_style: { bzys: textColor, bkys: liningColor, ztdx: fontSize, bkdx: bksize },
        build_id: element.id,
        position: model,
        center: JSON.parse(msg)
      }
      if (element.children && element.children.length > 0) {
        json["id"] = element.children[0].id
      }
      setBuildLabel(json).then(res => {
        if (res.msg === "success") {
          if (element.children && element.children.length > 0) {
            message.success("修改成功");
            if (buildLabel[dId]) {
              buildLabel[dId] = { ...model };
              // , attr: { center: msg }
            }
            BuildingMarked.this.setState({
              buildLabel: buildLabel
            })
          } else {
            message.success("添加成功");
          }
          BuildingMarked.this.GetBuildLabel();
          BuildingMarked.this.shrinkageBtn();
        }
      })
    })
  }
  // 删除建筑标注
  DelBuildLabel = (e, item) => {
    e.preventDefault();
    const { buildLabel } = this.state;
    delBuildLabel({ id: item.children[0].id }).then(res => {
      if (res.msg === "success") {
        message.success("删除成功");
        let element = buildLabel[item.id] ? buildLabel[item.id] : item.children[0].position;
        this.setState({
          model: { ...element }
        })
        this.removeModel();
        this.GetBuildLabel();
        this.shrinkageBtn();
      }
    })
  }
  // 添加清空赋值
  addEmpty = (item) => {
    this.setState({
      dId: "",
      textColor: "#ffffff",
      liningColor: "#ffffff",
      buildName: item.build_name,
      fontSize: "",
      bksize: "",
      X: "",
      Y: "",
      Z: "",
      pitch: "",
      yaw: "",
      roll: "",
      model: {}
    })
  }
  // 修改编辑赋值
  updateEmpty = (item) => {
    const style = item.children[0].label_style;
    const model_position = item.children[0].position;
    this.setState({
      dId: item.id,
      textColor: style.bzys,
      liningColor: style.bkys,
      buildName: item.children[0].label_name,
      fontSize: style.ztdx,
      bksize: style.bkdx,
      X: model_position.location.x,
      Y: model_position.location.y,
      Z: model_position.location.z,
      pitch: model_position.location.pitch,
      yaw: model_position.location.yaw,
      roll: model_position.location.roll,
      model: { ...model_position }
    })
  }
  // 输入框变值
  inputAll = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
    setTimeout(() => {
      this.updeteLabelModel();
    }, 10);
  }
  // 修改编辑
  updeteLabelModel = () => {
    let { model, buildName, fontSize, textColor, X, Y, Z, pitch, yaw, roll } = this.state;
    if (JSON.stringify(model) === "{}") {
      return;
    }
    model.text = buildName;
    model.fontsize = fontSize;
    model.fontcolor = textColor;
    model.location = {
      x: X,
      y: Y,
      z: Z,
      pitch: pitch,
      yaw: yaw,
      roll: roll
    };
    Model.updeteLabelModel(model);
    this.setState({
      model: model
    });
  }
  //取消编辑
  cancelEditor = () => {
    const { element } = this.state;
    // console.log(element, "我是复原")
    if (element.children && JSON.stringify(element.children[0].position) !== "{}") {
      // console.log(element.children[0].position, "我是复原")
      Model.updeteLabelModel(element.children[0].position);
    } else {
      this.removeModel();
    }
    this.shrinkageBtn();
  }
  // 绘制
  playLabelModel = () => {
    const { dId, buildName, fontSize, textColor, element } = this.state;
    // console.log(element, "element")
    let buildLabel = this.state.buildLabel;
    if (buildName === "") {
      message.error("请先填写建筑名称");
      return;
    } else if (fontSize === "") {
      message.error("请先填写标注大小");
      return
    }
    this.removeModel();
    Model.LabelModel({ text: buildName, color: textColor, size: fontSize, attr: { buildId: element.build_id } }, (res) => {
      // console.log(res, JSON.parse(res).location.z, "JSON.parse(res).location.z")
      if (buildLabel[dId]) {
        buildLabel[dId].gid = JSON.parse(res).gid;
      }
      BuildingMarked.this.setState({
        model: JSON.parse(res),
        X: JSON.parse(res).location.x,
        Y: JSON.parse(res).location.y,
        Z: JSON.parse(res).location.z + 600,
        pitch: -90,//JSON.parse(res).location.pitch
        yaw: JSON.parse(res).location.yaw,
        roll: JSON.parse(res).location.roll
      })
      setTimeout(() => {
        BuildingMarked.this.updeteLabelModel();
      }, 100)
    })
  }
  // 删除指定ID对象
  removeModel = () => {
    const { model } = this.state;
    if (JSON.stringify(model) !== "{}") {
      Model.removeGid(model.gid);
    }
  }
  render() {
    const { list, textColor, textColorFlag, liningColorFlag, liningColor, buildName, fontSize, bksize, X, Y, Z, pitch, yaw, roll } = this.state;
    return (
      <div className="BuildingMarked">
        <div className="RightTitle">
          <span>建筑标注</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
        </div>
        <div className="BuildingList">
          {/* <div className="BuildingBtn"><button className="ConfirmButton" onClick={(e) => this.addData(e)}>添加</button></div> */}
          <ul>
            {list.map((item, index) => {
              return (
                <li key={index}><span onContextMenu={(e) => this.onContextMenu(e)} onClick={(e) => this.leftClick(e, item)}>{item.build_name}</span>
                  <div className="Alert" style={{ display: "none" }}>
                    {item.children && item.children.length > 0 ? <p onClick={(e) => this.AddOrEditBtn(e, item, false)}>修改</p> :
                      <p onClick={(e) => this.AddOrEditBtn(e, item, true)}>添加</p>}
                    {item.children && item.children.length > 0 && <p onClick={(e) => this.DelBuildLabel(e, item)}>删除</p>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.cancelEditor()}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
          </div>
          <div className="BuildingManipulation">
            <div className="TextWb">
              <span>建筑名称：</span>
              <input type="text" className="inputAll" value={buildName} onChange={(e) => this.inputAll(e, "buildName")} />
            </div>
            <div className="TextWb">
              <span>标注颜色：</span>
              <div className="colorArea" style={{ backgroundColor: textColor }} onClick={(e) => this.colorOpen(e, "fontColor")}></div>
              {textColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={textColor} onChange={this.handleChoosePalette.bind(this, 'fontColor')}></ChromePicker></div>}
            </div>
            <div className="TextWb">
              <span>标注大小：</span>
              <input type="text" style={{
                width: "50px",
                flex: "0", textAlign: "center"
              }} className="inputAll" value={fontSize} onChange={(e) => this.inputAll(e, "fontSize")} />
            </div>
            <div className="TextWb">
              <span>边框颜色：</span>
              <div className="colorArea" style={{ backgroundColor: liningColor }} onClick={(e) => this.colorOpen(e, "liningColor")}></div>
              {liningColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={liningColor} onChange={this.handleChoosePalette.bind(this, 'liningColor')}></ChromePicker></div>}
            </div>
            <div className="TextWb">
              <span>边框大小：</span>
              <input type="text" style={{
                width: "50px",
                flex: "0", textAlign: "center"
              }} className="inputAll" value={bksize} onChange={(e) => this.inputAll(e, "bksize")} />
            </div>
            <div className="TextWb">
              <span>建筑标注：</span>
              <button onClick={() => this.playLabelModel()}>设置标注</button>
            </div>
            <div className="TextWbPosition">
              <p>标注位置</p>
              <div className="TextWb">
                <span>X：</span>
                <input type="number" className="inputAll" value={X} step="10" onChange={(e) => this.inputAll(e, "X")} />
              </div>
              <div className="TextWb">
                <span>Y：</span>
                <input type="number" className="inputAll" value={Y} step="10" onChange={(e) => this.inputAll(e, "Y")} />
              </div>
              <div className="TextWb">
                <span>Z：</span>
                <input type="number" className="inputAll" value={Z} step="10" onChange={(e) => this.inputAll(e, "Z")} />
              </div>
              <div className="TextWb">
                <span>pitch：</span>
                <input type="number" className="inputAll" value={pitch} step="10" onChange={(e) => this.inputAll(e, "pitch")} />
              </div>
              <div className="TextWb">
                <span>yaw：</span>
                <input type="number" className="inputAll" value={yaw} step="10" onChange={(e) => this.inputAll(e, "yaw")} />
              </div>
              <div className="TextWb">
                <span>roll：</span>
                <input type="number" className="inputAll" value={roll} step="10" onChange={(e) => this.inputAll(e, "roll")} />
              </div>
            </div>
            <div className="TextWbPosition">
              <p>定位坐标</p>
              <div className="TextWb Positionwb">
                <span>坐标定位：</span>
                <input type="text" className="inputAll" />
              </div>
              <div className="TextWb Positionwb">
                <span>当前位置：</span>
                <input type="text" className="inputAll" />
              </div>
            </div>
          </div>
          <div className="BuildingAnnotationBtn">
            <button className="ConfirmButton" onClick={() => this.SetBuildLabel()}>保存</button>
            <button className="ConfirmButton" onClick={() => this.cancelEditor()}>取消</button>
          </div>
        </div>

      </div>
    );
  }
}

export default BuildingMarked;