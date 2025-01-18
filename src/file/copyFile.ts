import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.copyFile',
    sort: 2,
    displayName: '复制文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将文件${sourcePath}复制到${targetPath}',
    inputs: {
        sourcePath: {
            name: 'sourcePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '源文件路径',
                placeholder: '请选择要复制的文件',
                type: 'filePath',
                openDirectory: false
            }
        },
        targetPath: {
            name: 'targetPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '目标路径',
                placeholder: '请选择复制到的位置',
                type: 'filePath',
                openDirectory: true
            }
        },
        isCovered: {
            name: 'isCovered',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '存在时是否覆盖',
                type: 'boolean',
                defaultValue: false,
                tip: '目标文件存在时是否覆盖'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    sourcePath,
    targetPath,
    isCovered
}: {
    sourcePath: string;
    targetPath: string;
    isCovered: boolean;
}) {
    if (!fs.existsSync(sourcePath)) {
        throw new Error('源文件不存在');
    }

    // 确保目标目录存在
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    // 如果目标文件已存在且不覆盖，则修改文件名
    if (!isCovered && fs.existsSync(targetPath)) {
        const parsedPath = path.parse(targetPath);
        const newName = parsedPath.name + '_' + new Date().getTime() + parsedPath.ext;
        targetPath = path.join(parsedPath.dir, newName);
    }

    // 复制文件
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`文件已成功复制到: ${targetPath}`);
}; 