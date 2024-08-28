import hmc from 'hmc-win32';
import { ElementHandle, KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'keyboard.sendCtrlV',
    displayName: 'Ctrl+V 粘贴',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘组合键 Ctrl+V 粘贴',
    inputs: {},
    outputs: {}
};

const impl = async function () {
    hmc.sendBasicKeys(true, false, false, false, 'V');
};

export { config, impl };
