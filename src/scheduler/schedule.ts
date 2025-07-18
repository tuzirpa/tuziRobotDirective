import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
  name: "scheduler.schedule",
  icon: "icon-task-schedule",
  isControl: false,
  appendDirectiveNames: ['scheduler.scheduleEnd'],
  displayName: "调度任务",
  comment: "调度任务${taskFunction}，执行模式：${executeMode}",
  inputs: {
    taskFunction: {
      name: "taskFunction",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "任务函数",
        placeholder: "选择任务函数",
        type: "variable",
        filtersType: "scheduler.taskFunction",
        required: true,
        autoComplete: true,
      },
    },
    executeMode: {
      name: "executeMode",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "执行模式",
        placeholder: "选择执行模式",
        type: "select",
        required: true,
        options: [
          {
            label: "立即执行",
            value: "immediate"
          },
          {
            label: "延迟执行",
            value: "delay"
          },
          {
            label: "定时重复执行",
            value: "repeat"
          },
          {
            label: "一次性延迟执行",
            value: "once"
          }
        ],
        defaultValue: "immediate"
      }
    },
    syncMode: {
      name: "syncMode",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "同步模式",
        placeholder: "选择同步模式",
        type: "select",
        required: true,
        filters: "this.inputs.executeMode.value === 'immediate'",
        options: [
          {
            label: "异步执行",
            value: "async"
          },
          {
            label: "同步执行",
            value: "sync"
          }
        ],
        defaultValue: "async"
      }
    },
    delay: {
      name: "delay",
      value: "",
      display: "",
      type: "number",
      addConfig: {
        label: "延迟时间（秒）",
        placeholder: "请输入延迟秒数",
        type: "string",
        required: false,
        defaultValue: "0",
      },
    },
    repeatInterval: {
      name: "repeatInterval",
      value: "",
      display: "",
      type: "number",
      addConfig: {
        label: "重复间隔（秒）",
        placeholder: "重复执行时的间隔时间",
        type: "string",
        required: false,
        defaultValue: "1",
      },
    },
    maxExecutions: {
      name: "maxExecutions",
      value: "",
      display: "",
      type: "number",
      addConfig: {
        label: "最大执行次数",
        placeholder: "最大执行次数（0为无限制）",
        type: "string",
        required: false,
        defaultValue: "0",
      },
    },
  },

  outputs: {
    executionObject: {
      name: "",
      display: "执行对象",
      type: "scheduler.executionObject",
      addConfig: {
        label: "执行对象",
        type: "variable",
        defaultValue: "executionObject",
      },
    },
  },
};

export const impl = async function ({ taskFunction, executeMode, syncMode = 'async', delay = 0, repeatInterval = 1, maxExecutions = 0 }: 
    { taskFunction: Function, executeMode: string, syncMode?: string, delay?: number, repeatInterval?: number, maxExecutions?: number }) {
  console.log('调度任务执行，模式:', executeMode, '同步模式:', syncMode, '延迟:', delay, '秒');
  
  const executionObject: any = {
    id: Date.now() + Math.random(),
    mode: executeMode,
    syncMode: syncMode,
    delay: delay,
    repeatInterval: repeatInterval,
    maxExecutions: maxExecutions,
    currentExecutions: 0,
    status: 'created',
    isRunning: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    startedAt: null,
    stoppedAt: null,
    timeoutId: null,
    
    // 状态查询方法
    getStatus() {
      return {
        id: this.id,
        mode: this.mode,
        syncMode: this.syncMode,
        status: this.status,
        isRunning: this.isRunning,
        isActive: this.isActive,
        currentExecutions: this.currentExecutions,
        maxExecutions: this.maxExecutions,
        createdAt: this.createdAt,
        startedAt: this.startedAt,
        stoppedAt: this.stoppedAt,
      };
    },
    
    // 停止任务方法
    stop() {
      console.log('停止任务执行，ID:', this.id);
      this.isActive = false;
      this.status = 'stopped';
      this.stoppedAt = new Date().toISOString();
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
      
      
      console.log('任务已停止，ID:', this.id);
      return this.getStatus();
    }
    
  };

  // 执行任务的内部函数
  const executeTask = async () => {
    if (!executionObject.isActive) {
      console.log('任务已停止，不再执行');
      return;
    }

    if (executionObject.maxExecutions > 0 && executionObject.currentExecutions >= executionObject.maxExecutions) {
      console.log('任务达到最大执行次数:', executionObject.maxExecutions);
      executionObject.status = 'completed';
      executionObject.isActive = false;
      return;
    }

    console.log('开始执行任务，第', executionObject.currentExecutions + 1, '次, 同步模式:', syncMode);
    executionObject.status = 'running';
    executionObject.isRunning = true;
    executionObject.currentExecutions++;
    
    if (!executionObject.startedAt) {
      executionObject.startedAt = new Date().toISOString();
    }
    
    try {
      // 根据同步模式决定如何执行任务
      if (syncMode === 'sync') {
        // 同步执行 - 等待任务完成
        await taskFunction();
        console.log('任务同步执行完成，第', executionObject.currentExecutions, '次');
      } else {
        // 异步执行 - 不等待任务完成
        taskFunction().catch((error: unknown) => {
          console.error('异步任务执行失败:', error);
          executionObject.status = 'failed';
        });
        console.log('任务异步执行启动，第', executionObject.currentExecutions, '次');
      }
      
      // 根据执行模式决定后续操作
      if (executeMode === 'repeat' && executionObject.isActive) {
        if (executionObject.maxExecutions === 0 || executionObject.currentExecutions < executionObject.maxExecutions) {
          // 继续重复执行
          executionObject.timeoutId = setTimeout(executeTask, repeatInterval * 1000);
        } else {
          executionObject.status = 'completed';
          executionObject.isActive = false;
        }
      } else {
        // 对于同步模式，只有在任务完成后才标记为完成
        if (syncMode === 'sync') {
          executionObject.status = 'completed';
          executionObject.isActive = false;
        } else {
          // 异步模式立即标记为完成
          executionObject.status = 'completed';
          executionObject.isActive = false;
        }
      }
    } catch (error) {
      executionObject.status = 'failed';
      console.error('任务执行失败:', error);
    } finally {
      // 对于同步模式，在这里设置isRunning为false
      if (syncMode === 'sync') {
        executionObject.isRunning = false;
      } else {
        // 异步模式立即设置为false
        executionObject.isRunning = false;
      }
    }
  };

  // 根据执行模式启动任务
  switch (executeMode) {
    case 'immediate':
      console.log('立即执行任务');
      if (syncMode === 'sync') {
        await executeTask();
      } else {
        executeTask();
      }
      break;
      
    case 'delay':
    case 'once':
      console.log('延迟执行任务，延迟时间:', delay, '秒');
      executionObject.timeoutId = setTimeout(executeTask, delay * 1000);
      break;
      
    case 'repeat':
      console.log('重复执行任务，首次延迟:', delay, '秒，重复间隔:', repeatInterval, '秒');
      executionObject.timeoutId = setTimeout(executeTask, delay * 1000);
      break;
      
    default:
      console.error('未知的执行模式:', executeMode);
      executionObject.status = 'failed';
      break;
  }
  
  return { executionObject };
}; 