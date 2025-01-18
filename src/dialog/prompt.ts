import { DirectiveTree } from "tuzirobot/types";
import { invokeApi } from "tuzirobot/commonUtil";
export const config: DirectiveTree = {
	name: "dialog.prompt",
	sort: 2,
	displayName: "弹出输入框",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "弹出一个输入框，用户可以输入文本,保存到变量${content}中",
	inputs: {
		placeholder: {
			name: "placeholder",
			value: "",
			type: "string",
			addConfig: {
				label: "提示语",
				placeholder: "请输入提示语",
				type: "string",
				defaultValue: "请输入内容",
			},
		},
	},

	outputs: {
		content: {
			name: "",
			display: "用户输入的内容",
			type: "string",
			addConfig: {
				label: "用户输入的内容",
				type: "variable",
				defaultValue: "content",
			},
		},
	},
};

export const impl = async function ({ placeholder }: { placeholder: string }) {
	//运行一个electron 并打开文件选择器
	const content = await invokeApi("dialog.prompt", { placeholder });
	return { content };
};
