import { KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { keyCodeMap } from '../utils/keyCodeMap';

const config: DirectiveTree = {
    name: 'web.keyboard.sendKeyCodeDown',
    displayName: '发送按下键盘按键',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘按键 ${keyCode}, 是否按下 ${keyDown}',
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
            value: '',
            type: 'string',
            addConfig: {
                placeholder: '请输入需要发送的键值',
                required: true,
                type: 'select',
                defaultValue: '',
                options: keyCodeMap,
                label: '键值'
            }
        }
    },
    outputs: {}
};

const impl = async function ({ page, keyCode }: { page: Page; keyCode: KeyInput }) {
    await page.keyboard.down(keyCode);
};

export { config, impl };
