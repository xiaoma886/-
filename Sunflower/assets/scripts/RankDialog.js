let Dialog = require("./Dialog");
let Utils = require("../scripts/common/Utils");
let NetUtils = require("../scripts/common/NetUtils");

let ITEM_TYPE = cc.Enum({
    TOP3: 0,
    OTHERS: 1,
    SELF: 2,
});

cc.Class({
    extends: cc.Component,

    properties: {
        scrollView: {
            default: null,
            type: cc.ScrollView
        },
        itemBgs: {
            default: [],
            type: cc.SpriteFrame
        },
        itemNumberTop3: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    btnClick (event, data) {

        switch (data) {
            case 'close':
                Utils.log('close...');
                Dialog.hiddenRankDialog(this.node);
                break;
            case 'pk':
                Utils.log('pk...');
                Dialog.hiddenRankDialog(this.node);
                cc.director.emit("startGame");
                break;
            default:
                break;
        }
    },

    setData (dataArray, selfData) {
        let that = this;
        this._content = this.scrollView.content;
        let childern = this._content.children;
        if (childern && childern.length > 0) {
            childern.forEach(element => {
                element.destroy();
            });
        }
        cc.loader.loadRes("prefab/rankItem", cc.Prefab, function(err, prefab) {
            if (err) {
                return;
            }
            dataArray.forEach(element => {
                let newNode = cc.instantiate(prefab);

                let type = element.id < 4 ? ITEM_TYPE.TOP3 : ITEM_TYPE.OTHERS;
                that._setItemNode(newNode, type, element, function(node) {
                    that._content.addChild(node);
                });
            });

            if (selfData) {
                that._newItemNode(ITEM_TYPE.SELF, selfData, function(node) {
                    that.node.getChildByName("bg").getChildByName("selfNode").addChild(node);
                });
            }
        });
    },


    _newItemNode (type, itemObj, callBack) {
        let newNode = null;
        if (!this.itemPool) {
            this.itemPool = new cc.NodePool();
        }
        if (this.itemPool.size() > 0) {
            newNode = this.itemPool.get();
            this._setItemNode(newNode, type, itemObj, callBack);
        } else {
            cc.loader.loadRes("prefab/rankItem", cc.Prefab, function(err, prefab) {
                if (err) {
                    return;
                }
                newNode = cc.instantiate(prefab);
                this._setItemNode(newNode, type, itemObj, callBack);
            }.bind(this));
        }
    },
    _setItemNode (newNode, type, itemObj, callBack) {
        // 设置成绩
        newNode.getChildByName("score").getComponent(cc.Label).string = itemObj.score;
        // 设置图像
        let headNode = newNode.getChildByName("head").getChildByName("head");
        Utils.loadImgByUrl(headNode, itemObj.headUrl);
        // 设置 item 背景
        newNode.getComponent(cc.Sprite).spriteFrame = this.itemBgs[type];
        // 设置玩家昵称 
        newNode.getChildByName("bannerId").getChildByName("name").
        getComponent(cc.Label).string = Utils.stringTodo(itemObj.name, 8);
        // 设置排名
        let noNode = newNode.getChildByName("no");
        let numberNode = newNode.getChildByName("number");
        let numImgNode = newNode.getChildByName("numImg");
        noNode.active = false;
        numberNode.active = false;
        numImgNode.active = false;

        if (type == ITEM_TYPE.TOP3) {
            numImgNode.getComponent(cc.Sprite).spriteFrame = this.itemNumberTop3[itemObj.id - 1];
            numImgNode.active = true;
        } else if (type == ITEM_TYPE.OTHERS) {
            numberNode.getComponent(cc.Label).string = itemObj.id;
            numberNode.active = true;
        } else if (type == ITEM_TYPE.SELF) {
            if (itemObj.id <= 0) {
                noNode.active = true;
            } else {
                numberNode.getComponent(cc.Label).string = itemObj.id;
                numberNode.active = true;
            }
        }

        if (callBack) {
            callBack(newNode);
        }

    },
    _itemObj (id, name, score, openId, headUrl) {
        let item = {
            id: id,
            name: name,
            score: score,
            headUrl: headUrl,
            openId: openId
        };
        return item;
    },


    //异步加载数据并显示
    loadRankData () {
        let that = this;
        return new Promise(function(resolve, reject) {
            NetUtils.getRankData(function(code, data) {
                Utils.log('getRankData', code, data);

                if (code != 0) {
                    Utils.log('getRank 请求异常', code);
                    reject('getRank 请求异常:' + code);
                    return;
                }

                if (data && data.code != 0) {
                    Utils.log('getRank code ', data.code, data.msg);
                    reject('getRank code:' + data.code + " msg:" + data.msg);
                    return;
                }

                let rankData = data.data.ranking;
                let dataArray = [];
                if (rankData && rankData.length > 0) {
                    rankData.forEach(element => {
                        let itemObj = that._itemObj(element.rank, element.name, element.score,
                            element.openId, 'http://192.168.1.134:12888/img/head.png');
                        dataArray.push(itemObj)
                    });
                }
                let selfData = undefined;
                let oneself = data.data.oneself;
                if (oneself) {
                    selfData = that._itemObj(oneself.rank, oneself.name, oneself.score,
                        oneself.openId, 'http://192.168.1.134:12888/img/head.png');
                }
                that.setData(dataArray, selfData);
                resolve("success");
            });
        });
    },
    onLoad () {
        Utils.log('onLoad....');
    },
    start () {
        Utils.log('start....');
    },
    onEnable () {
        this.loadRankData()
            .then(function(data) {
                Utils.log('loadRankData', data);
            })
            .catch(function(reason) {
                Utils.log('loadRankData', reason);
            });
        Utils.log('onEnable....');
    },

    // update (dt) {},
});