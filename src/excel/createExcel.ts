import { join } from "path";
import { DirectiveTree } from "../types";
import XLSX from "xlsx";

export const config: DirectiveTree = {
	name: "excel.create",
	displayName: "创建Excel表格",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "新建一个表格文件${filePath}，保存到变量${workbook}。",
	inputs: {
		fileDir: {
			name: "fileDir",
			value: "",
			type: "string",
			addConfig: {
				required: true,
				placeholder: "请选择保存的文件目录",
				label: "创建的文件目录",
				openDirectory: true,
				type: "filePath",
				defaultValue: "",
				tip: "请选择保存的文件目录",
			},
		},
		fileName: {
			name: "fileName",
			value: "",
			type: "string",
			addConfig: {
				required: true,
				placeholder: "请输入文件名",
				label: "文件名",
				type: "string",
				defaultValue: "",
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

export const impl = async function ({
	filePath,
	fileName,
}: {
	filePath: string;
	fileName: string;
}) {
	// 创建一个新的工作簿
	const workbook = XLSX.utils.book_new();
	if (fileName.endsWith(".xlsx")) {
		fileName += ".xlsx";
	}
	XLSX.writeFile(workbook, join(filePath, fileName + ".xlsx"));
	return { workbook };
};
