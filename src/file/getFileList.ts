import path from 'path';
import { DirectiveTree } from '../types';
import fs from 'fs';

export const config: DirectiveTree = {
    name: 'file.getFileList',
    sort: 2,
    displayName: '获取文件列表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '获取指定文件夹${fileDir}下，是否递归${isRecursion}获取文件列表，以及是否包含文件夹${isIncludeDir},并将结果保存到变量${fileList}中',
    inputs: {
        fileDir: {
            name: 'fileDir',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '文件夹目录',
                placeholder: '请输入文件夹目录',
                type: 'filePath',
                openDirectory: true
            }
        },
        isRecursion: {
            name: 'isRecursion',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '是否递归文件夹',
                placeholder: '是否递归文件夹 (是/否) 默认为是',
                type: 'string',
                defaultValue: '是'
            }
        },
        isIncludeDir: {
            name: 'isIncludeDir',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '是否包含文件夹',
                placeholder: '是否包含文件夹 (是/否) 默认为否',
                type: 'string',
                defaultValue: '否'
            }
        }
    },

    outputs: {
        fileList: {
            name: '',
            display: '文件列表',
            type: 'array',
            addConfig: {
                required: true,
                label: '文件列表',
                defaultValue: 'fileList',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({
    fileDir,
    isRecursion,
    isIncludeDir
}: {
    fileDir: string;
    isRecursion: string;
    isIncludeDir: string;
}) {
    isRecursion = isRecursion?.trim() || '是';
    isIncludeDir = isIncludeDir?.trim() || '否';
    const isRecursionBool = isRecursion.toLocaleLowerCase() === '是';
    const isIncludeDirBool = isIncludeDir.toLocaleLowerCase() === '是';
    function readDirectory(dir: string, recursive: boolean = true) {
        let results: { path: string; isDirectory: boolean }[] = [];
        // 使用 withFileTypes: true 读取目录内容
        const list = fs.readdirSync(dir, { withFileTypes: true });

        list.forEach((dirent) => {
            const filePath = path.join(dir, dirent.name);

            results.push({ path: filePath, isDirectory: dirent.isDirectory() });

            if (dirent.isDirectory() && recursive) {
                // 如果是目录，递归读取
                results = results.concat(readDirectory(filePath));
            }
        });
        return results;
    }
    const files = readDirectory(fileDir, isRecursionBool);

    const fileList = files
        .filter((file) => (file.isDirectory && isIncludeDirBool) || !file.isDirectory)
        .map((file) => file.path.replace(/\\/g, '/'));
    return { fileList };
};
