import { DirectiveTree } from "tuzirobot/types";
import { typeToCode } from 'tuzirobot/commonUtil';

export const config: DirectiveTree = {
  name: "scheduler.createTask",
  icon: "icon-task-create",
  isControl: true,
  appendDirectiveNames: ['scheduler.createTaskEnd'],
  displayName: "创建任务",
  comment: "创建任务函数${taskName}并保存到变量${taskFunction}中",
  inputs: {
    taskName: {
      name: "taskName",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "任务名称",
        placeholder: "请输入任务名称",
        type: "string",
        required: true,
      },
    },
  },

  outputs: {
    taskFunction: {
      name: "",
      display: "任务函数",
      type: "scheduler.taskFunction",
      addConfig: {
        label: "任务函数",
        type: "variable",
        defaultValue: "taskFunction",
      },
    },
  },

  async toCode(directive, block) {
    const { taskName } = directive.inputs;
    const { taskFunction } = directive.outputs;

    return `var createTaskFunc = await robotUtil.system.scheduler.createTask(${typeToCode(taskName)}, ${
        block}); const ${taskFunction.name} = createTaskFunc(async () => {`;
  },
};

export const impl = async function (taskName: string) {
  console.log('创建任务函数:', taskName);
  
  // 返回一个函数，这个函数接受用户定义的任务逻辑作为参数
  return function (taskLogic: Function) {
    console.log('任务函数已创建:', taskName);
    
    // 返回包装后的任务函数
    return async function() {
      console.log('开始执行任务:', taskName);
      try {
        await taskLogic();
        console.log('任务执行完成:', taskName);
      } catch (error) {
        console.error('任务执行失败:', taskName, error);
        throw error;
      }
    };
  };
}; 