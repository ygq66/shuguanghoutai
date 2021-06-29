import axios from 'axios'
// 引用api公共地址
import constant from './constent'
// 引用接口公共方法
import request from './request'

// 登录
export function getLogin(paramsData) {
    return request({
        url: constant.getLogin,
        method: 'post',
        data: paramsData
    })
}
export function getConfig() {
    return request({
        url: constant.getConfig,
        method: 'get'
    })
}
export function getVesion() {
    return request({
        url: constant.getVesion,
        method: 'get'
    })
}
export function touchinVesion(paramsData) {
    return request({
        url: constant.touchinVesion,
        method: 'post',
        data: paramsData
    })
}
export function versionsUpdate(paramsData) {
    return request({
        url: constant.versionsUpdate,
        method: 'post',
        data: paramsData
    })
}
export function moduleVersions() {
    return request({
        url: constant.moduleVersions,
        method: 'get'
    })
}

//module ---基础配置
export async function touchinVesion_fd(paramsData) {
    try {
        const response = await axios.post(constant.touchinVesion, paramsData)
        console.log(response)
        return response;
    } catch (error) {
        console.log(error)
    }
}

//module  ---用户管理增加
export function userTouchin(paramsData) {
    return request({
        url: constant.userTouchin,
        method: 'post',
        data: paramsData
    })
}
// 用户信息
export function userList() {
    return request({
        url: constant.userList,
        method: 'get'
    })
}
export function userList_pt(paramsData) {
    return request({
        url: constant.userList,
        method: 'post',
        data: paramsData
    })
}
// 删除
export function userDelete(paramsData) {
    return request({
        url: constant.userDelete,
        method: 'post',
        data: paramsData
    })
}


//module  --报警增加
export async function alarmouchin(paramsData) {
    try {
        const response = await axios.post(constant.alarmouchin, paramsData)
        console.log(response)
        return response;
    } catch (error) {
        console.log(error)
    }
}
// 报警管理
export function alarmEvent(paramsData) {
    return request({
        url: constant.alarmEvent,
        method: 'post',
        data: paramsData
    })
}
export function alarmList() {
    return request({
        url: constant.alarmList,
        method: 'get'
    })
}
export function eventInfo(paramsData) {
    return request({
        url: constant.eventInfo,
        method: 'post',
        data: paramsData
    })
}
// 报警删除
export function alarmDelete(paramsData) {
    return request({
        url: constant.alarmDelete,
        method: 'post',
        data: paramsData
    })
}
// 设备配置
export function deviceType(paramsData) {
    return request({
        url: constant.deviceType,
        method: 'get',
    })
}
// 设备子类的添加或修改
export function deviceTypeCUpdate(paramsData) {
    return request({
        url: constant.deviceTypeCUpdate,
        method: 'post',
        data: paramsData
    })
}


// 设备详情
export function deviceDetail(paramsData) {
    return request({
        url: constant.deviceDetail,
        method: 'post',
        data: paramsData
    })
}
// 修改设备类型信息
export function deviceTypeUpdate(paramsData) {
    return request({
        url: constant.deviceTypeUpdate,
        method: 'post',
        data: paramsData
    })
}
export function deviceCateoryUpdate(paramsData) {
    return request({
        url: constant.deviceCateoryUpdate,
        method: 'post',
        data: paramsData
    })
}
//module ---角色权限
export function roleTouchin(paramsData) {
    return request({
        url: constant.roleTouchin,
        method: 'post',
        data: paramsData
    })
}
export function roleList() {
    return request({
        url: constant.roleList,
        method: 'get'
    })
}
export function roleList_pt(paramsData) {
    return request({
        url: constant.roleList,
        method: 'post',
        data: paramsData
    })
}
export function roleDelete(paramsData) {
    return request({
        url: constant.roleDelete,
        method: 'post',
        data: paramsData
    })
}
export function deviceList() {
    return request({
        url: constant.deviceList,
        method: 'get'
    })
}
export function powerAdd(paramsData) {
    return request({
        url: constant.powerAdd,
        method: 'post',
        data: paramsData
    })
}
export function powerList(paramsData) {
    return request({
        url: constant.powerList,
        method: 'post',
        data: paramsData
    })
}

//模块管理
export function scenariosList(paramsData) {
    return request({
        url: constant.scenariosList,
        method: 'post',
        data: paramsData
    })
}
export function moduleList(paramsData) {
    return request({
        url: constant.moduleList,
        method: 'post',
        data: paramsData
    })
}

//报警数量
export function alarmCount(paramsData) {
    return request({
        url: constant.alarmCount,
        method: 'post',
        data: paramsData
    })
}
//模块场景保存
export function preservation(ParamsData) {
    return request({
        url: constant.preservation,
        method: 'post',
        data: ParamsData
    })
}
// 点位匹配
export function Equipmentype() {
    return request({
        url: constant.Equipmentype,
        method: 'get',
    })
}
//布局配置--添加
export function layoutTouchin(ParamsData) {
    return request({
        url: constant.layoutTouchin,
        method: 'post',
        data: ParamsData
    })
}
export function sedLayout(ParamsData) {
    return request({
        url: constant.sedLayout,
        method: 'post',
        data: ParamsData
    })
}

// 获取初始位置
export function getLocationList(ParamsData) {
    return request({
        url: constant.getLocationList,
        method: 'get',
        data: ParamsData
    })
}
// 添加/修改初始位置
export function setLocationTouchin(ParamsData) {
    return request({
        url: constant.setLocationTouchin,
        method: 'post',
        data: ParamsData
    })
}
// 获取常用位置
export function getMapLocation(ParamsData) {
    return request({
        url: constant.getMapLocation,
        method: 'get',
        data: ParamsData
    })
}
// 添加常用位置
export function addMapLocation(ParamsData) {
    return request({
        url: constant.addMapLocation,
        method: 'post',
        data: ParamsData
    })
}
// 修改常用位置
export function updateMapLocation(ParamsData) {
    return request({
        url: constant.updateMapLocation,
        method: 'post',
        data: ParamsData
    })
}
// 删除常用位置
export function delMapLocation(ParamsData) {
    return request({
        url: constant.delMapLocation,
        method: 'post',
        data: ParamsData
    })
}


// 获取建筑信息
export function getBuildList(ParamsData) {
    return request({
        url: constant.getBuildList,
        method: 'get',
        data: ParamsData
    })
}
// 获取楼层信息
export function getFloorList(ParamsData) {
    return request({
        url: constant.getFloorList,
        method: 'post',
        data: ParamsData
    })
}
// 导入网格
export function daoruWg(ParamsData) {
    return request({
        url: constant.daoruWg,
        method: 'post',
        data: ParamsData
    })
}
//网格信息修改
export function wgUpdata(ParamsData) {
    return request({
        url: constant.wgUpdata,
        method: 'post',
        data: ParamsData
    })
}
// 网格信息获取
export function savaGridRegionList(ParamsData) {
    return request({
        url: constant.savaGridRegionList,
        method: 'get',
        data: ParamsData
    })
}
export function savaGridInfoList(ParamsData) {
    return request({
        url: constant.savaGridInfoList,
        method: 'get',
        data: ParamsData
    })
}
// 网格名称添加
export function addGridRegion(ParamsData) {
    return request({
        url: constant.addGridRegion,
        method: 'post',
        data: ParamsData
    })
}
// 网格组织删除
export function wgzjDel(ParamsData) {
    return request({
        url: constant.wgzjDel,
        method: 'post',
        data: ParamsData
    })
}
// 网格组织重置
export function wgzzReset(ParamsData) {
    return request({
        url: constant.wgzzReset,
        method: 'post',
        data: ParamsData
    })
}

// 获取图层组列表信息
export function getMapGroup(ParamsData) {
    return request({
        url: constant.getMapGroup,
        method: 'get',
        data: ParamsData
    })
}
// 添加/修改图层组列表信息
export function setMapGroup(ParamsData) {
    return request({
        url: constant.setMapGroup,
        method: 'post',
        data: ParamsData
    })
}
// 删除图层组列表信息
export function delMapGroup(ParamsData) {
    return request({
        url: constant.delMapGroup,
        method: 'post',
        data: ParamsData
    })
}
// 获取图层列表信息
export function getMapLayer(ParamsData) {
    return request({
        url: constant.getMapLayer,
        method: 'get',
        data: ParamsData
    })
}
// 添加/修改图层列表信息
export function setMapLayer(ParamsData) {
    return request({
        url: constant.setMapLayer,
        method: 'post',
        data: ParamsData
    })
}
// 删除图层列表信息
export function delMapLayer(ParamsData) {
    return request({
        url: constant.delMapLayer,
        method: 'post',
        data: ParamsData
    })
}

// 获取文字标注
export function getFigureLabel(ParamsData) {
    return request({
        url: constant.getFigureLabel,
        method: 'get',
        data: ParamsData
    })
}
// 添加/修改文字标注
export function setFigureLabel(ParamsData) {
    return request({
        url: constant.setFigureLabel,
        method: 'post',
        data: ParamsData
    })
}
// 删除文字标注
export function delFigureLabel(ParamsData) {
    return request({
        url: constant.delFigureLabel,
        method: 'post',
        data: ParamsData
    })
}


// 添加/修改建筑信息
export function setMapBuild(ParamsData) {
    return request({
        url: constant.setMapBuild,
        method: 'post',
        data: ParamsData
    })
}
// 添加/修改楼层信息
export function setMapFloor(ParamsData) {
    return request({
        url: constant.setMapFloor,
        method: 'post',
        data: ParamsData
    })
}
// 获取建筑信息
export function getMapBulid(ParamsData) {
    return request({
        url: constant.getMapBulid,
        method: 'get',
        data: ParamsData
    })
}
// 获取楼层信息
export function getMapFloor(ParamsData) {
    return request({
        url: constant.getMapFloor,
        method: 'post',
        data: ParamsData
    })
}
// 获取建筑标注列表
export function getBuildLabel(ParamsData) {
    return request({
        url: constant.getBuildLabel,
        method: 'get',
        data: ParamsData
    })
}
// 添加/修改建筑标注列表
export function setBuildLabel(ParamsData) {
    return request({
        url: constant.setBuildLabel,
        method: 'post',
        data: ParamsData
    })
}
// 删除建筑标注
export function delBuildLabel(ParamsData) {
    return request({
        url: constant.delBuildLabel,
        method: 'post',
        data: ParamsData
    })
}

// 获取巡逻路线
export function getPatrolLine(ParamsData) {
    return request({
        url: constant.getPatrolLine,
        method: 'get',
        data: ParamsData
    })
}
// 获取对应id路线相机点位列表
export function getPatrolLineAll(ParamsData) {
    return request({
        url: constant.getPatrolLineAll,
        method: 'post',
        data: ParamsData
    })
}
// 查询相机
export function getLineSelectCamera(ParamsData) {
    return request({
        url: constant.getLineSelectCamera,
        method: 'post',
        data: ParamsData
    })
}
// 添加巡逻路线
export function setPatrolLine(ParamsData) {
    return request({
        url: constant.setPatrolLine,
        method: 'post',
        data: ParamsData
    })
}
// 修改巡逻路线
export function updatePatrolLine(ParamsData) {
    return request({
        url: constant.updatePatrolLine,
        method: 'post',
        data: ParamsData
    })
}
// 删除巡逻路线
export function delPatrolLine(ParamsData) {
    return request({
        url: constant.delPatrolLine,
        method: 'post',
        data: ParamsData
    })
}

// 获取巡逻预案
export function getPatrolPlan(ParamsData) {
    return request({
        url: constant.getPatrolPlan,
        method: 'get',
        data: ParamsData
    })
}

// 巡逻预案 - 查询对应ID全部巡逻预案
export function getPatrolPlanChildren(ParamsData) {
    return request({
        url: constant.getPatrolPlan,
        method: 'post',
        data: ParamsData
    })
}
// 添加巡逻预案
export function setPatrolPlan(ParamsData) {
    return request({
        url: constant.setPatrolPlan,
        method: 'post',
        data: ParamsData
    })
}
// 修改巡逻预案
export function updatePatrolPlan(ParamsData) {
    return request({
        url: constant.updatePatrolPlan,
        method: 'post',
        data: ParamsData
    })
}
// 删除巡逻预案
export function delPatrolPlan(ParamsData) {
    return request({
        url: constant.delPatrolPlan,
        method: 'post',
        data: ParamsData
    })
}


// 获取床位信息
export function getBedList(ParamsData) {
    return request({
        url: constant.getBedList,
        method: 'get',
        data: ParamsData
    })
}
// 添加or修改床位信息
export function setBedTouchin(ParamsData) {
    return request({
        url: constant.setBedTouchin,
        method: 'post',
        data: ParamsData
    })
}
//删除床位信息
export function delBed(ParamsData) {
    return request({
        url: constant.delBed,
        method: 'post',
        data: ParamsData
    })
}
// 添加or修改房间信息
export function setBedRoom(ParamsData) {
    return request({
        url: constant.setBedRoom,
        method: 'post',
        data: ParamsData
    })
}
//删除房间信息
export function delBedRoom(ParamsData) {
    return request({
        url: constant.delBedRoom,
        method: 'post',
        data: ParamsData
    })
}


// 获取人员定位信息
export function getPeopleLocation(ParamsData) {
    return request({
        url: constant.getPeopleLocation,
        method: 'get',
        data: ParamsData
    })
}
// 添加or修改人员定位信息
export function setPeopleLocation(ParamsData) {
    return request({
        url: constant.setPeopleLocation,
        method: 'post',
        data: ParamsData
    })
}
//删除人员定位信息
export function delPeopleLocation(ParamsData) {
    return request({
        url: constant.delPeopleLocation,
        method: 'post',
        data: ParamsData
    })
}
export function labelList(ParamsData) {
    return request({
        url: constant.labelList,
        method: 'post',
        data: ParamsData
    })
}

// 添加飞行漫游
export function setRoamFly(ParamsData) {
    return request({
        url: constant.setRoamFly,
        method: 'post',
        data: ParamsData
    })
}
//获取全部飞行漫游
export function getRoamlist(ParamsData) {
    return request({
        url: constant.getRoamlist,
        method: 'get',
        data: ParamsData
    })
}
// 删除飞行漫游
export function delRoamlist(ParamsData) {
    return request({
        url: constant.delRoamlist,
        method: 'post',
        data: ParamsData
    })
}