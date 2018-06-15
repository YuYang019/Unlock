export function addEvent (el, type, handler, options) {
	if (el.addEventListener) {
		el.addEventListener(type, handler, options)
	} else if (el.attachEvent) {
		el.attachEvent('on' + type, handler)
	} else {
		el['on' + type] = handler
	}
}

export function removeEvent (el, type, handler) {
	if (el.addEventListener) {
		el.removeEventListener(type, handler, false)
	} else if (el.attachEvent) {
		el.detachEvent('on' + type, handler)
	} else {
		el['on' + type] = null
	}
}

export function $ (el) {
	return document.querySelector(el)
}

// 数组里是否包含某个obj, 仅判断一层
export function includes (arr, obj) {
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

export function getDistance (a, b) {
  const x2 = Math.pow(a.x - b.x, 2)
  const y2 = Math.pow(a.y - b.y, 2)
  return Math.sqrt(x2 + y2)
}

export function getStyle (el, name) {
	if (el.currentStyle) {
    return name ? el.currentStyle[name] : el.currentStyle
	} else {
		return name ? Number(getComputedStyle(el, false)[name].replace(/px/, '')) : getComputedStyle(el, false)
	}
}

export function throttle (fn, time) {
	let timer
	let firstTime = true
	return function (...args) {
		if (firstTime) {
			fn.apply(this, args)
			firstTime = false
			return firstTime
		}

		if (timer) {
			return false
		}

		timer = setTimeout(() => {
			clearTimeout(timer)
			timer = null
			fn.apply(this, args)
		}, time)
	}
}

export function addClass (el, newClass) {
	let oldClass = el.className
	el.className = oldClass ? `${oldClass} ${newClass}` : newClass
}

export function removeClass (obj, cls) {
  // 获取 class 内容, 并在首尾各加一个空格.  'abc    bcd' -> ' abc    bcd '
	let objClass = ' ' + obj.className + ' '
	// 将多余的空字符替换成一个空格.  ' abc    bcd ' -> ' abc bcd '
	objClass = objClass.replace(/(\s+)/gi, ' ')
		// 在原来的 class 替换掉首尾加了空格的 class.  ' abc bcd ' -> 'bcd '
	let removed = objClass.replace(' ' + cls + ' ', ' ')
		// 去掉首尾空格.  'bcd ' -> 'bcd'
	removed = removed.replace(/(^\s+)|(\s+$)/g, '')
		// 替换原来的 class
	obj.className = removed
}

export function warn (msg) {
  console.error(`[DragList warn]: ${msg}`)
}

export function merge (/** obj1, obj2, obj3 **/) {
	var result = {}

	for (var i = 0; i < arguments.length; i++) {
		var obj = arguments[i]
			// 遍历该对象
		for (var key in obj) {
			// 如果对象有该属性，且不在原型链上
			if (obj.hasOwnProperty(key)) {
				// 如果待混入的值为对象，且result中对应值也为对象，则将两个对象融合后重新赋值给result[key]
				if (_.isObject(obj[key]) && _.isObject(result[key])) {
					result[key] = merge(result[key], obj[key])
				} else {
					// 否则直接赋值
					result[key] = obj[key]
				}
			}
		}
	}
	return result
}

export const _ = {
	setAttr (node, key, value) {
		switch (key) {
			case 'style':
				node.style.cssText = value
				break
			case 'value':
				let tagName = node.tagName || ''
				tagName = tagName.toLowerCase()
				if (tagName === 'input' || tagName === 'textarea') {
					node.value = value
				} else {
					node.setAttribute(key, value)
				}
				break
			default:
				node.setAttribute(key, value)
				break
		}
	},
	slice (arrLike, index) {
		return Array.prototype.slice.call(arrLike, index)
	},
	isArray (array) {
		return Object.prototype.toString.call(array) === '[object Array]'
  },
  isFunction (fn) {
    return typeof fn === 'function'
  },
	toArray (arrLike) {
		return Array.from(arrLike)
	},
	isString (string) {
		return Object.prototype.toString.call(string) === '[object String]'
	},
	isObject (obj) {
		return Object.prototype.toString.call(obj) === '[object Object]'
	},
	isElementNode (node) {
		return node.nodeType === 1
	}
}
