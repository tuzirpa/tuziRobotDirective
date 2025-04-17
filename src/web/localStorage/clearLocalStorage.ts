import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.localStorage.clear',
    sort: 3,
    displayName: '清除本地存储',
    icon: 'icon-web-delete',
    isControl: false,
    isControlEnd: false,
    description: '清除浏览器localStorage中的数据',
    comment: '在${browserPage}中清除本地存储${key}的值，若不指定键名则清除所有数据',
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
                required: false,
                label: '存储键名',
                type: 'string',
                placeholder: '请输入要清除的键名，不填则清除所有数据'
            }
        }
    },
    outputs: {}
};

interface ClearLocalStorageParams {
    browserPage: Page;
    key?: string;
}

export const impl = async function ({ browserPage, key }: ClearLocalStorageParams): Promise<void> {
    if (!browserPage) {
        throw new Error('网页对象不能为空');
    }

    console.log(`开始清除localStorage${key ? `键名: ${key}` : '所有数据'}`);
    try {
        await browserPage.evaluate(
            (k?: string) => {
                try {
                    if (k) {
                        localStorage.removeItem(k);
                    } else {
                        localStorage.clear();
                    }
                } catch (e) {
                    console.error(`访问localStorage失败: ${e}`);
                    throw new Error(`访问localStorage失败: ${e}`);
                }
            },
            key
        );
        console.log(`成功清除localStorage${key ? `键名: ${key}` : '所有数据'}`);
    } catch (error: any) {
        const errorMessage = error.message || '未知错误';
        console.error(`清除localStorage失败: ${errorMessage}`);
        throw new Error(`清除localStorage失败: ${errorMessage}`);
    }
}; 