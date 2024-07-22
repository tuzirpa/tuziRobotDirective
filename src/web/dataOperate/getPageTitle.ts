import { Page } from "puppeteer";
import { DirectiveTree } from "../../types";
export const config: DirectiveTree = {
  name: "web.getPageTitle",
  icon: "icon-web-create",
  displayName: "获取网页标题",
  comment: "在页面${page}中获取当前标签页的标题，保存到变量${title}中",
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
    title: {
      name: "title",
      display: "标题",
      type: "string",
      addConfig: {
        label: "标题",
        type: "variable",
        defaultValue: "",
      },
    },
  },
};

export const impl = async function ({ page }: { page: Page }) {
  const title = await page.title();
  return { title };
};
