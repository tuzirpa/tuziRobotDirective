import { DirectiveTree } from "tuzirobot/types";
import { typeToCode } from "tuzirobot/commonUtil";

export const config: DirectiveTree = {
	name: "text.extractContent",
	icon: "icon-web-create",
	displayName: "从文本中提取内容",
	comment:
		"使用正则表达式从文本中提取内容，匹配方式 ${extractionWay},自定义正在${regexpValue},是否匹配第一个${isMatchFirst},是否区分大小写${isCaseSensitive}",
	inputs: {
		text: {
			name: "text",
			value: "",
			display: "",
			type: "string",
			addConfig: {
				label: "文本内容",
				placeholder: "文本内容",
				type: "textarea",
				required: true,
			},
		},
		extractionWay: {
			name: "extractionWay",
			value: "",
			display: "提取数字",
			type: "string",
			addConfig: {
				label: "提取方式",
				type: "select",
				required: true,
				options: [
					{ label: "提取数字", value: "\\-?\\d+(\\.\\d+)?" },
					{ label: "提取手机号码", value: "(1[3-9]\\d{9})" },
					{
						label: "提取Email地址",
						value: "([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,})",
					},
					{
						label: "提取身份证号码",
						value: "([1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx])",
					},
					{
						label: "自定义",
						value: "custom",
					},
				],
				defaultValue: "\\-?\\d+(\\.\\d+)?",
			},
		},
		regexpValue: {
			name: "regexpValue",
			value: "",
			type: "string",
			addConfig: {
				label: "自定义正则",
				type: "string",
				defaultValue: "",
				filters: 'this.inputs.extractionWay.value === "custom"',
			},
		},
		isMatchFirst: {
			name: "isMatchFirst",
			value: "",
			display: "是",
			type: "number",
			addConfig: {
				label: "是否匹配第一个",
				type: "select",
				required: true,
				options: [
					{ label: "是", value: "1" },
					{ label: "否", value: "0" },
				],
				defaultValue: "1",
			},
		},
		isCaseSensitive: {
			name: "isCaseSensitive",
			value: "",
			display: "是",
			type: "number",
			addConfig: {
				label: "是否区分大小写",
				type: "select",
				required: true,
				options: [
					{ label: "是", value: "1" },
					{ label: "否", value: "0" },
				],
				defaultValue: "1",
			},
		},
	},

	outputs: {
		matchResult: {
			name: "",
			display: "匹配的内容",
			type: "string",
			addConfig: {
				label: "匹配的内容",
				type: "variable",
				defaultValue: "matchResult",
			},
		},
	},

	async toCode(directive, _block) {
		const { matchResult } = directive.outputs;
		const {
			text,
			extractionWay,
			isMatchFirst,
			isCaseSensitive,
			regexpValue,
		} = directive.inputs;
		const code = `var ${
			matchResult.name
		} = await robotUtil.system.text.extractContent({ text: ${typeToCode(
			text
		)},extractionWay: "${extractionWay.value.replace(
			/\\/g,
			"\\\\"
		)}",regexpValue: "${regexpValue.value.replace(
			/\\/g,
			"\\\\"
		)}",isMatchFirst: ${typeToCode(
			isMatchFirst
		)},isCaseSensitive: ${typeToCode(isCaseSensitive)}},${_block});`;
		return code;
	},
};

export const impl = async function ({
	text,
	extractionWay,
	isMatchFirst,
	regexpValue,
	isCaseSensitive,
}: {
	text: string;
	extractionWay: string;
	regexpValue: string;
	isMatchFirst: number;
	isCaseSensitive: number;
}) {
	if (text) {
		let globalFlag = "";
		if (!isMatchFirst) {
			globalFlag = "g";
		}
		if (isCaseSensitive) {
			globalFlag += "i";
		}
		if (extractionWay === "custom") {
			extractionWay = regexpValue;
		}
		const regex = new RegExp(extractionWay, globalFlag);
		const match = text.match(regex);
		return isMatchFirst && match ? match[0] : match;
	}
};
