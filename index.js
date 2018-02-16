import Unlock from './src'

const unlock = new Unlock({
  el: '#canvas-wrapper',
  set: {
    beforeRepeat: function () {
      console.log('请再次输入密码')
    }
  },
  style: {
    bgColor: '#fff',
    dotColor: '#e6e6e6',
    dotRadius: 5,
    lineWidth: 10,
    statusColor: {
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
  }
})

const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')
const btn3 = document.getElementById('btn3')

const pw = '123456'

btn1.onclick = function () {
  unlock
    .check(pw)
    .success(() => { console.log('check success') })
    .fail(() => { console.log('check fail') })
}

btn2.onclick = function () {
  unlock
    .set()
    .success((pw) => { console.log(pw) })
    .fail(() => { console.log('set fail') })
}

btn3.onclick = function () {
  unlock.reset()
}

window.unlock = unlock
