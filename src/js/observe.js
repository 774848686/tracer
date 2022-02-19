import {
  throttle
} from './utils';
export default function scrollElmWatching(trace) {
  const scrollElms = document.querySelectorAll('[trace-name=observer_area]')
  if (scrollElms) {
    scrollEvent(trace, scrollElms)
    window.onscroll = throttle(function () {
      scrollEvent(trace, scrollElms)
    })
  }
}

function scrollEvent(trace, scrollElms) {
  scrollElms.forEach((d) => {
    computedIsInner(trace, d)
  })
}

function computedIsInner(trace, dom) {
  let clientW = window.innerWidth || document.documentElement.clientWidth
  let clientH = window.innerHeight || document.documentElement.clientHeight
  const getBoundingClientRect = dom.getBoundingClientRect()
  if (getBoundingClientRect) {
    const {
      left,
      right,
      top,
      bottom,
      height
    } = getBoundingClientRect
    const isInner =
      left >= 0 &&
      top >= -height / 2 &&
      bottom <= clientH + height / 2 &&
      right <= clientW
    if (isInner) {
      const isDisabled = trace.getElmAttr(dom, `trace-observe-disabled`);
      if (isDisabled) return;
      trace.setElmAttr(dom, 'observe')
      trace.traceEmit(dom, 'observe', {
        dt: 3004
      })
    } else {
      trace.removeElmAttr(dom, `trace-observe-disabled`)
    }
  }
}