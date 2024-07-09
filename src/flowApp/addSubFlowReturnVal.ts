import { DirectiveTree } from "../types";

export const config: DirectiveTree = {
	name: "flowApp.addSubFlowReturnVal",
	displayName: "子流程添加返回值",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "添加返回值${val}到返回值列表中",
	inputs: {
		val: {
			name: "val",
			value: "",
			type: "variable",
			addConfig: {
				label: "添加要返回的变量",
				type: "variable",
				required: true,
				tip: "添加要返回的内容",
			},
		},
	},
	outputs: {},
	async toCode(directive, block) {
		const { val } = directive.inputs;
		return `await robotUtil.system.flowApp.addSubFlowReturnVal({val: ${val.value} },returnVal,${block})`;
	},
};

export const impl = async function (
	{
		val,
	}: {
		val: any;
	},
	returnVal: any[]
) {
	returnVal.push(val);
};
