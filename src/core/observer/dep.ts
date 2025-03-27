

let uid = 0;

const pendingCleanupDeps: Dep[] = [];

export const cleanupDepts = () => {
  for (let i = 0; i < pendingCleanupDeps.length; i++) {
    const dep = pendingCleanupDeps[i];
    dep.subs = dep.subs.filter(sub => sub)
    dep._pending = false;
  }
  pendingCleanupDeps.length = 0;
}

export interface DepTarget {
  id: number
  addDep(dep: Dep): void
  update(): void
}

/**
 * 依赖存储类
 */
export default class Dep {
  static target: DepTarget | null;
  id: number;
  subs: Array<DepTarget | null>;
  _pending = false;

  constructor() {
    this.id = uid++;
    // 依赖存储数组
    this.subs = [];
  }

  addSub(sub: DepTarget) {
    this.subs.push(sub);
  }

  removeSub(sub: DepTarget) {
    this.subs[this.subs.indexOf(sub)] = null;
    if (!this._pending) {
      this._pending = true;
      // pendingCleanupDepth.push(this);
    }
  }
  /**
   * 将依赖添加到Dep.target中
   * @param info 
   */
  depend(info?: any) {
    if (Dep.target) {
      Dep.target.addDep(this);
      // DEV track todo
    }
  }
  /**
   * 遍历数组调用所有依赖的更新方法
   * @param info 
   */
  notify(info?: any) {
    const subs = this.subs.filter(s => s) as DepTarget[];
    for (let i = 0; i < subs.length; i++) {
      const sub = subs[i];
      sub.update();
    }
  }
}

Dep.target = null;

const targetStack: Array<DepTarget | null | undefined> = [];

export function pushTarget(target?: DepTarget | null) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
