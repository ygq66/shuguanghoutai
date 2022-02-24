import $ from 'jquery';
// import globalData from "../../config.json"
var ApiUrl;
var MapUrl;
var projectId;
var token;

$.ajax({
    url: "./config.json",
    type: "get",
    async: false,
    success: function (response) {
        console.log(response,'configjson配置')
        // 返回当前的URL协议,既http协议还是https协议
        // let protocol = document.location.protocol;
        // const interfaceIp = `${protocol}//${projectAddrass}/api`;
        ApiUrl = response.Url;
        MapUrl = response.map_url;
        projectId = response.projectId;
        token = response.token;
    }
})

export var configData1 = ApiUrl
export var configData2 = MapUrl
export var configData3 = projectId
export var configData4 = token