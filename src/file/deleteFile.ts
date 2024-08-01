import { DirectiveTree } from '../types';
import fs from 'fs';

export const config: DirectiveTree = {
    name: 'file.deleteFile',
    sort: 2,
    displayName: '删除本地文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '删除本地文件${filePath}',
    inputs: {
        filePath: {
            name: 'filePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '文件路径',
                placeholder: '请输入文件路径',
                type: 'filePath'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ filePath }: { filePath: string }) {
    fs.unlinkSync(filePath);
    console.log(`删除文件${filePath}成功`);
};
