import { rm } from "fs";
import { DirectiveTree } from "tuzirobot/types";
export const config: DirectiveTree = {
	name: "flowApp.addCallSubFlowParams",
	displayName: "添加子流程参数",
	comment: "向流程调用参数对象${array}中添加数据${value}",
	inputs: {
		array: {
			name: "array",
			value: "",
			display: "数组对象",
			type: "variable",
			addConfig: {
				label: "流程调用参数对象",
				type: "variable",
				placeholder: "流程调用参数对象",
				filtersType: "array",
				required: true,
			},
		},
		value: {
			name: "value",
			value: "",
			type: "variable",
			addConfig: {
				label: "要添加到流程调用参数的对象",
				placeholder: "要添加到流程调用参数的对象",
				type: "variable",

				defaultValue: "",
				required: true,
			},
		},
	},

	outputs: {},
};

export const impl = async function ({
	array,
	value,
}: {
	array: Array<any>;
	value: any;
}) {
	array.push(value);
};
