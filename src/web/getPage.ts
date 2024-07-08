import { Browser } from "puppeteer";
import { Page } from "puppeteer";
import { DirectiveTree } from "../types";
export const config: DirectiveTree = {
	name: "web.getPage",
	icon: "icon-web-create",
	displayName: "获取已打开标签页",
	comment:
		"在页面${browserPage}中获取匹配（根据${matchType}）的标签页，保存到变量${page}中",
	inputs: {
		browserPage: {
			name: "browserPage",
			value: "",
			display: "",
			type: "variable",
			addConfig: {
				label: "浏览器对象",
				type: "variable",
				filtersType: "web.browser",
				autoComplete: true,
			},
		},
		matchType: {
			name: "matchType",
			value: "active",
			display: "获取当前激活的标签页",
			type: "string",
			addConfig: {
				label: "匹配类型",
				type: "select",
				options: [
					{ value: "url", label: "根据网站匹配" },
					{ value: "title", label: "根据标题匹配" },
					{ value: "index", label: "根据索引匹配" },
					{ value: "active", label: "获取当前激活的标签页" },
				],
				defaultValue: "active",
			},
		},
		url: {
			name: "url",
			value: "",
			type: "string",
			addConfig: {
				label: "地址",
				type: "textarea",
				defaultValue: "https://",
				filters: "this.inputs.matchType.value === 'url'",
				tip: "打开的地址",
			},
		},
		title: {
			name: "title",
			value: "",
			type: "string",
			addConfig: {
				label: "标题",
				type: "textarea",
				defaultValue: "页面标题",
				filters: "this.inputs.matchType.value === 'title'",
				tip: "页面标题",
			},
		},

		index: {
			name: "index",
			value: "",
			type: "number",
			addConfig: {
				label: "索引",
				type: "string",
				defaultValue: 0,
				filters: "this.inputs.matchType.value === 'index'",
				tip: "标签页索引",
			},
		},
	},

	outputs: {
		page: {
			name: "",
			display: "标签页对象",
			type: "web.page",
			addConfig: {
				label: "标签页对象",
				type: "variable",
				defaultValue: "webPage",
			},
		},
	},
};

async function getActivePage(browser: Browser, timeout: number = 10000) {
	var start = new Date().getTime();
	while (new Date().getTime() - start < timeout) {
		var pages = await browser.pages();
		var arr: Page[] = [];
		for (const p of pages) {
			if (
				await p.evaluate(() => {
					return document.visibilityState == "visible";
				})
			) {
				arr.push(p);
			}
		}
		if (arr.length == 1) return arr[0];
	}
	throw "Unable to get active page";
}

export const impl = async function ({
	browserPage,
	matchType,
	url,
	title,
	index,
}: {
	browserPage: Browser;
	matchType: string;
	url: string;
	title: string;
	index: number;
}) {
	const pages = await browserPage.pages();
	let page: Page | undefined;
	if (matchType === "active") {
		page = await getActivePage(browserPage);
	} else if (matchType === "index") {
		if (index >= 0 && index < pages.length) {
			page = pages[index];
		} else {
			throw (
				"索引获取标签页失败，索引超出范围 需要获取的索引为" +
				index +
				"，标签页数量为" +
				pages.length
			);
		}
	} else if (matchType === "url") {
		for (let i = 0; i < pages.length; i++) {
			const pUrl = pages[i].url();
			if (pUrl.includes(url)) {
				page = pages[i];
				break;
			}
		}
	} else if (matchType === "title") {
		for (let i = 0; i < pages.length; i++) {
			if ((await pages[i].title()) === title) {
				page = pages[i];
				break;
			}
		}
	}
	if (!page) {
		throw new Error("未找到匹配的标签页");
	}
	return { page };
};
