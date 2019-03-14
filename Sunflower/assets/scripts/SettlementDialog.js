/**
 * @author Javen 
 * @copyright 2019-03-05 15:27:38 javendev@126.com 
 * @description 结算对话框
 */

let Dialog = require("./Dialog");
let Utils = require("../scripts/common/Utils");
let AdapterApi = require("../scripts/common/PlatformAdapter");

cc.Class({
    extends: cc.Component,

    properties: {
        head: {
            default: null,
            type: cc.Sprite,
            tooltip: '玩家图像'
        },
        userName: {
            default: null,
            type: cc.Label,
            tooltip: '玩家昵称'
        },
        score: {
            default: null,
            type: cc.Label,
            tooltip: '玩家成绩'
        },
        isNew: {
            default: null,
            type: cc.Node,
            tooltip: '新纪录'
        }
    },
    setData (headUrl, name, score) {
        this.userName.getComponent(cc.Label).string = name;
        this.score.getComponent(cc.Label).string = score;
        Utils.loadImgByUrl(this.head, headUrl);
    },
    setNewScore (isNew) {
        this.isNew.active = isNew;
    },
    btnClick (event, data) {
        switch (data) {
            case 'share':
                Utils.log('share ...');
                AdapterApi.shareAppMessage();
                Dialog.hiddenSettlementDialog(this.node);
                break;
            case 'submit':
                Utils.log('submit...');
                Dialog.hiddenSettlementDialog(this.node);
                break;

            default:
                break;
        }
    },
    // onLoad () {},

    start () {

    },

    // update (dt) {},
});