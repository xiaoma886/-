cc.Class({
    extends: cc.Component,

    start () {
        // cc.debug.setDisplayStats(false);

        try {
            //获取音效组件
            this._audioClip = cc.find("globalAudio").getComponent("AudioClip");
        } catch (error) {}

    },

});