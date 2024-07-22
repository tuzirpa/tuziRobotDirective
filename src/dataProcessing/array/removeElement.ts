import { rm } from "fs";
import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "dataProcessing.array.removeElement",
  displayName: "移除数组元素",
  comment: "数组对象${array}中,在${index}数组下标,${rmNumber}移除元素数量",
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
    index: {
      name: "index",
      value: "",
      display: "数组下标",
      type: "number",
      addConfig: {
        label: "数组对象",
        type: "variable",
        defaultValue: "0",
        required: true,
      },
    },
    rmNumber: {
      name: "rmNumber",
      value: "",
      display: "移除元素数量",
      type: "number",
      addConfig: {
        label: "移除元素数量",
        placeholder: "不填写则从下标开始移除所有元素",
        type: "variable",
        defaultValue: "",
      },
    },
  },

  outputs: {
    arrayObj: {
      name: "arrayObj",
      display: "数组对象",
      type: "string",
      addConfig: {
        label: "数组对象",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function ({
  array,
  index,
  rmNumber,
}: {
  array: Array<any>;
  index: number;
  rmNumber: number;
}) {
  let arrayObj;
  if (rmNumber) {
    arrayObj = array.splice(index, rmNumber);
  } else {
    arrayObj = array.splice(index);
  }

  return { arrayObj };
};
