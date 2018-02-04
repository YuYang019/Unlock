import coreMixin from './unlock/core'
import initMixin from './unlock/init'
import { $, warn, merge } from './utils'

function Unlock (options, styleOptions) {
  this.$options = merge(options, styleOptions)
  this.$el = typeof this.$options.el === 'string' ? this.$options.el : $(this.$options.el)
  if (!this.$el) {
    warn('can not resolve wrapper dom')
  }

  this._init()
}

Unlock.styleOptions = {
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

initMixin(Unlock)
coreMixin(Unlock)

export default Unlock
