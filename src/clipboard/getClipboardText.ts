import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
export const config: DirectiveTree = {
    name: 'clipboard.getClipboardText',
    icon: 'icon-web-create',
    displayName: '读取剪贴板中的文本',
    comment: '读取剪贴板中的文本',
    inputs: {},

    outputs: {
        clipboardText: {
            name: '',
            display: '字符串-粘贴板文本内容',
            type: 'string',
            addConfig: {
                label: '粘贴板文本内容',
                type: 'variable',
                defaultValue: 'clipboardText'
            }
        }
    }
};

export const impl = async function () {
    const clipboardText = hmc.getClipboardText();
    return { clipboardText };
};
