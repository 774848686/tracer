#### 前端落地页埋点统计设计方案
> 我们在日常工作中或多或少会接到这样的一个需求——对落地页的用户行为轨迹进行埋点上报，方便运营同学分析优化。如何做一个通用的埋点js-sdk呢？这是我们这次分享的主题。
##### 需求分析
首先我们思考一下:一个页面从打开再到交互，哪些地方需要我们去做一些埋点？从页面出发我们肯定想知道页面的`dom`加载是否完成、页面资源是否加载完、按钮点击、弹窗曝光、点击跳转、用户滚动页面哪些区域在可视区域范围内等上报。我们一般的做法就是代码嵌入式埋点，这样的好处就是能够在自己想要的位置能够精准的进行上报。不好的地方就是跟业务代码耦合性太强了。为了降低强耦合性，我们可以使用在需要埋点的标签上添加上报的属性，然后一切的上报逻辑都交给我们的`tracer.js`即可。
##### 埋点设计
既然我们要降低代码的强耦合性，那么我们将有关上报的逻辑跟业务代码做到完全分离。
- 需求预期
我们以前是这样代码式的嵌入：
```js
track({
  id:'',
  msg:'',
  type:''
});
```
这样一旦项目庞大起来，很可能就是搞得比较混乱，所以我们可使用如下的格式进行埋点：
```html
<div id="root" trace-name="land_root" trace-id="1">
  <div class="button" trace-name="submit_play" trace-msg="提交按钮">
        点击
  </div>
  <div class="button" trace-name="comp_play" trace-msg="组件按钮">多次点击</div>
 </div>
```
通过对比一下，是不是发现这种能够很大的降低跟业务的强耦合性呢。好了，那让我们去实现它吧！
- 埋点字段
首先我们要根据我们的业务需求定义好埋点字段。以下是我定义的一些字段：
```js
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
    '[trace-name=dialog_root]': {
      DOMNodeInserted: 'dt=2001',
      click: 'dt=3000',
    },
    '[trace-name=observer_area]': {
      view: 'dt=3004',
    },
    ...
  },
}
```
解释一下为什么我要这样去做这个设计，我的想法是以属性名作为`key`,然后以该目标对象需要的监听的事件作为`value`；一个目桥对象可以绑定多个事件，每个事件有对应的上报`code`。这样我们只需要对其遍历一遍，然后分别绑定事件以及获取对应的`code`即可。
- 事件的绑定
根据我们上面定义好的`type`,然后一次进行遍历添加就可以了：
```js
let eventsPool = [];
Object.keys(events).forEach((key) => {
    let dom = document.querySelector(key)
    for (let k in event) {
      function handleEvent(e) {
        const tranceName = trace.getElmAttr(e.target, 'trace-name')
        if (tranceName) {
          ...
        }
      }
      if (eventsPool.includes(k)) return;
      eventsPool.push(k);
      document.addEventListener(k, ['click'].includes(k) ? debounce(handleEvent) : handleEvent)
    }
})
```
这里我是使用了事件代理然后有一个校验该事件是否已经绑定，防止多次进行绑定。这里为了防止多次点击，我们使用了一个防抖函数。以及我们会在当前`dom`元素添加一个是否触发了事件的属性`trace-${key}-disabled`，可控制单次触发。`tracer.js`也提供了一个多次点击触发的埋点属性,绑定属性`trace-name=comp_play`即可。
- 检测元素是否已加载
这里我们有两种方案，第一种是监听`DOMNodeInserted`事件，第二种是通过一个定时器去监听是否存在某个元素，存在就进行上报。
- 检测用户滚动后哪些区域在可视区域内
用法也很简单，我们只需要在需要检测的元素上添加`trace-name="observer_area"`即可。原理也很简单，就是判断当前元素相对于视口的`top`、`bottom`、`left`、`right`满足以下几个条件即可：
1. 当前元素相对于视口的`top`要大于(-元素高度/2);
2. 当前元素相对于视口的`bottom`要小于(视口高度+元素高度/2);
3. 当前元素相对于视口的`left`要大于0;
4. 当前元素相对于视口的`right`要小于视口宽度;
具体的代码如下：
```js
function computedIsInner(trace, dom) {
  let clientW = window.innerWidth || document.documentElement.clientWidth
  let clientH = window.innerHeight || document.documentElement.clientHeight
  const getBoundingClientRect = dom.getBoundingClientRect()
  if (getBoundingClientRect) {
    const { left, right, top, bottom, height } = getBoundingClientRect
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
        dt:3004
      })
    } else {
      trace.removeElmAttr(dom, `trace-observe-disabled`)
    }
  }
}
```
这里为了让已经在可视区域内的元素不每次进行上报，会给已经上报的区域添加一个`trace-observe-disabled`为`true`属性值，只要是在可视区域内只上报一次即可。<br/>
注意：代码运行时首先会检测是否需要开启滚动检测功能，即判断是否存在`dom`绑定了`trace-name="observer_area"`属性，有则开启滚动事件，无则不执行。<br/>
这样我们一个基础版的埋点就设计好了，如果还行更多的功能自行扩充即可。以上是这次分享的所有内容，谢谢阅读。项目的完整代码在[https://github.com/774848686/tracer](https://github.com/774848686/tracer)




