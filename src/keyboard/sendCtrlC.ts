import hmc from 'hmc-win32';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'keyboard.sendCtrlC',
    displayName: 'Ctrl+C 复制',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘组合键Ctrl+C 复制',
    inputs: {},
    outputs: {}
};

const impl = async function () {
    hmc.sendBasicKeys(true, false, false, false, 'C');
};

export { config, impl }; 