import { ElementHandle, KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.keyboard.sendCharacter',
    sort: 2,
    displayName: '发送字符',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '往页面 ${page} 发送字符 ${char}',
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
        char: {
            name: 'char',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '发送的字符',
                required: true,
                placeholder: '请输入要发送的字符',
                type: 'textarea'
            }
        }
    },
    outputs: {}
};

const impl = async function ({ page, char }: { page: Page; char: string }) {
    await page.keyboard.sendCharacter(char);
};

export { config, impl };
