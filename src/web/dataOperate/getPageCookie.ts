import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getPageCookie',
    icon: 'icon-web-create',
    displayName: '获取网页Cookie',
    comment: '在页面${page}中获取当前标签页的Cookie，保存到变量${cookie}中,保存为字符串到变量${cookieString}中',
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
            display: 'Cookie对象',
            type: 'variable',
            addConfig: {
                label: 'cookie',
                type: 'variable',
                defaultValue: ''
            }
        },
        cookieString: {
            name: 'cookieString',
            display: 'Cookie字符串',
            type: 'variable',
            addConfig: {
                label: 'cookieString',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ page }: { page: Page }) {
    const cookie = await page.cookies();
    const cookieString = cookie.map((c) => `${c.name}=${c.value}`).join('; ');

    return { cookie, cookieString};
};
