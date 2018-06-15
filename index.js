import Unlock from './src'

const unlock = new Unlock('#canvas-wrapper', {
  set: {
    beforeRepeat: function () {
      console.log('请再次输入密码')
    }
  },
  style: {
    bgColor: '#fff',
    dotColor: '#e6e6e6',
    dotRadius: 5,
    lineWidth: 10
  }
})

const btn1 = document.getElementById('btn1')
const btn2 = document.getElementById('btn2')
const btn3 = document.getElementById('btn3')
const tips = document.getElementById('tips')

const pw = '123456'

btn1.onclick = function () {
  tips.innerHTML = '当前为：验证密码'
  unlock
    .check(pw)
    .success(() => { console.log('check success') })
    .fail(() => { console.log('check fail') })
}

btn2.onclick = function () {
  tips.innerHTML = '当前为：设置密码'
  unlock
    .set()
    .success((pw) => { console.log('设置成功, 密码为', pw) })
    .fail(() => { console.log('两次设置不一致') })
}

btn3.onclick = function () {
  tips.innerHTML = '当前为：重设密码'
  unlock.reset()
}

window.unlock = unlock
