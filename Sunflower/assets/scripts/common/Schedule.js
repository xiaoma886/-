/*
 * @author: Javen 
 * @date: 2018-09-14 20:45:14 
 * @description 倒计时工具类
 */

cc.Class({
    extends: cc.Component,

    properties: {
        _scheduleTime: 3,
        scheduleTime: {
            type: cc.Integer,
            tooltip: "倒计时时间(单位秒)",
            get() {
                return this._scheduleTime;
            },
            set(seconds) {
                this._scheduleTime = seconds;
                this.node.getComponent(cc.Label).string = seconds;
            }
        },
        emitNode: {
            default: null,
            type: cc.Node,
            tooltip: "发射事件",
        }
    },


    // onLoad () {},

    // start() {},
    setTime (seconds) {
        cc.log("设置倒计时:" + seconds);
        if (seconds <= 0) return;
        this.scheduleTime = seconds;
        this.callback = function() {
            let name = this.emitNode.name;
            if (this.scheduleTime <= 0) {
                this.unSchedule();
                this.node.emit(name, {
                    msg: name + '倒计时执行完成...',
                });
                return;
            }
            this.scheduleTime -= 1;
        };
        this.schedule(this.callback, 1);
    },
    /**
     * 取消倒计时
     */
    unSchedule () {
        this.unschedule(this.callback);
        return this.getTime();
    },
    getTime () {
        return this._scheduleTime;
    },

    onDestroy () {
        this.unschedule(this.callback);
        console.log(this.emitNode.name + " 销毁了倒计时...");
    }

    // update (dt) {},
});