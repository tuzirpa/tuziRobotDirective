import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.addElement",
  displayName: "添加数组元素(批量传入数组)",
  comment: "数组对象${array}中，在数组末尾添加元素${value}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "数组对象",
      type: "variable",
      addConfig: {
        label: "数组对象",
        type: "variable",
        placeholder: "选择数组对象",
        filtersType: "array",
        required: true,
      },
    },
    value: {
      name: "value",
      value: "",
      display: "数组元素值",
      type: "variable",
      addConfig: {
        label: "要添加的数据数组",
        placeholder: "请输入要添加的数组",
        type: "variable",
        filtersType: "array",
        autoComplete: true,
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
  array: any[];
  value: any[];
}) {
  array.push(...value);
};
