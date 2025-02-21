import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
  name: "dataProcessing.map.createMap",
  displayName: "创建Map存储数据",
  comment: "创建Map结构存储数据,${mapObj}为Map对象",
  inputs: {},

  outputs: {
    mapObj: {
      name: "mapObj",
      display: "Map对象",
      type: "string",
      addConfig: {
        label: "Map对象",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function () {
  return { mapObj: new Map() };
};
