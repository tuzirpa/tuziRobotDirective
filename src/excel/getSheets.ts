import { DirectiveTree } from "../types";
import XLSX, { WorkBook, WorkSheet } from "xlsx";

export const config: DirectiveTree = {
	name: "excel.getSheets",
	displayName: "获取Excel的所有个工作表",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "从workbook对象读取一个工作表，并保存到${sheet}。",
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
	},
	outputs: {
		sheets: {
			name: "",
			display: "工作表对象",
			type: "array",
			addConfig: {
				label: "所有工作表对象",
				type: "variable",
				defaultValue: "sheets",
			},
		},
	},
};

export const impl = async function ({ workbook }: { workbook: WorkBook }) {
	const sheets: WorkSheet[] = [];
	workbook.SheetNames.forEach((sheetName) => {
		sheets.push(workbook.Sheets[sheetName]);
	});
	return { sheets };
};
