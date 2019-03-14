let Slider = require("../common/Slider");
let Dialog = require("../Dialog");
cc.Class({
    extends: cc.Component,

    properties: {
        loadingProgress: {
            default: null,
            type: Slider,
            tooltip: "加载进度条"
        },
    },


    // onLoad () {},

    start () {

    },
    loadScene (sceneName) {
        let that = this;
        cc.director.preloadScene(sceneName, function(completedCount, totalCount, item) {
            that.setLoadingProgress(completedCount / totalCount)
        }, function(error, asset) {
            if (error) {
                return
            }
            cc.director.loadScene(sceneName);
            Dialog.hiddenLoadingDialog(that.node);
        });
    },
    setLoadingProgress (progress) {
        this.loadingProgress.setProgress(progress);
    },
    // update (dt) {},
});