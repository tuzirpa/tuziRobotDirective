import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'web.cssNoNeedGetElement',
    sort: 2,
    displayName: 'CSS或XPath无需等待获取元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在页面对象${browserPage}中，使用CSS或XPath选择器${selector}查找元素，无需等待获取元素。返回元素对象${webElement}。',
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
        webElement: {
            name: '',
            display: '元素对象',
            type: 'web.Element',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'webElement'
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
    let webElement = await browserPage.$(selector);
    return { webElement: webElement ? webElement : '' };
};
