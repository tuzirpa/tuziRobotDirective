import { ElementHandle, Frame, Page } from "puppeteer";
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
  name: "web.getChildElement",
  sort: 2,
  displayName: "获取元素的子元素",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "在元素${element}下查找子元素${selector}，并保存到变量${childElement}中。",
  inputs: {
    element: {
      name: "element",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        required: true,
        label: "元素对象",
        type: "variable",
        filtersType: "web.Element",
        autoComplete: true,
      },
    },
    selector: {
      name: "selector",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        required: true,
        label: "CSS选择器",
        type: "string",
      },
    },
    timeout: {
      name: "timeout",
      value: "",
      type: "number",
      addConfig: {
        isAdvanced: true,
        label: "超时时间",
        type: "string",
        defaultValue: 30,
      },
    },
  },

  outputs: {
    childElement: {
      name: "",
      display: "元素对象",
      type: "web.Element",
      addConfig: {
        label: "元素对象",
        type: "variable",
        defaultValue: "childElement",
      },
    },
  },
};

export const impl = async function ({
  element,
  selector,
  timeout,
}: {
  element: ElementHandle;
  selector: string;
  timeout: number;
}) {
  const childElement = await element.waitForSelector(selector, {
    timeout: timeout * 1000,
  });
  console.log("childElement", childElement);

  return { childElement };
};
