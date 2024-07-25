import { Frame, Page } from "puppeteer";
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
  name: "web.cssGetElementProperty",
  sort: 2,
  displayName: "CSS获取元素属性值",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "在${browserPage}页面中，通过CSS选择器${selector},超时时间${timeout}秒, 获取元素属性${property},并保存到变量${propertyValue}",
  inputs: {
    browserPage: {
      name: "browserPage",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "网页对象",
        type: "variable",
        filtersType: "web.page",
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
    property: {
      name: "property",
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
    propertyValue: {
      name: "propertyValue",
      display: "元素属性值",
      type: "string",
      addConfig: {
        label: "元素属性值",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function ({
  browserPage,
  selector,
  property,
  timeout,
}: {
  browserPage: Page;
  selector: string;
  property: string;
  timeout: number;
}) {
  try {
    if (!browserPage) {
      throw new Error("浏览器页面对象不能为空");
    }
    const webElement = await browserPage.waitForSelector(selector, {
      timeout: timeout * 1000,
    });

    if (webElement) {
      const propertyValue = await webElement.getProperty(property);
      return {
        propertyValue: await propertyValue.jsonValue(),
      };
    }

    return { propertyValue: "" };
  } catch (error) {
    console.log(error);
    return { propertyValue: "" };
  }
};
