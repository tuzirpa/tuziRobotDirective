import hmc from 'hmc-win32';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'keyboard.sendKeyCode',
    displayName: '发送键盘按键',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘按键 ${keyCode}, 是否按下 ${keyDown}',
    inputs: {
        keyCode: {
            name: 'keyCode',
            value: 'A',
            type: 'string',
            addConfig: {
                placeholder: '请输入需要发送的键值',
                required: true,
                label: '键值',
                type: 'string'
            }
        },
        keyDown: {
            name: 'keyDown',
            value: '',
            type: 'boolean',
            addConfig: {
                placeholder: '是否按下，true为按下，false为松开',
                required: true,
                label: '是否按下',
                type: 'string',
                defaultValue: 'true'
            }
        }
    },
    outputs: {}
};

const impl = async function ({ keyCode, keyDown }: { keyCode: string; keyDown: boolean }) {
    hmc.sendKeyboard(keyCode, keyDown);
};

export { config, impl };
