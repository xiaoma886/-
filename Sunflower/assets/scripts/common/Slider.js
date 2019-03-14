cc.Class({
    extends: cc.Component,

    properties: {
        mask: {
            default: null,
            type: cc.Mask
        },
        _width: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let slider = this.getComponent(cc.Slider);
        slider.enabled = false;
        this._slider = this;

        if (slider == null || this.mask == null) {
            return;
        }
        this._width = this.mask.node.width;
        this.mask.node.width = this._width * slider.progress;

        // let self = this;
        // slider.node.on('slide', function (event) {
        //     self.mask.node.width = self._width * slider.progress;
        // }, this);

        if (this.currentProgress) {
            this.setProgress(this.currentProgress);
        }
    },
    /**
     * 设置进度 0~1
     * @param {*} progress 
     */
    setProgress (progress) {
        this._slider.progress = progress;
        this.mask.node.width = this._width * this._slider.progress;
    },


    // start() {},

    // update (dt) {},
});