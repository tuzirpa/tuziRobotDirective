import { Page } from "puppeteer";
import { DirectiveTree } from "../types";
export const config: DirectiveTree = {
	name: "web.clearAllCookie",
	icon: "icon-web-create",
	displayName: "清除所有cookie",
	comment: "在页面${browserPage}中清理所有的cookie",
	inputs: {
		browserPage: {
			name: "browserPage",
			value: "",
			display: "",
			type: "variable",
			addConfig: {
				required: true,
				label: "标签页对象",
				placeholder: "选择标签页对象",
				type: "variable",
				filtersType: "web.page",
				autoComplete: true,
			},
		},
	},

	outputs: {},
};

export const impl = async function ({ browserPage }: { browserPage: Page }) {
	let cookies = await browserPage.cookies();
	cookies.forEach(async (cookie) => {
		await browserPage.deleteCookie(cookie);
	});
};
