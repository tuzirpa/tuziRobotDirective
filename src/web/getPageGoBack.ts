import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getPageGoBack',
    icon: 'icon-web-create',
    displayName: '后退一页',
    comment: '在页面${page}中后退一页',
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
    await page.goBack();
    console.log('后退一页');
};
