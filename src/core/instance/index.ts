import { GlobalAPI } from "../../types/global-api";
import { eventsMixin } from "./event";


function Vue(options) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

export default Vue as unknown as GlobalAPI;