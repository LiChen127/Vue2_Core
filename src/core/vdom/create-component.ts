/**
 * 创建组件
 */

import { Component } from "../../types/component";
import { ComponentOptions, InternalComponentOptions } from "../../types/options";
import { MountedComponentVNode, VNodeWithData } from "../../types/vnode";
import { isDef } from "../../utils/shared";


/**
 * 获取组件名
 */
export function getComponentName(options: ComponentOptions) {
  return options.name || options._componentTag || options.name;
}

// 组件hooks
const componentVNodeHooks = {
  // @todo: 加入hydrate服务端渲染的逻辑，目前只考虑客户端渲染
  init(vnode: VNodeWithData, hydrating: boolean): boolean | void {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      const moutedValue: any = vnode;
      componentVNodeHooks.prepatch(moutedValue, moutedValue);
    } else {
      // const child = createComponentInstanceForVnode(
      //   vnode,
      //   activeInstance
      // );
      child.$mount(hydrating ? vnode.element : undefined, hydrating);
    }
  }
  /**
   * prepatch
   * @param {*} oldVnode
   * @param {*} vnode
   */
  prepatch(oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions;
    const child = oldVnode.componentInstance;
    updateChildComponent(child, options.propsData, options.listeners, vnode, options.children);
  }
}

export function createComponentInstanceForVnode(vnode: any, parent?: any): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent,
  };

  const inlineTemplate = vnode.data.inlineTemplate;
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRednerFns = inlineTemplate.staticRenderFns;
  }

  return new vnode.componentOptions.Ctor(options);
}

// export function updateChildComponent