import { DirectiveTree } from "../types";
export const config: DirectiveTree = {
  name: "web.setOneTimerTaskEnd",
  icon: "icon-web-create",
  displayName: "定时器结束标记",
  comment: "定时器结束标记",
  isControlEnd: true,
  inputs: {},

  outputs: {},

  async toCode() {
    return `});`;
  },
};

export const impl = async function () {};
