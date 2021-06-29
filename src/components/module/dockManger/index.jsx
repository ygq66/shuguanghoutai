import React from "react"
import "./style.scss"

export default class DockManger extends React.Component {
    constructor(props) {
        super()
        this.state = {
            list: [
                { img: require("../../../assets/images/smallTools/guangzhao-2.png").default, text: "光照", flag: true },
                { img: require("../../../assets/images/smallTools/xue-2.png").default, text: "雪", flag: false },
                { img: require("../../../assets/images/smallTools/wu.png").default, text: "雾", flag: false },
                { img: require("../../../assets/images/smallTools/yu-2.png").default, text: "雨", flag: false },
                { img: require("../../../assets/images/smallTools/cemianji.png").default, text: "测面积", flag: false },
                { img: require("../../../assets/images/smallTools/cekuan.png").default, text: "测宽", flag: false },
                { img: require("../../../assets/images/smallTools/cegao-2.png").default, text: "测高", flag: false }
            ]
        }
        DockManger.this = this;
    }

    //初始化的加载
    componentDidMount() {

    }
    btnListXz = (obj) => {
        let list = this.state.list;
        obj.flag = !obj.flag;
        DockManger.this.setState({
            list: list
        })
    }
    close=()=>{
        this.props.setMoudleId("")
    }
    render() {
        const { list } = this.state
        return (
            <div className="SmallTools">
                <div className="RightTitle">
                    <span>小工具</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={()=>this.close()} alt="" />
                </div>
                <div className="SmallToolsChoose">
                    <ul>
                        {list.map((item, index) => {
                            return (
                                <li key={index} onClick={() => this.btnListXz(item)}>
                                    {item.flag && <img src={require("../../../assets/images/smallTools/xuanze-2.png").default} className="xuanzhong" alt="" />}
                                    <p><img src={item.img} alt="" /></p>
                                    <span style={{ color: item.flag ? "white" : "rgba(255, 255, 255, 0.2)" }}>{item.text}</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
                <div className="SmallToolsBtn">
                    <button className="ConfirmButton">确定</button>
                </div>
            </div>
        )
    }
}