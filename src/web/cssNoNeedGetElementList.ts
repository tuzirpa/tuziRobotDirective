import { Frame, Page } from 'puppeteer';
import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'web.cssNoNeedGetElementList',
    sort: 2,
    displayName: 'CSS或XPath无需等待获取元素列表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在页面对象${browserPage}中，使用CSS或XPath选择器${selector}查找元素列表，无需等待获取元素。返回元素对象列表${webElement}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        }
    },

    outputs: {
        webElementList: {
            name: '',
            display: '元素对象列表',
            type: 'array',
            addConfig: {
                label: '元素对象列表',
                type: 'variable',
                defaultValue: 'webElementList'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector
}: {
    browserPage: Page | Frame;
    selector: string;
}) {
    if (selector.startsWith('//')) {
        selector = `::-p-xpath(${selector})`;
    }
    let webElementList = await browserPage.$$(selector);
    return { webElementList: webElementList ? webElementList : '' };
};
