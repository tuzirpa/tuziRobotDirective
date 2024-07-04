import { Page } from "puppeteer";

export const config = {
	name: "web.cssGetElement",
	sort: 2,
	displayName: "CSS获取元素",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment:
		"获取元素${selector},超时时间${timeout}秒,并保存到变量${webElement}",
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

	outputs: {
		webElement: {
			name: "",
			display: "元素对象",
			type: "web.Element",
			addConfig: {
				label: "元素对象",
				type: "variable",
				defaultValue: "webElement",
			},
		},
	},
};

export const impl = async function ({
	browserPage,
	selector,
	timeout,
}: {
	browserPage: Page;
	selector: string;
	timeout: number;
}) {
	try {
		const webElement = await browserPage.waitForSelector(selector, {
			timeout: timeout * 1000,
		});
		return { webElement };
	} catch (error) {
		console.log(error);
		throw new Error(`超时${timeout}秒，未找到元素：${selector}`);
	}
};
