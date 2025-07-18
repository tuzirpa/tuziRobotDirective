import puppeteer, { Browser, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.closePage',
    displayName: '关闭标签页',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在浏览器 ${browser} 中关闭标签页 ${browserPage}',
    inputs: {
        browser: {
            name: 'browser',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                filtersType: 'web.browser',
                autoComplete: true
            }
        },
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器标签页',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ browserPage }: { browserPage: Page }) {
    try {
        const isClose = browserPage.isClosed();
        if(isClose){
            console.debug('页面已关闭');
            return;   
        }
        await browserPage.close();
        console.debug('Browser Page closed');
    } catch (error) {
        console.error('关闭标签失败');
        throw error;
    }
};
