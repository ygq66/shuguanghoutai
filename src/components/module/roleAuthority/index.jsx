import React, { useState, useEffect } from 'react';
import './style.scss';
import $ from "jquery";
import { ChromePicker } from "react-color";
import { Slider, message } from 'antd';
import { getMapGroup, setMapGroup, delMapGroup, getMapLayer, setMapLayer, delMapLayer } from '../../../api/mainApi';
import { Model, createMap } from '../../../map3D/map3d';

const RoleAuthority = (props) => {
  const [list, setListArry] = useState([]);
  const [groupId, setGroupId] = useState("");
  const [layerId, setLayerId] = useState("");
  const [imgPic, setImgPic] = useState("");
  const [Flag, setFlag] = useState(true);
  const [typeText, setTypeText] = useState("文本");
  const [csFlag, setCsFlag] = useState(false);
  // 字体颜色 （color1）
  const [colorOne, setColorOne] = useState("#ffffff");
  const [colorOneFlag, setColorOneFlag] = useState(false);
  // 边框颜色（color2）
  const [colorTwo, setColorTwo] = useState("#ffffff");
  const [colorTwoFlag, setColorTwoFlag] = useState(false);
  // 透明度
  const [tmd, setTmd] = useState(0);
  // 边框透明度
  const [bktmd, setBktmd] = useState(0);
  // 绘制坐标
  const [postion, setPostion] = useState("");
  // 当前覆盖物
  const [gMulch, setGMulch] = useState();

  // 绘制结束后，保存传回的绘制对象的location属性，以便后续调整位置属性。
  const [objLocation, setObjectLocation] = useState({
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0,
    roll: 0
  })

  // 当前绘制结束后，返回的完整的绘制对象属性
  const [currentDrawObject, setCurrentDrawObject] = useState(null)

  useEffect(() => {
    const GetMapGroup = () => {
      let data = [];
      getMapGroup().then(res => {
        if (res.msg === "success") {
          res.data.forEach(element => {
            element["childen"] = []
          })
          data = [...res.data];
          GetMapLayer((obj) => {
            obj.forEach(item => {
              data.forEach(item2 => {
                if (item.group_id === item2.id) {
                  item2["childen"].push(item);
                }
              })
            })
            setListArry(data);
          })
        }
      })
    }
    GetMapGroup();
    $(document).on("click", () => {
      $('.Alert').hide()
    })
  }, []);
  // 获取图层组列表
  const GetMapGroup = () => {
    let data = [];
    getMapGroup().then(res => {
      if (res.msg === "success") {
        res.data.forEach(element => {
          element["childen"] = []
        })
        data = [...res.data];
        GetMapLayer((obj) => {
          obj.forEach(item => {
            data.forEach(item2 => {
              if (item.group_id === item2.id) {
                item2["childen"].push(item);
              }
            })
          })
          setListArry(data);
        })
      }
    })
  }
  // 添加/修改图层组
  const SetMapGroup = (e) => {
    if ($('#fcmc').val() === "") {
      message.error("请填写分层名称")
    } else if (imgPic === "") {
      message.error("请选择分层图标")
    } else {
      let json = {
        group_name: $('#fcmc').val(),
        group_icon: imgPic,
        remark: $('#fcbz').val()
      }
      if (groupId !== "") {
        json["id"] = groupId
      }
      setMapGroup(json).then(res => {
        if (res.msg === "success") {
          if (groupId !== "") {
            message.success("修改成功");
          } else {
            message.success("添加成功");
          }
          shrinkageBtn(e);
          $('#fcmc').val("");
          $('#fcbz').val("");
          setImgPic("");
          GetMapGroup();
          $('.Alert').siblings("span").css("color", "#ffffff");
        } else {
          message.error(res.msg);
        }
      })
    }
  }
  // 删除图层组
  const DelMapGroup = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    delMapGroup({id: id}).then(res => {
      if (res.msg === "success") {
        message.success("删除成功");
        GetMapGroup();
        $('.Alert').hide();
      } else {
        message.error(res.msg);
      }
    })
  }
  // 获取图层列表
  const GetMapLayer = (callback) => {
    getMapLayer().then(res => {
      if (res.msg === "success") {
        callback(res.data);
      }
    })
  }
  // 添加修改图层
  const SetMapLayer = () => {
    let json = {
      layer_name: $('#tcmc').val(),
      layer_type: typeText,
      group_id: groupId,
      options: {}
    }
    if (layerId !== "") {
      json["id"] = layerId
    }
    if ($('#tcmc').val() === "") {
      message.error("请填写图层名称！");
      return false;
    } else if (postion === "") {
      message.error("请先绘制图层！");
      return false;
    }
    switch (typeText) {
      case "文本":
        let bzwb = $('#bzwb').val();
        let ztdx = $('#ztdx').val();
        let cskd = $('#cskd').val();
        if (bzwb === "") {
          message.error("请填写标注文本！");
          return false;
        } else if (ztdx === "") {
          message.error("请填写字体大小！");
          return false;
        } else if (csFlag && cskd === "") {
          message.error("请填写衬色宽度！");
          return false;
        }
        json["options"] = {
          bzwb: bzwb,
          bzys: colorOne,
          ztdx: ztdx,
          csflag: csFlag,
          csys: colorTwo,
          cskd: cskd,
          postion: postion
        }
        break;
      case "图片":
        if (colorOne === "") {
          message.error("请选择图标！");
          return false;
        }
        json["options"] = {
          sctb: colorOne,
          postion: postion
        }
        break;
      case "折线":
        let zxkd = $('#zxkd').val();
        let zxcskd = $('#cskd').val();
        if (zxkd === "") {
          message.error("请填写折线宽度！");
          return false;
        } else if (zxcskd === "") {
          message.error("请填写衬色宽度！");
          return false;
        }
        json["options"] = {
          zxys: colorOne,
          zxkd: zxkd,
          csys: colorTwo,
          cskd: zxcskd,
          bktmd: bktmd,
          ostion: postion
        }
        break;
      case "多边形":
        let bkkd = $('#bkkd').val();
        if (bkkd === "") {
          message.error("请填写边框宽度！");
          return false;
        }
        json["options"] = {
          dbxys: colorOne,
          tmd: tmd,
          bkkd: bkkd,
          bkys: colorTwo,
          bktmd: bktmd,
          ostion: postion
        }
        break;
      default:
        break;
    }
    setMapLayer(json).then(res => {
      if (res.msg === "success") {
        if (layerId !== "") {
          message.success("修改成功");
        } else {
          message.success("添加成功");
        }
        shrinkageBtn();
        GetMapGroup();
        $(".spanAtive").css("color", "#ffffff");
      } else {
        message.error(res.msg);
      }
    })
  }
  // 图层组添加btn
  const addTczBtn = (e, id) => {
    e.stopPropagation()
    setFlag(false);
    setTimeout(() => {
      $('#tcmc').val("");
      $('#bzwb').val("");
      $('#ztdx').val("");
      $('#cskd').val("");
    }, 10);
    setTypeText("文本");
    setColorOne("#ffffff");
    setColorTwo("#ffffff");
    setCsFlag(false);
    setGroupId(id);
    setLayerId("");
    addData(e);
  }
  // 删除图层
  const DelMapLayer = (e, item) => {
    e.stopPropagation();

    delMapLayer({id: item.id}).then(res => {
      if (res.msg === "success") {
        message.success("删除成功");
        GetMapGroup();
        $(".Alert").hide();
        let Pos;
        if (item.layer_type === "多边形") {
          Pos = JSON.parse(item.options.ostion);
        } else {
          Pos = JSON.parse(item.options.postion);
        }
        Model.delectMulch({gid: Pos.gid});
      } else {
        message.error(res.msg);
      }
    })
  }
  const shrinkageBtn = (ev) => {
    $(".ContractionArea").slideUp();
    $(".spanAtive").css("color", "#ffffff");
  }
  const fileOpen = (ev) => {
    $(ev.currentTarget).find("input").click()
  }
  const fileQr = (ev) => {
    var filePath = $(ev.currentTarget)[0].files[0];
    var reader = new FileReader();
    if (filePath === undefined) {
      setImgPic("")
    } else {
      reader.readAsDataURL(filePath);
      reader.onload = function (e) {
        setImgPic(this.result)
      }
    }

  }
  const addData = (ev) => {
    $(ev.currentTarget).parents(".custom").find(".ContractionArea").slideDown();
    $(".spanAtive").css("color", "#ffffff");
  }
  // 打开右键菜单
  const rightClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    shrinkageBtn();
    $(".Alert").hide();
    $(".spanAtive").css("color", "#ffffff");
    $(e.currentTarget).css("color", "#ea9310");
    $(e.currentTarget).siblings(".Alert").show();
  }
  // 图层组左键事件
  const leftClick = (e, obj) => {
    e.stopPropagation();
    setFlag(true);
    $(".Alert").hide();
    $(".spanAtive").css("color", "#ffffff");
    $(e.currentTarget).css("color", "#ea9310");
    $(e.currentTarget).parents("li").siblings("li").children("ul").slideUp();
    if ($(e.currentTarget).parents("li").children("ul").css("display") === "none") {
      $(e.currentTarget).parents("li").children("ul").slideDown();
    } else {
      $(e.currentTarget).parents("li").children("ul").slideUp();
    }

    setGroupId(obj.id);
    setTimeout(() => {
      $("#fcmc").val(obj.group_name);
      $('#fcbz').val(obj.remark)
    }, 100);
    setImgPic(obj.group_icon)
    $(e.currentTarget).parents(".custom").find(".ContractionArea").slideDown();
  }
  // 图层左键事件
  const tcleftClick = (e, id, obj) => {
    e.stopPropagation();
    setFlag(false);
    $(".Alert").hide();
    $(".spanAtive").css("color", "#ffffff");
    $(e.currentTarget).css("color", "#ea9310");
    setGroupId(id);
    setLayerId(obj.id)
    $(e.currentTarget).parents(".custom").find(".ContractionArea").slideDown();
    // 赋值
    setTypeText(obj.layer_type);
    setTimeout(() => {
      console.log(obj, "obbj")
      let Pos;
      if (obj.layer_type === "多边形") {
        Pos = JSON.parse(obj.options.ostion);
        let loca = {
          pitch: 0,
          roll: 0,
          x: Pos.points[0].x,
          y: Pos.points[0].y,
          yaw: 0,
          z: Pos.points[0].z
        };

        createMap.FlyToPosition(loca);
      } else {
        Pos = typeof obj.options.postion === 'string' ? JSON.parse(obj.options.postion) : obj.options.postion
        createMap.FlyToPosition({
          ...Pos.location,
          pitch: -90,
          z: Pos.location.z + 5000
        });
      }
      setPostion(Pos)
      setGMulch(Pos);

      $('#tcmc').val(obj.layer_name);
      switch (obj.layer_type) {
        case "文本":
          setCsFlag(obj.options.csflag);
          setColorOne(obj.options.bzys);
          setColorTwo(obj.options.csys);
          $('#bzwb').val(obj.options.bzwb);
          $('#ztdx').val(obj.options.ztdx);
          $('#cskd').val(obj.options.cskd);
          break;
        case "图片":
          setImgPic(obj.options.sctb);
          break;
        case "折线":
          setColorOne(obj.options.zxys);
          setColorTwo(obj.options.csys);
          $("#zxkd").val(obj.options.zxkd);
          $("#cskd").val(obj.options.cskd);
          setBktmd(obj.options.bktmd);
          break;
        case "多边形":
          setColorOne(obj.options.dbxys);
          setColorTwo(obj.options.bkys);
          setTmd(obj.options.tmd);
          setBktmd(obj.options.bktmd);
          $('#bkkd').val(obj.options.bkkd);
          break;
        default:
          break;
      }
      // 点击的图层，添加到地图上
      Model.addExistModel(Pos)
      setCurrentDrawObject(Pos)
      setObjectLocation(Pos.location)
    }, 10);
  }
  const addBtn = (e) => {
    setFlag(true);
    $("#fcmc").val("");
    setImgPic("")
    $('#fcbz').val("")
    addData(e);

  }
  const SetCsFlag = () => {
    setCsFlag(!csFlag)
  }
  const colorOpen = (e, type) => {
    e.stopPropagation();
    if (type === "colorOne") {
      setColorOneFlag(!colorOneFlag)
      setColorTwoFlag(false);
    } else if (type === "colorTwo") {
      setColorOneFlag(false);
      setColorTwoFlag(!colorTwoFlag);
    }

  }
  const colorClose = () => {
    setColorTwoFlag(false);
    setColorOneFlag(false);
  }
  const handleChoosePalette = (type, color) => {
    if (type === "colorOne") {
      setColorOne(color.hex)
    } else if (type === "colorTwo") {
      setColorTwo(color.hex)
    }

  }
  // 透明度
  const SetTmd = (value) => {
    setTmd(value)
  }
  // 边框透明度
  const SetBktmd = (value) => {
    setBktmd(value)
  }
  const formatter = (value) => {
    return `${value}`;
  }
  // 切换类型
  const typeQh = (value) => {
    setTypeText(value);
    setImgPic("");
  }
  // 绘制
  const huizhi = () => {
    if (gMulch) {
      console.log("gMulch: ", gMulch)
      Model.delectMulch({gid: gMulch.gid});
    }
    if (typeText === "文本") {
      let bzwb = $('#bzwb').val();
      let ztdx = $('#ztdx').val();
      if (bzwb === "") {
        message.error("请填写标注文本！");
        return false;
      } else if (ztdx === "") {
        message.error("请填写字体大小！");
        return false;
      }
      let json = {
        text: bzwb,
        color: colorOne,
        size: ztdx
      }
      Model.LabelModel(json, (res) => {
        setPostion(res)
        setCurrentDrawObject(res)
        setObjectLocation(res.location)
      });
    } else if (typeText === '图片') {
      Model.drawImageModel({
        // src: imageSrc,
        // src: "https://picsum.photos/200/300",
        src: "menjin",  // 不支持自定义图片地址。所有图片都要从图片库取。
        scale: 2
      }, (res) => {
        console.log(res)
        setPostion(res)
        setCurrentDrawObject(res)
        setObjectLocation(res.location)
      })
    } else if (typeText === '折线') {
      let lineConfig = {
        color: colorTwo,
        lineWidth: $('#zxkd').val()
      }
      Model.drawLine(lineConfig, (res) => {
        console.log(res)
        setPostion(res)
        setCurrentDrawObject(res)
        setObjectLocation(res.location)
      })
    } else if (typeText === '多边形') {
      let bkkd = $('#bkkd').val();
      Model.playPolygon2({
        color: colorOne,
        lineColor: colorTwo,
        lineWidth: bkkd
      }, (res) => {
        console.log(res)
        setCurrentDrawObject(res)
        setObjectLocation(res.location)
      })
    }
  }

  const updateObjectLocation = (e, key) => {
    const newLocation = {
      ...objLocation,
      [key]: e.target.value

    }
    setObjectLocation(newLocation)
    setCurrentDrawObject(current => ({
      ...current,
      location: newLocation
    }))
    Model.modify({
      ...currentDrawObject,
      location: newLocation
    })
  }
  const showPositionControl =  typeText === '文本'
  return (
    <div className="custom">
      <div className="RightTitle">
        <span>自定义数据</span>
        <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => props.setMoudleId("")}
             alt=""/>
      </div>
      <div className="customList">
        <div className="customBtn">
          <button className="ConfirmButton" onClick={(ev) => addBtn(ev)}>添加</button>
        </div>
        <ul>
          {list.map((item, index) => {
            return (
              <li key={index}><span className="spanAtive" onContextMenu={(e) => rightClick(e)}
                                    onClick={(e) => leftClick(e, item)}>{item.group_name}</span>
                <ul>
                  {item.childen && item.childen.map(item2 => {
                    return (
                      <li key={item2.id}>
                        <span
                          className="spanAtive"
                          onContextMenu={(e) => rightClick(e)}
                          onClick={(e) => tcleftClick(e, item.id, item2)}
                        >
                          {item2.layer_name}
                        </span>
                        <div className="Alert" style={{display: "none"}}>
                          <p onClick={(e) => DelMapLayer(e, item2)}>删除</p>
                        </div>
                      </li>
                    )
                  })}

                </ul>
                <div className="Alert" style={{display: "none"}}>
                  <p onClick={(e) => addTczBtn(e, item.id)}>添加</p>
                  {JSON.stringify(item.childen) === "[]" && <p onClick={(e) => DelMapGroup(e, item.id)}>删除</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="ContractionArea">
        <div className="shrinkage">
          <p onClick={(e) => shrinkageBtn(e)}><img src={require("../../../assets/images/shousuojt.png").default}
                                                   alt=""/></p>
        </div>
        {Flag ? <div className="CustomPanel">
            <div className="CustomPanel_Div"><span>分层名称：</span><input className="inputAll" type="text" id="fcmc"/></div>
            <div className="CustomPanel_Div"><span>分层图标：</span><p
              onClick={(ev) => fileOpen(ev)}>{imgPic !== "" && imgPic !== undefined ?
              <img src={imgPic} alt=""/> : "pic"}<input type="file" onChange={(ev) => fileQr(ev)}/></p></div>
            <div className="CustomPanel_Div"><span>分层备注：</span><textarea className="inputAll" id="fcbz"/></div>
          </div> :
          <div className="CustomPanel">
            <div className="TextWb">
              <span>图层名称：</span>
              <input type="text" className="inputAll" id="tcmc"/>
            </div>
            <div className="TextWb" style={{width: "200px"}}>
              <span>上图方式：</span>
              <select name="" className="sleAll" id="stfs" value={typeText} onChange={(e) => typeQh(e.target.value)}>
                <option value="文本">文本</option>
                <option value="图片">图片</option>
                <option value="折线">折线</option>
                <option value="多边形">多边形</option>
              </select>
            </div>
            {(() => {
              switch (typeText) {
                case "文本":
                  return (
                    <div>
                      <div className="TextWb">
                        <span>标注文本：</span>
                        <input type="text" className="inputAll" id="bzwb"/>
                      </div>
                      <div className={`TextWb`}>
                        <span>标注颜色：</span>
                        <div
                          className="colorArea"
                          style={{backgroundColor: colorOne}}
                          onClick={(e) => colorOpen(e, "colorOne")}
                        />
                        {colorOneFlag &&
                        <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker
                            color={colorOne}
                            onChange={handleChoosePalette.bind(this, 'colorOne')}
                          />
                        </div>
                        }
                      </div>
                      <div className="TextWb">
                        <span>字体大小：</span>
                        <input type="text" className="inputAll" id="ztdx"/>
                      </div>
                      <div className="TextWb">
                        <span>是否衬色：</span>
                        <input type="checkbox" checked={csFlag} onChange={() => SetCsFlag()}/>
                      </div>
                      <div className={`TextWb ${!csFlag ? "disableState" : ""}`}>
                        <span>衬色颜色：</span>
                        <div
                          className="colorArea"
                          style={{backgroundColor: colorTwo}}
                          onClick={csFlag ? (e) => colorOpen(e, "colorTwo") : null}
                        />
                        {colorTwoFlag && <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker
                            color={colorTwo}
                            onChange={handleChoosePalette.bind(this, 'colorTwo')}
                          />
                        </div>}
                      </div>
                      <div className={`TextWb ${!csFlag ? "disableState" : ""}`}>
                        <span>衬色宽度：</span>
                        <input type="text" className="inputAll" id="cskd" disabled={!csFlag ? "disabled" : ""}/>
                      </div>
                    </div>
                  )
                case "图片":
                  return (
                    <div>
                      <div className="TextWb">
                        <span>上传图标：</span>
                        <p onClick={(ev) => fileOpen(ev)}>{imgPic !== "" && imgPic !== undefined ?
                          <img src={imgPic} alt=""/> : "pic"}
                          <input type="file" onChange={(ev) => fileQr(ev)}/>
                        </p>
                      </div>
                    </div>
                  )
                case "折线":
                  return (
                    <div>
                      <div className={`TextWb`}>
                        <span>折线颜色：</span>
                        <div className="colorArea" style={{backgroundColor: colorOne}}
                             onClick={(e) => colorOpen(e, "colorOne")}/>
                        {colorOneFlag &&
                        <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker color={colorOne} onChange={handleChoosePalette.bind(this, 'colorOne')}/>
                        </div>}
                      </div>
                      <div className="TextWb">
                        <span>折线宽度：</span>
                        <input type="text" className="inputAll" id="zxkd"/>
                      </div>
                      <div className={`TextWb`}>
                        <span>衬色颜色：</span>
                        <div
                          className="colorArea"
                          style={{backgroundColor: colorTwo}}
                          onClick={(e) => colorOpen(e, "colorTwo")}
                        />
                        {colorTwoFlag &&
                        <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker color={colorTwo} onChange={handleChoosePalette.bind(this, 'colorTwo')}
                          />
                        </div>
                        }
                      </div>
                      <div className="TextWb">
                        <span>衬色宽度：</span>
                        <input type="text" className="inputAll" id="cskd"/>
                      </div>
                      <div className="TextWb">
                        <span style={{width: "110px"}}>边框透明度：</span>
                        <Slider onChange={SetBktmd} value={bktmd} tipFormatter={formatter}/>
                      </div>
                    </div>
                  )
                case "多边形":
                  return (
                    <div>
                      <div className={`TextWb`}>
                        <span>多边形颜色：</span>
                        <div
                          className="colorArea"
                          style={{backgroundColor: colorOne}}
                          onClick={(e) => colorOpen(e, "colorOne")}
                        />
                        {colorOneFlag &&
                        <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker
                            color={colorOne}
                            onChange={handleChoosePalette.bind(this, 'colorOne')}
                          />
                        </div>}
                      </div>
                      <div className="TextWb">
                        <span>透明度：</span>
                        <Slider onChange={SetTmd} value={tmd} tipFormatter={formatter}/>
                      </div>
                      <div className="TextWb">
                        <span>边框宽度：</span>
                        <input type="text" className="inputAll" id="bkkd"/>
                      </div>
                      <div className={`TextWb`}>
                        <span>边框颜色：</span>
                        <div
                          className="colorArea"
                          style={{backgroundColor: colorTwo}}
                          onClick={(e) => colorOpen(e, "colorTwo")}
                        />
                        {colorTwoFlag &&
                        <div className="ChromePicker">
                          <div className="mask" onClick={() => colorClose()}/>
                          <ChromePicker
                            color={colorTwo}
                            onChange={handleChoosePalette.bind(this, 'colorTwo')}
                          />
                        </div>}
                      </div>
                      <div className="TextWb">
                        <span style={{width: "110px"}}>边框透明度：</span>
                        <Slider onChange={SetBktmd} value={bktmd} tipFormatter={formatter}/>
                      </div>
                    </div>
                  )
                default:
                  return null;
              }

            })()}
            {showPositionControl &&
            <div className="Operation">
              <div className="Operation_div">
                <span>X：</span>
                <input
                  type="number"
                  value={objLocation.x}
                  onChange={(e) => updateObjectLocation(e, 'x')}
                />
              </div>
              <div className="Operation_div">
                <span>Y：</span>
                <input
                  type="number"
                  value={objLocation.y}
                  onChange={(e) => updateObjectLocation(e, 'y')}
                />
              </div>
              <div className="Operation_div">
                <span>Z：</span>
                <input
                  type="number"
                  value={objLocation.z}
                  onChange={(e) => updateObjectLocation(e, 'z')}
                />
              </div>
              <div className="Operation_div" title="俯仰角">
                <span>pitch:：</span>
                <input
                  type="number"
                  value={objLocation.pitch}
                  min={-90}
                  max={90}
                  onChange={(e) => updateObjectLocation(e, 'pitch')}
                />
              </div>
              <div className="Operation_div" title="偏航角">
                <span>yaw：</span>
                <input
                  type="number"
                  value={objLocation.yaw}
                  onChange={(e) => updateObjectLocation(e, 'yaw')}
                />
              </div>
              <div className="Operation_div" title="翻滚角">
                <span>roll：</span>
                <input
                  type="number"
                  value={objLocation.roll}
                  onChange={(e) => updateObjectLocation(e, 'roll')}
                />
              </div>
            </div>
            }
          </div>
        }
        <div className="CustomPanelBtn">
          {!Flag && <button className="ConfirmButton" onClick={() => huizhi()}>绘制</button>}
          <button className="ConfirmButton" onClick={Flag ? (e) => SetMapGroup(e) : () => SetMapLayer()}>保存</button>
        </div>
      </div>
    </div>
  );
}

export default RoleAuthority;