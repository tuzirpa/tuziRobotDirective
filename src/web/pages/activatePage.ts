import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.pages.activatePage',
    sort: 1,
    displayName: '激活标签页',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '激活浏览器标签页${page}',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true,
                tip: '要激活的标签页对象'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ page }: { page: Page }) {
    try {
        if (!page) {
            throw new Error('标签页对象不能为空');
        }

        await page.bringToFront();
    } catch (error) {
        console.error('激活标签页失败:', error);
        throw error;
    }
}; 