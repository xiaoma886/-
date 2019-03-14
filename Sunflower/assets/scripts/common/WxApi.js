/**
 * @author Javen 
 * @copyright 2019-03-07 19:22:21 javendev@126.com 
 * @description 微信接口
 */
let Global = require('../common/Global');

var WxApi = function() {

}

WxApi.prototype.initCloud = function(envId) {
    wx.cloud.init({
        env: envId,
        traceUser: true
    });

    //初始化数据库
    Global.wxDb = wx.cloud.database({
        env: envId
    });

    this.showShareMenu();
    this.onShareAppMessage();
}


WxApi.prototype.callFunction = function(funcName, params) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name: funcName,
            data: params || {},
            success: res => {
                resolve(res)
                console.log(`[云函数 ${funcName}] 调用成功: `, res);
            },
            fail: err => {
                resolve(null)
                console.log(`[云函数 ${funcName}] 调用失败: `, err);
            }
        })
    })
}

WxApi.prototype.getSetting = function(scope) {
    return new Promise(function(resolve, reject) {
        wx.getSetting({
            success (res) {
                if (res.authSetting[scope]) {
                    resolve('已授权');
                } else {
                    reject('未授权');
                }
            }
        })
    });
}

WxApi.prototype.getUserInfo = function() {
    return new Promise(function(resolve, reject) {
        wx.getUserInfo({
            withCredentials: true,
            success (res) {
                resolve(res);
            },
            fail (error) {
                reject(error);
            }
        })
    });
}

WxApi.prototype.login = function() {
    return new Promise(function(resolve, reject) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.login({
                success (res) {
                    if (res.code) {
                        resolve(res.code);
                    } else {
                        reject(res.errMsg);
                    }
                }
            });
        } else {
            reject('非微信环境');
        }
    });
}


WxApi.prototype.createUserInfoBtnByImg = function(left, top, imgUrl, width, height, callBack) {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        let button = wx.createUserInfoButton({
            type: 'image',
            image: imgUrl,
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
            }
        });
        button.onTap((res) => {
            if (callBack) {
                callBack(res);
            }
        });
        button.show();
        return button;
    } else {
        console.log("createUserInfoBtnByImg 非微信环境...");
    }
}

WxApi.prototype.createFeedbackButtonByImg = function(left, top, imgUrl, width, height, callBack) {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {

        let button = wx.createFeedbackButton({
            type: 'image',
            image: imgUrl,
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
            }
        });
        button.onTap((res) => {
            if (callBack) {
                callBack(res);
            }
        });
        button.show();
        return button;
    } else {
        console.log("createFeedbackButtonByImg 非微信环境...");
    }
}

WxApi.prototype.getShareInfo = function(title, imageUrl, openId) {
    if (!title) {
        title = "前方高能";
    }
    if (!imageUrl) {
        imageUrl = "https://7072-pro-15ec75-1258808161.tcb.qcloud.la/static/share_01.png?sign=f246f9cc5f05eece2ae92bbd4444cc16&t=1552447069";
    }
    let query = "";
    if (!openId) {
        query = 'openId=' + openId;
    }
    return {
        title: title,
        imageUrl: imageUrl,
        query: query,
        success (res) {
            console.log("分享完成...", res);
        },
        fail (res) {
            console.log("分享失败...", res);
        }
    };
}

WxApi.prototype.showShareMenu = function() {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        wx.showShareMenu({
            withShareTicket: true
        });
    }
}

WxApi.prototype.onShareAppMessage = function(shareInfo) {
    if (!shareInfo) {
        shareInfo = this.getShareInfo();
    }
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        //转发·小程序
        wx.onShareAppMessage(function() {
            return shareInfo;
        });
    } else {
        console.log("onShareAppMessage 非微信环境...");
    }
}

WxApi.prototype.shareAppMessage = function(shareInfo) {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        if (!shareInfo) {
            shareInfo = this.getShareInfo();
        }
        //主动分享
        wx.shareAppMessage(shareInfo);
    } else {
        console.log("shareAppMessage 非微信环境...");
    }
}

WxApi.prototype.showModal = function(title, content) {
    wx.showModal({
        title: title,
        content: content
    });
}

WxApi.prototype.showLoading = function(title) {
    return new Promise(function(resolve, reject) {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            wx.showLoading({
                title: title,
                mask: true,
                success (res) {
                    resolve(res);
                },
                fail (error) {
                    reject(error);
                }
            });
        } else {
            reject('非微信平台');
        }
    });
}

WxApi.prototype.hideLoading = function() {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        wx.hideLoading();
    }
}

WxApi.prototype.showToast = function(msg) {
    wx.showToast({
        title: msg,
        duration: 2000
    })
}



WxApi.prototype.loadVideoAd = function(adUnitId) {
    if (!Global.videoAd && cc.sys.platform == cc.sys.WECHAT_GAME) {
        let rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: adUnitId
        });
        rewardedVideoAd.onLoad(() => {
            console.log('激励视频 广告加载成功');
            Global.videoAd = rewardedVideoAd;
            Global.videoAdLoadCount = 0;
        });
        rewardedVideoAd.onClose(res => {
            console.log('激励视频 广告关闭');
            Global.videoAd = undefined;
        });
        rewardedVideoAd.onError(err => {
            console.log('激励视频 广告加载失败');
            Global.viewAdLoadCount += 1;
            if (Global.viewAdLoadCount < 4) {
                rewardedVideoAd.load();
            }
        })
    }
}

WxApi.prototype.loadBannerAd = function(adUnitId) {
    if (!Global.bannerAd && cc.sys.platform == cc.sys.WECHAT_GAME) {

        let bannerAd = wx.createBannerAd({
            adUnitId: adUnitId,
            style: {
                left: 10,
                top: Global.windowHeight - 180,
                width: Global.windowWidth - 20,
            }
        });
        bannerAd.onError(err => {
            console.log('Banner 广告加载失败', err);
            Global.bannerAdLoadCount += 1;
            if (Global.bannerAdLoadCount < 4) {
                loadBannerAd();
            }
        });
        bannerAd.onLoad(() => {
            console.log('banner 广告加载成功');
            Global.bannerAd = bannerAd;
            Global.viewAdLoadCount = 0;
        });
    }
}

WxApi.prototype.showBannerAd = function() {
    if (Global.bannerAd) {
        Global.bannerAd.show();
    } else {
        loadBannerAd();
    }
}

WxApi.prototype.hideBannerAd = function() {
    if (Global.bannerAd) {
        // Global.bannerAd.hide();
        Global.bannerAd.destroy();
        Global.bannerAd = undefined;
        loadBannerAd();
    } else {
        console.log('不存在资源,无需关闭');
    }
}

WxApi.prototype.post = function(postUrl, params) {
    return new Promise(function(resolve, reject) {
        wx.request({
            url: postUrl,
            method: 'POST',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: params || {},
            success: function(res) {
                resolve(res)
                console.log(`[post ${postUrl}] 调用成功: `, res);
            },
            fail: function(error) {
                reject(error);
                console.log(`[post ${postUrl}] 调用失败: `, error);
            }
        });
    });
}
WxApi.prototype.setUserCloudStorage = function(score) {
    return new Promise(function(resolve, reject) {
        wx.setUserCloudStorage({
            KVDataList: [{
                key: "score",
                value: score + ""
            }],
            success (res) {
                console.log("数据上报成功:", res);
                resolve(res);
            },
            fail (err) {
                console.log("数据上报失败:", err);
                reject(err);
            },
            complete () {
                console.log("数据上报完成");
            }
        });
    });
}

WxApi.prototype.uploadScore = function(score) {
    let that = this;
    // 1、查询成绩 
    // 2、如果没有数据就添加
    // 3、如果有数据判断是否是新纪录
    return new Promise(function(resolve, reject) {
        Global.wxDb.collection('scores').where({
            _openid: Global.openId,
        }).get({
            success (res) {
                if (res.data.length > 0) {
                    let data = res.data[0];
                    let oldScore = data.score;

                    if (oldScore < score) {
                        // 新纪录 更新
                        Global.wxDb.collection('scores').doc(data._id).update({
                            data: {
                                score: score,
                                updateDate: Global.wxDb.serverDate()
                            },
                            success (res) {
                                that.setUserCloudStorage(score);
                                // 新纪录
                                resolve(1);
                            },
                            fail (err) {
                                reject(err);
                            }
                        })
                    } else {
                        resolve(-1);
                    }
                } else {
                    // 无纪录添加数据
                    Global.wxDb.collection('scores').add({
                        data: {
                            score: score,
                            createDate: Global.wxDb.serverDate(),
                            updateDate: Global.wxDb.serverDate()
                        },
                        success (res) {
                            that.setUserCloudStorage(score);
                            // 新纪录
                            resolve(1);
                        },
                        fail (err) {
                            reject(err);
                        }
                    })
                }
            },
            fail (err) {
                reject(err);
            }
        })
    });
}

module.exports = WxApi;