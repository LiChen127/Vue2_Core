export function isDef<T>(v: T): v is NonNullable<T> {
  return v !== undefined && v !== null;
}

export function isUndef<T>(v: T): v is null | undefined {
  return v === undefined || v === null;
}

export function isTrue(v: any): boolean {
  return v === true;
}

export function isFalse(v: any): boolean {
  return v === false;
}

export function isFunction(v: any): v is (...args: any[]) => any {
  return typeof v === 'function';
}

export function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object';
}

export const isArray = Array.isArray;

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwn(obj: Object | Array<any>, key: string): boolean {
  return hasOwnProperty.call(obj, key);
}

export function hasChanged(x: unknown, y: unknown): boolean {
  if (x === y) {
    return x === 0 && 1 / x !== 1 / (y as number);
  } else {
    return x === x || y === y;
  }
}

export function remove(arr: Array<any>, item: any): Array<any> | void {
  const len = arr.length;
  if (len) {
    if (item === arr[len - 1]) {
      arr.length = len - 1;
      return;
    }
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

export function cached<R>(fn: (str: string) => R): (str: string) => R {
  const cache = Object.create(null);
  return (str: string) => {
    const hit = cache[str];
    // 命中的话，返回，没命中缓存，执行fn，并缓存
    return hit || (cache[str] = fn(str));
  };
}

export function toArray(list: any, start?: number): Array<any> {
  start = start || 0;
  let i = list.length - start;
  const ret: Array<any> = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

export function extend(to: Record<PropertyKey, any>, _from: Record<PropertyKey, any>): Record<PropertyKey, any> {
  for (const key in _from) {
    to[key] = _from[key];
  }
  return to;
}

export function noop(a?: any, b?: any, c?: any) { }