import React,{ useState,useEffect } from 'react';
import './style.scss';
import { Upload,message,Checkbox,Spin,Button,Modal} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { touchinVesion_fd } from '../../../api/mainApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const BasicConfiguration = () => {
  const configurationList = [{name:"系统名称",field:"sys_name"},{name:"地图后台",field:"data_server_url"},{name:"算法服务",field:"data_arithmetic_url"},{name:"独立运行",field:"is_stand"}]
  //提交数据
  const [formDatas,formDataChange] = useState({id:"",sys_logo_url:"",sys_name:"",data_server_url:"",data_arithmetic_url:"",is_stand:false})
  //预览图片
  const [imgSrc,setImg] = useState()
  //loding...
  const [loading,setLoading] = useState(false)
  //缓存config
  const configData = JSON.parse(sessionStorage.getItem('configDetils'))
  useEffect(() => {
    formDataChange({...formDatas,id:configData.id,sys_logo_url:configData.sys_logo_url,sys_name:configData.sys_name,data_server_url:configData.data_server_url,
    data_arithmetic_url:configData.data_arithmetic_url,is_stand:configData.is_stand})
    setImg(configData.sys_logo_url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  //图片规则
  function beforeUpload(file) {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }
  //图片
  const handleChange = (file) => {
    formDataChange({...formDatas,sys_logo_url:file.fileList[0].originFileObj})
    const reader = new FileReader();
    reader.addEventListener('load', () => setImg(reader.result));
    reader.readAsDataURL(file.file.originFileObj);
  };
  //配置内容修改
  const changeContent = (e,field) =>{
    formDataChange({...formDatas,[field]:e.target.value})
  }
  //独立运行反选
  const checkON = (e) =>{
    formDataChange({...formDatas,is_stand:e.target.checked})
  }
  //模态框
  const showConfirm =() =>{
    confirm({
      title: '确定保存当前配置?',
      confirmLoading:true,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      cancelText: '取消',
      onOk() {
        submit()
      }
    });
  }
  //提交
  const submit = () =>{
    setLoading(true)
    let formdata = new FormData();
    formdata.append("id",formDatas.id);
    formdata.append("sys_logo_url",formDatas.sys_logo_url);
    formdata.append("sys_name",formDatas.sys_name);
    formdata.append("data_server_url",formDatas.data_server_url);
    formdata.append("data_arithmetic_url",formDatas.data_arithmetic_url);
    formdata.append("is_stand",formDatas.is_stand);
    touchinVesion_fd(formdata).then(res=>{
      if(res.data.msg === "success"){
        message.success("保存成功")
        formDataChange({id:"",sys_logo_url:"",sys_name:"",data_server_url:"",data_arithmetic_url:"",is_stand:false})
        setLoading(false)
      }else{
        setLoading(false)
      }
    })
  }
  return (
    <div id="BasicConfiguration" className="animate__animated animate__fadeInRight">
      <Spin spinning={loading}  size="large" tip="请求中...">
        <div className="bc_title">
          <h1 className="title"><span>布局样式</span></h1>
        </div>
        <div className="bc_content">
          <ul>
            <li>
              <span className="c_title">系统logo</span>    
              <div>
                <Upload name="avatar" listType="picture-card" className="avatar-uploader" showUploadList={false} beforeUpload={beforeUpload} onChange={handleChange}>
                  {formDatas.sys_logo_url ? <img src={imgSrc} alt="avatar"/> : <div><PlusOutlined className="logo_icon"/><div className="logo_title">点击上传logo</div></div>}
                </Upload>
              </div>
            </li>
            {configurationList.map((item, index) => {
              return (
                <li key={index}>
                  <span className="c_title">{item.name}</span>
                  {
                    item.name === "独立运行"?(<Checkbox checked={formDatas.is_stand} onChange={checkON} className="dlyx_check"/>):
                    <input type="text" className="form_input" value={formDatas[item.field]} onChange = {(e) =>changeContent(e,item.field)}/>
                  }
                </li>
              );
            })}
          </ul>
          <div className="save_button" >
            <Button type="primary" size="large" onClick ={() => showConfirm() }>保存</Button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default BasicConfiguration;