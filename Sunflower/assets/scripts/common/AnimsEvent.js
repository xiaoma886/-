/**
 * @author Javen 
 * @copyright 2018-10-31 16:24:02 javendev@126.com 
 * @description 动画执行回调
 */

cc.Class({
    extends: cc.Component,

    // onLoad () {},

    // start () {},

    // update (dt) {},

    animDone () {
        this.node.emit('logoAnimDone', {
            msg: 'logo动画播放完成',
        });
    },
});