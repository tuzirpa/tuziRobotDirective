import { Browser } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getPages',
    icon: 'icon-web-create',
    displayName: '获取已打开标签页列表',
    comment: '在页面${browserPage}中获取所有标签页列表并返回',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                filtersType: 'web.browser',
                autoComplete: true
            }
        }
    },

    outputs: {
        pages: {
            name: '',
            display: '数组-标签页列表',
            type: 'array',
            addConfig: {
                label: '对象',
                type: 'variable',
                defaultValue: 'webPages'
            }
        }
    }
};

export const impl = async function ({ browserPage }: { browserPage: Browser }) {
    const pages = await browserPage.pages();
    return { pages };
};
