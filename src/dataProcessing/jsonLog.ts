const fs = require("fs");
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
  name: "dataProcessing.jsonLogPrint",
  displayName: "JSON对象打印",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment: "输出日志 ${content}",
  inputs: {
    content: {
      name: "要输出的内容",
      value: "",
      type: "variable",
      addConfig: {
        label: "输出内容",
        type: "variable",
        placeholder: "请输入内容",
        defaultValue: "",
        tip: "输出内容",
      },
    },
  },
  outputs: {},
};

const conver = (content: any) => {
  const cacheMap = new Map();
  const convertMapToObject = (map: Map<any, any>) => {
    const obj: Record<any, any> = {};
    for (const [key, value] of map.entries()) {
      obj[key] = ((value) => {
        const cacheKey = value;
        if (cacheMap.has(cacheKey)) {
          return cacheMap.get(cacheKey);
        }

        if (value instanceof Map) {
          return convertMapToObject(value);
        } else if (Array.isArray(value)) {
          value = value.map((item) => {
            if (item instanceof Map) {
              return convertMapToObject(item);
            }
            return item;
          });
          cacheMap.set(cacheKey, value);
          return value;
        }

        cacheMap.set(cacheKey, value);
        return value;
      })(value);
    }
    return obj;
  };

  if (content instanceof Map) {
    content = convertMapToObject(content);
  } else if (Array.isArray(content)) {
    const arr = [];
    for (let item of content) {
      if (item instanceof Map) {
        arr.push(convertMapToObject(item));
      } else {
        arr.push(item);
      }
    }
    content = arr;
  }

  cacheMap.clear();
  return content;
};

exports.impl = async function ({ content }: { content: any }) {
  console.log(JSON.stringify(conver(content), null, 2));
};
