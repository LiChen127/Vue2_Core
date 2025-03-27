import { Component } from "../../types/component";
import { noop, remove } from "../../utils/shared";
import { popTarget, pushTarget } from "../observer/dep";
import Watcher, { WatcherOptions } from "../observer/watcher";
import VNode, { createEmptyVNode } from "../vdom/vnode";


export let activeInstance: any = null;
export let isUpdatingChildComponent: boolean = false;

export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance;
  activeInstance = vm;
  return () => {
    activeInstance = prevActiveInstance;
  };
}

export function initLifecycle(vm: Component) {
  const options = vm.$options;

  let parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._provided = parent ? parent._provided : Object.create(null);
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

export function lifecycleMixin(Vue: typeof Component) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this;
    // 挂载的dom对象
    const prevEl = vm.$el;
    const prevVnode = vm._vnode;
    const restoreActiveInstance = setActiveInstance(vm);
    if (!prevVnode) {
      vm.$el = vm.__patch__(vm._vnode, vnode, hydrating, false /* removeOnly */);
    } else {
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    restoreActiveInstance();
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    let wrapper: Component | undefined = vm;

    while (
      wrapper &&
      wrapper.$vnode &&
      wrapper.$parent &&
      wrapper.$vnode === wrapper.$parent._vnode
    ) {
      wrapper.$parent.$el = wrapper.$el;
      wrapper = wrapper.$parent;
    }
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
  }

  Vue.prototype.$destroy = function () {
    const vm: Component = this;
    if (vm._isBeingDestroyed) {
      return;
    }
    callHook(vm, "beforeDestroy");
    vm._isBeingDestroyed = true;
    const parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // vm._scope.stop();

    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    vm._isDestroyed = true;
    vm.__patch__(vm._vnode, null);

    callHook(vm, "destroyed");
    vm.$off();

    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  }
}

export function mountComponent(
  vm: Component,
  el: Element | string,
  hydrating?: boolean
): Component {
  vm.$el = el;
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;
  }
  callHook(vm, "beforeMount");
  let updateComponent;
  updateComponent = () => {
    vm._update(vm._render(), hydrating);
  }

  const watcherOptions: WatcherOptions = {
    before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, "beforeUpdate");
      }
    }
  }

  new Watcher(
    vm,
    updateComponent,
    noop,
    watcherOptions,
    true /* isRenderWatcher **/
  );

  hydrating = false;

  // v3不列入其中
  // const preWatchers = vm._preWatchers;

  // if (preWatchers) {
  //   for (let i = 0; i < preWatchers.length; i++) {
  //     preWatchers[i].run();
  //   }
  // }

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, "mounted");
  }

  return vm;
}

export function isInInactiveTree(vm: Component) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true;
  }
  return false;
}

export function callHook(
  vm: Component,
  hook: string,
  args?: any[],
  setContext = true
) {
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, args || null, vm, info)
    }
  }
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}

export function activateChildComponent(vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}


export function deactivateChildComponent(vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true;
    if (isInInactiveTree(vm)) {
      return;
    }
  }
  if (!vm._inactive) {
    vm._inactive = true;
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }
    callHook(vm, 'deactivated');
  }
}