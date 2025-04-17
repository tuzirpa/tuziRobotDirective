import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.exists',
    sort: 2,
    displayName: '文件是否存在',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '检查文件${filePath}是否存在,并将结果赋值给${exists}变量',
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
        exists: {
            name: '',
            display: '是否存在',
            type: 'boolean',
            addConfig: {
                required: true,
                label: '文件是否存在',
                defaultValue: 'false',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ filePath }: { filePath: string }) {
    const fullPath = path.resolve(filePath);
    const exists = fs.existsSync(fullPath);
    return { exists };
}; 