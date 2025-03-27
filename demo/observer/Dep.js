export default class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    if (this.subs.length) {
      const index = this.subs.indexOf(sub);
      index > -1 ? this.subs.splice(index, 1) : null;
    }
  }

  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}