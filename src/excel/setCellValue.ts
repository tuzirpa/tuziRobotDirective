import { DirectiveTree } from "../types";
import XLSX, { WorkBook, WorkSheet } from "xlsx";

export const config: DirectiveTree = {
	name: "excel.setCellValue",
	displayName: "设置单元格值",
	icon: "icon-web-create",
	isControl: false,
	isControlEnd: false,
	comment: "将值${val}写入单元格 行号${rowNum}列号${colNum}",
	inputs: {
		sheet: {
			name: "sheet",
			value: "",
			type: "variable",
			addConfig: {
				required: true,
				label: "工作表",
				type: "variable",
				filtersType: "excel.sheet",
				autoComplete: true,
			},
		},
		rowNum: {
			name: "rowNum",
			value: "",
			type: "number",
			addConfig: {
				required: true,
				label: "设置单元格的行号",
				placeholder: "请输入行号",
				type: "string",
				defaultValue: "",
			},
		},
		colNum: {
			name: "colNum",
			value: "",
			type: "number",
			addConfig: {
				required: true,
				label: "设置单元格的列号",
				placeholder: "请输入列号",
				type: "string",
				defaultValue: "",
			},
		},
		val: {
			name: "val",
			value: "",
			type: "string",
			addConfig: {
				required: true,
				label: "要写入的文本内容",
				type: "textarea",
				defaultValue: "",
			},
		},
	},
	outputs: {},
};

export const impl = async function ({
	sheet,
	rowNum,
	colNum,
	val,
}: {
	sheet: WorkSheet;
	rowNum: number;
	colNum: number;
	val: string;
}) {
	const cellAddress = XLSX.utils.encode_cell({
		r: rowNum,
		c: colNum,
	});

	sheet[cellAddress] = {
		v: val,
		t: "s",
	};
};
