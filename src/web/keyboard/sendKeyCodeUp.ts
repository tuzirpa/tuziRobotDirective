import { KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { keyCodeMap } from '../utils/keyCodeMap';

const config: DirectiveTree = {
    name: 'web.keyboard.sendKeyCodeUp',
    displayName: '发送松开键盘按键',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘按键 ${keyCode} 松开',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        keyCode: {
            name: 'keyCode',
            value: 'A',
            type: 'string',
            addConfig: {
                placeholder: '请输入需要发送的键值',
                required: true,
                label: '键值',
                type: 'select',
                defaultValue: '',
                options: keyCodeMap
            }
        }
    },
    outputs: {}
};

const impl = async function ({ page, keyCode }: { page: Page; keyCode: KeyInput }) {
    page.keyboard.up(keyCode);
};

export { config, impl };
