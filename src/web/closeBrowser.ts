import puppeteer, { Browser } from "puppeteer";
import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
	name: "web.closeBrowser",
	displayName: "关闭浏览器",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "关闭浏览器 ${browser}",
	inputs: {
		browser: {
			name: "browser",
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

	outputs: {},
};

export const impl = async function ({ browser }: { browser: Browser }) {
	await browser.close();
	console.log("Browser closed");
};
