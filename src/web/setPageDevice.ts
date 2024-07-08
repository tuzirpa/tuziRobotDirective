import { CookieParam, Device, Page } from "puppeteer";
import { DirectiveTree } from "../types";

export const devices: { [key in string]: Device } = {
	PC: {
		viewport: {
			width: 0,
			height: 0,
		},
		userAgent: "",
	},
	"iPhone 6/7/8": {
		viewport: {
			width: 375,
			height: 667,
			deviceScaleFactor: 2,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
	},
	"iPhone 6/7/8 Plus": {
		viewport: {
			width: 414,
			height: 736,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
	},
	iPad: {
		viewport: {
			width: 768,
			height: 1024,
			deviceScaleFactor: 2,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
	},
	"iPad Pro": {
		viewport: {
			width: 1024,
			height: 1366,
			deviceScaleFactor: 2,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
	},
	//三星 s20

	"Samsung Galaxy S9": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36",
	},
	// huaWei Mate 20 Pro

	"Huawei P20 Pro": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 8.1.0; POT-LX1 Build/HUAWEIPOT-LX1; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36 T7/11.10 SP-engine/2.15.0 baiduboxapp/11.10.0.11 (Baidu; P1 8.1.0)",
	},
	// vivo X21

	"vivo X21": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 8.1.0; vivo X21A Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36 T7/11.10 SP-engine/2.15.0 baiduboxapp/11.10.0.11 (Baidu; P1 8.1.0)",
	},
	// OPPO R11

	"OPPO R11": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 8.1.0; OPPO R11 Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.91 Mobile Safari/537.36 T7/11.10 SP-engine/2.15.0 baiduboxapp/11.10.0.11 (Baidu; P1 8.1.0)",
	},
	// Xiaomi Mi 9

	"Xiaomi Mi 9": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 8.1.0; MI 9 Build/OPM1.171019.019; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36 T7/11.10 SP-engine/2.15.0 baiduboxapp/11.10.0.11 (Baidu; P1 8.1.0)",
	},
	// OnePlus 7 Pro
	"OnePlus 7 Pro": {
		viewport: {
			width: 360,
			height: 740,
			deviceScaleFactor: 3,
			isMobile: true,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 10; ONEPLUS A7010 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.169 Mobile Safari/537.36 T7/11.14 SP-engine/2.15.0 baiduboxapp/11.14.0.11 (Baidu; P1 10)",
	},

	android: {
		viewport: {
			width: 411,
			height: 731,
		},
		userAgent:
			"Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Mobile Safari/537.36",
	},
};

export const config: DirectiveTree = {
	name: "web.setPageDevice",
	icon: "icon-web-create",
	displayName: "设置打开网页环境",
	comment:
		"设置标签页${page}的设备环境，包括屏幕大小、userAgent、是否启用手机模式等。",
	inputs: {
		page: {
			name: "page",
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
		usePresuppose: {
			name: "usePresuppose",
			value: "",
			type: "string",
			addConfig: {
				label: "是否使用预设",
				type: "select",
				options: [
					{
						label: "否",
						value: "false",
					},
					{
						label: "是",
						value: "true",
					},
				],
				defaultValue: "false",
				tip: "是否使用预设的设备设置",
			},
		},
		deviceName: {
			name: "deviceName",
			value: "",
			type: "string",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value === "true"',
				label: "设备",
				required: false,
				type: "select",
				options: Object.keys(devices).map((key) => {
					return { label: key, value: key };
				}),
				defaultValue: "PC",
				tip: "选择设备类型，打开的浏览器将使用该设备的设置",
			},
		},
		userAgent: {
			name: "userAgent",
			value: "",
			type: "string",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value !== "true"',
				label: "userAgent",
				placeholder: "设置userAgent 默认使用浏览器自带的userAgent",
				type: "textarea",
				defaultValue: "",
				tip: "设置userAgent,如果设置了则使用该userAgent,设备设置的userAgent将失效",
			},
		},
		width: {
			name: "width",
			value: "",
			type: "number",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value !== "true"',
				label: "屏幕宽度",
				placeholder: "设置屏幕宽度 默认 窗口宽度",
				type: "string",
				defaultValue: "",
				tip: "设置宽度,如果设置了则使用该宽度,设备设置的宽度将失效",
			},
		},
		height: {
			name: "height",
			value: "",
			type: "number",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value !== "true"',
				label: "屏幕高度",
				placeholder: "设置屏幕高度 默认 窗口高度",
				type: "string",
				defaultValue: "",
				tip: "设置高度,如果设置了则使用该高度,设备设置的高度将失效",
			},
		},
		isMobile: {
			name: "isMobile",
			value: "",
			type: "boolean",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value !== "true"',
				label: "启用手机模式",
				type: "select",
				options: [
					{
						label: "否",
						value: "false",
					},
					{
						label: "是",
						value: "true",
					},
				],
				defaultValue: "false",
				tip: "",
			},
		},
		deviceScaleFactor: {
			name: "deviceScaleFactor",
			value: "",
			type: "number",
			addConfig: {
				filters: 'this.inputs.usePresuppose.value !== "true"',
				label: "缩放比例",
				placeholder: "设置缩放比例 默认 1",
				type: "string",
				defaultValue: "1",
				tip: "",
			},
		},
	},

	outputs: {},
};

export const impl = async function ({
	page,
	usePresuppose,
	deviceName,
	width,
	height,
	isMobile,
	deviceScaleFactor,
	userAgent,
}: {
	page: Page;
	usePresuppose: string;
	deviceName: string;
	width: number;
	height: number;
	isMobile: boolean;
	deviceScaleFactor: number;
	userAgent: string;
}) {
	let device: Device = {
		viewport: {
			width: width,
			height: height,
			deviceScaleFactor: deviceScaleFactor,
			isMobile: isMobile,
			hasTouch: true,
			isLandscape: false,
		},
		userAgent: userAgent,
	};
	if (usePresuppose === "true") {
		const deviceTemp = devices[deviceName];
		device = {
			viewport: {
				width: deviceTemp.viewport.width,
				height: deviceTemp.viewport.height,
				deviceScaleFactor: deviceTemp.viewport.deviceScaleFactor,
				isMobile: deviceTemp.viewport.isMobile,
				hasTouch: deviceTemp.viewport.hasTouch,
				isLandscape: deviceTemp.viewport.isLandscape,
			},
			userAgent: deviceTemp.userAgent,
		};
	}

	await page.emulate(device);
};
