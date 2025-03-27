import VNode from "../core/vdom/vnode";
import { Component } from "./component"

export interface VNodeData {
  key?: string | number
  slot?: string
  // ref?: string | Ref | ((el: any) => void) @todo Ref
  is?: string
  pre?: boolean
  tag?: string
  staticClass?: string
  class?: any
  staticStyle?: { [key: string]: any }
  style?: string | Array<Object> | Object
  normalizedStyle?: Object
  props?: { [key: string]: any }
  attrs?: { [key: string]: string }
  domProps?: { [key: string]: any }
  hook?: { [key: string]: Function }
  on?: { [key: string]: Function | Array<Function> }
  nativeOn?: { [key: string]: Function | Array<Function> }
  transition?: Object
  show?: boolean // marker for v-show
  inlineTemplate?: {
    render: Function
    staticRenderFns: Array<Function>
  }
  // directives?: Array<VNodeDirective> @todo: Directived implements
  keepAlive?: boolean
  scopedSlots?: { [key: string]: Function }
  model?: {
    value: any
    callback: Function
  }

  [key: string]: any
}

export type VNodeCopomemntOptions = {
  Ctor: typeof Component;
  propsData?: Object
  listeners?: Record<string, Function | Function[]>,
  children?: Array<VNode>
  tag?: string
}

export type VNodeWithData = VNode & {
  tag: string;
  data: VNodeData;
  children: Array<VNode>;
  text: void;
  element: any;
  ns: string | void; // 命名空间
  context: Component;
  key: string | number | undefined;
  parant?: VNodeWithData;
  componentOptions?: VNodeCopomemntOptions;
  componentInstance?: Component;
  isRootInsert: boolean; // 是否是根节点
}

export type VNodeChildren = Array<null | VNode | string | number | VNodeChildren> | string;

export type MountedComponentVNode = VNode & {
  context: Component;
  componentOptions: VNodeCopomemntOptions;
  componentInstance: Component;
  parent: VNode;
  data: VNodeData;
}