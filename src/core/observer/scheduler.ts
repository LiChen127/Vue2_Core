import { Component } from "../../types/component"
import { nextTick } from "../../utils/next-tick"
import { activateChildComponent, callHook } from "../instance/lifecycle"
import Dep, { cleanupDepts } from "./dep"
import Watcher from "./watcher"

export const MAX_UPDATE_COUNT = 100

const queue: Array<Watcher> = []
const activatedChildren: Array<Component> = []
let has: { [key: number]: true | undefined | null } = {}
let circular: { [key: number]: number } = {}
let waiting = false
let flushing = false
let index = 0
/**
 * 重置调度器状态
 */
function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0
  has = {}
  waiting = flushing = false
}

export let currentFlushTimestamp = 0;

let getNow: () => number = Date.now;

const sortCompareFn = (a: Watcher, b: Watcher): number => {
  if (a.post) {
    if (!b.post) return 1
  } else if (b.post) {
    return -1
  }
  return a.id - b.id
}

function flushShedulerQuue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  let watcher, id;
  queue.sort(sortCompareFn);

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];
    if (watcher.before) {
      watcher.before();
    }
    id = watcher.id;
    has[id] = null;
    watcher.run();
  }

  const activatedQueue = activatedChildren.slice();
  const updatedQueue = queue.slice();

  resetSchedulerState();


  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue);
  cleanupDepts();
}


function callUpdatedHooks(queue: Array<Watcher>) {
  let i = queue.length;
  while (i--) {
    const watcher = queue[i];
    const vm = watcher.vm;
    if (vm && vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

export function queueActivatedComponent(vm: Component) {
  vm._inactive = true;
  activatedChildren.push(vm);
}

function callActivatedHooks(queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = false;
    activateChildComponent(queue[i], true);
  }
}

export function queueWatcher(watcher: Watcher) {
  const id = watcher.id;
  if (has[id] !== null) {
    return;
  }
  if (watcher === Dep.target && watcher.noRecurse) {
    return;
  }
  has[id] = true;
  if (!flushing) {
    queue.push(watcher);
  } else {
    let i = queue.length - 1;
    while (i > index && queue[i].id > watcher.id) {
      i--;
    }
    queue.splice(i + 1, 0, watcher);
  }
  if (!waiting) {
    waiting = true;

    nextTick(flushShedulerQuue);
  }
}