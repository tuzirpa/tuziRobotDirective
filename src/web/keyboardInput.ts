import { ElementHandle, KeyInput, Page } from "puppeteer";
import { DirectiveTree } from "../types";

const config: DirectiveTree = {
  name: "web.keyboardInput",
  sort: 2,
  displayName: "键盘输入",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "在页面${page}中，选择元素${selector}上按下键盘${keyboardKey}，超时时间${timeout}秒",
  inputs: {
    page: {
      name: "page",
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
        label: "css选择器",
        required: true,
        type: "string",
      },
    },
    keyboardKey: {
      name: "keyboardKey",
      value: "",
      type: "string",
      addConfig: {
        required: true,
        label: "选择键盘按下的键",
        type: "select",
        options: [
          {
            label: "0",
            value: "0",
          },
          {
            label: "1",
            value: "1",
          },
          {
            label: "2",
            value: "2",
          },
          {
            label: "3",
            value: "3",
          },
          {
            label: "4",
            value: "4",
          },
          {
            label: "5",
            value: "5",
          },
          {
            label: "6",
            value: "6",
          },
          {
            label: "7",
            value: "7",
          },
          {
            label: "8",
            value: "8",
          },
          {
            label: "9",
            value: "9",
          },
          {
            label: "Enter",
            value: "Enter",
          },
        ],
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
  page,
  selector,
  keyboardKey,
  timeout,
}: {
  page: Page;
  selector: string;
  keyboardKey: KeyInput;
  timeout: number;
}) {
  const elementHandle = await page.waitForSelector(selector, {
    timeout: timeout * 1000,
  });
  if (!elementHandle) {
    throw new Error(`元素${selector}未找到`);
  }
  await elementHandle.press(keyboardKey);
};

export { config, impl };
