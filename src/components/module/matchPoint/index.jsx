import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { ChromePicker } from "react-color";
import { Model, createMap } from "../../../map3D/map3d";
import { getFigureLabel, setFigureLabel, delFigureLabel } from '../../../api/mainApi';
import { message } from 'antd';
class MatchPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      dId: "",//当前id
      labelName: "",//标注文本
      labelFont: "",//字体大小
      cskd: "",//衬色宽度
      textColorFlag: false,
      textColor: "#ffffff",
      liningColorFlag: false,
      liningColor: "#ffffff",
      liningFlag: false,
      oldLabelModel: {},//原本模型id数据
      labelModel: {},//当前模型id数据
      X: 0,
      Y: 0,
      Z: 0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      textLabel: this.props.textlabel
    };
    MatchPoint.this = this;
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      textLabel: nextProps.textlabel
    })
  }
  componentDidMount() {
    this.GetFigureLabel();
    $(document).on("click", () => {
      $('.Alert').hide();
    })
  }
  // 获取文字标注列表
  GetFigureLabel = () => {
    getFigureLabel().then(res => {
      if (res.msg === "success") {
        MatchPoint.this.setState({
          list: res.data
        })
      }
    })
  }
  // 添加/删除文字标注
  SetFigureLabel = () => {
    console.log('进了3')
    let dId = this.state.dId;
    let labelName = this.state.labelName;
    let textColor = this.state.textColor;
    let liningColor = this.state.liningColor;
    let labelFont = this.state.labelFont;
    let liningFlag = this.state.liningFlag;
    let cskd = this.state.cskd;
    let labelModel = this.state.labelModel;
    let textLabel = this.state.textLabel;
    console.log('绘制上图', labelModel)
    if (labelName === "") {
      message.error("请填写标注文本");
      return;
    } else if (labelFont === "") {
      message.error("请填写字体大小");
      return;
    } else if (liningFlag && cskd === "") {
      message.error("请填写衬色宽度");
      return;
    } else if (JSON.stringify(labelModel) === "{}") {
      message.error("请先绘制上图");
      return;
    }
    createMap.getCurrent(msg => {
      let json = {
        label_name: labelName,
        label_style: {
          bzys: textColor,
          ztdx: labelFont,
          csflag: liningFlag,
          csys: liningColor,
          cskd: cskd,
          model: JSON.stringify(labelModel),
          center: msg
        }
      }
      if (dId !== "") {
        json["id"] = dId;
      }
      setFigureLabel(json).then(res => {
        if (res.msg === "success") {
          if (dId !== "") {
            message.success("修改成功！");
            textLabel[dId] = { ...labelModel, attr: { center: msg } };
            this.setState({
              textLabel: textLabel
            })
          } else {
            message.success("添加成功！")
          }
          MatchPoint.this.shrinkageBtn();
          MatchPoint.this.empty();
          MatchPoint.this.GetFigureLabel();
        } else {
          message.error(res.msg);
        }
      })
    })
  }
  // 删除文字标注
  DelFigureLabel = (item) => {
    const textLabel = this.state.textLabel;
    delFigureLabel({ id: item.id }).then(res => {
      if (res.msg === "success") {
        message.success("删除成功！");
        MatchPoint.this.shrinkageBtn();
        MatchPoint.this.empty();
        MatchPoint.this.GetFigureLabel();
        if (textLabel[item.id]) {
          Model.removeGid(textLabel[item.id].gid);
        } else {
          Model.removeGid(JSON.parse(item.label_style.model).gid);
        }
      } else {
        message.error(res.msg);
      }
    })
  }
  // 所有赋值清空
  empty = () => {
    this.setState({
      dId: "",//当前id
      labelName: "",//标注文本
      labelFont: "",//字体大小
      cskd: "",//衬色宽度
      textColorFlag: false,
      textColor: "#ffffff",
      liningColorFlag: false,
      liningColor: "#ffffff",
      liningFlag: false,
      X: 0,
      Y: 0,
      Z: 0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      oldLabelModel: {},
      labelModel: {}
    })
  }
  // 编辑
  editorLabel = (e, obj) => {
    const { textLabel } = this.state;
    const center = textLabel[obj.id] ? JSON.parse(textLabel[obj.id].attr.center) : JSON.parse(obj.label_style.center);
    const model = textLabel[obj.id] ? textLabel[obj.id] : JSON.parse(obj.label_style.model);
    this.setState({
      dId: obj.id,
      labelName: obj.label_name,//标注文本
      labelFont: obj.label_style.ztdx,//字体大小
      textColor: obj.label_style.bzys,
      liningFlag: obj.label_style.csflag,
      oldLabelModel: { ...model },
      labelModel: { ...model },
      X: model.location.x,
      Y: model.location.y,
      Z: model.location.z,
      pitch: model.location.pitch,
      yaw: model.location.yaw,
      roll: model.location.roll,
    })
    if (obj.label_style.csflag) {
      this.setState({
        cskd: obj.label_style.cskd,//衬色宽度
        liningColor: obj.label_style.csys,
      })
    }
    $(".ContractionArea").slideDown();
    createMap.FlyToPosition(center)
  }
  shrinkageBtn = (ev) => {
    $(".ContractionArea").slideUp();
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
    MatchPoint.this.setState({ textColorFlag: false, liningColorFlag: false })
  }
  addData = (ev) => {
    $(ev.currentTarget).parents(".TextAnnotation").find(".ContractionArea").slideDown();
    MatchPoint.this.empty();
  }
  liningChange = () => {
    let liningFlag = this.state.liningFlag;
    this.setState({
      cskd: "",
      liningFlag: !liningFlag,
    })
  }
  inputOnchange = (e, type) => {
    this.setState({
      [type]: e.target.value
    });
    setTimeout(() => {
      this.updeteLabelModel();
    }, 10);
  }
  onContextMenu = (e, id) => {
    e.preventDefault();
    $(".Alert").hide();
    $(e.currentTarget).siblings(".Alert").show();
    this.setState({
      dId: id
    })
  }
  // 删除指定ID对象
  removeModel = () => {
    const { labelModel } = this.state;
    if (JSON.stringify(labelModel) !== "{}") {
      Model.removeGid(labelModel.gid);
    }
  }
  // 绘制
  playLabelModel = () => {
    console.log('进了1')
    const { dId, labelName, labelFont, textColor } = this.state;
    let textLabel = this.state.textLabel;
    let oldLabelModel = this.state.oldLabelModel;
    if (labelName === "") {
      message.error("请先填写标注文本");
      return;
    } else if (labelFont === "") {
      message.error("请先填写字体大小");
      return
    }
    this.removeModel();
    createMap.getCurrent(msg => {
      setTimeout(() => {
        Model.LabelModel({ text: labelName, color: textColor, size: labelFont, attr: { center: msg } }, (res) => {
          console.log('进了2', res, typeof (res))
          console.log('这里值是', { ...res })
          // console.log(res)
          if (textLabel[dId]) {
            textLabel[dId].gid = res.gid;
            oldLabelModel.gid = res.gid;
          }

          MatchPoint.this.setState({
            textLabel: textLabel,
            oldLabelModel: oldLabelModel,
            labelModel: { ...res },
            X: res.location.x,
            Y: res.location.y,
            Z: res.location.z,
            pitch: res.location.pitch,
            yaw: res.location.yaw,
            roll: res.location.roll,
          })
        }, () => {
          console.log('执行了吗')
          console.log('我是值', this.state.labelModel)
        })
      }, 10)
    })

  }
  // 修改编辑
  updeteLabelModel = () => {
    let { labelModel, labelName, labelFont, textColor, X, Y, Z, pitch, yaw, roll } = this.state;
    if (JSON.stringify(labelModel) === "{}") {
      return;
    }
    labelModel.text = labelName;
    labelModel.fontsize = labelFont;
    labelModel.fontcolor = textColor;
    labelModel.location = {
      x: X,
      y: Y,
      z: Z,
      pitch: pitch,
      yaw: yaw,
      roll: roll
    };
    Model.updeteLabelModel(labelModel);
    this.setState({
      labelModel: labelModel,
    });
  }
  //取消编辑
  cancelEditor = () => {
    const { oldLabelModel } = this.state;
    console.log(oldLabelModel, "oldLabelModel")
    if (JSON.stringify(oldLabelModel) !== "{}") {
      Model.updeteLabelModel(oldLabelModel);
    } else {
      this.removeModel();
    }
    MatchPoint.this.shrinkageBtn();
    MatchPoint.this.empty();
  }
  render() {
    const { X, Y, Z, pitch, yaw, roll, dId, list, textColor, textColorFlag, liningColorFlag, liningColor, liningFlag, labelName, labelFont, cskd } = this.state;
    return (
      <div className="TextAnnotation">
        <div className="RightTitle">
          <span>文字标注</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
        </div>
        <div className="TextList">
          <div className="TextListBtn"><button className="ConfirmButton" onClick={(e) => this.addData(e)}>添加</button></div>
          <ul>
            {list.map((item, index) => {
              return (
                <li key={index}>
                  <span style={{ color: dId === item.id && "#ea9310" }} onClick={(e) => this.editorLabel(e, item)} onContextMenu={(e) => this.onContextMenu(e, item.id)}>{item.label_name}</span>
                  <div className="Alert" style={{ display: "none" }}>
                    <p onClick={() => this.DelFigureLabel(item)}>删除</p>
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
          <div className="TextManipulation">
            <div className="TextWb">
              <span>标注文本：</span>
              <input type="text" className="inputAll" value={labelName} onChange={(e) => this.inputOnchange(e, "labelName")} />
            </div>
            <div className="TextWb">
              <span>标注颜色：</span>
              <div className="colorArea" style={{ backgroundColor: textColor }} onClick={(e) => this.colorOpen(e, "fontColor")}></div>
              {textColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={textColor} onChange={this.handleChoosePalette.bind(this, 'fontColor')}></ChromePicker></div>}
            </div>
            <div className="TextWb">
              <span>字体大小：</span>
              <input type="text" style={{
                width: "50px",
                flex: "0", textAlign: "center"
              }} className="inputAll" value={labelFont} onChange={(e) => this.inputOnchange(e, "labelFont")} />
            </div>
            <div className="TextWb" style={{
              flexDirection: "column",
              alignItems: "flex-start"
            }}>
              <span>坐标位置：</span>
              <div className="positionText">
                <div className="TextWb">
                  <span>X：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={X} step="10" onChange={(e) => this.inputOnchange(e, "X")} />
                </div>
                <div className="TextWb">
                  <span>Y：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={Y} step="10" onChange={(e) => this.inputOnchange(e, "Y")} />
                </div>
                <div className="TextWb">
                  <span>Z：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={Z} step="10" onChange={(e) => this.inputOnchange(e, "Z")} />
                </div>
                <div className="TextWb">
                  <span>pitch：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={pitch} step="10" onChange={(e) => this.inputOnchange(e, "pitch")} />
                </div>
                <div className="TextWb">
                  <span>yaw：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={yaw} step="10" onChange={(e) => this.inputOnchange(e, "yaw")} />
                </div>
                <div className="TextWb">
                  <span>roll：</span>
                  <input type="number" style={{
                    flex: "0", textAlign: "center"
                  }} className="inputAll" value={roll} step="10" onChange={(e) => this.inputOnchange(e, "roll")} />
                </div>
              </div>
            </div>
            <div className="TextWb">
              <span>是否衬色：</span>
              <input type="checkbox" checked={liningFlag} onChange={() => this.liningChange()} />
            </div>
            <div className={`TextWb ${!liningFlag ? "disableState" : ""}`}>
              <span>衬色颜色：</span>
              <div className="colorArea" style={{ backgroundColor: liningColor }} onClick={liningFlag ? (e) => this.colorOpen(e, "liningColor") : null}></div>
              {liningColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={liningColor} onChange={this.handleChoosePalette.bind(this, 'liningColor')}></ChromePicker></div>}
            </div>
            <div className={`TextWb ${!liningFlag ? "disableState" : ""}`}>
              <span>衬色宽度：</span>
              <input type="text" style={{
                width: "50px",
                flex: "0", textAlign: "center"
              }} className="inputAll" disabled={!liningFlag ? "disabled" : ""} value={cskd} onChange={(e) => this.inputOnchange(e, "cskd")} />
            </div>
          </div>
          <div className="TextAnnotationBtn">
            <button className="ConfirmButton" onClick={() => this.playLabelModel()}>绘制</button>
            <button className="ConfirmButton" onClick={() => this.SetFigureLabel()}>保存</button>
            <button className="ConfirmButton" onClick={() => this.cancelEditor()}>取消</button>
          </div>
        </div>
      </div >
    );
  }
}

export default MatchPoint;