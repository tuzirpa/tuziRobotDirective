import { join } from "path";
import { DirectiveTree } from "../types";
import XLSX, { WorkBook } from "xlsx";
import fs from "fs";

export const config: DirectiveTree = {
	name: "excel.saveExcel",
	displayName: "保存Excel表格",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "将${workbook},保存到文件${filePath}",
	inputs: {
		workbook: {
			name: "workbook",
			value: "",
			type: "variable",
			addConfig: {
				required: true,
				label: "excel对象",
				type: "variable",
				filtersType: "excel.workbook",
				autoComplete: true,
			},
		},
		filePath: {
			name: "filePath",
			value: "",
			type: "string",
			addConfig: {
				required: true,
				placeholder: "保存的文件路径，例如：c:/test.xlsx",
				label: "文件路径",
				type: "filePath",
				defaultValue: "",
				tip: "保存的文件路径",
			},
		},
	},
	outputs: {},
};

export const impl = async function ({
	workbook,
	filePath,
}: {
	workbook: WorkBook;
	filePath: string;
}) {
	// const file = join(filePath);
	// if (!fs.existsSync(file)) {
	// 	fs.mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
	// }
	XLSX.writeFile(workbook, filePath);
	return { workbook };
};
