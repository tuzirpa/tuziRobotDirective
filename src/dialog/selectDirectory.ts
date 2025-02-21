import { DirectiveTree } from 'tuzirobot/types';
import { invokeApi } from 'tuzirobot/commonUtil';
export const config: DirectiveTree = {
    name: 'dialog.selectDirectory',
    sort: 2,
    displayName: '弹出选择目录',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '弹出目录选择器，选择目录后返回文件路径保存到变量中${dirPath}',
    inputs: {},

    outputs: {
        dirPath: {
            name: '',
            display: '文件路径',
            type: 'string',
            addConfig: {
                label: '文件路径',
                type: 'variable',
                defaultValue: 'dirPath'
            }
        }
    }
};

export const impl = async function () {
    //运行一个electron 并打开文件选择器
    const filePath = await invokeApi('dialog.openDirectory', {});
    return { dirPath: filePath };
};
