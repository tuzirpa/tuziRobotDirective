import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.dataOperate.getBrowserUA',
    sort: 6,
    displayName: '获取浏览器UA',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description: '获取当前浏览器的User-Agent信息',
    comment: '获取${browserPage}的User-Agent信息，并将结果存入${userAgent}变量',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '网页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        }
    },
    outputs: {
        userAgent: {
            name: '',
            display: 'User-Agent',
            type: 'string',
            addConfig: {
                label: 'User-Agent字符串',
                type: 'variable',
                defaultValue: 'browserUA'
            }
        }
    }
};

export const impl = async function ({ browserPage }: { browserPage: Page }) {
    try {
        const userAgent = await browserPage.evaluate(() => navigator.userAgent);
        return { userAgent };
    } catch (error: any) {
        throw new Error(`获取User-Agent失败: ${error.message}`);
    }
}; 