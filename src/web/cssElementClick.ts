import { ElementHandle, Frame, Page } from "puppeteer";
import { DirectiveTree } from "../types";

const config: DirectiveTree = {
  name: "web.cssElementClick",
  sort: 2,
  displayName: "CSS点击元素",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "在页面对象${browserPage}中获取元素${selector} 并点击，元素超时时间${timeout}秒",
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
  outputs: {},
};

const impl = async function ({
  browserPage,
  selector,
  timeout,
}: {
  browserPage: Page | Frame;
  selector: string;
  timeout: number;
}) {
  try {
    if (!browserPage) {
      throw new Error("浏览器页面对象不能为空");
    }
    const webElement = await browserPage.waitForSelector(selector, {
      timeout: timeout * 1000,
    });

    console.log(`找到元素：${selector}`);
    console.log(webElement);

    if (webElement) {
      await webElement.tap();
    } else {
      throw new Error(`未找到元素：${selector}`);
    }
  } catch (error) {
    console.log(error);
    throw new Error(`超时${timeout}秒，未找到元素：${selector}`);
  }
};

export { config, impl };
