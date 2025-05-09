import { CookieParam, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.setCookie',
    icon: 'icon-web-create',
    displayName: '设置cookie',
    comment: '在页面${browserPage}中设置cookie : ${cookie}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                placeholder: '选择标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        cookie: {
            name: 'cookie',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: 'cookie字符串',
                placeholder: '输入cookie字符串，例如: a=b; c=d',
                type: 'textarea'
            }
        },
        domain: {
            name: 'domain',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '域名',
                placeholder: '请输入域名',
                type: 'string',
                defaultValue: ''
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    browserPage,
    cookie,
    domain
}: {
    browserPage: Page;
    cookie: string;
    domain: string;
}) {
    const cookies: CookieParam[] = [];
    cookie.split(';').forEach((item) => {
        const [key, value] = item.split('=');
        if (domain) {
            cookies.push({
                name: key.trim(),
                value: value,
                domain: domain
            });
        } else {
            cookies.push({
                name: key.trim(),
                value: value
            });
        }
    });
    await browserPage.setCookie(...cookies);
};
