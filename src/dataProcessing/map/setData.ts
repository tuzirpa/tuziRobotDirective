import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "dataProcessing.map.setData",
  displayName: "设置Map存储数据",
  comment:
    "设置Map存储数据，将数据存入${mapObj}对象中,key为${key},value为${value}",
  inputs: {
    mapObj: {
      name: "mapObj",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        required: true,
        label: "Map对象",
        placeholder: "选择Map对象",
        type: "variable",
        filtersType: "map",
        autoComplete: true,
      },
    },
    key: {
      name: "key",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        required: true,
        label: "数据kay",
        placeholder: "数据kay",
        type: "string",
        autoComplete: true,
      },
    },
    value: {
      name: "value",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        required: true,
        label: "数据值",
        placeholder: "数据值",
        type: "string",
        autoComplete: true,
      },
    },
  },

  outputs: {},
};

export const impl = async function ({
  mapObj,
  key,
  value,
}: {
  mapObj: Map<any, any>;
  key: string;
  value: string;
}) {
  mapObj.set(key, value);
  console.log("设置Map数据", "key:", key, "value:", value, mapObj);
};
