import { Page } from "puppeteer";
import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "web.getPageUrl",
  icon: "icon-web-create",
  displayName: "获取标签页网址",
  comment: "在页面${page}中获取当前标签页的网址，保存到变量${url}中",
  inputs: {
    page: {
      name: "page",
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
  },

  outputs: {
    url: {
      name: "url",
      display: "URL",
      type: "string",
      addConfig: {
        label: "URL",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function ({ page }: { page: Page }) {
  const url = await page.url();
  return { url };
};
