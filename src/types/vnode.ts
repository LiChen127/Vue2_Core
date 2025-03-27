import VNode from "../core/vdom/vnode";
import { Component } from "./component"

export interface VNodeData {

}

export type VNodeCopomemntOptions = {
  Ctor: typeof Component;
  propsData?: Object
  listeners?: Record<string, Function | Function[]>,
  children?: Array<VNode>
  tag?: string
}