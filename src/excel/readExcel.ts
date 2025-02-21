import { DirectiveTree } from "tuzirobot/types";
import XLSX from "xlsx";

export const config: DirectiveTree = {
	name: "excel.read",
	displayName: "读取Excel表格",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "读取一个表格文件${filePath}，保存到变量${workbook}。",
	inputs: {
		filePath: {
			name: "filePath",
			value: "",
			type: "string",
			addConfig: {
				required: true,
				placeholder: "请输入文件路径",
				label: "表格文件路径",
				extensions: ["xlsx", "xls"],
				type: "filePath",
				defaultValue: "",
				tip: "选择表格文件路径",
			},
		},
	},
	outputs: {
		workbook: {
			name: "",
			display: "Excel对象-包含多个工作表",
			type: "excel.workbook",
			addConfig: {
				label: "Excel对象",
				type: "variable",
				defaultValue: "workbook",
			},
		},
	},
};

export const impl = async function ({ filePath }: { filePath: string }) {
	const workbook = XLSX.readFile(filePath);
	// if (!workbook.Sheets[sheetName]) {
	// 	throw new Error(`工作表${sheetName}不存在`);
	// }
	// const sheet = workbook.Sheets[sheetName];
	return { workbook };
};
