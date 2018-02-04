import { addEvent } from './src/utils'

const bottomCanvas = document.getElementById('bottom-canvas')
const midCanvas = document.getElementById('mid-canvas')
// const topCanvas = document.getElementById('top-canvas')

const bottomCtx = bottomCanvas.getContext('2d')
const midCtx = midCanvas.getContext('2d')
// const topCtx = topCanvas.getContext('2d')

const clientWidth = document.body.clientWidth
const d = Math.round(clientWidth / 4)
const dots = []

const tips = document.querySelector('.tips')

bottomCanvas.width = clientWidth
bottomCanvas.height = clientWidth

midCanvas.width = clientWidth
midCanvas.height = clientWidth

const PI = Math.PI

const log = console.log.bind(console)

let num = 0

const pw = '123456789'

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    dots.push({
      x: d * (j + 1),
      y: d * (i + 1),
      index: ++num
    })
  }
}

function drawDot (arr) {
  arr.forEach((dot) => {
    const radius = 5
    arc(bottomCtx, dot.x, dot.y, radius)
  })
}

// 数组里是否包含某个obj, 仅判断一层
function includes (arr, obj) {
  if (arr.includes(obj)) {
    return true
  }
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const keys = Object.keys(obj)
    const itemKeys = Object.keys(item)
    if (keys.length !== itemKeys.length) {
      continue
    }
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j]
      if (item[key] !== obj[key]) {
        break
      }
      if (j === keys.length - 1 && i === arr.length - 1) {
        return true
      }
    }
  }
  return false
}

function arc (ctx, x, y, radius) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * PI)
  ctx.fillStyle = '#e6e6e6'
  ctx.fill()
}

const colorMap = {
  'default': {
    line: 'rgba(0, 0, 0, 0.3)',
    dot: 'rgba(0, 0, 0, 0.6)'
  },
  'error': {
    line: 'rgba(255, 0, 0, 0.3)',
    dot: 'rgba(255, 0, 0, 0.6)'
  },
  'success': {
    line: 'rgba(0, 255, 0, 0.3)',
    dot: 'rgba(0, 255, 0, 0.6)'
  }
}

function line (ctx, old, now, type) {
  now = now || old
  type = type || 'default'
  const lineColor = colorMap[type].line
  const dotColor = colorMap[type].dot
  ctx.strokeStyle = lineColor
  ctx.lineWidth = 10
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

let start = {}

function getCanvasPoints (canvas, x, y) {
  let rect = canvas.getBoundingClientRect()
  return {
    x: x - rect.left,
    y: y - rect.top
  }
}

function distance (a, b) {
  const x2 = Math.pow(a.x - b.x, 2)
  const y2 = Math.pow(a.y - b.y, 2)
  return Math.sqrt(x2 + y2)
}

// 找最近的点，且已在历史里的点不可获取
function findNearDot (now) {
  let minDistance = Math.sqrt(2 * d * d) / 6
  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i]
    const temp = distance(dot, now)
    if (temp < minDistance && !includes(history, dot)) {
      return dot
    }
  }
  return null
}

// 判断两点是否在同一水平线或竖直线或对角线，返回直线类型
function judgeLine (dot1, dot2) {
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

function addNearLine (ctx, old, now) {
  if (!old || !now) return
  if (history.length) {
    for (let i = 0; i < history.length; i++) {
      line(ctx, history[i], history[i + 1])
    }
  }
  line(ctx, old, now)
}

let history = []
let loading = false

function addHistory (dot) {
  if (!includes(history, dot)) {
    const beforeDot = history[history.length - 1]
    const judeResult = judgeLine(dot, beforeDot)
    if (history.length >= 1 || (judeResult && judeResult.bool)) {
      switch (judeResult.type) {
        case 'horizontal':
          fixHorizontalLine(dot, beforeDot)
          break
        case 'vertical':
          fixVerticalLine(dot, beforeDot)
          break
        case 'diagonal':
          fixDiagonalLine(dot, beforeDot)
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
function fixHorizontalLine (now, before) {
  // 如果两点距离大于单位距离,添加中间的点
  if (Math.abs(now.x - before.x) > d) {
    const midIndex = getMidIndex(now, before)
    if (!includes(history, dots[midIndex])) {
      history.push(dots[midIndex])
    }
  }
  history.push(now)
}

// 垂直线是否有点未被选，没选则添
function fixVerticalLine (now, before) {
  if (Math.abs(now.y - before.y) > d) {
    const midIndex = getMidIndex(now, before)
    if (!includes(history, dots[midIndex])) {
      history.push(dots[midIndex])
    }
  }
  history.push(now)
}

// 对角线是否有点未被选，没选则添
function fixDiagonalLine (now, before) {
  if (Math.abs(now.x - before.x) > d) {
    const midIndex = getMidIndex(now, before)
    if (!includes(history, dots[midIndex])) {
      log(dots[midIndex], history)
      history.push(dots[midIndex])
    }
  }
  history.push(now)
}

function getMidIndex (now, before) {
  const nowIndex = dots.indexOf(now)
  const beforeIndex = dots.indexOf(before)
  const midIndex = (nowIndex + beforeIndex) / 2

  return midIndex
}

addEvent(midCanvas, 'touchstart', (e) => {
  start = ''
  history = []
  midCtx.clearRect(0, 0, clientWidth, clientWidth)
  if (loading) return
  const point = getCanvasPoints(midCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  start = findNearDot(point)
  if (start) addHistory(start)
}, { passive: false })

addEvent(midCanvas, 'touchmove', (e) => {
  if (!start || loading) return
  midCtx.clearRect(0, 0, clientWidth, clientWidth)
  const now = getCanvasPoints(midCanvas, e.changedTouches[0].clientX, e.changedTouches[0].clientY)
  const nearDot = findNearDot(now)
  if (nearDot) {
    addNearLine(midCtx, start, nearDot)
    addHistory(nearDot)
    start = nearDot
  } else {
    addNearLine(midCtx, start, now)
  }
}, { passive: false })

addEvent(midCanvas, 'touchend', (e) => {
  midCtx.clearRect(0, 0, clientWidth, clientWidth)
  if (history.length <= 1 || loading) return
  loading = true
  check()
  setTimeout(() => {
    start = ''
    loading = false
    log(history)
    history = []
    midCtx.clearRect(0, 0, clientWidth, clientWidth)
  }, 3000)
}, { passive: false })

function check () {
  const result = history.map(item => item.index).join('')
  if (pw === result) {
    log('正确')
    drawSuccessLine()
  } else {
    log('错误')
    drawErrorLine()
  }
}

function drawErrorLine () {
  midCtx.clearRect(0, 0, clientWidth, clientWidth)
  if (history.length) {
    for (let i = 0; i < history.length; i++) {
      line(midCtx, history[i], history[i + 1], 'error')
    }
  }
  tips.innerHTML = '密码错误，请重试'
}

function drawSuccessLine () {
  midCtx.clearRect(0, 0, clientWidth, clientWidth)
  if (history.length) {
    for (let i = 0; i < history.length; i++) {
      line(midCtx, history[i], history[i + 1], 'success')
    }
  }
  tips.innerHTML = '密码正确'
}

drawDot(dots)
