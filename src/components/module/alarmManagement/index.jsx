import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { message } from 'antd';
import { Build } from "../../../map3D/map3d";
import { setMapBuild, setMapFloor, getMapBulid, getMapFloor } from "../../../api/mainApi";
class AlarmManagement extends Component {
    constructor(props) {
        super(props);
        this.state = {
            buildFlag: true,//当前为建筑还是楼层 true建筑/false楼层
            buildList: [],
            floorList: [],
            bulidFloor: [],
            buildId: "",//编号
            name: "",//名称
            postion: "",//坐标定位
            dqObj: {},//当前编辑对象

        }
        AlarmManagement.this = this;
    }
    componentDidMount() {
        this.getMap();
    }
    // 获取地图建筑
    getMapVBuild = () => {
        Build.getBuild((obj) => {
            AlarmManagement.this.setState({
                buildList: JSON.parse(obj)
            })
            this.getMapVFloor(JSON.parse(obj));
        })
    }
    // 获取地图楼层
    getMapVFloor = async (obj) => {
        let floorList = this.state.floorList;
        let num = 0;
        obj.forEach(element => {
            Build.getFloor(element.id, (item) => {
                floorList = [...floorList, ...JSON.parse(item)]
                num++;
                if (num === obj.length) {
                    AlarmManagement.this.setState({
                        floorList: floorList
                    });
                    AlarmManagement.this.SetMap(AlarmManagement.this.state.buildList, AlarmManagement.this.state.floorList)
                    console.log(AlarmManagement.this.state.buildList, AlarmManagement.this.state.floorList)
                }
            });

        });
    }
    // 数据同步到后台
    SetMap = (build, floor) => {
        build.forEach(item => {
            this.SetMapBuild(item.name, item.id, "");
        })
        floor.forEach((item2, index) => {
            this.SetMapFloor(item2.buildname, item2.floorname, item2.buildname + "#" + item2.floorname, "", floor.length - 1 === index ? true : false);
        })
    }
    // 建筑请求
    SetMapBuild = (name, build_id, id) => {
        let json = { build_name: name, build_id: build_id, postions: {} }
        if (id !== "") {
            json["id"] = id;
        }
        setMapBuild(json).then(res => {
            if (res.msg === "success" && id !== "") {
                this.getMap();
                message.success("修改成功");
                this.shrinkageBtn();
            }

        })
    }
    //楼层请求
    SetMapFloor = (buildname, floorname, floorId, id, flag) => {
        let json = { build_id: buildname, floor_name: floorname, floor_id: floorId, postions: {} }
        if (id !== "") {
            json["id"] = id;
        }
        setMapFloor(json).then(res => {
            if (res.msg === "success" && id !== "") {
                this.getMap();
                message.success("修改成功");
                this.shrinkageBtn();
            }
            if (res.msg === "success" && flag) {
                message.success("楼层同步成功");
                this.getMap();
            }
        })
    }
    //获取后台建筑楼层数据
    getMap = () => {
        getMapBulid().then(res => {
            if (res.msg === "success") {
                let element = res.data;
                element.forEach(item => {
                    item["childen"] = [];
                })
                getMapFloor().then(res2 => {
                    if (res.msg === "success") {
                        let element2 = res2.data;
                        element2.forEach(item => {
                            element.forEach(item2 => {
                                if (item.build_id === item2.build_id) {
                                    item2["childen"].push(item);
                                }
                            })
                        })
                        AlarmManagement.this.setState({
                            bulidFloor: element
                        })
                        // console.log(element, "element")
                    }
                })
            }
        })
    }
    // 左键事件
    onMenuClicked = (e, obj, flag) => {
        $(".alerth2").css("color", "#ffffff");
        $(e.currentTarget).css("color", "#ea9310");
        $(e.currentTarget).parents("li").siblings("li").children("ul").slideUp();
        if ($(e.currentTarget).siblings("ul").css("display") === "none") {
            $(e.currentTarget).siblings("ul").slideDown();
        } else {
            $(e.currentTarget).siblings("ul").slideUp();
        }
        if (flag) {
            this.assignment(obj.build_id, obj.build_name);
        } else {
            this.assignment(obj.floor_id, obj.floor_name);
        }
        this.setState({
            buildFlag: flag,
            dqObj: obj
        })
        this.addData(e);
    }
    // 赋值
    assignment = (buildId, name) => {
        this.setState({
            buildId: buildId,
            name: name,
            postion: ""
        })
    }
    // 输入框变值
    inputAll = (e, type) => {
        this.setState({
            [type]: e.target.value
        })
    }
    shrinkageBtn = (ev) => {
        $(".floorConfiguration").find(".ContractionArea").slideUp();
        $(".alerth2").css("color", "#ffffff");
    }
    addData = (ev) => {
        $(".floorConfiguration").find(".ContractionArea").slideDown();
    }
    render() {
        const { bulidFloor, buildId, name, postion, buildFlag, dqObj } = this.state;
        return (
            <div className="floorConfiguration">
                <div className="RightTitle">
                    <span>楼层配置</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
                </div>
                <div className="ConfigurationList">
                    <div className="ImportBtn">
                        <button className="ConfirmButton" onClick={() => this.getMapVBuild()}>楼层同步</button>
                    </div>
                    <div className="TreeList" style={{ 'height': '300px' }}>
                        <ul key="single">
                            {bulidFloor.map(menuObj => {
                                return (
                                    <li key={menuObj.id} className='addAlert'>
                                        <h2 className="alerth2" onClick={(e) => this.onMenuClicked(e, menuObj, true)} title={menuObj.build_name}><img src={require("../../../assets/images/wenjianjia.png").default} alt=""></img>
                                            {menuObj.build_name}
                                        </h2>
                                        <ul>
                                            {menuObj.childen.map(item => {
                                                return (
                                                    <li key={item.id} className='addAlert'>
                                                        <h2 className="alerth2" onClick={(e) => this.onMenuClicked(e, item, false)} title={item.floor_name}>
                                                            {item.floor_name}
                                                        </h2>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </li>
                                )
                            })}

                        </ul>
                    </div>
                </div>
                <div className="ContractionArea">
                    <div className="shrinkage">
                        <p onClick={(e) => this.shrinkageBtn(e)}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
                    </div>
                    <div className="floorEditor">
                        <div className="TextWb">
                            <span>编号：</span>
                            <input type="text" className="inputAll" defaultValue={buildId} disabled="disabled" />
                        </div>
                        <div className="TextWb">
                            <span>名称：</span>
                            <input type="text" className="inputAll" defaultValue={name} onChange={(e) => this.inputAll(e, "name")} />
                        </div>
                        <div className="TextWb">
                            <span>坐标定位：</span>
                            <input type="text" className="inputAll" defaultValue={postion} />
                        </div>
                    </div>
                    <div className="floorBtn">
                        <button className="ConfirmButton" onClick={buildFlag ? () => this.SetMapBuild(name, dqObj.build_id, dqObj.id) : () => this.SetMapFloor(dqObj.build_id, name, dqObj.floor_id, dqObj.id)}>保存</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default AlarmManagement;