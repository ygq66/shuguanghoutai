import React, { useState, useEffect } from 'react';
import './style.scss';
// import { moduleVersions } from '../../api/mainApi'
import { useDispatch, useMappedState } from 'redux-react-hook';

const HomeLeft = (props) => {
  const dispatch = useDispatch();
  const title_left = useMappedState(state => state.title_left_check);
  // const [current, setcurrent] = useState(title_left);
  const [currentChildren, setcurrentChildren] = useState(0);
  // const [moduleList, setModuleList] = useState([]);
  const leftList = [
    // { "id": "7898B8531BF810474762D0CAD1CEBF37", "versions_id": "0ADDCFF261E365D77C9277F2D9753A98", "module_name": "基础模块", "enable": true, "imgPath": "jcpz", "page": "basicConfiguration" },
    { "module_name": "基础配置", "enable": true, "imgPath": "jcpz", "page": "InitLocation", "children": ["InitLocation", "management", "FlyRoam"] },
    { "module_name": "结构化数据", "enable": true, "imgPath": "jghsj", "page": "deviceConfig", "children": ["deviceConfig", "BuildingMarked"] },
    { "module_name": "文字标注", "enable": true, "imgPath": "wzbz", "page": "matchPoint", "children": ["matchPoint", "BuildingMarked"] },
    { "module_name": "自定义数据", "enable": true, "imgPath": "zdysj", "page": "roleAuthority" },
    { "module_name": "点位上图", "enable": true, "imgPath": "dwst", "page": "userManagement" },
    { "module_name": "小工具", "enable": true, "imgPath": "xgj", "page": "dockManger" },
    { "module_name": "楼层配置", "enable": true, "imgPath": "lcpz", "page": "alarmManagement" },
    { "module_name": "巡逻路线", "enable": true, "imgPath": "xllx", "page": "patrolRoute", "children": ["patrolRoute", "patrolPlan"] },
    { "module_name": "床位管理", "enable": true, "imgPath": "cwgl", "page": "bedManagement" },
    { "module_name": "人员定位", "enable": true, "imgPath": "rydw", "page": "perPosition" }
  ]
  useEffect(() => {
    // moduleVersions().then(res => {
    //   setModuleList(res.data)
    // })
    // setcurrent(title_left)
  }, [title_left]);
  const clickevent = (item, key) => {
    // setcurrent(key);
    if (key !== title_left) setcurrentChildren(0);
    dispatch({ type: "check_top", title_top_check: null })
    dispatch({ type: "check_left", title_left_check: key })
    // console.log(title_left, "title_left")

    props.setMoudleId(item.page)
  };
  const clickchieldren = (e, key, page) => {
    console.log('进值',e,key,page);
    e.stopPropagation();
    setcurrentChildren(key);
    props.setMoudleId(page)
  }
  return (
    <div id="Home_left">
      <div className="home_logo">
        <img src={require('../../assets/logo/ty_logo_header.png').default} alt="logo" />
      </div>
      <div className="module_list">
        <ul>
          {leftList.map((item, index) => {
            return (
              <li key={index} className={index === title_left ? 'tabs_active' : null} onClick={clickevent.bind(null, item, index)}>
                {
                  index === title_left ? (
                    <img className="img_active" src={require('../../assets/images/module/' + item.imgPath + '_active.png').default} alt="" />
                  ) : <img src={require('../../assets/images/module/' + item.imgPath + '.png').default} alt="" />
                }
                <span>{item.module_name}</span>

                {(() => {
                  switch (item.module_name) {
                    case "文字标注":
                      return index === title_left && <ul>
                        <li className={index === title_left && currentChildren === 0 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 0, item.children[0])}>
                          <span>文字标注</span>
                        </li>
                        <li className={index === title_left && currentChildren === 1 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 1, item.children[1])}>
                          <span>建筑标注</span>
                        </li>
                      </ul>
                    case "结构化数据":
                      return index === title_left && <ul>
                        <li className={index === title_left && currentChildren === 0 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 0, item.children[0])}>
                          <span>网格导入</span>
                        </li>
                        <li className={index === title_left && currentChildren === 1 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 1, item.children[1])}>
                          <span>路网导入</span>
                        </li>
                      </ul>
                    case "基础配置":
                      return index === title_left && <ul>
                        <li className={index === title_left && currentChildren === 0 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 0, item.children[0])}>
                          <span>初始化设置</span>
                        </li>
                        <li className={index === title_left && currentChildren === 1 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 1, item.children[1])}>
                          <span>常用位置</span>
                        </li>
                        <li className={index === title_left && currentChildren === 2 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 2, item.children[2])}>
                          <span>飞行漫游</span>
                        </li>
                      </ul>
                    case "巡逻路线":
                      return index === title_left && <ul>
                        <li className={index === title_left && currentChildren === 0 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 0, item.children[0])}>
                          <span>巡逻路线</span>
                        </li>
                        <li className={index === title_left && currentChildren === 1 ? 'tabs_li_active2' : ""} onClick={(e) => clickchieldren(e, 1, item.children[1])}>
                          <span>巡逻预案</span>
                        </li>
                      </ul>
                    default:
                      return null;
                  }
                })()
                }

              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default HomeLeft;
