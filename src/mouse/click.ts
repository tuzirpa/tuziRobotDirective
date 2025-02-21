import hmc from 'hmc-win32';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'mouse.click',
    displayName: '鼠标点击',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在当前鼠标位置执行左键点击，支持延时',
    inputs: {
        time: {
            name: 'time',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '延迟时间（毫秒）',
                placeholder: '请输入延迟时间',
                required: false,
                type: 'string'
            }
        }
    },
    outputs: {}
};

const impl = async function ({ time }: { time?: number }) {
    time = time || 100;
    hmc.leftClick(time); // 执行鼠标左键点击
};

export { config, impl };
