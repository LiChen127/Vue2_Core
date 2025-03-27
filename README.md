# 从Vue2源码中逐步剥离的, 实现功能完备的Vue2-Core，并对于一些创新和设计进行思考和解释

**每次都多问一下为什么**

## Observer

Observer是Vue响应式系统的核心，注意，我们这里讨论Vue2, Vue2采用的是Object.defineProperty来实现响应式，Vue3则采用Proxy来实现响应式。

这里有历史的原因，关于Proxy实现响应式，我们会在实现Vue3-Core的时候继续深入。

Observer应该叫做变化侦测，它用来侦测数据变化，然后通知视图更新，使得状态的管理变得简单。

### 变化侦测

变化侦测用于解决运行时内部数据状态发生变化时需要不停地重新渲染的问题。

#### Angular和React的做法

Angular和React的做法是很粗粒度的做法，当state change, 它们不知道哪些组件需要重新渲染，当状态改变时，会发送信号给框架，
框架收到信号后，进行暴力比对来找到需要重新渲染的DOM节点。

至于如何比对:

- Angular: 脏值检查: Angular会记录上一次的状态，当状态改变时，会比较两次状态的差异，然后进行DOM操作。
- React: 虚拟DOM: React会生成一个虚拟DOM，当状态改变时，会生成一个新虚拟DOM，然后进行比较，找出差异，然后进行DOM操作。

#### Vue的做法

对于Vue来说，它控制地更加具有细粒度。

假如有一个状态绑定着好多个依赖，每个依赖表示一个具体的DOM节点，那么当这个状态发生变化时，向这个状态的所有依赖发送通知，让它们进行DOM更新操作。

但是细粒度也是有代价的，粒度越是细，每个状态要绑定的依赖就越多，依赖追踪在内存的开销就会越来越大。

Vue2引入虚拟DOM，粒度较小，**一个状态所绑定的依赖不再是具体的DOM节点，而是一个组件**

Vue实际上可以调整粒度的本质上原因还是采用了Observer的设计，通过这个设计，它可以随意控制这种粒度，特别的高明。

#### 变化侦测具体如何实现?

##### 1.如何知道某个属性发生了变化?

我们考虑Vue2的设计。
采用Object.defineProperty()

```js
// demo\observer\index.html
    let books = {};
    let val = 3000;
    Object.defineProperty(books, 'count', {
      enumerable: true,
      configurable: true,
      get() {
        console.log('get it');
        return val;
      },
      set(newVal) {
        console.log('set it');
        val = newVal;
      }
    })
```

##### 2.如何收集依赖?

我们观测数据的目的是，数据属性/值变化时，通知使用该数据的组件更新, 通过vdom渲染

所以，应该在getter中收集依赖，在setter中更新依赖。

##### 3.依赖是什么?

谁用到了响应式数据，谁就是依赖。

##### 3.依赖收集在哪里?

vue中把依赖封装成一个独立的数组对象。
这样的话，每一个响应式数据都会有一个独立的依赖数组。

```js
// demo/observer/dep.js
export default class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    if (this.subs.length) {
      const index = this.subs.indexOf(sub);
      index > -1 ? this.subs.splice(index, 1) : null;
    }
  }

  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

// demo/observer/observer.js
function defineReactive(data, key, val) {
  let dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // 收集依赖
      dep.depend();
      return val;
    },
    set: function (newVal) {
      if (newVal === val) {
        return;
      }
      val = newVal;
      // 更新notify
      dep.notify();
    }
  })
}
```

##### 4. 优化响应式数据更新链路

在Vue中，还实现了一个Watcher类，用来管理依赖，当数据更新时，会通知Watcher，Watcher会更新DOM。

Watcher做了什么事情?

Watcher实际上会做的是在全局读取数据，进行初始化观察。

1. 依赖触发，执行cb, 访问数据属性时触发`getter`, 将当前的`Watcher`收集到对应的`Dep`中;
2. 更新机制: 数据变化时，`Dep`通知所有关联的`Watcher`执行`update()`, 最终触发cb, 更新视图/相关状态。

**为什么要这么做?**

很多的资料并没有告诉我们。
1. 解耦: 将依赖和更新分离，便于维护，统一用`Watcher`管理不同场景的更新逻辑;
2. 优化性能: 在Watcher中实际上实现了异步队列，避免频繁更新，提高性能;
3. 精准性: 每个data只点对点通知直接依赖的`Watcher`，足够的原子化和精确。

#### Array的变化侦测

##### 为什么Array和Object要分开处理?

js中改变数组内容的方法很多, 比如`push`, `pop`\ `shift`\ `unshift`\ `splice`\ `sort`\ `reverse`, 但是它们不会触发属性的`setter`。
本质上是因为`length`属性或者数组的索引属性无法被`Object.defineProperty`所监听;

##### Array的变化侦测如何做的

1. 重写数组的方法, `push`, `pop`\ `shift`\ `unshift`\ `splice`\ `sort`\ `reverse`, 使得这些方法调用时，既可以执行原生操作，又可以手动触发更新
2. 对数组元素进行响应式更新(只要不是Array)
3. 无法检测的索引操作怎么解决? `Vue.set` && `vm.$set`

## VDOM

### 虚拟DOM

虚拟DOM是时代发展的必然产物。随着需求增多，命令式操作DOM变得特别复杂。
