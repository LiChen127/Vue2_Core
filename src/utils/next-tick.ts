
export let isUsingMicroTask = false;

const callbacks: Array<Function> = [];

let pending = false;

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice();
  callbacks.length = 0;
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

let timerFunc;

if (typeof Promise !== 'undefined') {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(flushCallbacks);
  }
  isUsingMicroTask = true;
} else if (typeof MutationObserver !== 'undefined') {
  let counter = 1;
  const observer = new MutationObserver(flushCallbacks);
  const textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });
  timerFunc = () => {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  }
  isUsingMicroTask = true;
} else if (typeof setImmediate !== 'undefined') {
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
} else {
  setTimeout(() => {
    flushCallbacks
  }, 0);
}

export function nextTick(): Promise<void>;

export function nextTick<T>(this: T, cb: (this: T, ...args: any[]) => any): void;

export function nextTick<T>(cb: (this: T, ...args: any[]) => any, ctx: T): void;

export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve;
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (error: any) {
        throw new Error("nextTick error");
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
    if (!pending) {
      pending = true;
      timerFunc();
    }
  })
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
} 