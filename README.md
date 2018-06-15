## Unlock

一个玩具手势解锁库，基于canvas实现，定位是提供基本的验证和设置功能

## demo

![Image text](https://github.com/maoyuyang/Unlock/blob/master/demo.gif)

## usage

```
const unlock = new Unlock('#canvas-wrapper', {
  set: {
    // 设置第一次后的回调
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

### tips
验证和设置之间是没有逻辑关系的，设置密码后仅会触发参数为密码的回调，之后的具体逻辑，比如跳到验证，还是其他的需要自己实现，这也是出于设计考虑

### 原理

基本原理就是监听事件，然后连线。canvas分两层，底层放九个基本点，顶层放连的线。分三层似乎更好，但是懒得弄了

靠近某个点时跳到该点上的效果的原理，就是在每一帧计算当前触摸点与9个基本点的距离，找到最小的，并且距离小于某一值时，将该点加入队列，下一帧就绘制出来

连接顺序的实现，就是内部维护了一个基本点的队列，连到哪就把对应基本点添加到队列，不可重复添加

验证就更简单，就是对比两次的值

### 总结

这次写这个，就是觉得好玩，想试试，熟悉canvas。。一开始，是意识流的写法，代码写成一坨，但写的很快。

真正花的时间都在重构上，思考这个东西应该暴露出什么api才好用

一开始想做成那种大而全的东西，对外不提供什么接口。但发现这样用体验不好，一是太黑盒，二是对于不同的场景来说，封装的东西肯定不能满足多种多样的场景

所以，把思路调整了一下，只提供基本的绘制功能，对外提供几个基本的接口。更复杂的功能，需要自己弄。

接口的确定，也颇费脑筋。因为以前完全没用过类似的库，github上找了一下也没找到什么。只能从使用者角度脑补了一下，拿出我的手机的手势解锁来对比－ － 。一些交互的细节都是来自手机的解锁 - -

之后确定了提供设置和验证两个基本功能，。然后又思考了一下接口怎么用才爽，最后确定链式调用。

至于实现，有些地方我感觉实现的挺挫的，但是能力有限，想不到好的了。等以后再来改

### todos

样式更加可定制化
