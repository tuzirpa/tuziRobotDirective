import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.keyboard.sendCtrlA',
    displayName: 'Ctrl+A 全选',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘组合键Ctrl+A 全选',
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
        }
    },
    outputs: {}
};

const impl = async function ({ page }: { page: Page }) {
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
};

export { config, impl };
