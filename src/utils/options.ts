import { Component } from "../types/component";
import { ComponentOptions } from "../types/options";
import { hasOwn, isFunction } from "./shared";

const strats = Object.create(null);

export function mergeOptions(
  parent: Record<string, any>,
  child: Record<string, any>,
  vm?: Component
): ComponentOptions {
  if (isFunction(child)) {
    child = child.options;
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }
  const options: ComponentOptions = {} as any;

  let key;

  for (key in parent) {
    mergeField(key);
  }

  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }

  function mergeField(key: any) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal;
}