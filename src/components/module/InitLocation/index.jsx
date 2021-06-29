import React, { Component } from 'react'
import "./style.scss"
import $ from "jquery"
import { message } from "antd";
import { getLocationList, setLocationTouchin } from '../../../api/mainApi'
import { createMap } from '../../../map3D/map3d';
class InitLocation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            textId: "",
            textPostion: ""
        }
        InitLocation.this = this;
    }
    componentDidMount() {
        this.getLocationList();
    }
    shrinkageBtn = (ev) => {
        $(ev.currentTarget).parents(".ContractionArea").slideUp()
    }

    addData = (ev) => {
        $(ev.currentTarget).parents(".custom").find(".ContractionArea").slideDown()
    }
    getLocationList = () => {
        getLocationList().then(res => {
            if (res.msg === "success" && res.data.length > 0) {
                InitLocation.this.setState({
                    textId: res.data[0].id,
                    textPostion: res.data[0].position
                })
            }
        })
    }
    setLocationTouchin = () => {
        let textId = this.state.textId;
        let textPostion = this.state.textPostion;
        let json = {
            position: textPostion
        };
        if (textId !== "") {
            json["id"] = textId;
        }
        setLocationTouchin(json).then(res => {
            if (res.msg === "success" && res.data.length > 0) {
                message.success("保存成功")
                InitLocation.this.setState({
                    textId: res.data[0].id,
                    textPostion: res.data[0].position
                })
            }
        })
    }
    textChange = (e) => {
        this.setState({
            textPostion: e.target.value
        })
    }
    GetCurrentPosition = () => {
        createMap.getCurrent(res => {
            console.log(res, "当前视角")
            this.setState({
                textPostion: res
            })
        })
    }
    render() {
        const { textPostion } = this.state;
        return (

            <div className="initLocation">

                <div className="RightTitle">
                    <span>初始化位置</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />

                </div>

                <div className="initLocationContent">

                    <div className="CustomPanel">
                        <div><span>坐标位置：</span><textarea className="inputAll" defaultValue={textPostion} onChange={(e) => this.textChange(e)}></textarea></div>
                        <div><p><span>当前位置：</span><button className="ConfirmButton" onClick={() => this.GetCurrentPosition()}>获取</button></p><textarea defaultValue={textPostion} disabled className="inputAll"></textarea></div>
                    </div>

                    <div className="initLocationSave">
                        <button className="ConfirmButton" onClick={() => this.setLocationTouchin()}>保存</button>
                    </div>

                </div>

            </div>

        )
    }
}
export default InitLocation;