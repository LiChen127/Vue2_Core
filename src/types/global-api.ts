import { Component } from "./component";

/**
 * 全局API
 */
export interface GlobalAPI {
  (options?: any): void;
  cid: number;
  options: Record<string, any>;
  // config: Config; @todo
  util: Object;

  extend: (options: typeof Component | object) => typeof Component;
  set: <T>(target: Object | Array<T>, key: string | number, val: T) => T;
  delete: (target: Object | Array<any>, key: string | number) => void;
  nextTick: (cb: Function, ctx?: any) => void;
  use: (plugin: Function | Object) => GlobalAPI;
  mixin: (mixin: Object) => GlobalAPI;
  compile: (template: string, options?: Object) => Function;
  directive: (
    id: string,
    definition?: Function | Object,
    extend?: Function
  ) => void;
  component: (
    id: string,
    definition?: typeof Component | Object,
  ) => typeof Component | void;
  filter: (id: string, definition: Function) => Function | void;
  observable: <T>(value?: T) => T;
  // 允许动态方法注册
  [key: string]: any;
}