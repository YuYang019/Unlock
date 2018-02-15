import { includes, getDistance } from '../utils'

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

  let startDot = null
  let loading = false

  Unlock.prototype.handleTouchStart = function (e) {
    startDot = null
    this.$history = []
    this.clear(this.$topCanvas)

    if (loading) return

    const point = this.getCanvasPoint(this.$topCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    startDot = this.findNearDot(point)

    if (startDot) this.addHistory(startDot)
  }

  Unlock.prototype.handleTouchMove = function (e) {
    if (!startDot || loading) return

    this.clear(this.$topCanvas)

    const topCtx = this.$topCanvas.getContext('2d')
    const now = this.getCanvasPoint(this.$topCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    const nearDot = this.findNearDot(now)

    if (nearDot) {
      this.drawNewLine(topCtx, startDot, nearDot)
      this.addHistory(nearDot)
      startDot = nearDot
    } else {
      this.drawNewLine(topCtx, startDot, now)
    }
  }

  Unlock.prototype.handleTouchEnd = function (e) {
    this.clear(this.$topCanvas)

    if (this.$history.length <= 1 || loading) return

    loading = true
    this.check()
    setTimeout(() => {
      startDot = null
      loading = false
      this.$history = []
      this.clear(this.$topCanvas)
    }, 3000)
  }

  const pw = '123456789'
  Unlock.prototype.check = function () {
    const history = this.$history
    const result = history.map(item => item.index).join('')
    if (pw === result) {
      this.drawSuccessLine()
    } else {
      this.drawErrorLine()
    }
  }
}

export default coreMixin
