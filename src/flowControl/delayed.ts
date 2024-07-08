import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
	name: "flowControl.delayed",
	displayName: "延时等待",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "延时等待，单位：${loadTimeout}秒",
	inputs: {
		loadTimeout: {
			name: "timeout",
			value: "30",
			type: "number",
			addConfig: {
				label: "超时",
				type: "string",
				required: true,
				defaultValue: "30",
				tip: "延时等待时间，单位：秒",
			},
		},
	},
	outputs: {},
};

export const impl = async function ({ loadTimeout }: { loadTimeout: number }) {
	console.log(`延时等待${loadTimeout}秒`);
	await new Promise((resolve) => {
		setTimeout(() => {
			resolve(null);
		}, loadTimeout * 1000);
	});
};
