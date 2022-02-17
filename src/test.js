import { example } from './examples'
import trace from './js/trace'
trace.initDocument()
// document.body.append(example())
setTimeout(() => {
  $('body').append('<div trace-name="dialog_root">测试广告</div>')
}, 100)
