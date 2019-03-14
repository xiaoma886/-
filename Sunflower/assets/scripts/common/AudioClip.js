/**
 * @author Javen 
 * @copyright 2018-10-31 16:24:42 javendev@126.com 
 * @description  音效与背景音乐组件
 */
var Global = require("./Global");
cc.Class({
    extends: cc.Component,
    properties: {
        onClickAudio: {
            default: null,
            tooltip: "按钮点击音效",
            type: cc.AudioClip,
        },
        logoAudio: {
            default: null,
            tooltip: "前方高能音效",
            type: cc.AudioClip
        },
        bgmAudio: {
            default: null,
            tooltip: "背景音效",
            type: cc.AudioClip
        },
    },

    playClickAudio () {
        if (Global.isAudio) {
            cc.audioEngine.play(this.onClickAudio, false, 1);
        }
    },
    playLogoAudio () {
        cc.audioEngine.play(this.logoAudio, false, 1);
    },
    playBgmAudio () {
        if (Global.isAudio && (!this.bgmAudioId || this.getState(this.bgmAudioId) != cc.audioEngine.AudioState.PLAYING)) {
            this.bgmAudioId = cc.audioEngine.play(this.bgmAudio, true, 1);
        }
    },

    //暂停现在正在播放的所有音频
    pauseAll () {
        cc.audioEngine.pauseAll();
    },
    //恢复播放所有之前暂停的所有音频
    resumeAll () {
        cc.audioEngine.resumeAll();
    },
    stopAll () {
        cc.audioEngine.stopAll();
    },
    getState (id) {
        return cc.audioEngine.getState(id);
    },

    // onLoad() {},
    // start () {},

    // update (dt) {},
});