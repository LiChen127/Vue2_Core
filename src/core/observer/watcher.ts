import { Component } from "../../types/component";
import { SimpleSet } from "../../utils/env";
import { isArray, isFunction, isObject } from "../../utils/shared";
import VNode from "../vdom/vnode";
import Dep, { DepTarget, popTarget, pushTarget } from "./dep";
import { queueWatcher } from "./scheduler";

let uid = 0;

export interface WatcherOptions {
  deep?: boolean;
  user?: boolean;
  lazy?: boolean;
  sync?: boolean;
  before?: Function;
}

/**
 * 观测者
 */
export default class Watcher implements DepTarget {
  vm?: Component | null;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before?: Function;
  onStop?: Function;
  noRecurse?: boolean;
  getter: Function;
  value: any;
  post: boolean;

  constructor(
    vm: Component | null,
    expOrFn: string | (() => any),
    cb: Function,
    options?: WatcherOptions | null,
    isRenderWatcher?: boolean
  ) {
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid;
    this.post = false;
    this.active = false;
    this.dirty = this.lazy;  // lazy watchers默认是dirty的
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = "";

    if (isFunction(expOrFn)) {
      this.getter = expOrFn;
    } else {
      // @todo: 实现parsePath
      // this.getter = parsePath(expOrFn);

    }
    this.value = this.lazy ? undefined : this.get();
  }

  get() {
    pushTarget(this);
    let v;
    const vm = this.vm;
    try {
      v = this.getter.call(vm, vm);
    } catch (error) {
      throw new Error(`getter for watcher "${this.expression}"`);
    } finally {
      if (this.deep) {
        // 递归遍历
        traverse(v);
      }
      popTarget();
      this.cleanupDeps();
    }
    return v;
  }

  addDep(dep: Dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  cleanupDeps() {
    let len = this.deps.length;
    while (len--) {
      const dep = this.deps[len];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
      let temp: any = this.depIds;
      this.depIds = this.newDepIds;
      this.newDepIds = temp;
      this.newDepIds.clear();
      temp = this.deps;
      this.deps = this.newDeps;
      this.newDeps = temp;
      this.newDeps.length = 0;
    }
  }

  update() {
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  run() {
    if (this.active) {
      const value = this.get();
      if (value !== this.value || isObject(value) || this.deep) {
        const oldVal = this.value;
        this.value = value;
        if (this.user) {
          // @todo: 待实现
          // const info = `callback for watcher "${this.expression}"`
          // invokeWithErrorHandling(
          //   this.cb,
          //   this.vm,
          //   [value, oldVal],
          //   this.vm,
          //   info
          // )
        } else {
          this.cb.call(this.vm, value, oldVal)
        }
      }
    }
  }

  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    let len = this.deps.length;
    while (len--) {
      this.deps[len].depend();
    }
  }

  teardown() {
    if (this.vm && !this.vm._isBeingDestroyed) {
      remove(this.vm._scope.effects, this);
    }
    if (this.active) {
      let i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}

const seenObjects = new Set();

export function traverse(val: any) {
  _traverse(val, seenObjects);
  seenObjects.clear();
  return val;
}

function _traverse(val: any, seen: SimpleSet) {
  let i, keys;
  const isA = isArray(val);

  if (!isA && !isObject(val) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }

  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return;
    }
    seen.add(depId);
  }

  if (isArray(val)) {
    i = val.length;
    while (i--) {
      _traverse(val[i], seen);
    }
  } // vue3 的不支持
  else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      _traverse(val[keys[i]], seen);
    }
  }
}