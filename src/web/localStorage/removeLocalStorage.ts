import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.localStorage.remove',
    sort: 3,
    displayName: '删除本地存储项',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description: '删除浏览器localStorage中的某一项',
    comment: '在${browserPage}中删除本地存储${key}的值',
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
        },
        key: {
            name: 'key',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '存储键名',
                type: 'string',
                placeholder: '请输入要删除的键名'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ browserPage, key }: { browserPage: Page; key: string }) {
    try {
        await browserPage.evaluate(
            (k) => localStorage.removeItem(k),
            key
        );
    } catch (error: any) {
        throw new Error(`删除localStorage项失败: ${error.message}`);
    }
}; 