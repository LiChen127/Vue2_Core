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
