import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
  name: "scheduler.getTaskStatus",
  icon: "icon-task-status",
  displayName: "获取任务状态",
  comment: "获取执行对象${executionObject}的状态信息到变量${statusInfo}中",
  inputs: {
    executionObject: {
      name: "executionObject",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "执行对象",
        placeholder: "选择执行对象",
        type: "variable",
        filtersType: "scheduler.executionObject",
        required: true,
        autoComplete: true,
      },
    },
  },

  outputs: {
    statusInfo: {
      name: "",
      display: "状态信息",
      type: "scheduler.statusInfo",
      addConfig: {
        label: "状态信息",
        type: "variable",
        defaultValue: "statusInfo",
      },
    },
  }
};

export const impl = async function ({executionObject}: {executionObject: any}) {
  console.log('获取任务状态，ID:', executionObject.id);
  
  if (executionObject && typeof executionObject.getStatus === 'function') {
    return executionObject.getStatus();
  } else {
    console.error('无效的执行对象');
    return {
      error: '无效的执行对象',
      id: null,
      status: 'unknown'
    };
  }
}; 