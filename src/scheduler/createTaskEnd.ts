import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
  name: "scheduler.createTaskEnd",
  icon: "icon-task-create",
  displayName: "创建任务结束标记",
  comment: "创建任务结束标记",
  isControlEnd: true,
  inputs: {},
  outputs: {},

  async toCode() {
    return `});`;
  },
};

export const impl = async function () {}; 