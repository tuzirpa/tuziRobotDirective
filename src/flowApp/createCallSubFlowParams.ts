import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
	name: "flowApp.createCallSubFlowParams",
	displayName: "创建调用子流程参数",
	comment: "创建调用子流程的参数 ${array},实际为数组对象",
	inputs: {},

	outputs: {
		array: {
			name: "",
			display: "数组-子流程调用参数",
			type: "array",
			addConfig: {
				label: "数组对象",
				type: "variable",
				defaultValue: "子流程调用参数",
			},
		},
	},
};

export const impl = async function () {
	return { array: new Array() };
};
