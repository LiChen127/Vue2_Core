import Watcher from "../core/observer/watcher";
import VNode from "../core/vdom/vnode";
import { ComponentOptions } from "./options";
import { VNodeChildren } from "./vnode";

export declare class Component {
  constructor(options: any);

  static cid: number;
  static options: Record<string, any>;
  // static extend: GlobalAPI['extend'] @todo: GlobalApi
  static superOptions: Record<string, any>
  static extendOptions: Record<string, any>
  static sealedOptions: Record<string, any>
  static super: typeof Component

  // public
  $el: any;
  $data: Record<string, any>;
  $props: Record<string, any>;
  $options: ComponentOptions;
  $parent: Component | undefined;
  $root: Component;
  $children: Array<Component>;
  $refs: {
    [key: string]: Component | Element | Array<Component | Element> | undefined;
  }
  $slots: {
    [key: string]: Array<VNode>;
  }
  $scopedSlots: { [key: string]: () => VNode[] | undefined };
  $vnode: VNode;
  $attrs: { [key: string]: string };
  $listeners: { [key: string]: Function | Function[] }
  $isServer: boolean;

  $mount: (
    element?: Element | string,
    hydrating?: boolean
  ) => Component & { [key: string]: any }
  $forceUpdate: () => void;
  $destroy: () => void;
  $set: <T>(
    target: Record<string, any> | Array<T>,
    key: string | number,
    value: T
  ) => void;
  $delete: <T>(
    target: Record<string, any> | Array<T>,
    key: string | number
  ) => void
  $watch: (
    expOrFn: string | (() => any),
    cb: Function,
    options?: Record<string, any>
  ) => Function
  $on: (event: string | Array<string>, fn: Function) => Component
  $once: (event: string, fn: Function) => Component
  $off: (event?: string | Array<string>, fn?: Function) => Component
  $emit: (event: string, ...args: Array<any>) => Component
  $nextTick: (fn: (...args: any[]) => any) => void | Promise<any>
  $createElement: (
    tag?: string | Component,
    data?: Record<string, any>,
    children?: VNodeChildren
  ) => VNode

  // private properties
  // private properties
  _uid: number | string
  _name: string // this only exists in dev mode
  _isVue: true
  __v_skip: true
  _self: Component
  _renderProxy: Component
  _renderContext?: Component
  _watcher: Watcher | null
  // _scope: EffectScope
  _computedWatchers: { [key: string]: Watcher }
  _data: Record<string, any>
  _props: Record<string, any>
  _events: Record<string, any>
  _inactive: boolean | null
  _directInactive: boolean
  _isMounted: boolean
  _isDestroyed: boolean
  _isBeingDestroyed: boolean
  _vnode?: VNode | null // self root node
  _staticTrees?: Array<VNode> | null // v-once cached trees
  _hasHookEvent: boolean
  _provided: Record<string, any>

  // 生命周期
  _init: Function;
  _mount: (el?: Element | void, hydrating?: boolean) => Component;
  _update: (vnode: VNode, hydrating?: boolean) => void;

  // rendering
  _render: () => VNode;

  __patch__: (
    a: Element | VNode | void | null,
    b: VNode | null,
    hydrating?: boolean,
    removeOnly?: boolean,
    parentElm?: any,
    refElm?: any
  ) => any;

  // 私有
  _isComponent?: true;
  _propKeys?: Array<string>;
  _parentVnode?: VNode;
  _parentListeners?: object | null;
  _renderChildren?: Array<VNode> | null;
  _componentTag: string | null;
  _scopeId: string | null;
  _base: typeof Component;
}