import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
  name: "scheduler.stopTask",
  icon: "icon-task-stop",
  displayName: "停止任务",
  comment: "停止执行对象${executionObject}的任务执行",
  inputs: {
    executionObject: {
      name: "executionObject",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "执行对象",
        placeholder: "选择要停止的执行对象",
        type: "variable",
        filtersType: "scheduler.executionObject",
        required: true,
        autoComplete: true,
      },
    },
  },

  outputs: {
    result: {
      name: "",
      display: "停止结果",
      type: "scheduler.stopResult",
      addConfig: {
        label: "停止结果",
        type: "variable",
        defaultValue: "stopResult",
      },
    },
  }
};

export const impl = async function ({ executionObject }: { executionObject: any }) {
  console.log('停止任务，ID:', executionObject.id);
  if (executionObject && typeof executionObject.stop === 'function') {
    return executionObject.stop();
  } else {
    console.error('无效的执行对象');
    return {
      error: '无效的执行对象',
      success: false
    };
  }
}; 