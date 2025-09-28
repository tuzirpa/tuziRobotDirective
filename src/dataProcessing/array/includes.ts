import { rm } from "fs";
import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.includes",
  displayName: "数组是否包含指定值",
  comment: "数组对象${array}中，是否包含${value},返回值为${isInclude}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "数组对象",
        type: "variable",
        defaultValue: "",
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
        type: "textarea",
        defaultValue: "",
        required: true,
      },
    },
  },

  outputs: {
    isInclude: {
      name: "isInclude",
      display: "数组元素是否包含指定值",
      type: "string",
      addConfig: {
        label: "是否包含指定值",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function ({
  array,
  value,
}: {
  array: Array<any>;
  value: string;
}) {
  const isInclude = array.includes(value);
  return { isInclude };
};
