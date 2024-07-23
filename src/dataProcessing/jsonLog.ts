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
        defaultValue: "test",
        tip: "输出内容",
      },
    },
  },
  outputs: {},
};

exports.impl = async function ({ content }: { content: any }) {
  if (content instanceof Map) {
    const obj: Record<string, any> = {};
    for (const [key, value] of content.entries()) {
      obj[key] = value;
    }
    content = obj;
  }
  console.log(JSON.stringify(content, null, 2));
};
