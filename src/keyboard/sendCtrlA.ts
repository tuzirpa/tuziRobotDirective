import hmc from 'hmc-win32';
import { ElementHandle, KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'keyboard.sendCtrlA',
    displayName: 'Ctrl+A 全选',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘组合键Ctrl+A 全选',
    inputs: {},
    outputs: {}
};

const impl = async function () {
    hmc.sendBasicKeys(true, false, false, false, 'A');
};

export { config, impl };
