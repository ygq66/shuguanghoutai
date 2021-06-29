import React, { Component } from 'react'
import "./style.scss";
import $ from "jquery"
import flyIcon from "../../../assets/images/feixing-1.png"
import { createMap, Model } from '../../../map3D/map3d';
import { message } from 'antd';
import { setRoamFly, getRoamlist, delRoamlist } from "../../../api/mainApi"
class FlyRoam extends Component {

    constructor(props) {
        super(props);
        this.state = {
            flyRoam: [],
            currentindex: -1,
            lineName: "",//线路名称
            lineHeight: 0,//线路高度
            lineModel: {},//当前绘制线对象
        };
        FlyRoam.this = this;
    }
    componentDidMount() {
        this.GetRoamlist();
        $(document).on("click", () => {
            $('.Alert').hide();
        })
    }
    // 获取漫游路径
    GetRoamlist = () => {
        getRoamlist().then(res => {
            this.setState({
                flyRoam: res.data
            })
        })
    }
    shrinkageBtn = () => {
        $(".flyRoam").find(".ContractionArea").slideUp();
        this.delLine();
        this.setState({
            lineName: "", lineHeight: 0, currentindex: -1
        })
    }
    addData = (ev) => {
        $(".flyRoam").find(".ContractionArea").slideDown()
    }
    handleclick(index, item) {
        this.delLine();
        Model.carteLine(item.postions.points, res => {
            if (res) {
                const pos = {
                    x: res.points[0].x,
                    y: res.points[0].y,
                    z: Number(res.points[0].z) + 200,
                    pitch: 45,  // 俯仰角 0——90度
                    yaw: 0,   // 偏航角 0-360度
                    roll: 0     // 翻滚角
                };
                createMap.FlyToPosition(pos);
                FlyRoam.this.setState({
                    lineHeight: res.points[0].z,
                    lineModel: res
                })
            }
        })
        this.addData();
        this.setState({
            currentindex: index,
            lineName: item.roam_name
        })
    }
    // 绘制飞行漫游路线
    creatLine = () => {
        message.warning("鼠标右键结束绘制");
        Model.drawLine(res => {
            Model.endEditing();
            if (res) {
                FlyRoam.this.setState({
                    lineModel: res,
                    lineHeight: res.points[0].z
                })
            }
        })
    }
    // 修改路线高度
    updateLine = (e) => {
        const { lineModel } = this.state;
        let obj = { ...lineModel };
        if (JSON.stringify(obj) !== "{}") {
            obj.points.forEach(item => {
                item.z = Number(e.target.value)
            })
            Model.updeteLabelModel(obj);
        }
        this.setState({
            lineModel: obj,
            lineHeight: Number(e.target.value)
        })
    }

    // 重新绘制飞行漫游路线/删除线
    delLine = () => {
        const { lineModel } = this.state;
        Model.removeGid(lineModel.gid);
        FlyRoam.this.setState({
            lineModel: {}
        })
    }
    // 保存
    SetRoamFly = () => {
        const { lineName, lineModel } = this.state;
        const json = {
            roam_name: lineName,
            postions: lineModel
        }
        setRoamFly(json).then((result) => {
            message.success("保存成功!");
            FlyRoam.this.shrinkageBtn();
            FlyRoam.this.GetRoamlist();
        })
    }
    // 删除当前飞行漫游
    DelRoamlist = (e, item) => {
        e.preventDefault();
        delRoamlist({ id: item.id }).then(res => {
            message.success("删除成功!");
            FlyRoam.this.shrinkageBtn();
            FlyRoam.this.GetRoamlist();
        })
    }
    // 关闭右边窗口
    closeWindow = () => {
        this.delLine();
        this.props.setMoudleId("")
    }
    // 右键事件
    onContextMenu = (e) => {
        e.preventDefault();
        $('.Alert').hide();
        $(e.currentTarget).find(".Alert").show();
    }
    render() {
        const { flyRoam, currentindex, lineModel, lineName, lineHeight } = this.state;
        return (
            <div className="flyRoam">
                <div className="RightTitle">
                    <span>飞行漫游</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.closeWindow()} alt="" />
                </div>
                <div className="flyRoamContent">
                    <div className="flyRoamSave">
                        <button className="ConfirmButton" onClick={(ev) => this.addData(ev)}>设置新路线</button>
                    </div>
                    <div className="flyRoamItem">
                        <div className="ItemWrap">
                            {
                                flyRoam.map((item, index) => {
                                    return (
                                        <div key={index} className={`ItemBody ${index === currentindex ? "ItemBody active" : "ItemBody"}`} onContextMenu={(e) => this.onContextMenu(e)} onClick={this.handleclick.bind(this, index, item)}>
                                            <span>{index + 1}.</span>
                                            <span>{item.roam_name}</span>
                                            <span><img src={flyIcon} alt="" /></span>
                                            <div className="Alert" style={{ display: "none" }}>
                                                <p onClick={(e) => this.DelRoamlist(e, item)}>删除</p>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="flyBottom">
                    <div className="ContractionArea">
                        <div className="shrinkage">
                            <p onClick={() => this.shrinkageBtn()}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
                        </div>
                        <div className="CustomPanel">
                            <div><span>线路名称</span><input className="inputAll" type="text" value={lineName} onChange={(e) => { this.setState({ lineName: e.target.value }) }} /></div>
                            <div><span>高度</span><input className="inputAll" type="number" value={lineHeight} onChange={(e) => this.updateLine(e)} /></div>
                        </div>
                        <div className="CustomPanelBtn">
                            <button className="ConfirmButton" onClick={() => JSON.stringify(lineModel) === "{}" ? this.creatLine() : this.delLine()}>{JSON.stringify(lineModel) === "{}" ? "绘制" : "重新绘制"}</button>
                            <button className="ConfirmButton" onClick={() => this.SetRoamFly()}>保存</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default FlyRoam;