import {
  logBaseInfo
} from './base'
import types from './typeMap'
import {
  formatStrToObj,
  assign,
  paramsStandard,
  debounce
} from './utils'
import scrollElmWatching from './observe'
const eventsPool = [];
const trace = {
  traceEmit(dom, key, data) {
    data.event = key;
    let domAttrs = {};
    if (dom) {
      domAttrs = trace.selectAttrExt(dom)
    }
    const extras = Object.assign(data, paramsStandard(domAttrs));
    this.logRequest(extras)
  },
  initEvents() {
    let events = types.elEventMap
    Object.keys(events).forEach((key) => {
      if (key !== 'document') {
        let event = events[key]
        let dom = document.querySelector(key)
        for (let k in event) {
          function handleEvent(e) {
            const tranceName = trace.getElmAttr(e.target, 'trace-name')
            if (tranceName && tranceName !== 'observer_area') {
              let key = k === 'DOMNodeInserted' ? 'show' : k
              if (
                'true' != trace.getElmAttr(e.target, `trace-${key}-disabled`)
              ) {
                const elm = e.target;
                // 默认事件 只上报一次
                trace.setElmAttr(elm, k)
                trace.traceEmit(
                  elm,
                  k,
                  formatStrToObj(events[`[trace-name=${tranceName}]`][k])
                )
                // 一些特殊的组件点击 进行多次上报
                if ('comp_play' === tranceName) {
                  trace.removeElmAttr(e.target, `trace-${key}-disabled`);
                }
              }
            }
          }
          if (eventsPool.includes(k)) return;
          eventsPool.push(k);
          document.addEventListener(k, ['click'].includes(k) ? debounce(handleEvent) : handleEvent)
        }
        // this.domWatchLoad(key, events[key])
      }
    })
  },
  setElmAttr(dom, k, bool = true) {
    if (dom && typeof dom.setAttribute === 'function') {
      return dom.setAttribute(
        `trace-${k === 'DOMNodeInserted' ? 'show' : k}-disabled`,
        bool
      )
    }
  },
  getElmAttr(dom, name) {
    if (dom && typeof dom.getAttribute === 'function')
      return dom.getAttribute(name)
  },
  removeElmAttr(dom, name) {
    dom.removeAttribute(name)
  },
  selectAttrExt(dom) {
    const attrs = dom.attributes
    let result = {}
    if (attrs && attrs.length) {
      result = Array.prototype.slice.call(attrs).reduce((pre, cur) => {
        let res = {}
        if (cur.name.indexOf('trace-') > -1) {
          res[cur.name] = cur.value
        }
        return {
          ...pre,
          ...res,
        }
      }, {})
    }
    return result
  },
  domWatchLoad(attrname, data) {
    if (attrname === '[trace-name=land_root]') {
      let timer = null
      const watchElm = () => {
        let rootElm = document.querySelector(attrname)
        if (rootElm) {
          var t = formatStrToObj(data.DOMNodeInserted)
          this.traceEmit(rootElm, 'root', t)
          return clearTimeout(timer)
        }
        timer = setTimeout(() => {
          watchElm()
        }, 50)
      }
      watchElm()
    }
  },
  initDocument() {
    let d = types.elEventMap.document
    if ('object' === typeof d) {
      if ((assign({}, d), 'string' == typeof d.init)) {
        var t = formatStrToObj(d.init)
        this.traceEmit(document, 'init', t)
      }
      d.ready &&
        document.addEventListener('DOMContentLoaded', function (e) {
          const t = formatStrToObj(d.ready)
          trace.traceEmit(document, 'ready', t)
        })

      d.winLoad &&
        (window.onload = function (e) {
          var t = formatStrToObj(d.winLoad),
            o = new Date().getTime()
          trace.traceEmit(document, 'winLoad', t)
          trace.initEvents()
          scrollElmWatching(trace)
        })
      d.exit &&
        (window.onbeforeunload = function (e) {
          var t = formatStrToObj(d.exit),
            o = new Date().getTime()
          trace.traceEmit(document, 'exit', t)
        })
      window.onerror = function (message, source, lineno, colno, error) {
        let info = {
          message,
          source,
          lineno,
          colno,
          error
        }
        trace.traceEmit(null, 'error', {
          dt: 4000,
          msg: JSON.stringify(info)
        })
      }
    }
  },
  logRequest(data) {
    let params = Object.assign(data, logBaseInfo)
    console.log(params)
  },
}
export default trace