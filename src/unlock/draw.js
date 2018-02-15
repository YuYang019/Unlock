const PI = Math.PI
const w = document.body.clientWidth

function drawMixin (Unlock) {
  Unlock.prototype.drawDots = function (dots, ctx) {
    dots.forEach((dot) => {
      const radius = this.$style.dotRadius
      this.drawArc(ctx, dot.x, dot.y, radius)
    })
  }

  Unlock.prototype.drawArc = function (ctx, x, y, radius) {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * PI)
    ctx.fillStyle = this.$style.dotColor
    ctx.fill()
  }

  Unlock.prototype.drawLine = function (ctx, old, now, type) {
    now = now || old
    type = type || 'default'

    const lineColor = this.$style.statusColor[type].line
    const dotColor = this.$style.statusColor[type].dot
    const lineWidth = this.$style.lineWidth

    ctx.strokeStyle = lineColor
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(old.x, old.y)
    ctx.lineTo(now.x, now.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(old.x, old.y, 5, 0, 2 * PI)
    ctx.arc(now.x, now.y, 5, 0, 2 * PI)
    ctx.fillStyle = dotColor
    ctx.fill()
  }

  // 当滑动到某个最近的点时，按照记录依次连接，最后连接最新的线
  Unlock.prototype.drawNewLine = function (ctx, old, now) {
    if (!old || !now) return
    if (this.$history.length) {
      for (let i = 0; i < this.$history.length; i++) {
        this.drawLine(ctx, this.$history[i], this.$history[i + 1])
      }
    }
    this.drawLine(ctx, old, now)
  }

  Unlock.prototype.clear = function (canvas) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, w)
  }

  Unlock.prototype.drawErrorLine = function () {
    const history = this.$history
    const topCtx = this.$topCanvas.getContext('2d')
    this.clear(this.$topCanvas)
    if (history.length) {
      for (let i = 0; i < history.length; i++) {
        this.drawLine(topCtx, history[i], history[i + 1], 'error')
      }
    }
  }

  Unlock.prototype.drawSuccessLine = function () {
    const history = this.$history
    const topCtx = this.$topCanvas.getContext('2d')
    this.clear(this.$topCanvas)
    if (history.length) {
      for (let i = 0; i < history.length; i++) {
        this.drawLine(topCtx, history[i], history[i + 1], 'success')
      }
    }
  }
}

export default drawMixin
