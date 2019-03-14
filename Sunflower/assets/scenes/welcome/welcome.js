cc.Class({
  extends: cc.Component,

  properties: {
    audio: {
      default: null,
      type: cc.Node
    },
    logoNode: {
      default: null,
      type: cc.Node
    }
  },

  // onLoad() {},

  start() {
    //常驻节点设置音效
    cc.game.addPersistRootNode(this.audio);
    this.audioClip = this.audio.getComponent("AudioClip");
    this.audioClip.playLogoAudio();

    this.logoNode.on('logoAnimDone', function (event) {
      this.animDone();
    }.bind(this));
  },

  animDone: function () {
    cc.director.loadScene("Loading");
  },
  // update (dt) {},
});