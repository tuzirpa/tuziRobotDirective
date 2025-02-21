import { DirectiveTree } from 'tuzirobot/types';
import XLSX, { WorkSheet } from 'xlsx';

export const config: DirectiveTree = {
    name: 'excel.sheetToJson',
    displayName: '工作表数据转JSON',
    icon: 'icon-web-create',
    comment:
        '将工作表${sheet}数据，按表头为key，每行数据为value的JSON格式数据，输出到变量${sheetJsonData}中。',
    inputs: {
        sheet: {
            name: 'sheet',
            value: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '工作表',
                type: 'variable',
                filtersType: 'excel.sheet',
                autoComplete: true
            }
        }
    },
    outputs: {
        sheetJsonData: {
            name: '',
            display: '表格JSON数据',
            type: 'string',
            addConfig: {
                label: '表格JSON数据',
                type: 'variable',
                defaultValue: 'sheetJsonData'
            }
        }
    }
};

export const impl = async function ({ sheet }: { sheet: WorkSheet }) {
    const sheetJsonData = XLSX.utils.sheet_to_json(sheet);
    return { sheetJsonData };
};
