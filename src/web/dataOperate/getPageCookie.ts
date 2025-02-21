import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getPageCookie',
    icon: 'icon-web-create',
    displayName: '获取网页Cookie',
    comment: '在页面${page}中获取当前标签页的Cookie，保存到变量${cookie}中',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        }
    },

    outputs: {
        cookie: {
            name: 'cookie',
            display: 'Cookie',
            type: 'string',
            addConfig: {
                label: 'cookie',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ page }: { page: Page }) {
    const cookie = await page.cookies();
    return { cookie };
};
