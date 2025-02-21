import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.createArray",
  displayName: "创建数组",
  comment: "创建数组结构存储数据,${array}为数组对象",
  inputs: {},

  outputs: {
    array: {
      name: "array",
      display: "数组对象",
      type: "array",
      addConfig: {
        label: "数组对象",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function () {
  return { array: new Array() };
};
