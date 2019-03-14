let ITEM_TYPE = cc.Enum({
    TOP3: 0,
    OTHERS: 1,
    SELF: 2,
});
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        selfNode: cc.Node,
        prefab: cc.Prefab,
        itemBgs: {
            default: [],
            type: cc.SpriteFrame
        },
        itemNumberTop3: {
            default: [],
            type: cc.SpriteFrame
        },
        _dataArray: [],
    },

    start() {
        let _self = this;

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.onMessage(data => {
                console.log("onMessage..", data);
                if (data.message == 'getFriendRank') {

                    let selfOpenId = data.openId;
                    console.log("selfOpenId:", selfOpenId);
                    //清理之前的数据
                    _self.content.children.forEach(element => {
                        element.destroy();
                    });
                    _self._dataArray = [];
                    //清理之前的数据End
                    //获取好友排行榜数据
                    wx.getFriendCloudStorage({
                        keyList: ['score'],
                        success: function (res) {
                            console.log('friend success', res);
                            let length = res.data.length;
                            if (length > 0) {
                                for (let i = 0; i < res.data.length; i++) {
                                    let friendInfo = res.data[i];
                                    if (friendInfo) {
                                        let openId = friendInfo.openid;
                                        let nickName = friendInfo.nickname;
                                        let avatarUrl = friendInfo.avatarUrl;
                                        let score = friendInfo.KVDataList[0].value;
                                        _self._dataArray.push(_self._itemObj(0, openId, avatarUrl, nickName, score));
                                    }
                                }
                                //排序
                                _self._dataArray.sort(function (m, n) {
                                    if (parseInt(m.score) < parseInt(n.score)) return 1
                                    else if (parseInt(m.score) > parseInt(n.score)) return -1
                                    else return 0
                                });
                                console.log("排序后的数据:", _self._dataArray);
                                let temp = _self._dataArray.length > 10 ? 10 : _self._dataArray.length;
                                for (let index = 0; index < temp; index++) {
                                    let node = _self.createPrefab();
                                    let itemData = _self._dataArray[index];
                                    itemData.id = index + 1;
                                    _self._setItemNode(node, itemData.id < 4 ? ITEM_TYPE.TOP3 : ITEM_TYPE.OTHERS,
                                        itemData);
                                }

                                _self.selfNode.active = false;
                                //设置自己排名
                                for (let index = 0; index < _self._dataArray.length; index++) {
                                    let tempData = _self._dataArray[index];
                                    tempData.id = index + 1;
                                    if (selfOpenId == tempData.openId) {
                                        console.log("selfData:", tempData);
                                        _self._setItemNode(_self.createPrefab(), ITEM_TYPE.SELF, tempData);
                                        _self.selfNode.active = true;
                                        break;
                                    }
                                }
                            }
                        },
                        fail: function (res) {
                            console.error(res);
                        }
                    });
                }
            });
        } else {
            //非微信环境下的测试数据
            console.log('非微信环境...');
            for (let index = 1; index < 11; index++) {
                let node = this.createPrefab();
                let itemData = new this._itemObj(index, "", "http://192.168.1.134:12888/img/head.png",
                    "Javen", 100 + index);
                this._setItemNode(node, index < 4 ? ITEM_TYPE.TOP3 : ITEM_TYPE.OTHERS, itemData);
            }
            let itemData = new this._itemObj(100, "", "http://192.168.1.134:12888/img/head.png",
                "Javen001", 100);
            this._setItemNode(this.createPrefab(), ITEM_TYPE.SELF, itemData);
        }
    },

    _setItemNode(newNode, type, itemObj) {
        // 设置成绩
        newNode.getChildByName("score").getComponent(cc.Label).string = itemObj.score;
        // 设置图像
        let headNode = newNode.getChildByName("head").getChildByName("head");
        this.loadImgByUrl(headNode, itemObj.avatarUrl);
        // 设置 item 背景
        newNode.getComponent(cc.Sprite).spriteFrame = this.itemBgs[type];
        // 设置玩家昵称 
        newNode.getChildByName("bannerId").getChildByName("name").
        getComponent(cc.Label).string = this.stringTodo(itemObj.nickName, 8);
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

        if (type == ITEM_TYPE.SELF) {
            newNode.parent = this.selfNode;
        }
    },

    _itemObj(id, openId, avatarUrl, nickName, score) {
        return {
            id: id,
            openId: openId,
            nickName: nickName,
            score: score,
            avatarUrl: avatarUrl,
        }
    },

    createPrefab() {
        let node = cc.instantiate(this.prefab);
        node.parent = this.content;
        return node;
    },
    loadImgByUrl(imgNode, remoteUrl, imageType) {
        let _self = this;
        if (!imageType) {
            imageType = "png";
        }
        cc.loader.load({
            url: remoteUrl,
            type: imageType
        }, function (err, texture) {
            if (err) {
                return;
            }
            _self.setImg(imgNode, new cc.SpriteFrame(texture));
        });
    },
    setImg(imgNode, spriteFrame) {
        imgNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    },
    stringTodo(str, len) {
        let reg = /[\u4e00-\u9fa5]/g,
            slice = str.substring(0, len),
            chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
            realen = slice.length * 2 - chineseCharNum;
        return str.substr(0, realen) + (realen < str.length ? "..." : "");
    }

});