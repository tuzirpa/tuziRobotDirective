import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.forArray",
  isControl: true,
  isLoop: true,
  isControlEnd: false,
  displayName: "循环数组",
  comment: "循环数组数据 ${array}, 输出数组值 ${value}",
  inputs: {
    array: {
      name: "array",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        required: true,
        label: "数组对象",
        placeholder: "数组对象",
        type: "variable",
        filtersType: "array",
        autoComplete: true,
      },
    },
  },

  outputs: {
    value: {
      name: "value",
      type: "string",
      display: "数组值",
      addConfig: {
        type: "variable",
        label: "数组值",
      },
    },
  },
  async toCode(directive, block) {
    const { array } = directive.inputs;
    const { value } = directive.outputs;
    const code = `for (const ${value.name} of await robotUtil.system.dataProcessing.array.forArray(${array.value},${block})) {`;
    return code;
  },
};

export const impl = async function (array: Array<any>) {
  return array.values();
};
