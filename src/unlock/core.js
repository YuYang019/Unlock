import { includes, getDistance, warn, _ } from '../utils/index'
import { DEFAULT_MODE, SET_MODE, CHECK_MODE } from '../constants/index'

let CHECK_PASSWORD = '' // 密码放在全局
let startDot = null // 最开始连线的点
let loading = false
let firstPassword = '' // set模式下，第一次设置的密码
let isFirst = true // set模式下，是否是第一次设置

function coreMixin (Unlock) {
  Unlock.prototype.getCanvasPoint = function (canvas, x, y) {
    let rect = canvas.getBoundingClientRect()
    return {
      x: x - rect.left,
      y: y - rect.top
    }
  }

  // 找最近的点，且已在历史里的点不可获取
  Unlock.prototype.findNearDot = function (now) {
    const d = this.$d
    const dots = this.$dots
    const history = this.$history
    // 对角线长度的1/6
    let minDistance = Math.sqrt(2 * d * d) / 6
    for (let i = 0; i < dots.length; i++) {
      const dot = this.$dots[i]
      const d = getDistance(dot, now)
      if (d < minDistance && !includes(history, dot)) {
        return dot
      }
    }
    return null
  }

  // 判断两点是否在同一水平线或竖直线或对角线，返回直线类型
  Unlock.prototype.getLineType = function (dot1, dot2) {
    const result = {}
    if (!dot2) return
    if (dot1.y === dot2.y) {
      result.bool = true
      result.type = 'horizontal'
    } else if (dot1.x === dot2.x) {
      result.bool = true
      result.type = 'vertical'
    } else if (Math.abs((dot1.x - dot2.x) / (dot1.y - dot2.y)) === 1) {
      result.bool = true
      result.type = 'diagonal'
    } else {
      result.bool = false
      result.type = 'default'
    }
    return result
  }

  Unlock.prototype.addHistory = function (dot) {
    const history = this.$history

    if (!includes(history, dot)) {
      const beforeDot = history[history.length - 1]
      const lineType = this.getLineType(dot, beforeDot)
      if (history.length >= 1 || (lineType && lineType.bool)) {
        switch (lineType.type) {
          case 'horizontal':
            this.fixHorizontalLine(dot, beforeDot)
            break
          case 'vertical':
            this.fixVerticalLine(dot, beforeDot)
            break
          case 'diagonal':
            this.fixDiagonalLine(dot, beforeDot)
            break
          default:
            history.push(dot)
        }
      } else {
        history.push(dot)
      }
    }
  }

  // 水平线是否有点未被选，没选则添
  Unlock.prototype.fixHorizontalLine = function (now, before) {
    const history = this.$history
    const d = this.$d
    const dots = this.$dots
    // 如果两点距离大于单位距离,添加中间的点
    if (Math.abs(now.x - before.x) > d) {
      const midIndex = this.getMidIndex(now, before)
      if (!includes(history, dots[midIndex])) {
        history.push(dots[midIndex])
      }
    }
    history.push(now)
  }

  // 垂直线是否有点未被选，没选则添
  Unlock.prototype.fixVerticalLine = function (now, before) {
    const history = this.$history
    const d = this.$d
    const dots = this.$dots
    if (Math.abs(now.y - before.y) > d) {
      const midIndex = this.getMidIndex(now, before)
      if (!includes(history, dots[midIndex])) {
        history.push(dots[midIndex])
      }
    }
    history.push(now)
  }

  // 对角线是否有点未被选，没选则添
  Unlock.prototype.fixDiagonalLine = function (now, before) {
    const history = this.$history
    const d = this.$d
    const dots = this.$dots
    if (Math.abs(now.x - before.x) > d) {
      const midIndex = this.getMidIndex(now, before)
      if (!includes(history, dots[midIndex])) {
        history.push(dots[midIndex])
      }
    }
    history.push(now)
  }

  Unlock.prototype.getMidIndex = function (now, before) {
    const dots = this.$dots

    const nowIndex = dots.indexOf(now)
    const beforeIndex = dots.indexOf(before)
    const midIndex = (nowIndex + beforeIndex) / 2

    return midIndex
  }

  Unlock.prototype._start = function (e) {
    startDot = null
    this.$history = []
    this.clear(this.$topCanvas)

    if (loading) return

    const pos = {
      x: e.clientX || e.changedTouches[0].clientX,
      y: e.clientY || e.changedTouches[0].clientY
    }

    const point = this.getCanvasPoint(this.$topCanvas, pos.x, pos.y)
    startDot = this.findNearDot(point)

    if (startDot) this.addHistory(startDot)
  }

  Unlock.prototype._move = function (e) {
    if (!startDot || loading) return

    this.clear(this.$topCanvas)

    const pos = {
      x: e.clientX || e.changedTouches[0].clientX,
      y: e.clientY || e.changedTouches[0].clientY
    }

    const topCtx = this.$topCanvas.getContext('2d')
    const now = this.getCanvasPoint(this.$topCanvas, pos.x, pos.y)
    const nearDot = this.findNearDot(now)

    if (nearDot) {
      this.drawNewLine(topCtx, startDot, nearDot)
      this.addHistory(nearDot)
      // 更新起始点
      startDot = nearDot
    } else {
      this.drawNewLine(topCtx, startDot, now)
    }
  }

  Unlock.prototype._end = function (e) {
    this.clear(this.$topCanvas)

    if (this.$history.length <= 1 || loading) return

    loading = true

    this.drawHistoryLine(this.$topCanvas.getContext('2d'))

    switch (this.$mode) {
      case DEFAULT_MODE:
        this.handleDefaultMode()
        break
      case CHECK_MODE:
        this.handleCheckMode()
        break
      case SET_MODE:
        this.handleSetMode()
        break
      default:
        warn('unknown mode')
    }
  }

  Unlock.prototype.handleDefaultMode = function () {
    setTimeout(() => {
      startDot = null
      loading = false
      this.$history = []
      this.clear(this.$topCanvas)
    }, this.$options.intervalTime)
  }

  Unlock.prototype.handleCheckMode = function () {
    const history = this.$history
    const result = history.map(item => item.index).join('')

    if (CHECK_PASSWORD === result) {
      this._success && this._success.call()
      this.drawSuccessLine()
      // CHECK_PASSWORD = ''
    } else {
      this._fail && this._fail.call()
      this.drawErrorLine()
      // CHECK_PASSWORD = ''
    }

    setTimeout(() => {
      this.reset()
    }, this.$options.intervalTime)
  }

  Unlock.prototype.handleSetMode = function () {
    const history = this.$history
    const password = history.map(item => item.index).join('')

    if (isFirst) {
      isFirst = false
      firstPassword = password
      setTimeout(() => {
        this._resetAll(false)
      }, this.$options.intervalTime)
      return this.$options.set.beforeRepeat.call()
    }

    if (password === firstPassword) {
      this._success && this._success.call(null, password)
      this.drawSuccessLine()
      setTimeout(() => {
        this._resetAll(true)
      }, this.$options.intervalTime)
    } else {
      this._fail && this._fail.call()
      this.drawErrorLine()
      setTimeout(() => {
        this._resetAll(false)
      }, this.$options.intervalTime)
    }
  }

  Unlock.prototype.set = function () {
    this._fail = null
    this._success = null
    this.$mode = SET_MODE

    return this
  }

  Unlock.prototype.reset = function () {
    this._resetAll(true)
  }

  Unlock.prototype._resetAll = function (all) {
    if (all) {
      firstPassword = ''
      isFirst = true
    }
    startDot = null
    loading = false
    this.$history = []
    this.clear(this.$topCanvas)
  }

  Unlock.prototype.check = function (password) {
    this._fail = null
    this._success = null
    this.$mode = CHECK_MODE
    CHECK_PASSWORD = password

    return this
  }

  Unlock.prototype.success = function (fn) {
    if (!_.isFunction(fn)) warn('the callback should be a function')
    this._success = fn

    return this
  }

  Unlock.prototype.fail = function (fn) {
    if (!_.isFunction(fn)) warn('the callback should be a function')
    this._fail = fn

    return this
  }
}

export default coreMixin
