import { addEvent } from '../utils'
import { DEFAULT_MODE } from '../constants'

const w = document.body.clientWidth

function initMixin (Unlock) {
  Unlock.prototype._init = function () {
    this.$d = Math.round(w / 4)
    this.$dots = []
    this.$history = []
    this.$mode = DEFAULT_MODE

    this._initDots()
    this._initCanvas()
    this._initEvent()
  }

  Unlock.prototype._initCanvas = function () {
    const bottomCanvas = document.createElement('canvas')
    const topCanvas = document.createElement('canvas')

    this.$el.style.position = 'relative'
    this.$el.style.width = `${w}px`
    this.$el.style.height = `${w}px`

    bottomCanvas.width = w
    bottomCanvas.height = w
    bottomCanvas.style.position = 'absolute'
    bottomCanvas.style.top = 0
    bottomCanvas.style.left = 0

    topCanvas.width = w
    topCanvas.height = w
    topCanvas.style.position = 'absolute'
    topCanvas.style.top = 0
    topCanvas.style.left = 0

    this.$el.appendChild(bottomCanvas)
    this.$el.appendChild(topCanvas)

    this.$bottomCanvas = bottomCanvas
    this.$topCanvas = topCanvas

    this.drawDots(this.$dots, bottomCanvas.getContext('2d'))
  }

  Unlock.prototype._initDots = function () {
    let num = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.$dots.push({
          x: this.$d * (j + 1),
          y: this.$d * (i + 1),
          index: ++num
        })
      }
    }
  }

  Unlock.prototype._initEvent = function () {
    addEvent(this.$topCanvas, 'touchstart', this.handleTouchStart.bind(this), { passive: false })
    addEvent(this.$topCanvas, 'touchmove', this.handleTouchMove.bind(this), { passive: false })
    addEvent(this.$topCanvas, 'touchend', this.handleTouchEnd.bind(this), { passive: false })
  }
}

export default initMixin
