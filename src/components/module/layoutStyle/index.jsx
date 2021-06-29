import React, { useState, useEffect } from 'react';
import './style.scss';
// import { getConfig } from '../../../api/mainApi'
import { message } from 'antd';
import { useMappedState } from 'redux-react-hook';
import axios from 'axios';
import { createMap } from '../../../map3D/map3d';
const LayoutStyle = (props) => {
  // const configData = JSON.parse(sessionStorage.getItem('configDetils'))
  // // const [current, setcurrent] = useState();
  // const layoutList = [{img:"layout1"},{img:"layout2"}]
  const [sceneValue, setsceneValue] = useState();//地图场景地址
  const [sceneValue2, setsceneValue2] = useState();//数字化地图地址
  const title_top = useMappedState(state => state.title_top_check);
  // const [current, setcurrent] = useState(title_top);
  useEffect(() => {
    sfjsefj()
  }, [title_top]);

  const sfjsefj = () => {
    axios.get(global.Url + "/sys/config/list").then((res) => {
      const result = res.data;
      if (result.msg === "success") {
        if (result.data.length > 0) {
          setsceneValue(result.data[0].map_database_url)
          setsceneValue2(result.data[0].digit_model_url)
        } else {
          message.warning('未找到地图数据');
        }
      } else {
        message.error("地图加载失败");
      }
    })
  }
  const handleLayout = (key) => {
    // setcurrent(key)
    // console.log(current,"current")
    props.setMoudleId("")
  };
  const handleClick = () => {
    document.getElementById("mapv3dContainer").innerHTML = "";
    createMap.createMap({
      id: "mapv3dContainer",
      url: "http://" + sceneValue,
      projectId: "5nbmjsdljf785208",
      token: "rt2d645ty3eadaed32268mdta6"
    })

  }
  const SetsceneValue = (e, type) => {
    console.log(e.target.value, "sss")
    if (type === "map1") {
      setsceneValue(e.target.value)
    } else {
      setsceneValue2(e.target.value)
    }
  }
  const baocun = () => {
    const data = {
      map_database_url: sceneValue,
      digit_model_url:sceneValue2
    }
    axios.post(global.Url + "/sys/config/add", data).then((res) => {
      const result = res.data;
      console.log(res)
      if (result.msg === "success") {
        message.success("保存成功");
        handleClick();
      } else {
        message.error("保存失败");
      }
    })
  }
  return (
    <div id="layoutStyle" className="">
      <div className="layout_title">
        <h1 className="title">场景配置</h1>
        <img src={require("../../../assets/images/closeicon.png").default} onClick={() => handleLayout(null)} alt="" />
      </div>
      <div className="layoutSelect">
        <label>地图模型数据地址：</label>
        <input type="text" value={sceneValue} onChange={(e) => SetsceneValue(e, 'map1')} />
      </div>
      <div className="layoutSelect" style={{ paddingTop: "0" }}>
        <label>数字化模型数据地址：</label>
        <input type="text" value={sceneValue2} onChange={(e) => SetsceneValue(e, "map2")} />
      </div>
      <div className="save_button" ><button onClick={() => baocun()}>确定</button><button onClick={() => handleClick()}>应用</button></div>
    </div>
  );
}

export default LayoutStyle;