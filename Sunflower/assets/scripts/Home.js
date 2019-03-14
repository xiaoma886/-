let Utils = require("../scripts/common/Utils");
let Custom = require("../scripts/common/Custom");
let NetUtils = require("../scripts/common/NetUtils");
let Global = require("./common/Global");
let Dialog = require("./Dialog");

let AdapterApi = require("../scripts/common/PlatformAdapter");

let LEFTORIGHT = cc.Enum({
    LEFT: 0,
    RIGHT: 1
});

cc.Class({
    extends: Custom,

    properties: {
        contentNode: {
            default: null,
            type: cc.Node,
            tooltip: "左右的根节点"
        },
        left: {
            default: null,
            type: cc.SpriteFrame,
        },
        leftCurrent: {
            default: null,
            type: cc.SpriteFrame,
        },
        right: {
            default: null,
            type: cc.SpriteFrame,
        },
        rightCurrent: {
            default: null,
            type: cc.SpriteFrame,
        },
        scoreLabel: {
            default: null,
            type: cc.Label,
        },
        rankNode: {
            default: null,
            type: cc.Node,
        },
        _totalTime: 40,
        _tvArray: [], //当前显示左右列表
        _removeArray: [], //单位时间内移除左右列表
        _rightOrRights: 0, //总数 用于设置最后一个位置
        _stepTime: 0, //单位时间
        _startGame: false, //是否开始游戏
        _defaultTimeScale: 1, // 默认动画播放的速率
        _currentTimeScale: 1, // 当前动画播放的速率
        _currentScore: 0, //当前成绩
        _dataArray: [],
    },

    btnOnclik (event, str) {
        this._audioClip.playClickAudio();
        switch (str) {
            case 'startGame':
                Utils.log('startGame...');
                this.startGame();
                this.rankNode.active = false;
                break;
            case 'left':
                Utils.log('left...');
                this.clickLeftOrightBtn(LEFTORIGHT.LEFT);

                break;
            case 'right':
                Utils.log('right...');
                this.clickLeftOrightBtn(LEFTORIGHT.RIGHT);

                break;
            case 'rank':
                Utils.log('rank...');
                if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                    wx.getOpenDataContext().postMessage({
                        message: "getFriendRank",
                        openId: Global.openId
                    });
                    this.rankNode.active = true;
                } else {
                    Dialog.showRankDialog(this.node);
                }

                break;
            case 'closeRank':
                this.rankNode.active = false;
                break;
            default:
                break;
        }
    },

    onLoad () {
        let that = this;
        Utils.log('onLoad...');
        //事件监听-排行榜中挑战
        cc.director.on("startGame", function() {
            Utils.log("startGame....");
            that.startGame();
        }, this.node);
    },

    start () {
        this._super();
        let that = this;
        let title = this.node.getChildByName("title");
        this._startTitle = title.getChildByName("startTitle");
        this._defaultTitle = title.getChildByName("defaultTitle");
        let panel = this.node.getChildByName("panel");
        this._startGameBtn = panel.getChildByName("startGame");
        this._leftAndRightBtn = panel.getChildByName("leftAndRight");
        this._rankBtn = panel.getChildByName("rank");

        this._timeNode = this.node.getChildByName("time");
        this._timeSchedule = this._timeNode.getComponent("Schedule");
        this._timeNode.on(this._timeNode.name, function(event) {
            cc.log("time 时间到>" + event.msg);
            this.gameOver();
        }.bind(this));

        this._initLeftOright();

        NetUtils.doExcel(function(code, dataObj) {
            if (code == 0 && dataObj) {
                if (dataObj.code == 0) {
                    this._dataArray = dataObj.data;
                }
            }
        }.bind(this));

        //异步加载龙骨动画
        this.runAsyncGetDragonRes("sunflower", this._defaultTimeScale)
            .then(function(data) {
                that.armatureDisPlay = data;
                that._audioClip.playBgmAudio();
            })
            .catch(function(reason) {
                Utils.log(reason);
            });


        // 判断是否授权 如果没有授权就动态创建button
        this._createButton();
    },

    _createButton () {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (!Global.isAuth) {
                let that = this;
                this.frameSize = cc.view.getFrameSize();

                this._startGameBtn.active = false;
                this._rankBtn.active = false;

                this._userInfoBtn = AdapterApi.createUserInfoBtnByImg(this.frameSize.width / 2 - 126.7, this.frameSize.height - 150,
                    'https://7072-pro-15ec75-1258808161.tcb.qcloud.la/static/button_start.png?sign=cd9bc5970a2adb7fab175e58b54743a9&t=1552444436', 253.4, 82.6,
                    function(userInfoRes) {
                        console.log("获取到的UserInfo:", userInfoRes);
                        if (userInfoRes.errMsg.indexOf('fail') != -1) {
                            AdapterApi.showModal('提示', '请点击允许按钮');
                            return;
                        }
                        Global.nickName = userInfoRes.userInfo.nickName;
                        Global.avatarUrl = userInfoRes.userInfo.avatarUrl;
                        that.startGame();
                    })
            }
        }
    },

    startGame () {
        this._startTitle.active = true;
        this._defaultTitle.active = false;
        this._startGameBtn.active = false;
        this._leftAndRightBtn.active = true;
        this._rankBtn.active = false;

        this._timeSchedule.setTime(this._totalTime);
        this._audioClip.pauseAll();
        this._audioClip.playBgmAudio();

        this._startGame = true;
        this._currentScore = 0;
        this._currentTimeScale = this._defaultTimeScale;
        this.setScore(this._currentScore);
        Utils.log('this._defaultTimeScale:', this._defaultTimeScale);

        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            if (this._userInfoBtn) {
                this._userInfoBtn.hide()
            }
        }
    },
    gameOver () {
        let that = this;
        this._startGame = false;

        this._startTitle.active = false;
        this._defaultTitle.active = true;
        this._startGameBtn.active = true;
        this._leftAndRightBtn.active = false;
        this._rankBtn.active = true;

        this._timeSchedule.unSchedule();
        this._timeNode.getComponent(cc.Label).string = this._totalTime;
        this.setPlayTimeScale(this._defaultTimeScale);
        this._removeArray = [];

        // 显示结算对话框
        this.showSettlementDialog(Global.avatarUrl,
            Global.nickName, this._currentScore,
            function(dialog) {
                if (cc.sys.platform == cc.sys.WECHAT_GAME) {
                    AdapterApi.uploadScore(that._currentScore).then(res => {
                        console.log('uploadScore ...', res);
                        if (res == 1) {
                            dialog.setNewScore(true);
                        } else {
                            dialog.setNewScore(false);
                        }
                    }).catch(err => {
                        console.log('uploadScore err...', err);
                    });
                } else {
                    NetUtils.uploadScore(that._currentScore, function(code, data) {
                        if (code == 0) {
                            if (data.code == 0) {
                                dialog.setNewScore(data.data.isNew);
                            } else {
                                dialog.setNewScore(false);
                            }
                        }
                    });
                }
            });
    },
    // 点击左右按钮
    clickLeftOrightBtn (leftOright) {
        //从数组中取出第一个元素
        let firstNumber = this._tvArray.shift();
        if (firstNumber == leftOright) {
            let children = this.contentNode.children;
            // 1、移除第一个子节点
            this.leftOrightPool.put(children[0]);
            // 2、将第二个子节点设置为选中
            let twoNode = children[0];
            if ('right' === twoNode.name.split("_")[1]) {
                this.setLeftOrightNode(twoNode, false, LEFTORIGHT.RIGHT, true, twoNode.position);
            } else {
                this.setLeftOrightNode(twoNode, false, LEFTORIGHT.LEFT, true, twoNode.position);
            }
            // 3、执行左移动画
            this.contentNode.runAction(cc.moveBy(0.2, cc.v2(-84, 0)));
            // 4、添加一个新的节点
            let random = Utils.getRandomInt(0, 2);

            this._tvArray.push(random);
            this._rightOrRights += 1;
            this.newLeftOrightNode(random, false, cc.v2(84 * this._rightOrRights - 247, 0));

            // 5、添加到移除列表
            this._removeArray.push(firstNumber);

        } else {
            this._tvArray.unshift(firstNumber);
            Utils.log('Game over...');
            this.gameOver();
        }
    },
    // 初始化左右
    _initLeftOright () {
        this.leftOrightPool = new cc.NodePool();

        cc.loader.loadRes("prefab/leftOright", cc.Prefab, function(err, prefab) {
            if (err) {
                return;
            }
            for (let index = 0; index < 7; index++) {
                let newNode = cc.instantiate(prefab);
                let random = Utils.getRandomInt(0, 2);
                this._tvArray.push(random);
                this.setLeftOrightNode(newNode, true, random, index == 0, cc.v2(84 * index - 247, 0));
            }
            this._rightOrRights = 6;
        }.bind(this));
    },

    // 实例化左右 Node
    newLeftOrightNode (leftOright, isCurrent, position, callBack) {
        let newNode = null;
        if (!this.leftOrightPool) {
            this.leftOrightPool = new cc.NodePool();
        }
        if (this.leftOrightPool.size() > 0) {
            newNode = this.leftOrightPool.get();
            this.setLeftOrightNode(newNode, true, leftOright, isCurrent, position, callBack);
        } else {
            cc.loader.loadRes("prefab/leftOright", cc.Prefab, function(err, prefab) {
                if (err) {
                    return;
                }
                newNode = cc.instantiate(prefab);
                this.setLeftOrightNode(newNode, true, leftOright, isCurrent, position, callBack);
            }.bind(this));
        }
    },
    // 设置左右 Node 的属性
    setLeftOrightNode (newNode, isAdd, leftOright, isCurrent, position, callBack) {
        let name = "lo";
        let nodeSprite = newNode.getComponent(cc.Sprite);
        if (isCurrent) {
            newNode.setScale(1, 1);
            if (LEFTORIGHT.LEFT == leftOright) {
                nodeSprite.spriteFrame = this.leftCurrent;
                name = name.concat("_left_current");
            } else {
                nodeSprite.spriteFrame = this.rightCurrent;
                name = name.concat("_right_current");
            }
        } else {
            newNode.setScale(0.8, 0.8);
            if (LEFTORIGHT.LEFT == leftOright) {
                nodeSprite.spriteFrame = this.left;
                name = name.concat("_left");
            } else {
                nodeSprite.spriteFrame = this.right;
                name = name.concat("_right");
            }
        }
        newNode.name = name;
        newNode.position = position;
        if (isAdd) {
            this.contentNode.addChild(newNode);
        }
        if (callBack) {
            callBack(newNode);
        }
    },

    /**
     * 获取龙骨资源并播放动画
     * @param {*} dragonName 龙骨文件夹名称 
     * @param {*} timeScale 动画缩放率
     */
    runAsyncGetDragonRes (dragonName, timeScale) {
        var p = new Promise(function(resolve, reject) {
            cc.loader.loadResDir('dragon/' + dragonName, function(err, assets) {
                if (err) {
                    return;
                }
                if (assets.length <= 0) {
                    return;
                }
                var newHero = new cc.Node();
                //节点名称必须与龙骨资源文件夹名称一致
                this.node.getChildByName("players").getChildByName(dragonName).addChild(newHero);
                newHero.setPosition(cc.v2(0, 0));
                newHero.setScale(1, 1);
                let armatureDisPlay = newHero.addComponent(dragonBones.ArmatureDisplay);
                for (let i in assets) {
                    if (assets[i] instanceof dragonBones.DragonBonesAsset) {
                        armatureDisPlay.dragonAsset = assets[i];
                    }
                    if (assets[i] instanceof dragonBones.DragonBonesAtlasAsset) {
                        armatureDisPlay.dragonAtlasAsset = assets[i];
                    }
                }
                armatureDisPlay.armatureName = 'Armature';
                armatureDisPlay.playAnimation('sunflower');
                armatureDisPlay.timeScale = timeScale;
                resolve(armatureDisPlay);
            }.bind(this));
        }.bind(this));
        return p;
    },

    // 设置播放的速率
    setPlayTimeScale (timeScale) {
        this.armatureDisPlay.timeScale = timeScale;
    },
    setScore (score) {
        this.scoreLabel.string = score;
    },
    showSettlementDialog (headUrl, name, score, callBack) {
        Dialog.showSettlementDialog(this.node, headUrl, name, score, callBack);
    },
    update (dt) {
        if (this._startGame) {
            this._stepTime += dt;
            if (this._stepTime >= 1) {
                this._stepTime = 0;
                let count = this._removeArray.length;

                if (count <= 0) {
                    this._currentTimeScale = this._defaultTimeScale;
                    this.setPlayTimeScale(this._currentTimeScale);
                    return;
                }
                let matchObj = undefined;
                if (this._dataArray.length > 0) {
                    for (let index = 0; index < this._dataArray.length; index++) {
                        let element = this._dataArray[index];
                        if (element.spend == count) {
                            matchObj = element;
                            break;
                        }
                    }
                }
                if (matchObj) {
                    let tempTimeScale = matchObj.animLevel;
                    let tempScore = matchObj.score;

                    this._removeArray = [];
                    this._currentScore += tempScore;
                    this.setScore(this._currentScore);
                    this._currentTimeScale = tempTimeScale;
                    this.setPlayTimeScale(this._currentTimeScale);
                    Utils.log("this._currentTimeScale>" + this._currentTimeScale);
                }
            }
        }
    },
});