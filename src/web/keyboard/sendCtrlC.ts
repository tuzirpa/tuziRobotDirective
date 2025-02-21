import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.keyboard.sendCtrlC',
    displayName: 'Ctrl+C 复制',
    icon: 'icon-web-copy',
    isControl: false,
    isControlEnd: false,
    comment: '发送键盘组合键Ctrl+C执行复制操作',
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
                autoComplete: true,
                required: true // 添加必填校验
            }
        }
    },
    outputs: {}
};

const impl = async function ({ page }: { page: Page }) {
    // 确保页面焦点
    // await page.bringToFront();
    
    // 执行复制操作
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyC');
    await page.keyboard.up('Control');
};

export { config, impl }; 