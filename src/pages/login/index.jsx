import React, {useState, useEffect} from 'react';
import {Form, Input, Button, message} from 'antd';//Modal
import './style.scss';
import {useHistory} from "react-router-dom";
import {getLogin} from '../../api/mainApi' // getVesion, touchinVesion, versionsUpdate
import {useDispatch} from 'redux-react-hook';

const Login = () => {
  let history = useHistory();
  const dispatch = useDispatch();
  // const [vesionId, setVesion] = useState()
  // const [configId, setConfig] = useState()
  // const [current, setCurrent] = useState();
  // const [visible, setVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [loginTitle, setloginTitle] = useState({logo: require('../../assets/logo/ty_logo.png').default, title: '图为视地图管理系统'})
  // const [vesionList, setvesionList] = useState([])
  useEffect(() => {
    sessionStorage.setItem("isLogin", false);
    setloginTitle({logo: require('../../assets/logo/ty_logo.png').default, title: '图为视地图管理系统'});
    // getConfig().then(res => {
    //     setloginTitle({ logo: res.data.sys_logo_url, title: res.data.sys_name })
    // })
  }, []);
  //样式
  const layout = {
    wrapperCol: {span: 18}
  };
  const tailLayout = {
    wrapperCol: {align: 'end', span: 18},
  };
  const onFinishFailed = (errorInfo) => {
    console.log('提交错误:', errorInfo);
  };
  //登录
  const onFinish = (values) => {
    setLoading(true)
    getLogin({
      user_name: values.username,
      user_pwd: values.password
    }).then(res => {
      dispatch({type: "userData", userData: res.data})
      if (res.msg === "success") {
        if (res.data === "账号或密码错误") {
          sessionStorage.setItem("isLogin", false);
          message.error(res.data);
          setLoading(false);
        } else {
          sessionStorage.setItem("isLogin", true);
          message.success("登录成功")
          setLoading(false)
          history.push("/home");
          // getConfig().then(res => {
          //     if (res.msg === "success") {
          //         setConfig(res.data.id)
          //         sessionStorage.setItem('configDetils', JSON.stringify(res.data))
          //         if (res.data.versions_id === null || res.data.versions_id.trim() === "") {
          //             setVisible(true)
          //             getVesion().then(res => { setvesionList(res.data) })
          //         } else {
          //             message.success("登录成功")
          //             setLoading(false)
          //             history.push("/home");
          //         }
          //     } else {
          //         setLoading(false)
          //     }
          // })
        }
      } else {
        message.error(res.msg);
        setLoading(false);
      }
    }).catch(error => {
      setLoading(false)
    })
  };
  //下一步
  // const typeSubmit = (e) => {
  //     versionsUpdate({ versions_id: vesionId }).then(res => { })
  //     touchinVesion({ id: configId, scenarios_id: vesionId }).then(res => {
  //         if (res.msg === "success") {
  //             setLoading(false)
  //             history.push("/home");
  //         }
  //     })
  // }
  return (
    <div id="login_all" className="login_bg">
      <div className="login_left">
        <img className="login_log animate__animated animate__fadeInLeft" alt="logo" src={loginTitle.logo}/>
        <p className="animate__animated animate__fadeInLeft">Welcome</p>
        <p className="animate__animated animate__fadeInLeft">欢迎登录{loginTitle.title}</p>
      </div>
      <div className="login_right">
        <h1 className="animate__animated animate__fadeInUp">登录</h1>
        {/* 登录表单提交 */}
        <Form  {...layout} name="basic" initialValues={{remember: false}}
               autoComplete="off" onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item name="username" rules={[{required: true, message: '请输入有效的账号/用户名！'}]} className="animate__animated animate__fadeInRight">
            <Input size="large" placeholder="请输入账号/用户名"/>
          </Form.Item>
          <Form.Item name="password" rules={[{required: true, message: '请输入密码！'}]} className="inputPassword animate__animated animate__fadeInRight">
            <Input.Password size="large" placeholder="请输入密码"/>
          </Form.Item>
          <Form.Item {...tailLayout} className="buttonSubmit animate__animated animate__fadeInRight">
            <Button type="primary" size="large" htmlType="submit" loading={isLoading}>登录</Button>
          </Form.Item>
        </Form>
      </div>
      {/* <Modal
       title="请选择符合您需求的系统版本"
       centered
       visible={visible}
       onCancel={() => { setVisible(false); setLoading(false) }}
       onOk={() => typeSubmit()}
       width={700}
       cancelText={true}
       okText="下一步">
       <ul className="vesion_list">
       {
       vesionList.map((item, index) => {
       return (
       <li key={index} className={index === current ? 'vesion_active' : null} onClick={() => { setVesion(item.id); setCurrent(index) }}>{item.versions_name}</li>
       )
       })
       }
       </ul>
       </Modal> */}
    </div>
  );
}

export default Login;