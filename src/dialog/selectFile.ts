import { DirectiveTree } from "../types";
import { invokeApi } from "tuzirobot/commonUtil";
export const config: DirectiveTree = {
	name: "dialog.selectFile",
	sort: 2,
	displayName: "弹出选择文件",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "弹出文件选择器，选择文件后返回文件路径保存到变量中${filePath}",
	inputs: {},

	outputs: {
		filePath: {
			name: "",
			display: "文件路径",
			type: "string",
			addConfig: {
				label: "文件路径",
				type: "variable",
				defaultValue: "filePath",
			},
		},
	},
};

export const impl = async function () {
	//运行一个electron 并打开文件选择器
	const filePath = await invokeApi("dialog.selectFile", {});
	return { filePath };
};
