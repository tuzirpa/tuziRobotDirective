import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.localStorage.get',
    sort: 2,
    displayName: '获取本地存储',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    description: '获取浏览器localStorage中的值',
    comment: '在${browserPage}中获取本地存储${key}的值',
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
                placeholder: '请输入要获取的键名'
            }
        }
    },
    outputs: {
        value: {
            name: 'value',
            display: '存储的值',
            type: 'variable',
            addConfig: {
                required: false,
                label: '存储的值',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ browserPage, key }: { browserPage: Page; key: string }) {
    if (!browserPage) {
        throw new Error('网页对象不能为空');
    }
    if (!key || typeof key !== 'string') {
        throw new Error('存储键名必须是非空字符串');
    }

    try {
        const value = await browserPage.evaluate(
            (k: string) => {
                const result = localStorage.getItem(k);
                return result === null ? '' : result;
            },
            key
        );
        return { value };
    } catch (error: any) {
        const errorMessage = error.message || '未知错误';
        throw new Error(`获取localStorage失败: ${errorMessage}`);
    }
};