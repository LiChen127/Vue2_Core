import { Component } from "../../types/component";
import { InternalComponentOptions } from "../../types/options";
import { mergeOptions } from "../../utils/options";
import { extend } from "../../utils/shared";
import { initEvents } from "./event";
import { callHook, initLifecycle } from "./lifecycle";


let uid = 0;

export function initMixin(Vue: typeof Component) {
  Vue.prototype._init = function (options?: Record<string, any>) {
    const vm = this as Component;
    vm._uid = uid++;

    let startTag, endTag;

    // 下面的很多代码都是用来处理options的，先跳过，如果说影响功能，可以再看
    // vm._isVue = true;

    if (options && options._isComponent) {
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      );
    }

    vm._renderProxy = vm;

    vm._self = vm; // 挂载自身实例

    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate', undefined, false /**setContext */);
    initInjections(vm);
    initState(vm);
    initProvide(vm);
    callHook(vm, 'created');

    if (vm.$options.el) {
      // 挂载
      vm.$mount(vm.$options.el);
    }
  }
}

export function initInternalComponent(
  vm: Component,
  options: InternalComponentOptions
) {
  const opts = (vm.$options = Object.create(vm.constructor as any).options);
  const parentVNode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVNode;

  const vnodeComonentOptions = parentVNode.componentOptions!;
  opts.propsData = vnodeComonentOptions.propsData;
  opts._parentListeners = vnodeComonentOptions.listeners;
  opts._renderChildren = vnodeComonentOptions.children;
  opts._componentTag = vnodeComonentOptions.tag;


  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

export function resolveConstructorOptions(Ctor: typeof Component) {
  let options = Ctor.options;
  if (Ctor.super) {
    // 如果存在父类，则递归调用父类的options
    const superOptions = resolveConstructorOptions(Ctor.super);
    const cachedSuperOptions = Ctor.superOptions;
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions;
      const modifiedOptions = resolveModifiedOptions(Ctor);
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }
  return options;
}

function resolveModifiedOptions(
  Ctor: typeof Component
): Record<string, any> | null {
  let modified;
  const latest = Ctor.options;
  const sealed = Ctor.sealedOptions;
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {};
      modified[key] = latest[key];
    }
  }
  return modified;
}