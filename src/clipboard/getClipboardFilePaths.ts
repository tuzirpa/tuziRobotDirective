import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
export const config: DirectiveTree = {
    name: 'clipboard.getClipboardFilePaths',
    icon: 'icon-web-create',
    displayName: '读取剪贴板中的文件列表',
    comment: '读取剪贴板中的文件列表',
    inputs: {},

    outputs: {
        filePaths: {
            name: '',
            display: '文件路径列表-数组',
            type: 'array',
            addConfig: {
                label: '文件路径列表',
                type: 'variable',
                defaultValue: 'filePaths'
            }
        }
    }
};

export const impl = async function () {
    const filePaths = hmc.getClipboardFilePaths();
    return { filePaths };
};
