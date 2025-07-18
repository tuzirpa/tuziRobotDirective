import { ElementHandle, KeyInput, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from './utils';
const config: DirectiveTree = {
    name: 'web.locatorClick',
    sort: 2,
    displayName: 'CSS定位器点击元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${page}中，使用${selector}定位到元素并点击',
    inputs: {
        page: {
            name: 'page',
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
                elementLibrarySupport: true,
                placeholder:
                    '请输入CSS或XPath选择器 (例如: #id, .class, input[type="text"], //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                type: 'string',
                defaultValue: 30
            }
        }
    },
    outputs: {}
};

const impl = async function ({
    page,
    selector,
    timeout
}: {
    page: Page;
    selector: string;
    timeout: number;
}) {
    selector = toSelector(selector);
    try {
        await page.locator(selector)
            .setTimeout(timeout * 1000)
            .click();
    } catch (error) {
        console.error('定位器点击失败, selector:', selector);
        throw error;
    }
};

export { config, impl };
