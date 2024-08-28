import hmc from 'hmc-win32';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'keyboard.sendKeyCode1',
    displayName: '发送一次完整按键（按下+松开）',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘按键 ${keyCode} 按下 ${time} 毫秒后松开 ',
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
        time: {
            name: 'time',
            value: '',
            type: 'number',
            addConfig: {
                placeholder: '请输入按键持续时间（单位：毫秒）',
                required: true,
                label: '按下持续时间',
                type: 'string',
                defaultValue: '0'
            }
        }
    },
    outputs: {}
};

const impl = async function ({ keyCode, time }: { keyCode: string; time: number }) {
    hmc.sendKeyboard(keyCode, true);
    await new Promise((resolve) => setTimeout(resolve, time));
    hmc.sendKeyboard(keyCode, false);
};

export { config, impl };
