import { rm } from "fs";
import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.addElement",
  displayName: "添加数组元素",
  comment: "在数组对象${array}末尾添加元素${value}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "数组对象",
        type: "variable",
        placeholder: "选择数组对象",
        autoComplete: true,
        filtersType: "array",
        required: true,
      },
    },
    value: {
      name: "value",
      value: "",
      display: "",
      type: "object",
      addConfig: {
        label: "数组元素值",
        placeholder: "请输入要添加的元素值",
        type: "object",

        defaultValue: "",
        required: true,
      },
    },
  },

  outputs: {},
};

export const impl = async function ({
  array,
  value,
}: {
  array: Array<any>;
  value: Object;
}) {
  array.push(value);
};
