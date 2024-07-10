import { ElementHandle } from "puppeteer";
import { DirectiveTree } from "../types";

const config: DirectiveTree = {
  name: "web.elementInput",
  sort: 2,
  displayName: "填写输入框",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment: "在元素${element}上输入${content}",
  inputs: {
    element: {
      name: "element",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "网页对象",
        required: true,
        type: "variable",
        filtersType: "web.Element",
        autoComplete: true,
      },
    },
    content: {
      name: "content",
      value: "",
      type: "string",
      addConfig: {
        required: true,
        label: "输入的内容",
        type: "string",
      },
    },
  },
  outputs: {},
};

const impl = async function ({
  element,
  content,
}: {
  element: ElementHandle;
  content: string;
}) {
  await element.evaluate((el) => ((el as HTMLInputElement).value = ""));
  await element.type(content, { delay: 100 });
};

export { config, impl };
