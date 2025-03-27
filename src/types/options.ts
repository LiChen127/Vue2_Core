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
  staticRednerFns?: Array<Function>;
}