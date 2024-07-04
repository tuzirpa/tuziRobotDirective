import puppeteer, { Browser } from "puppeteer";
import { DirectiveTree } from "tuzirobot/types";

export const config: DirectiveTree = {
	name: "web.createPage",
	displayName: "创建标签页",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "在浏览器${browserPage}中创建标签页,保存至：${page}",
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
	},
	outputs: {
		page: {
			name: "",
			display: "标签页对象",
			type: "web.page",
			addConfig: {
				label: "标签页对象",
				type: "variable",
				defaultValue: "page",
			},
		},
	},
};

export const impl = async function ({ browserPage }: { browserPage: Browser }) {
	const page = await browserPage.newPage();
	return { page };
};
