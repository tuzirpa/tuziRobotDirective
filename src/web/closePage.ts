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
        },
        runBeforeUnload: {
            name: 'runBeforeUnload',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '是否运行beforeunload事件',
                type: 'boolean',
                tip: '是否运行beforeunload事件，如果为true则运行beforeunload事件，如果为false则不运行beforeunload事件',
                isAdvanced: true,
                defaultValue: false,
                required: false
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ browserPage, runBeforeUnload }: { browserPage: Page, runBeforeUnload: boolean }) {
    try {
        const isClose = browserPage.isClosed();
        if(isClose){
            console.debug('页面已关闭');
            return;   
        }
        runBeforeUnload = runBeforeUnload || false;
        await browserPage.close({runBeforeUnload: runBeforeUnload});
        console.debug('Browser Page closed');
    } catch (error) {
        console.error('关闭标签失败');
        throw error;
    }
};
