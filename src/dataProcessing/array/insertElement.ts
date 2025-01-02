import { rm } from "fs";
import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.insertElement",
  displayName: "插入数组元素",
  comment: "数组对象${array}中，在下标${index}位置插入元素${value}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "数组对象",
      type: "variable",
      addConfig: {
        label: "数组对象",
        type: "variable",
        filtersType: "array",
      },
    },
    index: {
      name: "index",
      value: "",
      display: "数组下标",
      type: "number",
      addConfig: {
        label: "数组下标",
        type: "string",
        defaultValue: "0",
        required: true,
      },
    },
    value: {
      name: "value",
      value: "",
      display: "数组元素值",
      type: "string",
      addConfig: {
        label: "数组元素值",
        placeholder: "请输入要插入的元素值",
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
  index,
  value,
}: {
  array: Array<any>;
  index: number;
  value: string;
}) {
  array.splice(index, 0, value);
};
