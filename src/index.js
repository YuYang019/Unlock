import coreMixin from './unlock/core'
import initMixin from './unlock/init'
import { $, warn } from './utils'

function Unlock (el, options) {
  this.$el = typeof el === 'string' ? $(el) : el
  if (!this.$el) {
    warn('can not resolve wrapper dom')
  }

  this._init(options)
}

initMixin(Unlock)
coreMixin(Unlock)

export default Unlock
