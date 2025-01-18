import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.rename',
    sort: 2,
    displayName: '重命名文件或目录',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将文件或目录${filePath} 重命名为 ${newName}',
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
        newName: {
            name: 'newName',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写新名称，如果重复，会覆盖原文件',
                label: '新名称',
                defaultValue: '',
                type: 'string'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ filePath, newName }: { filePath: string; newName: string }) {
    if (!fs.existsSync(path.resolve(filePath))) throw new Error('文件或目录不存在');
    newName = newName.trim();
    let newPath = newName;
    if (!newPath.includes('/')) {
        newPath = path.join(path.dirname(filePath), newName);
    }
    return fs.renameSync(path.resolve(filePath), path.resolve(newPath));
};
