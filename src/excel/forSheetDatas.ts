import { DirectiveTree } from "../types";
import XLSX, { Sheet, WorkBook, WorkSheet } from "xlsx";

export const config: DirectiveTree = {
	name: "excel.forSheetDatas",
	displayName: "循环工作表数据",
	icon: "icon-web-create",
	isControl: true,
	isLoop: true,
	isControlEnd: false,
	comment:
		"循环遍历工作表${sheet}，单元格值保存到变量${cellValue}，当前行保存到变量${rowNum}，当前列保存到变量${colNum}。",
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
	},
	outputs: {
		cellValue: {
			name: "",
			display: "单元格值",
			type: "string",
			addConfig: {
				label: "单元格值",
				type: "variable",
				defaultValue: "cellValue",
			},
		},
		rowNum: {
			name: "",
			display: "数字",
			type: "number",
			addConfig: {
				label: "循环当前行号",
				type: "variable",
				defaultValue: "rowNum",
			},
		},
		colNum: {
			name: "",
			display: "数字",
			type: "number",
			addConfig: {
				label: "循环当前列号",
				type: "variable",
				defaultValue: "colNum",
			},
		},
	},
	async toCode(directive, block) {
		const { sheet } = directive.inputs;
		const { cellValue, rowNum, colNum } = directive.outputs;
		return `for (let [${cellValue.name}, ${rowNum.name}, ${colNum.name}] of await robotUtil.system.excel.forSheetDatas({ sheet: ${sheet.value} },${block})) {`;
	},
};

export const impl = async function ({ sheet }: { sheet: WorkSheet }) {
	function* range(sheet: WorkSheet) {
		// 解析范围以确定表格的边界
		if (!sheet["!ref"]) {
			// yield [void 0, 0, 0];
			return;
		}
		const range = XLSX.utils.decode_range(sheet["!ref"]);
		if (range.e.r === 0 && range.e.c === 0) {
			return;
		}
		for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
			for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
				const cellAddress = XLSX.utils.encode_cell({
					r: rowNum,
					c: colNum,
				});
				const cell = sheet[cellAddress];
				let cellValue;
				// 检查单元格是否有数据
				if (cell && cell.v !== undefined) {
					cellValue = cell.v;
				}
				yield [cellValue, rowNum + 1, colNum + 1];
			}
		}
	}
	return range(sheet);
};
