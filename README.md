## Unlock

一个玩具手势解锁，基于canvas实现

## usage

```
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

// 验证密码
btn1.onclick = function () {
  unlock
    .check(pw)
    .success(() => { console.log('check success') })
    .fail(() => { console.log('check fail') })
}

// 设置密码
btn2.onclick = function () {
  unlock
    .set()
    // 成功后，回调函数参数为设置的密码
    .success((pw) => { console.log(pw) })
    .fail(() => { console.log('set fail') })
}

// 重设密码
btn3.onclick = function () {
  unlock.reset()
}
```

## options

### el

最外层canvas容器

### set

#### beforeRepeat

在设置密码时，第一次设置后，第二次之前触发的回调函数。

### style

设置样式

## api

部分可链式调用，参见usage

### unlock.check(password)

开启验证模式，参数为要验证的密码

### unlock.set()

开启设置模式

### unlock.reset()

当两次设置密码不一致时，重新设置

### unlock.success(fn)

成功时调用对应方法

### unlock.fail(fn)

失败时调用对应方法

