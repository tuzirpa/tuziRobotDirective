import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.readFile',
    sort: 2,
    displayName: '读取文本文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '读取文本文件${filePath},并将内容赋值给${content}变量',
    inputs: {
        filePath: {
            name: 'filePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写文件路径',
                label: '文件路径',
                defaultValue: '',
                type: 'filePath'
            }
        }
    },

    outputs: {
        content: {
            name: '',
            display: '文本',
            type: 'string',
            addConfig: {
                required: true,
                label: '文件内容',
                defaultValue: '文件内容',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ filePath }: { filePath: string }) {
    if (!fs.existsSync(path.resolve(filePath))) throw new Error('文件不存在');
    return { content: fs.readFileSync(path.resolve(filePath), 'utf-8') };
};
