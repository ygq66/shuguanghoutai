import React,{ useState,useEffect } from 'react';
import './style.scss';
import { Button,message} from 'antd';
import IconFont from '../../icon_font/iconfont'
import { layoutTouchin,sedLayout } from '../../../api/mainApi'
const LayoutConfiguration = () => {
  const [colorList,setColorList] = useState([])
  const [layouList,setlayouList] = useState([])//选中的应用
  const [allitems,setAllitems] = useState([])//全部应用
  const [activeId,setActiveId] = useState(null);//拖拽过程中产生的id
  const [insect,setIn] = useState(false);
  const [colored,colorChange] = useState() //选择颜色
  const configData = JSON.parse(sessionStorage.getItem('configDetils'))//全局config参数
  const [layoutId,setId] = useState()
  useEffect(() => {
    sedLayout({versions_id:configData.versions_id,scenarios_id:configData.scenarios_id}).then(res=>{
      if(res.msg === "success"){
        setId(res.data.id)
        setAllitems(res.data.function_moudle_list)//全部应用
        setColorList(res.data.color_list)//颜色列表
        res.data.color_list.forEach((element,index) => {
          if(element === res.data.color){
            colorChange(index)
          }
        });
        //加载选中的模块
        setlayouList([{title:"顶部导航",title_layouts:res.data.top_navigation,isEdit:false},
        {title:"侧边栏",title_layouts:res.data.sidebar,isEdit:false}])//全部应用
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  //编辑
  const bianji=(index)=>{
    var lists = layouList.concat();
    lists[index].isEdit = !lists[index].isEdit;
    setlayouList(lists)
  }
  //编辑----删除
  const deleteSelf=(index,key,ishh)=>{
    setActiveId(null)
    if(ishh){
      var lists2 = layouList.concat();
      allitems.push(lists2[index].title_layouts[key])
      setAllitems(allitems)
      lists2[index].title_layouts.splice(key,1)
      setlayouList(lists2)
    }
  }
  const handleDragStart = (id) => {
    setActiveId(id)
  }
  const cancelSelect = () => {
    setActiveId(null)
  }
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIn(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIn(false)
  }
  const handleDrop = (e,key) => {
    e.preventDefault();
    setIn(false)
    allitems.forEach((element,index) => {
      if(element.id === activeId){
        //添加到拖拽的位置
        layouList[key].title_layouts.push(element)
        setlayouList(layouList)
        //删除被拖拽的对象
        allitems.splice(index,1)
        setAllitems(allitems)
      }
    });
  }
  //保存配置
  const saveButton=()=>{
    // 
    var params = {
      id:layoutId,
      color:colorList[colored],
      top_navigation:layouList[0].title_layouts,
      sidebar:layouList[1].title_layouts
    }
    layoutTouchin(params).then(res=>{
      if(res.msg === "success"){
        message.success("保存成功")
      }
    })
  }
  return (
    <div id="LayoutConfiguration" className="animate__animated animate__fadeInDown">
      <div className="lc_header">
        <h1 className="title"><span>布局配置</span></h1>
      </div>
      <div className="lc_content">
        <div className="content_1">
          <h1>色系选取</h1>
          <ul>
            {colorList.map((item, index) => {
              return (
                <li key={index} style={{background:item}} className={index===colored?"checkColor":null} onClick={() => colorChange(index)}></li> 
              );
            })}
          </ul>
        </div>
        <div className="content_2">
          <ul>
            {layouList.map((item,index) => {
              return (
                <li key={index}>
                  <div className="content_2_left">
                    <span className="title">{item.title}</span>
                    <span className="default">默认</span>
                  </div>
                  <div className={'content_2_right' + (insect ? ' active' : '')}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragEnter}
                    onDrop={(e) => handleDrop(e,index)}
                    draggable="false"
                    >
                    <ul>
                      {item.title_layouts.length>0 ?item.title_layouts.map((value, key) => {
                        return (
                          <li key={key} className={item.isEdit?'check_after1':''} onClick={() => deleteSelf(index,key,item.isEdit)}>{value.modules_name}</li> 
                        );
                      }):<div className="noData">暂无被选中的模块</div>}
                    </ul>
                    <div className="bianji">
                      {
                        item.title_layouts.length>0?<IconFont type="icon-bianji" className={item.isEdit?'iconed':'icon'} onClick={() => bianji(index)}/>:null
                      }
                    </div>
                  </div>
                </li> 
              );
            })}
          </ul>
          <div className="line_name">以上应用展示在首页</div>
        </div>
        <div className="content_3">
          <h1>全部应用</h1>
          <ul>
            {allitems.map((item, index) => {
              return (
                <li key={index}>
                  <span draggable="true"
                    onDragStart={() => handleDragStart(item.id)}
                    onDragEnd={cancelSelect}
                    className={item.id === activeId? 'active' : ''}
                    id ={`item-${item.id}`} 
                  >{item.modules_name}</span>
                </li> 
              );
            })}
          </ul>
        </div>
      </div>
      <div className="lc_footer">
        <Button type="primary" size="large" onClick={() => saveButton()}>保存</Button>
      </div>
    </div>
  );
}

export default LayoutConfiguration;