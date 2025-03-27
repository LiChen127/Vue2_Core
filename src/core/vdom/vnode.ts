/**
 * 虚拟节点
 */

import { Component } from "../../types/component";
import { VNodeCopomemntOptions, VNodeData } from "../../types/vnode";

export default class VNode {
  tag?: string;
  data: VNodeData | undefined;
  children?: Array<VNode> | null;
  text?: string;
  element: Node | undefined;
  context?: Component;
  componentOptions?: VNodeCopomemntOptions;
  asyncFactory?: Function;

  isComment: boolean;
  isCloned: boolean;

  constructor(
    tag?: string,
    data?: VNodeData,
    children?: Array<VNode> | null,
    text?: string,
    element?: Node,
    context?: Component,
    componentOptions?: VNodeCopomemntOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.element = element;
    this.context = context;
    this.componentOptions = componentOptions;
    this.asyncFactory = asyncFactory;
  }
}

/**
 * 创建注释节点
 */
export const createEmptyVNode = () => {
  const node = new VNode(undefined, undefined, undefined, undefined, undefined);
  node.text = '';
  node.isComment = true;
  return node;
};

/**
 * 创建文本节点
 */
export const createTextVNode = (val: string | number) => {
  return new VNode(
    undefined,
    undefined,
    undefined,
    String(val),
  );
}

/**
 * 克隆节点
 */
export function cloneVNode(vnode: VNode): VNode {
  const clonedVnode = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.element,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  );

  return clonedVnode;
}