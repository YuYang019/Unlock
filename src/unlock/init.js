function initMixin (Unlock) {
  Unlock.prototype._init = function () {
    this.$dots = []
  }

  Unlock.prototype._initCanvas = function () {
    this.$width = document.body.clientWidth()
  }
  Unlock.prototype._initDots = function () {}
}

export default initMixin
