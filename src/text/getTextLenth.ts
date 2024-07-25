import { log } from "console";
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
  name: "text.getTextLenth",
  icon: "icon-web-create",
  displayName: "获取文本长度",
  comment: "获取${text}文本的长度，并将结果保存到变量${textLength}中",
  inputs: {
    text: {
      name: "text",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "文本内容",
        placeholder: "文本内容",
        type: "textarea",
        required: true,
      },
    },
  },

  outputs: {
    textLength: {
      name: "",
      display: "文本长度",
      type: "string",
      addConfig: {
        label: "文本长度",
        type: "variable",
        defaultValue: "textLength",
      },
    },
  },
};

export const impl = async function ({ text }: { text: string }) {
  const textLength = text ? text.length : 0;
  return { textLength };
};
