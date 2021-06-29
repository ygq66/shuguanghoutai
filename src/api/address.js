import $ from 'jquery';
// import globalData from "../../config.json"
var ApiUrl;
$.ajax({
    url: "./config.json",
    type: "get",
    async: false,
    success: function (response) {
        let projectAddrass = window.location.host;
        console.log(projectAddrass)
        // 返回当前的URL协议,既http协议还是https协议
        // let protocol = document.location.protocol;
        // const interfaceIp = `${protocol}//${projectAddrass}/api`;
        ApiUrl = response.Url;
    }
})
export default ApiUrl;