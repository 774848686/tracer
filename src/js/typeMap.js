// 1开头是document初始化以及退出事件埋点
// 2开头是页面展示埋点
// 3开头是点击事件埋点
// 4开头是可视区域埋点
const types = {
  elEventMap: {
    document: {
      init: 'dt=1000',
      ready: 'dt=1001',
      exit: 'dt=1002',
      winLoad: 'dt=1003',
    },
    '[trace-name=land_root]': {
      DOMNodeInserted: 'dt=2000',
    },
    '[trace-name=comp_play]': {
      click: 'dt=3000',
    },
    '[trace-name=submit_play]': {
      click: 'dt=3001',
    },
    '[trace-name=button_play]': {
      click: 'dt=3002',
    },
    '[trace-name=dialog_root]': {
      DOMNodeInserted: 'dt=2001',
      click: 'dt=3000',
    },
    '[trace-name=dialog_close]': {
      click: 'dt=3003',
    },
    '[trace-name=land_skip]': {
      click: 'dt=3004',
    },
    '[trace-name=observer_area]': {
      view: 'dt=3004',
    },
  },
}
export default types
