import { Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.mouseReset',
    icon: 'icon-web-create',
    displayName: '重置鼠标为默状态',
    comment: '在页面${page}中，重置鼠标为默认状态，位置（0，0）',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ page }: { page: Page }) {
    await page.mouse.reset();
};
