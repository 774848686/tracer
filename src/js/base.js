export const logBaseInfo = {
  referrer: document && decodeURIComponent(document.referrer || ''), // referrer
  locaurl: decodeURIComponent(window.location.href), //当前url
  sh: (window.screen && window.screen.height) || 0, // 分辨率高
  sw: (screen && window.screen.width) || 0, // 分辨率长
}
