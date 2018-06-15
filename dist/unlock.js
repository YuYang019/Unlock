(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Unlock = factory());
}(this, (function () { 'use strict';

	function addEvent (el, type, handler, options) {
		if (el.addEventListener) {
			el.addEventListener(type, handler, options);
		} else if (el.attachEvent) {
			el.attachEvent('on' + type, handler);
		} else {
			el['on' + type] = handler;
		}
	}

	function removeEvent (el, type, handler) {
		if (el.addEventListener) {
			el.removeEventListener(type, handler, false);
		} else if (el.attachEvent) {
			el.detachEvent('on' + type, handler);
		} else {
			el['on' + type] = null;
		}
	}

	function $ (el) {
		return document.querySelector(el)
	}

	// 数组里是否包含某个obj, 仅判断一层
	function includes (arr, obj) {
	  if (arr.includes(obj)) {
	    return true
	  }
	  for (let i = 0; i < arr.length; i++) {
	    const item = arr[i];
	    const keys = Object.keys(obj);
	    const itemKeys = Object.keys(item);
	    if (keys.length !== itemKeys.length) {
	      continue
	    }
	    for (let j = 0; j < keys.length; j++) {
	      const key = keys[j];
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

	function getDistance (a, b) {
	  const x2 = Math.pow(a.x - b.x, 2);
	  const y2 = Math.pow(a.y - b.y, 2);
	  return Math.sqrt(x2 + y2)
	}

	function getStyle (el, name) {
		if (el.currentStyle) {
	    return name ? el.currentStyle[name] : el.currentStyle
		} else {
			return name ? Number(getComputedStyle(el, false)[name].replace(/px/, '')) : getComputedStyle(el, false)
		}
	}

	function warn (msg) {
	  console.error(`[DragList warn]: ${msg}`);
	}

	function merge (/** obj1, obj2, obj3 **/) {
		var result = {};

		for (var i = 0; i < arguments.length; i++) {
			var obj = arguments[i];
				// 遍历该对象
			for (var key in obj) {
				// 如果对象有该属性，且不在原型链上
				if (obj.hasOwnProperty(key)) {
					// 如果待混入的值为对象，且result中对应值也为对象，则将两个对象融合后重新赋值给result[key]
					if (_.isObject(obj[key]) && _.isObject(result[key])) {
						result[key] = merge(result[key], obj[key]);
					} else {
						// 否则直接赋值
						result[key] = obj[key];
					}
				}
			}
		}
		return result
	}

	const _ = {
		setAttr (node, key, value) {
			switch (key) {
				case 'style':
					node.style.cssText = value;
					break
				case 'value':
					let tagName = node.tagName || '';
					tagName = tagName.toLowerCase();
					if (tagName === 'input' || tagName === 'textarea') {
						node.value = value;
					} else {
						node.setAttribute(key, value);
					}
					break
				default:
					node.setAttribute(key, value);
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
	};

	const DEFAULT_MODE = 'default';

	const CHECK_MODE = 'check';

	const SET_MODE = 'set';

	let CHECK_PASSWORD = ''; // 密码放在全局
	let startDot = null; // 最开始连线的点
	let start = false; // 是否开始连线
	let firstPassword = ''; // set模式下，第一次设置的密码
	let isFirst = true; // set模式下，是否是第一次设置

	function coreMixin (Unlock) {
	  Unlock.prototype.getCanvasPoint = function (canvas, x, y) {
	    let rect = canvas.getBoundingClientRect();
	    return {
	      x: x - rect.left,
	      y: y - rect.top
	    }
	  };

	  // 找最近的点，且已在历史里的点不可获取
	  Unlock.prototype.findNearDot = function (now) {
	    const d = this.$d;
	    const dots = this.$dots;
	    const history = this.$history;
	    // 对角线长度的1/6
	    let minDistance = Math.sqrt(2 * d * d) / 6;
	    for (let i = 0; i < dots.length; i++) {
	      const dot = this.$dots[i];
	      const d = getDistance(dot, now);
	      if (d < minDistance && !includes(history, dot)) {
	        return dot
	      }
	    }
	    return null
	  };

	  // 判断两点是否在同一水平线或竖直线或对角线，返回直线类型
	  Unlock.prototype.getLineType = function (dot1, dot2) {
	    const result = {};
	    if (!dot2) return
	    if (dot1.y === dot2.y) {
	      result.bool = true;
	      result.type = 'horizontal';
	    } else if (dot1.x === dot2.x) {
	      result.bool = true;
	      result.type = 'vertical';
	    } else if (Math.abs((dot1.x - dot2.x) / (dot1.y - dot2.y)) === 1) {
	      result.bool = true;
	      result.type = 'diagonal';
	    } else {
	      result.bool = false;
	      result.type = 'default';
	    }
	    return result
	  };

	  Unlock.prototype.addHistory = function (dot) {
	    const history = this.$history;

	    if (!includes(history, dot)) {
	      const beforeDot = history[history.length - 1];
	      const lineType = this.getLineType(dot, beforeDot);
	      if (history.length >= 1 || (lineType && lineType.bool)) {
	        switch (lineType.type) {
	          case 'horizontal':
	            this.fixHorizontalLine(dot, beforeDot);
	            break
	          case 'vertical':
	            this.fixVerticalLine(dot, beforeDot);
	            break
	          case 'diagonal':
	            this.fixDiagonalLine(dot, beforeDot);
	            break
	          default:
	            history.push(dot);
	        }
	      } else {
	        history.push(dot);
	      }
	    }
	  };

	  // 水平线是否有点未被选，没选则添
	  Unlock.prototype.fixHorizontalLine = function (now, before) {
	    const history = this.$history;
	    const d = this.$d;
	    const dots = this.$dots;
	    // 如果两点距离大于单位距离,添加中间的点
	    if (Math.abs(now.x - before.x) > d) {
	      const midIndex = this.getMidIndex(now, before);
	      if (!includes(history, dots[midIndex])) {
	        history.push(dots[midIndex]);
	      }
	    }
	    history.push(now);
	  };

	  // 垂直线是否有点未被选，没选则添
	  Unlock.prototype.fixVerticalLine = function (now, before) {
	    const history = this.$history;
	    const d = this.$d;
	    const dots = this.$dots;
	    if (Math.abs(now.y - before.y) > d) {
	      const midIndex = this.getMidIndex(now, before);
	      if (!includes(history, dots[midIndex])) {
	        history.push(dots[midIndex]);
	      }
	    }
	    history.push(now);
	  };

	  // 对角线是否有点未被选，没选则添
	  Unlock.prototype.fixDiagonalLine = function (now, before) {
	    const history = this.$history;
	    const d = this.$d;
	    const dots = this.$dots;
	    if (Math.abs(now.x - before.x) > d) {
	      const midIndex = this.getMidIndex(now, before);
	      if (!includes(history, dots[midIndex])) {
	        history.push(dots[midIndex]);
	      }
	    }
	    history.push(now);
	  };

	  Unlock.prototype.getMidIndex = function (now, before) {
	    const dots = this.$dots;

	    const nowIndex = dots.indexOf(now);
	    const beforeIndex = dots.indexOf(before);
	    const midIndex = (nowIndex + beforeIndex) / 2;

	    return midIndex
	  };

	  Unlock.prototype._start = function (e) {
	    start = true;

	    const pos = {
	      x: e.clientX || e.changedTouches[0].clientX,
	      y: e.clientY || e.changedTouches[0].clientY
	    };

	    const point = this.getCanvasPoint(this.$topCanvas, pos.x, pos.y);
	    startDot = this.findNearDot(point);

	    if (startDot) this.addHistory(startDot);
	  };

	  Unlock.prototype._move = function (e) {
	    if (!startDot || !start) return

	    this.clear(this.$topCanvas);

	    const pos = {
	      x: e.clientX || e.changedTouches[0].clientX,
	      y: e.clientY || e.changedTouches[0].clientY
	    };

	    const topCtx = this.$topCanvas.getContext('2d');
	    const now = this.getCanvasPoint(this.$topCanvas, pos.x, pos.y);
	    const nearDot = this.findNearDot(now);

	    if (nearDot) {
	      this.drawNewLine(topCtx, startDot, nearDot);
	      this.addHistory(nearDot);
	      // 更新起始点
	      startDot = nearDot;
	    } else {
	      this.drawNewLine(topCtx, startDot, now);
	    }
	  };

	  Unlock.prototype._end = function (e) {
	    this.clear(this.$topCanvas);

	    start = false;
	    console.log(this.$history);
	    // 如果只有一个点，不画
	    if (this.$history.length <= 1) {
	      startDot = null;
	      this.$history = [];
	      return
	    }

	    this._loading = true;

	    this.drawHistoryLine(this.$topCanvas.getContext('2d'));

	    switch (this.$mode) {
	      case DEFAULT_MODE:
	        this.handleDefaultMode();
	        break
	      case CHECK_MODE:
	        this.handleCheckMode();
	        break
	      case SET_MODE:
	        this.handleSetMode();
	        break
	      default:
	        warn('unknown mode');
	    }
	  };

	  Unlock.prototype.handleDefaultMode = function () {
	    setTimeout(() => {
	      this._resetAll(false);
	    }, this.$options.intervalTime);
	  };

	  Unlock.prototype.handleCheckMode = function () {
	    const history = this.$history;
	    const result = history.map(item => item.index).join('');

	    if (CHECK_PASSWORD === result) {
	      this._success && this._success.call();
	      this.drawSuccessLine();
	      // CHECK_PASSWORD = ''
	    } else {
	      this._fail && this._fail.call();
	      this.drawErrorLine();
	      // CHECK_PASSWORD = ''
	    }

	    setTimeout(() => {
	      this._resetAll(true);
	    }, this.$options.intervalTime);
	  };

	  Unlock.prototype.handleSetMode = function () {
	    const history = this.$history;
	    const password = history.map(item => item.index).join('');

	    if (isFirst) {
	      isFirst = false;
	      firstPassword = password;
	      setTimeout(() => {
	        this._resetAll(false);
	      }, this.$options.intervalTime);
	      return this.$options.set.beforeRepeat.call()
	    }

	    if (password === firstPassword) {
	      this._success && this._success.call(null, password);
	      this.drawSuccessLine();
	      setTimeout(() => {
	        this._resetAll(true);
	      }, this.$options.intervalTime);
	    } else {
	      this._fail && this._fail.call();
	      this.drawErrorLine();
	      setTimeout(() => {
	        this._resetAll(false);
	      }, this.$options.intervalTime);
	    }
	  };

	  Unlock.prototype.set = function () {
	    this._fail = null;
	    this._success = null;
	    this.$mode = SET_MODE;

	    return this
	  };

	  Unlock.prototype.reset = function () {
	    this._resetAll(true);
	  };

	  Unlock.prototype._resetAll = function (all) {
	    if (all) {
	      firstPassword = '';
	      isFirst = true;
	    }
	    startDot = null;
	    this._loading = false;
	    this.$history = [];
	    this.clear(this.$topCanvas);
	  };

	  Unlock.prototype.check = function (password) {
	    this._fail = null;
	    this._success = null;
	    this.$mode = CHECK_MODE;
	    CHECK_PASSWORD = password;

	    return this
	  };

	  Unlock.prototype.success = function (fn) {
	    if (!_.isFunction(fn)) warn('the callback should be a function');
	    this._success = fn;

	    return this
	  };

	  Unlock.prototype.fail = function (fn) {
	    if (!_.isFunction(fn)) warn('the callback should be a function');
	    this._fail = fn;

	    return this
	  };
	}

	const createCanvas = (width, height) => {
	  const canvas = document.createElement('canvas');
	  // 不能用style.width，而是设置它的width属性
	  canvas.width = width;
	  canvas.height = height;
	  canvas.style.position = 'absolute';
	  canvas.style.top = 0;
	  canvas.style.left = 0;

	  return canvas
	};

	const w = document.body.clientWidth;

	function initMixin (Unlock) {
	  Unlock.prototype._init = function () {
	    this.$d = this._elWidth ? Math.round(this._elWidth / 4) : Math.round(w / 4); // 两点间距离
	    this.$dots = [];
	    this.$history = [];
	    this.$mode = DEFAULT_MODE;

	    this._loading = false;

	    this._initDots();
	    this._initCanvas();
	    this._addDomEvent();
	  };

	  Unlock.prototype._initCanvas = function () {
	    this.$el.style.position = 'relative';
	    this.$el.style.userSelect = 'none';
	    if (this._elWidth === 0) {
	      this.$el.style.width = `${w}px`;
	      this._elWidth = w;
	    }
	    if (this._elHeight === 0) {
	      this.$el.style.height = `${w}px`;
	      this._elHeight = w;
	    }
	    if (this.$options.style.bgColor) {
	      this.$el.style.backgroundColor = this.$options.style.bgColor;
	    }

	    this.$bottomCanvas = createCanvas(this._elWidth, this._elHeight);
	    this.$topCanvas = createCanvas(this._elWidth, this._elHeight);

	    this.$el.appendChild(this.$bottomCanvas);
	    this.$el.appendChild(this.$topCanvas);

	    this.drawDots(this.$dots, this.$bottomCanvas.getContext('2d'));
	  };

	  Unlock.prototype._initDots = function () {
	    let num = 0;
	    for (let i = 0; i < 3; i++) {
	      for (let j = 0; j < 3; j++) {
	        this.$dots.push({
	          x: this.$d * (j + 1),
	          y: this.$d * (i + 1),
	          index: ++num
	        });
	      }
	    }
	  };

	  Unlock.prototype._addDomEvent = function () {
	    this._initEvent(addEvent);
	  };

	  Unlock.prototype._removeDomEvent = function () {
	    this._initEvent(removeEvent);
	  };

	  Unlock.prototype._initEvent = function (eventOperator) {
	    if (this.$options.click) {
	      eventOperator(this.$topCanvas, 'mousedown', this);
	      eventOperator(this.$topCanvas, 'mousemove', this);
	      eventOperator(this.$topCanvas, 'mouseup', this);
	    }
	    eventOperator(this.$topCanvas, 'touchstart', this);
	    eventOperator(this.$topCanvas, 'touchmove', this);
	    eventOperator(this.$topCanvas, 'touchend', this);
	  };

	  Unlock.prototype.handleEvent = function (e) {
	    if (this._loading) return

	    switch (e.type) {
	      case 'mousedown':
	      case 'touchstart':
	        this._start(e);
	        break
	      case 'mousemove':
	      case 'touchmove':
	        this._move(e);
	        break
	      case 'mouseup':
	      case 'touchend':
	        this._end(e);
	    }
	  };
	}

	const PI = Math.PI;
	const w$1 = document.body.clientWidth;

	function drawMixin (Unlock) {
	  Unlock.prototype.drawDots = function (dots, ctx) {
	    dots.forEach((dot) => {
	      const radius = this.$options.style.dotRadius;
	      this.drawArc(ctx, dot.x, dot.y, radius);
	    });
	  };

	  Unlock.prototype.drawArc = function (ctx, x, y, radius) {
	    ctx.beginPath();
	    ctx.arc(x, y, radius, 0, 2 * PI);
	    ctx.fillStyle = this.$options.style.dotColor;
	    ctx.fill();
	  };

	  Unlock.prototype.drawLine = function (ctx, old, now, type) {
	    now = now || old;
	    type = type || 'default';

	    const lineColor = this.$options.style.statusColor[type].line;
	    const dotColor = this.$options.style.statusColor[type].dot;
	    const lineWidth = this.$options.style.lineWidth;

	    ctx.strokeStyle = lineColor;
	    ctx.lineWidth = lineWidth;
	    ctx.beginPath();
	    ctx.moveTo(old.x, old.y);
	    ctx.lineTo(now.x, now.y);
	    ctx.stroke();

	    ctx.beginPath();
	    ctx.arc(old.x, old.y, this.$options.style.activeDotRadius, 0, 2 * PI);
	    ctx.arc(now.x, now.y, this.$options.style.activeDotRadius, 0, 2 * PI);
	    ctx.fillStyle = dotColor;
	    ctx.fill();
	  };

	  // 当滑动到某个最近的点时，按照记录依次连接，最后连接最新的线
	  Unlock.prototype.drawNewLine = function (ctx, old, now) {
	    if (!old || !now) return
	    this.drawHistoryLine(ctx);
	    this.drawLine(ctx, old, now);
	  };

	  Unlock.prototype.drawHistoryLine = function (ctx) {
	    if (this.$history.length) {
	      for (let i = 0; i < this.$history.length; i++) {
	        this.drawLine(ctx, this.$history[i], this.$history[i + 1]);
	      }
	    }
	  };

	  Unlock.prototype.clear = function (canvas) {
	    const ctx = canvas.getContext('2d');
	    ctx.clearRect(0, 0, w$1, w$1);
	  };

	  Unlock.prototype.drawErrorLine = function () {
	    const history = this.$history;
	    const topCtx = this.$topCanvas.getContext('2d');
	    this.clear(this.$topCanvas);
	    if (history.length) {
	      for (let i = 0; i < history.length; i++) {
	        this.drawLine(topCtx, history[i], history[i + 1], 'error');
	      }
	    }
	  };

	  Unlock.prototype.drawSuccessLine = function () {
	    const history = this.$history;
	    const topCtx = this.$topCanvas.getContext('2d');
	    this.clear(this.$topCanvas);
	    if (history.length) {
	      for (let i = 0; i < history.length; i++) {
	        this.drawLine(topCtx, history[i], history[i + 1], 'success');
	      }
	    }
	  };
	}

	const defaultOptions = {
	  click: true,
	  intervalTime: 1500, // 输入后到清空画布的间隔时间
	  style: {
	    bgColor: '#fff',
	    dotColor: '#e6e6e6',
	    dotRadius: 5,
	    activeDotRadius: 5,
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
	  },
	  set: {
	    beforeRepeat: function () {}
	  }
	};

	function Unlock (el, options) {
	  if (!_.isObject(options)) {
	    warn('the options should be a object');
	  }
	  this.$options = merge(defaultOptions, options);
	  this.$el = typeof el === 'string' ? $(el) : el;
	  if (!this.$el) {
	    warn('can not resolve wrapper dom');
	  }

	  this._elWidth = getStyle(this.$el, 'width');
	  this._elHeight = getStyle(this.$el, 'height');

	  this._init();
	}

	drawMixin(Unlock);
	initMixin(Unlock);
	coreMixin(Unlock);

	return Unlock;

})));
