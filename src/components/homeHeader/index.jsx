import React, { useEffect } from 'react';
import './style.scss';
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from 'redux-react-hook';
import { getLocationList } from "../../api/mainApi";
import { createMap } from '../../map3D/map3d';

const HomeHeader = (props) => {
  const dispatch = useDispatch();
  let history = useHistory();
  const title_top = useMappedState(state => state.title_top_check);
  const title_left = useMappedState(state => state.title_left_check);
  const userData = useMappedState(state => state.userData);
  const backLogin = () => {
    history.push("/");
  };
  // const [current, setcurrent] = useState(title_top);
  useEffect(() => {
    // setcurrent(title_top)
  }, [title_top]);
  const handleHeader = (type, key) => {
    // setcurrent(key)
    // dispatch({type: "check_top",title_top_check:key})
    dispatch({ type: "check_left", title_left_check: key })
    props.setMoudleId2(type)

  };
  const comebock = () => {
    getLocationList().then(res => {
      if (res.msg === "success" && res.data.length > 0) {
        let position = JSON.parse(res.data[0].position);
        console.log('用来复位的数据', position);
        // position.z = position.z * 1.8;
        createMap.SetPosition(position);
      } else {
        createMap.initialPosition();
      }
    })
  }

  return (
    <div id="Home_header">
      <div className="header_middle">
        <div className="h_Fragment">
          <h1>后台地图管理</h1>
          <div className="header_button">
            <ul>
              <li className={10 === title_left ? 'Active' : null} onClick={() => handleHeader('layoutStyle', 10)}>场景配置</li>
              <li onClick={() => comebock()}>复位</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="header_right">
        <div className="userData">
          <span>{userData.real_name || "管理员"}</span>
          <img className="avatar" src={require('../../assets/images/avatar.jpg').default} alt="avatar" />
        </div>
        <img onClick={() => backLogin()} className="switch" src={require('../../assets/images/icon/switchUser.png').default} alt="" />
      </div>
    </div>
  );
}

export default HomeHeader;