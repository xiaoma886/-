cc.Class({
    extends: cc.Component,
    properties: {
        zIndex: {
            type: cc.Integer,
            default: 0,
            //使用notify函数监听属性变化
            notify (oldValue) {
                if (oldValue === this.zIndex) {
                    return;
                }
                this.node.zIndex = this.zIndex;
            }
        }
    },
    onLoad () {
        this.node.zIndex = this.zIndex;
    }
});