import { rm } from "fs";
import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.addElement",
  displayName: "添加数组元素",
  comment: "数组对象${array}中，在数组末尾添加元素${value}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "数组对象",
      type: "string",
      addConfig: {
        label: "数组对象",
        type: "variable",
        defaultValue: "",
      },
    },
    value: {
      name: "value",
      value: "",
      display: "数组元素值",
      type: "string",
      addConfig: {
        label: "数组元素值",
        placeholder: "请输入要添加的元素值",
        type: "string",
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
  value: string;
}) {
  array.push(value);
};
