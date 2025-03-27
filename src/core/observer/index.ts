import { define } from "../../utils/lang";
import { hasChanged, hasOwn, isArray } from "../../utils/shared";
import { arrayMethods } from "./array";
import Dep from "./dep";


const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

const NO_INITIAL_VALUE = {};

export let shouldObserve: boolean = true;

export function toggleObserving(v: boolean) {
  shouldObserve = v;
}
/**
 * 核心数据观察者类，响应式探测的基础
 */
export class Observer {
  dep: Dep;
  vmCount: number;
  constructor(value: any) {
    this.dep = new Dep();
    this.vmCount = 0;
    // 响应式
    define(value, '__ob__', this);
    if (isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const key = arrayKeys[i];
        define(value, key, value[key]);
        this.observeArray(value);
      }
    } else {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        defineReactive(value, key, NO_INITIAL_VALUE);
      }
    }
  }
  observeArray(value: any[]) {
    for (let i = 0; i < value.length; i++) {
      observe(value[i]);
    }
  }
}

export function defineReactive(
  obj: any,
  key: string,
  val?: any,
) {
  const dep = new Dep();
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  const getter = property && property.get;
  const setter = property && property.set;

  if ((!getter || setter) && (val == NO_INITIAL_VALUE || arguments.length === 2)) {
    val = obj[key];
  }
  let childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
      }
      if (childOb) {
        childOb.dep.depend();
        if (isArray(value)) {
          dependArray(value);
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val;
      if (!hasChanged(newVal, val)) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else if (getter) {
        return;
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  })
  return dep;
}

export function observe(
  value: any,
): Observer | void {
  if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
  if (shouldObserve) {
    return new Observer(value);
  }
}

function dependArray(value: Array<any>) {
  for (let i = 0; i < value.length; i++) {
    const e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();
    if (isArray(e)) {
      dependArray(e);
    }
  }
}