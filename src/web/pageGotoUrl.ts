import puppeteer, { Browser, Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';
import { error } from 'console';

export const config: DirectiveTree = {
    name: 'web.pageGotoUrl',
    displayName: '访问网页地址',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在标签${page}中访问网页地址${url},超时等待时间${loadTimeout}秒',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        url: {
            name: 'url',
            value: '',
            type: 'string',
            addConfig: {
                label: '地址',
                type: 'textarea',
                placeholder: '网页地址：如 https://www.baidu.com ',
                required: true,
                defaultValue: '',
                tip: '打开的地址'
            }
        },
        loadTimeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                label: '等待页面加载超时',
                placeholder: '不填或0表示不等待页面加载完成',
                type: 'string',
                defaultValue: '',
                tip: '等待超时时间，单位：秒 | 不填或者填0表示不等待'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    page,
    url,
    loadTimeout
}: {
    page: Page;
    url: string;
    loadTimeout: number;
}) {
    if (loadTimeout > 0) {
        await page.goto(url, { timeout: loadTimeout * 1000 });
    } else {
        await page.goto(url, { timeout: 0 });
    }
    return { page };
};
