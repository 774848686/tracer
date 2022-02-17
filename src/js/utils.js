export function formatStrToObj(str) {
  str = str.toString()
  const s = str.split('=')
  let res = {}
  res[s[0]] = s[1]
  return res
}
export function assign(n, t) {
  Object.keys(t).forEach((k) => {
    n[k] = t[k]
  })
  return n
}
export function paramsStandard(data) {
  if (data) {
    return Object.keys(data).reduce((pre, cur) => {
      let res = {}
      if (!cur.includes('-disabled')) {
        const key = cur && cur.split('-')[1]
        res[key] = data[cur]
      }
      return {
        ...pre,
        ...res,
      }
    }, {})
  }
}
export function throttle(fn, wait = 500) {
  let pre = +Date.now();
  return function () {
    const context = this;
    const args = arguments;
    const now = Date.now();
    if (now - pre >= wait) {
      fn.apply(context, args);
      pre = Date.now();
    }
  }
}
export function debounce(fn, time = 400) {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, time);
  }
}