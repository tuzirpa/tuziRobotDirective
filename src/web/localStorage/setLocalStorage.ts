import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.localStorage.set',
    sort: 1,
    displayName: '设置本地存储',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description: '设置浏览器localStorage的值',
    comment: '在${browserPage}中设置本地存储${key}的值为${value}',
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
                placeholder: '请输入存储键名'
            }
        },
        value: {
            name: 'value',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '存储的值',
                type: 'string',
                placeholder: '请输入要存储的值'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ browserPage, key, value }: { browserPage: Page; key: string; value: string }) {
    try {
        await browserPage.evaluate(
            (k, v) => {
                localStorage.setItem(k, v);
            },
            key,
            value
        );
    } catch (error: any) {
        throw new Error(`设置localStorage失败: ${error.message}`);
    }
}; 