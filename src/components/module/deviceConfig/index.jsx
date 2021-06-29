import React from "react"
import "./style.scss"
import $ from "jquery"
import { message, Checkbox } from 'antd';
import { savaGridRegionList, addGridRegion, savaGridInfoList, daoruWg, wgUpdata, wgzjDel, wgzzReset, getBuildList, getFloorList } from '../../../api/mainApi'
// import { message } from 'antd';
// import { Tree, Switch } from 'antd';
// import { CarryOutOutlined, FormOutlined } from '@ant-design/icons';
// import { Empty } from "antd"
// import { ChromePicker } from "react-color";
import { createMap, Model } from "../../../map3D/map3d";
export default class DeviceConfig extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            biuldList: [],//建筑列表
            floorList: [],//楼层建筑
            wg_gid: "",//当前展示的网格面gid
            pid: "0",
            dqid: "0",
            node_Flag: false,
            addFlag: true,
            treelist: [],
            wgColorFlag: false,
            wgColor: "#ffffff",
            liningColorFlag: false,
            bkColor: "#ffffff",
            inputflag: false,
            indoor: false,
            tmd: 0,
            bktmd: 0,
            fileNameArry: [],
            wg_themes: "默认主题",//网格主题
            isZytp: false,//是否用于资源图谱
            isSzh: false,//是否用于数字化
        }
        DeviceConfig.this = this;
    }
    componentDidMount() {
        this.getGidList()
        document.oncontextmenu = function () {
            return false;
        }
        $(document).on("click", function () {
            $(".Alert").hide();
        })
        Model.getModel((msg) => {
            console.log(msg, "msg")
        })
    }
    // 创建面
    CreatePolygon = (item) => {
        let coordinates = [];
        let h = 450;
        if (item.floor_num !== 0) {
            h = h + item.floor_num * 300
        }
        h = h + item.height * 100;
        h = h + item.level / 10;
        item.geom.coordinates[0].forEach(element => {
            let json = {
                x: element[0] * 100,
                y: -(element[1] * 100),
                z: h
            }
            coordinates.push(json)
        })
        Model.createPolygon(coordinates, strObj => {
            DeviceConfig.this.setState({
                wg_gid: JSON.parse(strObj).gid
            });
            let floorNum = null
            if (item.indoor) {
                floorNum = Number(item.floor_id.slice(-1))
            }
            const pos = {
                x: item.geom.coordinates[0][0][0] * 100,
                y: -(item.geom.coordinates[0][0][1] * 100),
                z: item.indoor ? floorNum * 450 : 800,
                pitch: 90,  // 俯仰角 0——90度
                yaw: 0,   // 偏航角 0-360度
                roll: 0     // 翻滚角
            };
            createMap.FlyToPosition(pos)
        })
    }
    onMenuClicked = (e, item) => {
        if (item.node_type === "details") {
            const { wg_gid } = this.state;
            Model.removeGid(wg_gid);
            this.clickOpen(item);
            setTimeout(() => {
                DeviceConfig.this.addData(e);
            }, 100)
            this.CreatePolygon(item)
            console.log(item, "item")
        } else {
            this.shrinkageBtn(e);
        }
        e.stopPropagation();
        $(".Alert").hide();
        $(e.currentTarget).parents("ul").find("h2").css("color", "#ffffff");
        $(e.currentTarget).css("color", "#ea9310");
        if ($(e.currentTarget).parent("li").children("ul").css("display") === "none") {
            $(e.currentTarget).parent("li").children("ul").slideDown();
            // $(e.currentTarget).children("img").attr("src", require("../../../assets/images/jianhao.png").default)
        } else {
            $(e.currentTarget).parent("li").children("ul").slideUp();
            // $(e.currentTarget).children("img").attr("src", require("../../../assets/images/jiahao.png").default)
        }
    }
    onContextMenu = (e, type) => {
        e.stopPropagation();
        e.preventDefault();
        const { wg_gid } = this.state;
        Model.removeGid(wg_gid);
        $(e.currentTarget).parents("ul").find("h2").css("color", "#ffffff");
        $(e.currentTarget).children("h2").css("color", "#ea9310");
        $(".Alert").hide();
        if (type !== "details") {
            $(e.currentTarget).children(".Alert").show();
        }
    }
    closeBtn = () => {
        $(".Alert").hide();
    }
    daoruBtn = (e, id, name) => {
        this.setState({
            node_Flag: true,
            pid: id,
            fileNameArry: [],
            biuldList: [],
            floorList: [],
            indoor: false
        })
        setTimeout(() => {
            DeviceConfig.this.addData(e);
            $('#wgmc').val(name);
            $('#wgdj').val("")
        }, 100)

    }
    //生成树结构
    generateMenu(menuObj) {
        let vdom = [];
        if (menuObj instanceof Array) {
            let list = [];
            for (var item of menuObj) {
                list.push(this.generateMenu(item));
            }
            vdom.push(
                <ul key="single">
                    {list}
                </ul>
            );
        } else {
            if (menuObj == null) { return; }
            vdom.push(
                <li key={menuObj.id} className='addAlert' id={'addAlert' + menuObj.id} onContextMenu={(e) => this.onContextMenu(e, menuObj.node_type)}>
                    <h2 onClick={(e) => this.onMenuClicked(e, menuObj)} title={menuObj.region_name}><img src={menuObj.node_type === "details" ? require("../../../assets/images/details.png").default : menuObj.node_type === "group" ? require("../../../assets/images/wenjianjia.png").default : require("../../../assets/images/wgtp.png").default} alt=""></img>
                        {menuObj.region_name}
                    </h2>
                    <input type='text' style={{ 'display': 'none' }} defaultValue={menuObj.region_name} onFocus={(e) => e.stopPropagation()} onChange={(e) => this.listName(e)} />


                    {this.generateMenu(menuObj.children)}
                    <div className="Alert" id={'Alert' + menuObj.id} style={{ display: "none" }}>
                        {menuObj.node_type === "group" && <p onClick={(e) => this.addXinxi(e, menuObj.id, true)}>添加</p>}
                        {(menuObj.node_type === "group" || menuObj.node_type === "grid") && <p onClick={(e) => this.addXinxi(e, menuObj.id, false, menuObj.region_name)}>修改</p>}
                        {(menuObj.node_type === "group" && JSON.stringify(menuObj.children) === "[]") && <p onClick={(e) => this.wgzjDel(e, menuObj.id)}>删除</p>}
                        {menuObj.node_type === "group" && <p onClick={(e) => this.daoruBtn(e, menuObj.id, menuObj.region_name)}>导入</p>}
                        {menuObj.node_type === "grid" && <p onClick={(e) => this.wgzzReset(e, menuObj.id)}>重置</p>}
                    </div>
                </li>
            );
        }
        return vdom;
    }
    //树结构生成
    AnalyticFormat(vdom) {
        var menuObj = vdom;
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
    addData = (ev) => {
        $(".GridImport").find(".ContractionArea").slideDown()
    }
    addXinxi = (e, id, flag, name) => {
        e.stopPropagation();
        const { wg_gid } = this.state;
        Model.removeGid(wg_gid);
        this.setState({
            inputflag: true,
            pid: id,
            addFlag: flag
        })
        setTimeout(() => {
            if (!flag) {
                $("#wgName").val(name)
            } else {
                $('#wgName').val("")
            }
        }, 10);

        this.closeBtn();
    }
    closeWgname = () => {
        this.setState({
            inputflag: false
        })
    }
    getGidList = () => {
        let list = [];
        savaGridRegionList().then(res => {
            if (res.msg === "success") {
                const result = res.data;
                list = result;
                savaGridInfoList().then(res => {
                    const results = res.data;
                    if (res.msg === "success") {
                        results.forEach(element => {
                            var arr = {
                                id: element.id
                                , pid: element.region_id
                                , region_name: element.grid_name
                                , node_type: "details"
                                , position: element.position
                                , indoor: element.indoor
                                , build_id: element.build_id
                                , floor_id: element.floor_id
                                , children: [],
                                grid_style: element.grid_style,
                                geom: element.geom,
                                level: element.level,
                                height: element.height,
                                floor_num: element.floor_num
                            }
                            list.push(arr);
                        });
                        DeviceConfig.this.setState({
                            treelist: list
                        })
                        // console.log(list, "list")
                    }

                })
            }
        })
    }
    saveWgXinxi = (ev) => {
        // const { wg_themes } = this.state;
        // let wgColor = this.state.wgColor;
        // let tmd = this.state.tmd;
        // let bkColor = this.state.bkColor;
        // let bktmd = this.state.bktmd;
        let dqid = this.state.dqid;
        let json = {
            "id": dqid,
            "grid_name": $('#wgmc').val(),
            "level": Number($('#wgdj').val()),
            // "grid_style": JSON.stringify({ wgzt: wg_themes })
        }
        if ($('#wgmc').val() === "") {
            message.error("网格名称不能为空");
        } else if ($('#wgdj').val() === "") {
            message.error("等级不能为空");
        } else {
            wgUpdata(json).then(res => {
                // const results = res.data;
                console.log(res, "res")

                if (res.msg === "success") {
                    DeviceConfig.this.getGidList();
                    $("#file_SJ").val("");
                    DeviceConfig.this.setState({
                        inputflag: false,
                        wgColor: "#ffffff",
                        bkColor: "#ffffff",
                        indoor: false
                    })
                    DeviceConfig.this.shrinkageBtn(ev);
                    message.success("修改成功");
                } else {
                    message.success(res.msg)
                }

            })
        }

    }
    wgzzReset = (e, id) => {
        e.stopPropagation();
        wgzzReset({ id: id }).then(res => {
            console.log(res, "res")

            if (res.msg === "success") {
                DeviceConfig.this.getGidList();
                message.success("重置成功")
            } else {
                message.success(res.msg)
            }

        })
    }
    wgzjDel = (e, id) => {
        e.stopPropagation();
        wgzjDel({ id: id }).then(res => {
            console.log(res, "res")

            if (res.msg === "success") {
                DeviceConfig.this.getGidList();
                message.success("删除成功")
            } else {
                message.success(res.msg)
            }

        })
    }
    saveXinxi = (ev) => {
        const { wg_themes, isSzh, isZytp } = this.state;
        let indoor = this.state.indoor;
        let pid = this.state.pid;
        // let wgColor = this.state.wgColor;
        // let tmd = this.state.tmd;
        // let bkColor = this.state.bkColor;
        // let bktmd = this.state.bktmd;
        let files = $("#file_SJ")[0].files;
        let shp, dbf;
        if (files.length === 0) {
            message.error("请先选择数据文件");
        } else if ($('#wgdj').val() === "") {
            message.error("等级不能为空");
            return;
        } else if (!isZytp && !isSzh) {
            message.error("请至少选择一个网格用途");
            return;
        } else {
            for (let i = 0; i < files.length; i++) {
                let name = files[i].name;
                if (name) {
                    name = name.split(".");
                    name = name[name.length - 1]
                    if (name === "shp") {
                        shp = files[i];
                    } else if (name === "dbf") {
                        dbf = files[i];
                    }
                }
            }
            var form = new FormData();
            form.append("shp", shp)
            form.append("dbf", dbf)
            // form.append("name", "未命名")
            form.append("region_id", pid)
            form.append("indoor", indoor)
            form.append("build_id", $('#build_sle').find("option:selected").val())
            form.append("floor_id", $('#floor_sle').find("option:selected").val())
            form.append("level", Number($('#wgdj').val()))

            form.append("digitalize", isSzh)
            form.append("chart", isZytp)
            // JSON.stringify({ wgColor: wgColor, toumingdu: tmd, bkkd: $('#bkkd').val(), bkColor: bkColor, bktmd: bktmd })
            form.append("grid_style", JSON.stringify({ wgzt: wg_themes }))
            daoruWg(form).then(res => {
                // const results = res.data;
                console.log(res, "res")

                if (res.msg === "success") {
                    DeviceConfig.this.getGidList();
                    DeviceConfig.this.shrinkageBtn(ev);
                    $("#file_SJ").val("");
                    $('#bkkd').val("");
                    $('#wgdj').val("");
                    DeviceConfig.this.setState({
                        inputflag: false,
                        wgColor: "#ffffff",
                        bkColor: "#ffffff",
                        indoor: false,
                        fileNameArry: []
                    })
                    message.success("导入成功");
                } else {
                    message.error(res.msg)
                }

            })
        }


    }
    addGridRegion = () => {
        let addFlag = this.state.addFlag;
        const region_name = $("#wgName").val();
        if (region_name === "") {
            message.warning("请先填写网格名称");
        }
        const pid = this.state.pid;
        let json = {
            region_name: region_name
        }
        if (!addFlag) {
            json["id"] = pid;
        } else {
            json["pid"] = pid;
        }
        addGridRegion(json).then(res => {
            if (res.msg === "success") {
                if (!addFlag) {
                    message.success("修改成功");
                } else {
                    message.success("添加成功");
                }
                $("#wgName").val("");
                DeviceConfig.this.setState({
                    inputflag: false
                });
                DeviceConfig.this.getGidList();
            } else {
                message.error(res.msg);
            }
            console.log(res, "addGridRegion")
        })
    }
    shrinkageBtn = (ev) => {
        // $(ev.currentTarget).parents(".GridImport").find(".ContractionArea").slideUp()
        const { wg_gid } = this.state;
        Model.removeGid(wg_gid);
        $(".GridImport").find(".ContractionArea").slideUp();
        $(".TreeList").children("ul").children("li").find("h2").css("color", "#ffffff");
    }
    handleChoosePalette = (type, color) => {
        if (type === "wgColor") {
            this.setState({ wgColor: color.hex })
        } else if (type === "bkColor") {
            this.setState({ bkColor: color.hex })
        }
    }
    colorOpen = (e, type) => {
        e.stopPropagation();
        let { wgColorFlag, liningColorFlag } = this.state;
        if (type === "wgColor") {
            this.setState({ wgColorFlag: !wgColorFlag, liningColorFlag: false })
        } else if (type === "bkColor") {
            this.setState({ liningColorFlag: !liningColorFlag, wgColorFlag: false })
        }
    }
    colorClose = () => {
        this.setState({ wgColorFlag: false, liningColorFlag: false })
    }
    formatter = (value) => {
        return `${value}`;
    }
    indoorChange = () => {
        let indoor = this.state.indoor;
        this.setState({
            indoor: !indoor,
            isZytp: !indoor,
            biuldList: [],
            floorList: []
        })
        !indoor && this.getBuildList();
    }
    clickOpen = (item) => {
        let grid_style = Object.prototype.toString.call(item.grid_style) !== '[object Object]' ? JSON.parse(item.grid_style) : item.grid_style;
        // console.log(grid_style, "grid_style")
        setTimeout(() => {
            DeviceConfig.this.setState({
                node_Flag: false,
                tmd: grid_style.tmd ? grid_style.tmd : 0,
                bktmd: grid_style.bktmd ? grid_style.bktmd : 0,
                wgColor: grid_style.wgColor,
                bkColor: grid_style.bkColor,
                dqid: item.id
            })
        }, 10);
        $('#wgdj').val(item.level);
        $('#bkkd').val(grid_style.bkkd);
        $('#wgmc').val(item.region_name);
    }
    openFile = (type) => {
        $('#' + type).click()
    }
    onChangeTmd = (value) => {
        this.setState({
            tmd: value
        })
    }
    onChangeBkTmd = (value) => {
        this.setState({
            bktmd: value
        })
    }
    fileChange = (e) => {
        let files = e.target.files;
        let fileNameArry = this.state.fileNameArry;
        let num = 0;
        for (let i = 0; i < files.length; i++) {
            const item = files[i];
            let name = item.name;
            if (name) {
                let houzhui = name.split(".");
                houzhui = houzhui[houzhui.length - 1]
                if (houzhui === "dbf" || houzhui === "shp") {
                    num++;
                    fileNameArry.push(name);
                    this.setState({
                        fileNameArry: fileNameArry
                    })
                } else {
                    message.error("您选择的文件有误，请重新选择！（注意：必须为.dbf和.shp文件）");
                    $('#file_SJ').val("");
                    num = 0;
                    this.setState({
                        fileNameArry: []
                    })
                    return;
                }
            }
        }
        if (num < 2) {
            message.error("缺少文件，请重新选择！（注意：必须含有.dbf和.shp文件）");
            this.setState({
                fileNameArry: []
            })
        }

    }
    // 建筑列表操作
    sleChange = (e) => {
        this.getFloorList(e.target.value);
    }
    // 获取建筑列表
    getBuildList = () => {
        getBuildList().then(res => {
            if (res.msg === "success") {
                DeviceConfig.this.setState({
                    biuldList: res.data
                });
                res.data.length > 0 && DeviceConfig.this.getFloorList(res.data[0].build_id);
            }
        })
    }
    // 获取楼层列表
    getFloorList = (id) => {
        getFloorList({ build_id: id }).then(res => {
            if (res.msg === "success") {
                DeviceConfig.this.setState({
                    floorList: res.data
                })
            }
        })
    }
    render() {
        const { fileNameArry, biuldList, floorList, node_Flag, indoor, treelist, inputflag, wg_themes, isZytp, isSzh } = this.state;
        return (
            <div className="GridImport">
                <div className="RightTitle">
                    <span>网格导入</span>
                    <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
                </div>
                <div className="Gridlist">

                    <div className="ImportBtn">
                        <button className="ConfirmButton" onClick={(e) => this.addXinxi(e, "0", true)}>添加信息</button>
                    </div>
                    {inputflag && <div className="TextWb Gridinput">
                        <span>网格名称：</span>
                        <input type="text" className="inputAll" id="wgName" />
                        <button className="ConfirmButton" onClick={() => this.addGridRegion()}>保存</button>
                        <button className="ConfirmButton" onClick={() => this.closeWgname()}>取消</button>
                    </div>}
                    <div className="TreeList">
                        {this.generateMenu(this.AnalyticFormat(treelist))}
                    </div>
                </div>
                <div className="ContractionArea">
                    <div className="shrinkage">
                        <p onClick={(e) => this.shrinkageBtn(e)}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
                    </div>
                    <div className="GridManipulation">
                        {node_Flag && <div className="GridBtn">
                            <button className="ConfirmButton" onClick={() => this.openFile("file_SJ")}>获取数据</button>

                            <input type="file" id="file_SJ" multiple="multiple" style={{ display: "none" }} accept=".dbf,.shp" onChange={(e) => this.fileChange(e)} />
                        </div>}
                        {node_Flag && fileNameArry.length > 0 && <div className="TextWb">
                            <span>当前文件：</span>
                            {fileNameArry.map(item => {
                                return (
                                    <p key={item} style={{ border: "1px solid rgba(255, 255, 255, 0.418)", padding: "5px 10px", borderRadius: "10px", margin: "0 5px 0 0" }}>{item}</p>
                                )
                            })}
                        </div>}
                        {node_Flag && <div className="TextWb">
                            <span>室内</span>
                            <input type="checkbox" checked={indoor} onChange={() => this.indoorChange()} />
                            <select className="sleAll" id="build_sle" onChange={(e) => this.sleChange(e)}>
                                {biuldList.map(item => {
                                    return (
                                        <option key={item.id} value={item.build_id}>{item.build_name}</option>
                                    )
                                })}
                            </select>
                            <select className="sleAll" id="floor_sle">
                                {floorList.map(item => {
                                    return (
                                        <option key={item.id} value={item.floor_id}>{item.floor_name}</option>
                                    )
                                })}
                            </select>
                        </div>}
                        {!node_Flag && <div className="TextWb">
                            <span>网格名称：</span>
                            <input type="text" className="inputAll" id="wgmc" />
                        </div>}
                        <div className="TextWb">
                            <span>网格等级：</span>
                            <input type="number" className="inputAll" id="wgdj" />
                        </div>
                        {node_Flag && <div className="TextWb">
                            <span>网格主题：</span>
                            <select className="sleAll" value={wg_themes} onChange={(e) => {
                                this.setState({
                                    wg_themes: e.target.value
                                })
                            }}>
                                <option value="默认主题">默认主题</option>
                            </select>
                        </div>}
                        {node_Flag && <div className="TextWb">
                            <span>网格用途：</span>
                            <Checkbox checked={indoor ? true : isSzh} onChange={(e) => { this.setState({ isSzh: e.target.checked }) }} disabled={indoor}>数字化场景</Checkbox>
                            <Checkbox checked={indoor ? true : isZytp} onChange={(e) => { this.setState({ isZytp: e.target.checked }) }} disabled={indoor} >资源图谱</Checkbox>
                        </div>}
                        {/* <div className="TextWbPosition">
                            <p>网格样式</p>
                            {!node_Flag && <div className="TextWb">
                                <span>网格名称：</span>
                                <input type="text" className="inputAll" id="wgmc" />
                            </div>}
                            <div className="TextWb">
                                <span>网格颜色：</span>
                                <div className="colorArea" style={{ backgroundColor: wgColor }} onClick={(e) => this.colorOpen(e, "wgColor")}></div>
                                {wgColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={wgColor} onChange={this.handleChoosePalette.bind(this, 'wgColor')}></ChromePicker></div>}
                            </div>
                            <div className="TextWb">
                                <span>透明度：</span>
                                <Slider onChange={this.onChangeTmd} value={tmd} tipFormatter={this.formatter} />
                            </div>

                            <div className="TextWb">
                                <span>边框宽度：</span>
                                <input type="text" style={{
                                    width: "50px",
                                    flex: "0", textAlign: "center"
                                }} className="inputAll" id="bkkd" />
                            </div>

                            <div className="TextWb">
                                <span>边框颜色：</span>
                                <div className="colorArea" style={{ backgroundColor: bkColor }} onClick={(e) => this.colorOpen(e, "bkColor")}></div>
                                {liningColorFlag && <div className="ChromePicker"><div className="mask" onClick={() => this.colorClose()}></div><ChromePicker color={bkColor} onChange={this.handleChoosePalette.bind(this, 'bkColor')}></ChromePicker></div>}
                            </div>
                            <div className="TextWb">
                                <span>边框透明度：</span>
                                <Slider onChange={this.onChangeBkTmd} value={bktmd} tipFormatter={this.formatter} />
                            </div>

                        </div> */}
                    </div>
                    <div className="GridAnnotationBtn">
                        <button className="ConfirmButton" onClick={node_Flag ? (e) => this.saveXinxi(e) : (e) => this.saveWgXinxi(e)}>保存</button>
                        <button className="ConfirmButton" onClick={(e) => this.shrinkageBtn(e)}>取消</button>
                    </div>
                </div>

            </div>

        )
    }
}
