import React, { Component } from 'react';
import './style.scss';
import $ from "jquery";
import { Checkbox, message } from 'antd';
import { getPatrolPlan, getPatrolPlanChildren, setPatrolPlan, getPatrolLine, delPatrolPlan } from '../../../api/mainApi';
import { createMap, Model } from '../../../map3D/map3d';
// import { message } from 'antd';
class PatrolPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showRouteGid: [],//当前展示的路线id
      planList: [],//预案列表
      routeList: [],//巡逻路线列表
      plan_route_list: [],//当前预案内的巡逻路线列表
      planList_flagNum: -1,//当前查看的预案
      flagNum: 0,//当前操作状态 0：添加预案路线名称 1：选择预案巡逻路线 2：展示当前预案巡逻路线
      planName: "",//巡逻路线名称
      plan_route_list_choose: [],//当前添加预案内选择的巡逻路线
    };
    PatrolPlan.this = this;
  }
  componentDidMount() {
    this.GetPatrolPlan();
    this.GetPatrolLine();
  }
  // 获取预案列表
  GetPatrolPlan = () => {
    getPatrolPlan().then(res => {
      this.setState({
        planList: res.data
      })
    });
  }
  // 获取所有巡逻路线
  GetPatrolLine = () => {
    getPatrolLine().then(res => {
      this.setState({
        routeList: res.data
      })
    })
  }
  // v-model数据绑定
  setOnChange = (e, type) => {
    this.setState({
      [type]: e.target.value
    })
  }
  // 显示/隐藏操作栏
  setOperatingArea = (flag) => {
    if (flag) {
      $(".PatrolPlan").find(".ContractionArea").slideDown();
    } else {
      PatrolPlan.this.hideRoute();
      $(".PatrolPlan").find(".ContractionArea").slideUp();
      this.setState({
        planList_flagNum: -1
      });
    }
  }
  // 添加预案button
  addPatrolPlan = (flag) => {
    PatrolPlan.this.hideRoute();
    this.setState({
      flagNum: 0,
      planName: "",
      planList_flagNum: -1
    });
    setTimeout(() => {
      this.setOperatingArea(flag);
    }, 10)
  }
  // 选择预案巡逻路线
  getCheckboxChange(e) {
    let { plan_route_list_choose } = this.state;
    if (e.target.checked) {
      plan_route_list_choose.push(e.target.defaultValue.id)
    } else {
      let index = plan_route_list_choose.indexOf(e.target.defaultValue.id);
      if (index !== -1) {
        plan_route_list_choose.splice(index, 1)
      }
    }
    this.setState({
      plan_route_list_choose: plan_route_list_choose
    })
  }
  // 预案路线名称确定
  planNameBtnDetermine = () => {
    const { planName } = this.state;
    planName !== "" ? this.setState({ flagNum: 1 }) : message.error("请先填写预案路线名称");
  }
  //  预案路线选择确定
  planListBtnDetermine = () => {
    const { planName, plan_route_list_choose } = this.state;
    let json = {
      plan_name: planName,
      line_id: plan_route_list_choose
    }
    setPatrolPlan(json).then(res => {
      message.success("添加成功")
      PatrolPlan.this.setOperatingArea(false);
      PatrolPlan.this.GetPatrolPlan();
    })
  }

  // 预案列表查看
  planListShow = (index, plan_id) => {
    this.hideRoute();
    getPatrolPlanChildren({ plan_id: plan_id }).then(res => {
      this.setState({
        plan_route_list: res.data,
        flagNum: 2,
        planList_flagNum: index,
        showRouteGid: []
      });
      setTimeout(() => {
        this.setOperatingArea(true);
      }, 10);
      res.data.forEach(obj => {
        let postion = []
        obj.patrol_line_subsection.forEach((msg, index2) => {
          for (let j = 0; j < msg.options.length; j++) {
            const element = msg.options[j];
            let obj = {
              x: element.x,
              y: element.y,
              z: 380
            };
            postion.push(obj)
          }

          // if (index2 === msg.length - 1) {
          //   let obj2 = {
          //     x: msg.options[0].x,
          //     y: msg.options[0].y,
          //     z: 380
          //   };
          //   postion.push(obj2);
          // }
        })
        console.log('我是值啊值', postion)
        PatrolPlan.this.showRoute(postion, res.data[0].remark);
      })
    })
  }
  // 查看路线
  showRoute = (geom, center) => {
    let { showRouteGid } = this.state;
    createMap.FlyToPosition(JSON.parse(center))
    Model.carteLine(geom, res => {
      showRouteGid.push(res.gid)
      PatrolPlan.this.setState({
        showRouteGid: showRouteGid
      })
    })
  }
  // 展示路线删除
  hideRoute = () => {
    let { showRouteGid } = this.state;
    showRouteGid.forEach(item => {
      Model.removeGid(item);
    })
  }
  // 右键事件
  onContextMenu = (e, index) => {
    e.preventDefault();
    $('.Alert').hide();
    $(e.currentTarget).siblings(".Alert").show();
    this.setState({
      planList_flagNum: index
    });
  }
  // 删除预案
  delPatrolPlan = (e, item) => {
    e.preventDefault();
    delPatrolPlan({ id: item.id }).then(res => {
      message.success("删除成功");
      PatrolPlan.this.GetPatrolPlan();
      PatrolPlan.this.setOperatingArea(false);
      PatrolPlan.this.hideRoute();
    })
  }
  render() {
    const { planList, routeList, plan_route_list, planName, flagNum, planList_flagNum } = this.state;
    return (
      <div className="PatrolPlan">
        <div className="RightTitle">
          <span>巡逻预案</span>
          <img src={require("../../../assets/images/closeWhite.png").default} onClick={() => this.props.setMoudleId("")} alt="" />
        </div>
        <div className="PatrolPlan_list">
          <div className="PatrolPlan_list_button">
            <button className="ConfirmButton" onClick={() => this.addPatrolPlan(true)}>添加预案</button>
          </div>
          <ul className="PatrolPlan_ul">
            {planList.map((item, index) => {
              return (
                <li key={item.id}><span onClick={() => this.planListShow(index, item.id)} style={{ color: planList_flagNum === index ? "#ea9310" : "white" }} onContextMenu={(e) => this.onContextMenu(e, index)}>{index + 1}.&nbsp;&nbsp;&nbsp;{item.plan_name}</span>
                  <div className="Alert" style={{ display: "none" }}>
                    <p onClick={(e) => this.delPatrolPlan(e, item)}>删除</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
        <div className="ContractionArea">
          <div className="shrinkage">
            <p onClick={() => this.setOperatingArea(false)}><img src={require("../../../assets/images/shousuojt.png").default} alt="" /></p>
          </div>
          {flagNum !== 2 ? <div className="PatrolPlan_add">
            {flagNum === 0 && <div className="PatrolPlan_add_name">
              <div className="TextWb">
                <span>预案路线名称：</span>
                <input type="text" className="inputAll" value={planName} onChange={(e) => this.setOnChange(e, "planName")} />
              </div>
            </div>
            }
            {flagNum === 1 && <div className="PatrolPlan_add_choose">
              <ul className="PatrolPlan_ul">
                {routeList.map((item, index) => {
                  return (
                    <li key={index}><Checkbox onChange={(e) => this.getCheckboxChange(e)} defaultValue={item}>{item.line_name}</Checkbox></li>
                  )
                })}
              </ul>
            </div>}
            <div className="PatrolPlan_add_button">
              <button className="ConfirmButton" onClick={flagNum === 0 ? () => this.planNameBtnDetermine() : () => this.planListBtnDetermine()}>确定</button>
              <button className="ConfirmButton" onClick={() => this.setOperatingArea(false)}>取消</button>
            </div>
          </div> : <div className="PatrolPlan_zs_list"><ul className="PatrolPlan_ul">
            {plan_route_list.map((item, index) => {
              return (
                <li key={index}>{item.line_name}</li>
              )
            })}
          </ul></div>}
        </div>
      </div>
    );
  }
}

export default PatrolPlan;