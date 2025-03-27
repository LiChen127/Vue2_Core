import { Component } from "../../types/component";


export function initRender(vm: Component) {
  vm._vnode = null;
  vm._staticTrees = null;
  const opts = vm.$options;
  const parentVNode = (vm.$vnode = opts._parentVnode!);
  const renderContext = parentVNode && parentVNode.context;
}