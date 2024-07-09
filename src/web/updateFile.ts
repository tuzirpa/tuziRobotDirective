import { ElementHandle, Page } from "puppeteer";
import { DirectiveTree } from "../types";
export const config: DirectiveTree = {
  name: "web.updateFile",
  icon: "icon-web-create",
  displayName: "上传文件",
  comment:
    "将页面${browserPage} 中选择元素${selector}，并上传文件${filePath}。",
  inputs: {
    browserPage: {
      name: "browserPage",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "标签页对象",
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
        placeholder: "不填写则默认截取整个页面",
        type: "string",
        defaultValue: "",
        required: true,
        tip: "不填写则默认截取整个页面",
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
    filePath: {
      name: "filePath",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "文件路径",
        placeholder: "选择要上传文件路径",
        type: "filePath",
        defaultValue: "",
        required: true,
        openDirectory: false,
        tip: "选择要上传文件路径",
      },
    },
  },

  outputs: {},
};

export const impl = async function ({
  browserPage,
  selector,
  filePath,
  timeout,
}: {
  browserPage: Page;
  selector: string;
  filePath: string;
  timeout: number;
}) {
  const fileElement = (await browserPage.waitForSelector(selector, {
    timeout: timeout * 1000,
  })) as ElementHandle<HTMLInputElement>;

  if (fileElement) {
    const tagName = await fileElement.evaluate((element) => element.tagName);
    const type = await fileElement.evaluate((element) =>
      element.getAttribute("type")
    );

    if (tagName != "INPUT" || type != "file") {
      console.error("元素", selector, "不是文件上传元素！");
      return;
    }

    const accept = await fileElement.evaluate((element) =>
      element.getAttribute("accept")
    );

    if (accept) {
      console.log("上传元素接收的是", accept, "上传文件是", filePath);
    }

    await fileElement.uploadFile(filePath);
  } else {
    console.error("找不到元素", selector);
  }
};
