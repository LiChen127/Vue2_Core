/**
 * 事件绑定相关
 */

import { Component } from "../../types/component";
import { isArray, toArray } from "../../utils/shared";
import { updateListeners } from "../../utils/update-listeners";

export function initEvents(vm: Component) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false;

  const listeners = vm.$options._parentListeners;

  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

let target: any;

function add(e, fn) {
  target.$on(e, fn);
}

function remove(e, fn) {
  target.$off(e, fn);
}

function createOnceHandler(e, fn) {
  const _target = target;
  return function onceHandler() {
    const res = fn.apply(null, arguments);
    if (res !== null) {
      _target.$off(e, onceHandler);
    }
  };
}

export function updateComponentListeners(
  vm: Component,
  listeners: any,
  oldListeners?: Object | null
) {
  target = vm;
  // 更新监听器
  updateListeners(
    listeners,
    oldListeners || {},
    add,
    remove,
    createOnceHandler,
    vm
  )
  target = undefined // gc
}

export function eventsMixin(Vue: typeof Component) {
  const hookRE = /^hook:/;
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this;
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn);
      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }
    return vm;
  };

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this;
    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm;
  }

  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this;
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    }
    if (isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$off(event[i], fn);
      }
      return vm;
    }
    const cbs = vm._events[event];
    if (!cbs) {
      return vm;
    }
    if (!fn) {
      vm._events[event] = null;
      return vm;
    }
    let cb;
    let i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return vm;
  }

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this;
    let cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      const args = toArray(arguments, 1);
      for (let i = 0; i < cbs.length; i++) {
        // @todo 异步hander实现
        // invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm;
  }
}