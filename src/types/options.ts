import VNode from "../core/vdom/vnode";
import { Component } from "./component";
/**
 * 组件配置类型
 */
export type ComponentOptions = {
  [key: string]: any;

  componentId?: string;

  // data
  data: object | Function | void;
  props?: string[] | Record<string, Function | Array<Function> | null | PropOptions>;
  propsData?: object;
  computed?: {
    [key: string]: Function |
    {
      get?: Function
      set?: Function
      cache?: boolean
    }
  };
  methods?: { [key: string]: Function };
  watch?: {
    [key: string]: Function | string
  };

  // DOM
  element?: string | Element
  template?: string;
  render: (h: () => VNode) => VNode;
  staticRenderFns?: Array<() => VNode>

  // 生命周期
  beforeCreate?: Function;
  created?: Function;
  beforeMount?: Function;
  mounted?: Function;
  beforeUpdate?: Function;
  updated?: Function;
  activated?: Function;
  deactivated?: Function;
  beforeDestroy?: Function;
  destroyed?: Function;
  errorCaptured?: () => boolean | void
  serverPrefetch?: Function
  // renderTracked?(e: DebuggerEvent): void
  // renderTriggerd?(e: DebuggerEvent): void

  // asstest
  directives?: { [key: string]: object };
  components?: { [key: string]: Component };
  transitions?: { [key: string]: object };
  filters?: { [key: string]: Function };

  // context
  provide?: Record<string, | symbol | any> | (() => Record<string | symbol, any>);
  inject?:
  | { [key: string]: string | symbol | { from?: string | symbol; default?: any } }
  | Array<string>

  // component v-model customization
  model?: {
    prop?: string;
    event?: string;
  }
  // misc
  parent?: Component;
  mixins?: Array<object>;
  name?: string;
  extends?: Component | object;
  delimiters?: [string, string];
  comments?: boolean;
  inheritAttrs?: boolean;

  // Legacy API
  abstract?: any;

  // private
  _isComponent?: true;
  _propKeys?: Array<string>;
  _parentVnode?: VNode
  _parentListeners?: object | null
  _renderChildren?: Array<VNode> | null
  _componentTag: string | null
  _scopeId: string | null
  _base: typeof Component;
}

// prop配置
export type PropOptions = {
  type?: Function | Array<Function> | null;
  default?: any;
  required?: boolean | null;
  validator?: Function | null;
}
// 组件选项
export type InternalComponentOptions = {
  _isComponent: boolean;
  parent: Component;
  _parentVnode: VNode;
  render?: Function;
  staticRenderFns?: Array<Function>;
}