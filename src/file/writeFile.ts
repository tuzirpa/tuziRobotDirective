import { DirectiveTree } from 'tuzirobot/types';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'file.writeFile',
    sort: 2,
    displayName: '写入文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将内容${content}写入文件${fileName}，存放目录${dir}',
    inputs: {
        content: {
            name: 'content',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '写入内容',
                type: 'textarea'
            }
        },
        fileName: {
            name: 'fileName',
            value: '',
            type: 'string',
            addConfig: {
                label: '文件名',
                placeholder: '请填写文件名',
                type: 'string',
                defaultValue: '',
                tip: '请填写文件名'
            }
        },
        dir: {
            name: 'dir',
            value: '',
            type: 'string',
            addConfig: {
                label: '文件存放目录',
                placeholder: '请选择文件存放目录',
                type: 'filePath',
                defaultValue: '',
                openDirectory: true,
                tip: '文件存放目录'
            }
        },
        isCovered: {
            name: 'isCovered',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '存在时文件是否覆盖',
                type: 'boolean',
                defaultValue: false,
                tip: '存在时文件是否覆盖'
            }
        },
        appendMode: {
            name: 'appendMode',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '追加写入模式',
                type: 'boolean',
                defaultValue: false,
                tip: '是否以追加模式写入文件，如果为true则内容会追加到文件末尾'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    content,
    fileName,
    dir,
    isCovered,
    appendMode
}: {
    content: any;
    fileName: string;
    dir: string;
    isCovered: boolean;
    appendMode: boolean;
}) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let filePath = path.join(dir, fileName);
    
    // 如果是追加模式，不需要处理文件重命名
    if (!appendMode && !isCovered && fs.existsSync(filePath)) {
        const parsedPath = path.parse(filePath);
        const newName = parsedPath.name + '_' + new Date().getTime() + parsedPath.ext;
        filePath = path.join(parsedPath.dir, newName);
    }

    // 根据模式选择写入方式
    if (appendMode) {
        fs.appendFileSync(filePath, content, 'utf8');
    } else {
        fs.writeFileSync(filePath, content, 'utf8');
    }
};
