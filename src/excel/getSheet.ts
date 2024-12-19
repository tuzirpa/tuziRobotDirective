import { DirectiveTree } from '../types';
import XLSX, { WorkBook } from 'xlsx';

export const config: DirectiveTree = {
    name: 'excel.getSheet',
    displayName: '通过名称获取一个工作表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '从${workbook}对象读取一个工作表，并保存到${sheet}。',
    inputs: {
        workbook: {
            name: 'workbook',
            value: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: 'excel对象',
                type: 'variable',
                filtersType: 'excel.workbook',
                autoComplete: true
            }
        },
        sheetName: {
            name: 'sheetName',
            value: '',
            type: 'string',
            addConfig: {
                required: false,
                placeholder: '工作表名称,默认值为Sheet1',
                label: '工作表名称',
                type: 'string',
                defaultValue: '',
                tip: '输入工作表名称，默认值为Sheet1'
            }
        }
    },
    outputs: {
        sheet: {
            name: '',
            display: 'Excel工作表对象',
            type: 'excel.sheet',
            addConfig: {
                label: 'Excel工作表对象',
                type: 'variable',
                defaultValue: 'sheet'
            }
        }
    }
};

export const impl = async function ({
    workbook,
    sheetName
}: {
    workbook: WorkBook;
    sheetName: string;
}) {
    sheetName = sheetName || 'Sheet1';
    if (!workbook.Sheets[sheetName]) {
        throw new Error(`工作表${sheetName}不存在`);
    }
    const sheet = workbook.Sheets[sheetName];
    return { sheet };
};
