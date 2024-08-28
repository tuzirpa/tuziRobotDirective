import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
export const config: DirectiveTree = {
    name: 'clipboard.clearClipboard',
    icon: 'icon-web-create',
    displayName: '清空剪贴板',
    comment: '清空剪贴板',
    inputs: {},

    outputs: {}
};

export const impl = async function () {
    hmc.clearClipboard();
};
