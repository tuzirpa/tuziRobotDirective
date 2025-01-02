import { DirectiveTree } from "../types";
export const config: DirectiveTree = {
  name: "timer.closeTimerTask",
  icon: "icon-web-create",
  displayName: "清除定时任务",
  comment: "清除定时任务${timerTask}",
  inputs: {
    timerTask: {
      name: "timerTask",
      value: "",
      display: "",
      type: "number",
      addConfig: {
        label: "定时任务",
        placeholder: "定时任务",
        type: "variable",
        filtersType: "timer.timerTask",
        required: true,
        autoComplete: true,
      },
    },
  },

  outputs: {},
};

export const impl = async function ({ timerTask }: { timerTask: number }) {
  if (timerTask) {
    clearInterval(timerTask);
  }
};
