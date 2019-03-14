/**
 * @author Javen 
 * @copyright 2018-10-10 11:33:12 javendev@126.com 
 * @description loading 页面
 */

let Dialog = require("../scripts/Dialog");
let AdapterApi = require("../scripts/common/PlatformAdapter");
let Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // onLoad() {},
    start () {
        Dialog.showLoadingDialog(this.node, function(node) {
            let loadDialog = node.getComponent("LoadingDialog");

            if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                AdapterApi.initCloud();

                AdapterApi.callFunction("getOpenId").then(res => {
                    Global.openId = res.result.openid;
                    console.log('openId', Global.openId);
                }).catch(err => {
                    console.log('getOpenId err', err);
                });

                AdapterApi.getSetting('scope.userInfo').then(res => {
                    Global.isAuth = true;
                    console.log(res);
                    // 已授权直接获取用户信息
                    AdapterApi.getUserInfo().then(res => {
                        console.log("用户信息:", res);
                        Global.nickName = res.userInfo.nickName;
                        Global.avatarUrl = res.userInfo.avatarUrl;
                        console.log("Global.nickName", Global.nickName, "Global.avatarUrl", Global.avatarUrl);
                        loadDialog.loadScene("Home");
                    }).catch(err => {
                        console.log("用户信息 err:", err);
                    });
                }).catch(error => {
                    console.log(error);
                    // 未授权
                    loadDialog.loadScene("Home");
                });
            } else {
                loadDialog.loadScene("Home");
            }
        });
    },



    // update (dt) {},
});