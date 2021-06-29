import React, { useState, useEffect, Fragment } from 'react';
import { useMappedState } from 'redux-react-hook';
import { labelList } from '../../../api/mainApi'
import { Build } from '../../../map3D/map3d';

import './style.scss'

const FloorList = () => {
    const map = useMappedState(state => state.map3d_light);
    const [flList, setFlist] = useState(["一层", "二层", "三层", "四层", "五层", "六层", "七层"])
    const [count, setCount] = useState()
    const [show, setShow] = useState(true)
    // const [buildData, setBdata] = useState()

    const getModelhandle = (map3d) => {
        if (map3d) {
            window.receiveMessageFromIndex = function (e) {
                if (e !== undefined) {
                    switch (e.data.switchName) {
                        case 'buildLable':
                            console.log(e.data, '建筑id')
                            labelList({ build_id: e.data.Personnel }).then(res => {
                                if (res.msg === "success") {
                                    // setBdata()
                                    setFlist(res.data[0].floor_name)
                                }
                            })
                            break;
                        default:
                            return null;
                    }
                }
            }
            //监听message事件
            window.addEventListener("message", window.receiveMessageFromIndex, false);
        }
    }
    useEffect(() => {
        getModelhandle(map)
        // eslint-disable-next-line
    }, []);

    //点击楼层
    const handleFloor = (index) => {
        setCount(index)
        Build.showFloor(map)
    }
    return (
        <Fragment>
            {
                show ? <div id="floorList">
                    <div className="fl_title">
                        <span>一号楼</span>
                        <img src={require("../../../assets/images/closeBtn.png").default} alt="" onClick={() => setShow(false)} />
                    </div>
                    <div className="fl_content">
                        <ul>
                            {flList.map((item, index) => {
                                return (
                                    <li key={index} className={count === index ? "acitve" : null} onClick={() => handleFloor(item, index)}>{item.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div> : null
            }
        </Fragment>

    )
}

export default FloorList;