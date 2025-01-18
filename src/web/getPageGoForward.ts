import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getPageGoForward',
    icon: 'icon-web-create',
    displayName: '前进一页',
    comment: '在页面${page}中前进一页',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '页面对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ page }: { page: Page }) {
    await page.goForward();
    console.log('前进一页');
};
