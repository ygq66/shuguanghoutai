import React, { Component } from 'react'
import "./style.scss";
import $ from "jquery";
import { getMapLocation, addMapLocation, updateMapLocation, delMapLocation } from '../../../api/mainApi';
import { message } from 'antd';
import { createMap } from '../../../map3D/map3d';

class Management extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isModify: false,//是否修改状态
            ModifyId: "",//当前修改的id
            locationData: [],
            weizhiName: "",//位置名称
        };
        Management.this = this;
    }
    componentDidMount() {
        this.getMapLocation()
    }
    shrinkageBtn = () => {
        this.setState({
            weizhiName: "",
            isModify: false,
            ModifyId: ""
        })
        $(".ContractionArea").slideUp();
    }
    addShowBtn = () => {
        this.setState({
            weizhiName: "",
            isModify: false,
            ModifyId: ""
        })
        this.showShrinkageBtn();
    }
    showShrinkageBtn = () => {
        $(".module_m").find(".ContractionArea").slideDown()
    }
    getMapLocation = () => {
        getMapLocation().then(res => {
            Management.this.setState({
                locationData: res.data
            })
        })
    }
    addMapLocation = () => {
        const { weizhiName, isModify, ModifyId } = this.state;
        if (weizhiName === "") {
            message.error("请输入位置名称")
        } else {
            new Promise(resolve => {
                createMap.getCurrent(msg => {
                    resolve(msg)
                })
            }).then(val => {
                return new Promise(resolve => {
                    this.exportVideoImg(res => {
                        resolve({ positions: val, pic: res })
                    })
                })
            }).then(item => {
                if (isModify) {
                    updateMapLocation({ id: ModifyId, location_name: weizhiName, pic: item.pic, positions: JSON.parse(item.positions) }).then(res => {
                        message.success("修改成功")
                        Management.this.getMapLocation();
                        Management.this.shrinkageBtn();
                    })
                } else {
                    addMapLocation({ location_name: weizhiName, pic: item.pic, positions: JSON.parse(item.positions) }).then(res => {
                        message.success("保存成功");
                        Management.this.getMapLocation();
                        Management.this.shrinkageBtn();
                    })
                }
            })
        }
    }
    // 删除
    delMapLocation = () => {
        const { ModifyId } = this.state;
        delMapLocation({ id: ModifyId }).then(res => {
            message.success("删除成功");
            Management.this.getMapLocation();
            Management.this.shrinkageBtn();
        })
    }
    //video截图
    exportVideoImg = (callback) => {
        var video = document.querySelector('#streamingVideo');
        video.crossorigin = 'anonymous'
        var canvas = document.getElementById('VideCanvas');
        var cobj = canvas.getContext('2d'); //获取绘图环境
        cobj.drawImage(video, 0, 0, 200, 300);
        let base64 = canvas.toDataURL('image/jpeg', 0.5)
        if (callback) {
            callback(base64);
        }
    }
    // 点击定位查看
    showFlyWeizhi = (item) => {
        createMap.FlyToPosition(item.positions);
        this.setState({
            ModifyId: item.id,
            isModify: true,
            weizhiName: item.location_name
        })
        this.showShrinkageBtn();
    }
    render() {
        const { locationData, weizhiName, isModify } = this.state
        return (
            <div className="module_m">
                <div className="RightTitle">
                    <span>常用位置</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
                </div>
                <div className="customList">
                    <div className="customBtn">
                        <button className="ConfirmButton" onClick={() => this.addShowBtn()}>添加</button>
                    </div>
                    <div className="customData">
                        {
                            locationData.map((item, index) => {
                                return (
                                    <div className="DataItem" key={index} onClick={() => this.showFlyWeizhi(item)}>
                                        <img src={item.pic} alt="" />
                                        <span>{item.location_name}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="ContractionArea">
                    <div className="shrinkage">
                        <p onClick={() => this.shrinkageBtn()}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
                    </div>
                    <div className="CustomPanel">
                        <div><span>位置名称：</span><input className="inputAll" type="text" id="cywz" value={weizhiName} onChange={(e) => this.setState({ weizhiName: e.target.value })} /></div>
                    </div>
                    <div className="CustomPanelBtn">
                        <button className="ConfirmButton" onClick={() => this.addMapLocation()}>{!isModify ? "保存" : "修改"}</button>
                        <button className="ConfirmButton" onClick={() => this.shrinkageBtn()}>取消</button>
                        {isModify && <button className="ConfirmButton" onClick={() => this.delMapLocation()}>删除</button>}
                    </div>
                    <canvas id="VideCanvas" width="200" height="300" backgroundColor='#ccc' style={{ display: "none" }}></canvas>
                </div>

            </div>
        );
    }
}





export default Management;