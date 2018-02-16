import coreMixin from './unlock/core'
import initMixin from './unlock/init'
import drawMixin from './unlock/draw'
import { $, warn, merge, _ } from './utils'

const defaultStyle = {
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

const defaultSet = {
  beforeRepeat: function () {}
}

function Unlock (options) {
  if (!_.isObject(options)) {
    warn('the options should be a object')
  }
  this.$options = options
  this.$style = options.style ? merge(defaultStyle, options.style) : defaultStyle
  this.$el = typeof options.el === 'string' ? $(options.el) : options.el
  this.$set = options.set ? merge(defaultSet, options.set) : defaultSet
  if (!this.$el) {
    warn('can not resolve wrapper dom')
  }

  this._init()
}

drawMixin(Unlock)
coreMixin(Unlock)
initMixin(Unlock)

export default Unlock

// const commonStyle = {
//   bgColor: '#fff',
//   dotColor: '#e6e6e6',
//   dotRadius: 5,
//   lineWidth: 10,
//   statusColor: {
//     'default': {
//       line: 'rgba(0, 0, 0, 0.3)',
//       dot: 'rgba(0, 0, 0, 0.6)'
//     },
//     'error': {
//       line: 'rgba(255, 0, 0, 0.3)',
//       dot: 'rgba(255, 0, 0, 0.6)'
//     },
//     'success': {
//       line: 'rgba(0, 255, 0, 0.3)',
//       dot: 'rgba(0, 255, 0, 0.6)'
//     }
//   }
// }

// const lock = new Unlock({
//   el: '#container',
//   set: {
//     beforeRepeat() {
//       console.log('请再次输入')
//     }
//   },
//   style: commonStyle,
// })

// btn.onClick = () => {
//   lock
//     .set()
//     .success((pw) => { console.log('1') })
//     .error(() => { console.log('2') })
// }

// btn2.onClick = () => {
//   const pw = localStorage.getItem('pw')
//   lock
//     .check(pw)
//     .success(() => { console.log('1') })
//     .fail(() => { console.log('2') })
// }

// btn3.onClick = () => {
//   lock.reset()
// }
