import { addEvent, removeEvent } from '../utils/index'
import { createCanvas } from '../utils/dom'
import { DEFAULT_MODE } from '../constants/index'

const w = document.body.clientWidth

function initMixin (Unlock) {
  Unlock.prototype._init = function () {
    this.$d = this._elWidth ? Math.round(this._elWidth / 4) : Math.round(w / 4) // 两点间距离
    this.$dots = []
    this.$history = []
    this.$mode = DEFAULT_MODE

    this._initDots()
    this._initCanvas()
    this._addDomEvent()
  }

  Unlock.prototype._initCanvas = function () {
    this.$el.style.position = 'relative'
    if (this._elWidth === 0) {
      this.$el.style.width = `${w}px`
      this._elWidth = w
    }
    if (this._elHeight === 0) {
      this.$el.style.height = `${w}px`
      this._elHeight = w
    }
    if (this.$options.style.bgColor) {
      this.$el.style.backgroundColor = this.$options.style.bgColor
    }

    this.$bottomCanvas = createCanvas(this._elWidth, this._elHeight)
    this.$topCanvas = createCanvas(this._elWidth, this._elHeight)

    this.$el.appendChild(this.$bottomCanvas)
    this.$el.appendChild(this.$topCanvas)

    this.drawDots(this.$dots, this.$bottomCanvas.getContext('2d'))
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

  Unlock.prototype._addDomEvent = function () {
    this._initEvent(addEvent)
  }

  Unlock.prototype._removeDomEvent = function () {
    this._initEvent(removeEvent)
  }

  Unlock.prototype._initEvent = function (eventOperator) {
    if (this.$options.click) {
      eventOperator(this.$topCanvas, 'mousedown', this)
      eventOperator(this.$topCanvas, 'mousemove', this)
      eventOperator(this.$topCanvas, 'mouseup', this)
    }
    eventOperator(this.$topCanvas, 'touchstart', this)
    eventOperator(this.$topCanvas, 'touchmove', this)
    eventOperator(this.$topCanvas, 'touchend', this)
  }

  Unlock.prototype.handleEvent = function (e) {
    switch (e.type) {
      case 'mousedown':
      case 'touchstart':
        this._start(e)
        break
      case 'mousemove':
      case 'touchmove':
        this._move(e)
        break
      case 'mouseup':
      case 'touchend':
        this._end(e)
    }
  }
}

export default initMixin
