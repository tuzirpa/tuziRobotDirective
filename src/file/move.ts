import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.move',
    sort: 2,
    displayName: '移动文件或目录',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将文件或目录${filePath} 移动到 ${newPath}',
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
        },
        newPath: {
            name: 'newPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写新文件路径/新目录路径，如果重复，会覆盖原文件',
                label: '新文件路径/新目录路径',
                defaultValue: '',
                type: 'string'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ filePath, newPath }: { filePath: string; newPath: string }) {
    if (!fs.existsSync(path.resolve(filePath))) throw new Error('文件或目录不存在');

    return fs.renameSync(path.resolve(filePath), path.resolve(newPath));
};
