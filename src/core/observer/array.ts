import { define } from "../../utils/lang";


const arrayProto = Array.prototype;

// 数组原型
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

methodsToPatch.forEach(method => {
  const original = arrayProto[method];
  define(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    // 对参数进行监听
    if (inserted) ob.observeArray(inserted);
    ob.dep.notify();
    return result;
  })
})