import { DirectiveTree } from 'tuzirobot/types';
import XLSX, { WorkSheet } from 'xlsx';

export const config: DirectiveTree = {
    name: 'excel.jsonToSheet',
    displayName: 'JSON数据保存到工作表中',
    icon: 'icon-web-create',
    comment: '',
    inputs: {
        filePath: {
            name: 'filePath',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: 'excel文件路径',
                type: 'textarea',
                placeholder: '请输入excel文件路径'
            }
        },
        sheetJsonData: {
            name: 'sheetJsonData',
            value: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: 'JSON数据',
                type: 'variable'
            }
        },
        sheetName: {
            name: 'sheetName',
            value: '',
            type: 'string',
            addConfig: {
                required: false,
                label: '工作表名称',
                type: 'string',
                placeholder: '请输入工作表名称 (默认Sheet1)'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    filePath,
    sheetJsonData,
    sheetName
}: {
    filePath: string;
    sheetJsonData: any;
    sheetName?: string;
}) {
    sheetName = sheetName || 'Sheet1';
    const excleBook = XLSX.utils.book_new(); // 新建文件
    XLSX.utils.book_append_sheet(excleBook, XLSX.utils.json_to_sheet(sheetJsonData), sheetName); // 向文件中添加sheet，并将数据写入sheet
    XLSX.writeFile(excleBook, filePath); // 输出文件
};
