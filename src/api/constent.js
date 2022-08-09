import { configData1 as ApiUrl } from "./address";

// 接口集合
const constant = {
  //登录
  getLogin: `${ApiUrl}/sys/user/login`,
  //获取平台配置
  getConfig: `${ApiUrl}/sys/config/list`,
  //获取版本配置
  getVesion: `${ApiUrl}/sys/versions/list`,
  //修改（上传平台配置）
  touchinVesion: `${ApiUrl}/sys/config/touchin`,
  //修改版本模块的版本id
  versionsUpdate: `${ApiUrl}/module/versions/update`,
  //加载左侧功能模块
  moduleVersions: `${ApiUrl}/module/versions/list`,

  //module 获取平台配置
  touchinPplatform: `${ApiUrl}/sys/versions/touchin`,

  //module 用户管理 增(改)平台用户
  userTouchin: `${ApiUrl}/sys/user/touchin`,
  //module 用户管理 查询符合条件的用户
  userList: `${ApiUrl}/sys/user/list`,
  //module 用户管理 根据用户id删除用户
  userDelete: `${ApiUrl}/sys/user/delete`,

  // 设备配置
  deviceType: `${ApiUrl}/device/category/list`,
  // 修改设备类型
  deviceTypeUpdate: `${ApiUrl}/device/category/touchin`,
  // 修改设备类型
  deviceCateoryUpdate: `${ApiUrl}/device/type/touchin`,
  // 设备详情
  deviceDetail: `${ApiUrl}/device/type/list`,
  //添加、修改设备子类
  deviceTypeCUpdate: `${ApiUrl}/device/type/touchin`,
  //module 角色权限-角色配置 增(改)
  roleTouchin: `${ApiUrl}/sys/role/touchin`,
  //查
  roleList: `${ApiUrl}/sys/role/list`,
  //删
  roleDelete: `${ApiUrl}/sys/role/delete`,
  //（设备权限） - 获取设备功能信息
  deviceList: `${ApiUrl}/device/function/list`,
  //添加权限
  powerAdd: `${ApiUrl}/power/role/add`,
  //查询对应角色权限
  powerList: `${ApiUrl}/power/role/list`,

  //module报警管理
  alarmList: `${ApiUrl}/device/category/list`,
  // 获取报警二级具体信息
  eventInfo: `${ApiUrl}/event/type/list`,
  // 报警删除
  alarmDelete: `${ApiUrl}/event/type/delete`,
  // 报警增加
  alarmouchin: `${ApiUrl}/event/type/touchin`,
  //对接管理中的报警管理
  alarmEvent: `${ApiUrl}/event/info/list`,

  //模块管理 --- 获取场景
  scenariosList: `${ApiUrl}/sys/scenarios/list`,
  //场景获取模块
  moduleList: `${ApiUrl}/module/function/list`,
  //对接管理报警数
  alarmCount: `${ApiUrl}/dock/manage/list`,
  //模块存储
  preservation: `${ApiUrl}/module/function/update`,

  // 点位匹配
  Equipmentype: `${ApiUrl}/device/category/list`,
  //布局配置
  layoutTouchin: `${ApiUrl}/layout/config/touchin`,
  //传场景版本id
  sedLayout: `${ApiUrl}/layout/config/list`,

  // 获取初始位置
  getLocationList: `${ApiUrl}/init/location/list`,
  // 添加/修改初始位置
  setLocationTouchin: `${ApiUrl}/init/location/touchin`,

  // 获取常用位置
  getMapLocation: `${ApiUrl}/map/location/list`,
  // 添加常用位置
  addMapLocation: `${ApiUrl}/map/location/add`,
  // 修改常用位置
  updateMapLocation: `${ApiUrl}/map/location/update`,
  // 删除常用位置
  delMapLocation: `${ApiUrl}/map/location/delete`,

  // 获取建筑信息
  getBuildList: `${ApiUrl}/map/build/list`,
  // 获取楼层信息
  getFloorList: `${ApiUrl}/map/floor/list`,
  // 网格信息获取
  savaGridRegionList: `${ApiUrl}/grid/region/list`,
  savaGridInfoList: `${ApiUrl}/grid/info/list`,
  // 网格组织名称添加
  addGridRegion: `${ApiUrl}/grid/region/touchin`,
  // 网格组织删除:
  wgzjDel: `${ApiUrl}/grid/region/delete`,
  // 网格组织重置
  wgzzReset: `${ApiUrl}/grid/region/reset`,
  // 导入网格
  daoruWg: `${ApiUrl}/grid/info/import`,
  // 网格信息修改
  wgUpdata: `${ApiUrl}/grid/info/touchin`,

  // 获取图层组列表信息
  getMapGroup: `${ApiUrl}/map/group/list`,
  // 添加/修改图层组列表信息
  setMapGroup: `${ApiUrl}/map/group/touchin`,
  // 删除图层组列表信息
  delMapGroup: `${ApiUrl}/map/group/delete`,
  // 获取图层列表信息
  getMapLayer: `${ApiUrl}/map/layer/list`,
  //添加/修改图层列表信息
  setMapLayer: `${ApiUrl}/map/layer/touchin`,
  //删除图层列表信息
  delMapLayer: `${ApiUrl}/map/layer/delete`,

  // 获取文字标注
  getFigureLabel: `${ApiUrl}/figure/label/list`,
  // 添加/修改文字标注
  setFigureLabel: `${ApiUrl}/figure/label/touchin`,
  // 删除文字标注
  delFigureLabel: `${ApiUrl}/figure/label/delete`,

  // 添加/修改建筑信息
  setMapBuild: `${ApiUrl}/map/build/touchin`,
  // 添加/修改楼层信息
  setMapFloor: `${ApiUrl}/map/floor/touchin`,
  // 获取建筑信息
  getMapBulid: `${ApiUrl}/map/build/list`,
  // 获取楼层信息
  getMapFloor: `${ApiUrl}/map/floor/list`,
  // 获取建筑标注列表
  getBuildLabel: `${ApiUrl}/build/label/list`,
  // 添加/修改建筑标注列表
  setBuildLabel: `${ApiUrl}/build/label/touchin`,
  // 删除建筑标注
  delBuildLabel: `${ApiUrl}/build/label/delete`,

  // 获取巡逻路线
  getPatrolLine: `${ApiUrl}/patrol/line/list`,
  // 获取对应id路线相机点位列表
  getPatrolLineAll: `${ApiUrl}/patrol/line/alllist`,
  // 查询相机
  getLineSelectCamera: `${ApiUrl}/line/selectCamera`,
  // 添加巡逻路线
  setPatrolLine: `${ApiUrl}/patrol/line/add`,
  // 修改巡逻路线
  updatePatrolLine: `${ApiUrl}/patrol/line/update`,
  // 删除巡逻路线
  delPatrolLine: `${ApiUrl}/patrol/line/destroy`,

  // 获取巡逻预案 or 巡逻预案 - 查询对应ID全部巡逻预案
  getPatrolPlan: `${ApiUrl}/patrol/plan/list`,
  // 添加巡逻预案
  setPatrolPlan: `${ApiUrl}/patrol/plan/add`,
  // 修改巡逻预案
  updatePatrolPlan: `${ApiUrl}/patrol/plan/update`,
  // 删除巡逻预案
  delPatrolPlan: `${ApiUrl}/patrol/plan/destroy`,

  // 获取床位信息
  getBedList: `${ApiUrl}/bed/list`,
  // 添加or修改床位信息
  setBedTouchin: `${ApiUrl}/bed/touchin`,
  //删除床位信息
  delBed: `${ApiUrl}/bed/delete`,
  // 添加or修改房间信息
  setBedRoom: `${ApiUrl}/bed/room/touchin`,
  //删除房间信息
  delBedRoom: `${ApiUrl}/bed/room/delete`,

  // 获取人员定位信息
  getPeopleLocation: `${ApiUrl}/area/GetAll`,
  // 添加or修改人员定位信息
  // setPeopleLocation: `${ApiUrl}/people/location/touchin`,
  setPeopleLocation:`${ApiUrl}/area/TouchIncamera`,
  //删除人员定位信息
  delPeopleLocation: `${ApiUrl}/people/location/delete`,

  labelList: `${ApiUrl}/figure/label/listId`,

  // 添加飞行漫游
  setRoamFly: `${ApiUrl}/roam/fly/add`,
  // 获取飞行漫游
  getRoamlist: `${ApiUrl}/roam/fly/list`,
  // 删除飞行漫游
  delRoamlist: `${ApiUrl}/roam/fly/destroy`,
  //新加的根据设备查网格面的
  deviceRegion: `${ApiUrl}/device/region`,
};

export default constant;
