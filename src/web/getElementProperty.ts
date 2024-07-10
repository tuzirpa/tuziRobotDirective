import { ElementHandle } from "puppeteer";
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
  name: "web.getElementProperty",
  sort: 2,
  displayName: "获取元素属性",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "获取元素${selector}的属性${propertyName}的值, 并将其赋值给变量${propertyValue}",
  inputs: {
    element: {
      name: "element",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "选择元素对象",
        type: "variable",
        filtersType: "web.element",
        autoComplete: true,
      },
    },
    propertyName: {
      name: "propertyName",
      value: "",
      display: "文本内容",
      type: "string",
      addConfig: {
        required: true,
        label: "选择获取的属性",
        type: "select",
        options: [
          {
            label: "文本内容",
            value: "innerText",
          },
          {
            label: "html内容",
            value: "innerHTML",
          },
          {
            label: "src属性",
            value: "src",
          },
        ],
        defaultValue: "innerText",
        tip: "获取的属性的值",
      },
    },
  },

  outputs: {
    propertyValue: {
      name: "",
      display: "字符串-元素属性值",
      type: "string",
      addConfig: {
        label: "属性值",
        type: "variable",
        defaultValue: "webElementProperty",
      },
    },
  },
};

export const impl = async function ({
  element,
  propertyName,
}: {
  element: ElementHandle<Element>;
  propertyName: string;
}) {
  const propertyValue = await element.getProperty(propertyName);
  return {
    propertyValue: await propertyValue.jsonValue(),
  };
};
