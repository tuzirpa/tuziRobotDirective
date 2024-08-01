import { DirectiveTree } from '../types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.deleteFolder',
    sort: 2,
    displayName: '删除本地文件夹',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '删除本地文件夹${folderPath}',
    inputs: {
        folderPath: {
            name: 'folderPath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '文件夹路径',
                placeholder: '请输入文件夹路径',
                type: 'filePath',
                openDirectory: true
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ folderPath }: { folderPath: string }) {
    function deleteFolderRecursive(folderPath: string) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file, index) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    // 递归删除文件夹
                    deleteFolderRecursive(curPath);
                } else {
                    // 删除文件
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath); // 删除空文件夹
            console.log(`Successfully deleted ${folderPath}`);
        }
    }

    deleteFolderRecursive(folderPath);
};
