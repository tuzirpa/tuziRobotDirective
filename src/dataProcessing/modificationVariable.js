const fs = require("fs");
const { typeToCode } = require("tuzirobot/commonUtil");
exports.config = {
	name: "dataProcessing.modificationVariable",
	displayName: "修改变量",
	isControl: false,
	isControlEnd: false,
	comment: "修改变量 ${varKey} 值为 ${varValue}",
	inputs: {
		varValue: {
			name: "变量值",
			value: "",
			type: "string",
			addConfig: {
				label: "变量值",
				type: "string",
				defaultValue: "",
			},
		},
	},
	outputs: {
		varKey: {
			name: "",
			type: "string",
			display: "",
			addConfig: {
				label: "要修改的变量",
				type: "variable",
			},
		},
	},

	async toCode(directive, block) {
		const name = directive.outputs.varKey.name;
		let varValue = directive.inputs.varValue;

		return `${name} = await robotUtil.system.dataProcessing.modificationVariable({"varValue": ${typeToCode(varValue)}},${block});`;
	},
};

exports.impl = async function ({ varValue }) {
	return varValue;
};
