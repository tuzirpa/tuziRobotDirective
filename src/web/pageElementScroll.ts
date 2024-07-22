import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { DirectiveTree } from "../types";
import { log } from "console";

export const config: DirectiveTree = {
  name: "web.pageElementScroll",
  displayName: "页面元素滚动",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment:
    "元素${element}滚动到底部，每次滚动${scrollDistance}，延迟${scrollDelay}毫秒",
  inputs: {
    element: {
      name: "element",
      value: "",
      display: "",
      type: "variable",
      addConfig: {
        label: "页面元素对象",
        type: "variable",
        filtersType: "web.Element",
        autoComplete: true,
      },
    },

    scrollDistance: {
      name: "scrollDistance",
      value: "100",
      display: "每次滚动距离",
      type: "number",
      addConfig: {
        label: "每次滚动距离",
        type: "variable",
        autoComplete: true,
        required: true,
        defaultValue: "100",
      },
    },
    scrollDelay: {
      name: "scrollDelay",
      value: "600",
      display: "滚动延迟",
      type: "number",
      addConfig: {
        label: "滚动延迟",
        type: "variable",
        autoComplete: true,
        required: true,
        defaultValue: "600",
      },
    },
  },
  outputs: {},
};

export const impl = async function ({
  element,
  scrollDistance,
  scrollDelay,
}: {
  element: ElementHandle;
  scrollDistance: number;
  scrollDelay: number;
}) {
  // 获取元素的总高度
  let pageHeight = await element.evaluate((el) => el.scrollHeight);
  let currentPosition = 0;

  while (currentPosition < pageHeight) {
    // 滚动页面
    await element.evaluate((el, scrollDistance) => {
      el.scrollBy({
        left: 0,
        top: scrollDistance,
        behavior: "smooth",
      });
    }, scrollDistance);

    currentPosition += scrollDistance;
    pageHeight = await element.evaluate((el) => el.scrollHeight);
    console.log(
      "元素滚动中...",
      `currentPosition: ${currentPosition}, pageHeight: ${pageHeight}`
    );
    // 等待一段时间再进行下一次滚动
    await new Promise((resolve) => setTimeout(resolve, scrollDelay));
  }
};
