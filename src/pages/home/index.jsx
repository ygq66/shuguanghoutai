import React, {useState, useEffect, Suspense, lazy, Fragment} from 'react';
import './style.scss';
import $ from "jquery";
import HomeLeft from '../../components/homeLeft'
import HomeHeader from '../../components/homeHeader'
import axios from 'axios';
import {message} from 'antd';
import {createMap, Model} from '../../map3D/map3d';
import {useDispatch, useMappedState} from 'redux-react-hook';
import {getFigureLabel, getBuildLabel} from "../../api/mainApi";
import {Redirect} from 'react-router';
import {configData2 as MapUrl, configData3 as projectId, configData4 as token} from '../../api/address';
import helperShapeUtil from "../../map3D/helperShapeUtil";

const Home = () => {
  const isLogin = sessionStorage.getItem("isLogin");

  let dispatch = useDispatch();
  const modelList = useMappedState(state => state.model_list);
  const buildLabelList = useMappedState(state => state.buildLabel_list);
  const textLabelList = useMappedState(state => state.textLabel_list);

  const [DynamicModule, setDynamicModule] = useState("div");
  const [moudleId, setMoudleId] = useState('')
  const [openFlag, setopenFlag] = useState(false)
  useEffect(() => {
    if (!isLogin || isLogin === "false") {
      return;
    }
    if (!openFlag) {
      axios.get(global.Url + "/sys/config/list").then((res) => {
        const result = res.data;
        if (result.msg === "success") {
          if (result.data.length > 0) {
            createMap.createMap({
              id: "mapv3dContainer",
              url: MapUrl,
              projectId: projectId,
              token: token
            }, () => {
              helperShapeUtil.createHelperShape()
            })
            setTimeout(function () {
              message.success("地图加载成功")
              // 去掉键盘控制先。不然点位上图输入都会被影响
              // createMap.eanbleKeyboard();
              axios.post(global.Url + "/device/camera/listS").then((res) => {
                const result = res.data;
                const data = res.data.data
                // console.log(res, "ddawjdaw")
                if (result.msg === "success") {
                  if (data.length > 0) {
                    var objModel = {};
                    (function loop(index) {
                      if (data[index] && data[index].model_name !== undefined && data[index].model_name !== null) {
                        const obj = {
                          gid: data[index].model_url,
                          filename: data[index].model_name,//box,capsule,cone,cube,cylinder,pipe,pyramid,sphere,capsule
                          location: data[index].list_style ? data[index].list_style : data[index].center,
                          attr: data[index]
                        };
                        Model.modelLoading(obj, msg => {
                          if (++index < data.length) {
                            setTimeout(() => {
                              objModel[msg.attr?.id] = {...msg, device_code: msg.attr?.device_code};
                              loop(index)
                            }, 0)
                          } else {
                            console.log("全部执行完毕");
                            dispatch({type: "model_list", model_list: {...objModel}});
                            GetBuildLabel();
                          }
                        })
                      } else {
                        if (++index < data.length) {
                          setTimeout(() => {
                            loop(index);
                          }, 0)
                        } else {
                          console.log("全部执行完毕");
                          dispatch({type: "model_list", model_list: {...objModel}});
                          GetBuildLabel();
                        }
                      }

                    })(0);
                  } else {
                    GetBuildLabel();
                  }
                } else {
                  message.error("加载模型失败");
                }
              })

            }, 1000)
          } else {
            message.warning('未找到地图数据');
          }
        } else {
          message.error("地图加载失败");
        }
      })
      setopenFlag(true)
    }
    const GetBuildLabel = () => {
      getBuildLabel().then(result => {
        const Label = result.data;
        if (result.msg === "success") {
          if (Label.length > 0) {
            var buildLabel = {};
            (function loop2(index2) {
              if (Label[index2].children) {
                const obj2 = {...Label[index2].children[0].position, attr: {buildId: Label[index2].build_id}};

                Model.labelLoading(obj2, msg => {
                  if (++index2 < Label.length) {
                    buildLabel[Label[index2].id] = {...msg};
                    loop2(index2);
                  } else {
                    dispatch({type: "buildLabel_list", buildLabel_list: {...buildLabel}});
                    GetFigureLabel();
                  }
                })
              } else {
                if (++index2 < Label.length) {
                  loop2(index2);
                } else {
                  dispatch({type: "buildLabel_list", buildLabel_list: {...buildLabel}});
                  GetFigureLabel();
                }
              }
            })(0);
          } else {
            GetFigureLabel();
          }
        } else {
          message.error("加载建筑标注失败");
        }
      })
    }
    const GetFigureLabel = () => {
      getFigureLabel().then(result => {
        const Label = result.data;
        if (result.msg === "success") {
          if (Label.length > 0) {
            var textLabel = {};
            (function loop2(index2) {
              if (Label[index2] === undefined) {
                if (++index2 < Label.length) {
                  setTimeout(() => {
                    loop2(index2);
                  }, 0)
                } else {
                  dispatch({type: "textLabel_list", textLabel_list: {...textLabel}});
                }
                return;
              }
              const obj2 = {...JSON.parse(Label[index2].label_style.model), attr: {center: Label[index2].label_style.center}};
              Model.labelLoading(obj2, msg => {
                if (++index2 < Label.length) {
                  textLabel[Label[index2].id] = {...msg};
                  setTimeout(() => {
                    loop2(index2);
                  }, 0)
                } else {
                  dispatch({type: "textLabel_list", textLabel_list: {...textLabel}});
                }
              })
            })(0);
          }
        } else {
          message.error("加载文字标注失败");
        }
      })
    }
    if (`${moudleId}` !== "") {
      setDynamicModule(
        lazy(() => import(`../../components/module/${moudleId}`))
      );
    }
  }, [isLogin, moudleId, openFlag, dispatch]);

  // 接受点击事件
  useEffect(() => {
    window.addEventListener('message', (e) => {
      let data = e.data;
      switch (data.switchName) {
        case 'model':
          // console.log(data);
          message.success(data?.Personnel.attr?.device_name)
          break
        default:
          break
      }
    })
  }, [])

  const setModel = (value) => {
    $('.mapright').addClass("animate__fadeOutRight");
    setTimeout(() => {
      setMoudleId(value)
    }, 800)
    dispatch({type: "check_left", title_left_check: -1})
  }
  const stPageModel = (value) => {
    if (moudleId !== "") {
      $('.mapright').addClass("animate__fadeOutRight");
      setTimeout(() => {
        setMoudleId("");
        setMoudleId(value)
      }, 800)
    } else {
      setMoudleId("");
      setMoudleId(value)
    }

  }

  // useEffect(() => {
  //   console.log(modelList, "model_list")
  // }, [modelList])

  return (
    <Fragment>
      {
        (!isLogin || isLogin === "false") ? <Redirect to='/login'/> :
          <div id="Home_all" className="">
            <HomeLeft setMoudleId={stPageModel} value="-1"/>
            <div className="homRight">
              <HomeHeader setMoudleId2={stPageModel}/>
              <div id="mapv3dContainer" className="map"></div>

              {/* <div className="home_content"></div> */}
              {`${moudleId}` !== "" &&
              <div className="mapright animate__animated animate__fadeInRight" style={{width: `${moudleId}` === "" || `${moudleId}` === "layoutStyle" ? "0" : "450px"}}>
                <Suspense fallback={<div>"loading"</div>}>
                  {DynamicModule === 'div'
                      ? ''
                      : <DynamicModule setMoudleId={setModel} modellist={modelList} buildlabel={buildLabelList} textlabel={textLabelList} />
                  }
                </Suspense>
              </div>}
            </div>
          </div>
      }
    </Fragment>
  );
}

export default Home;