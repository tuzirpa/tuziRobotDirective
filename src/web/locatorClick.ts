import { ElementHandle, KeyInput, Page } from 'puppeteer';
import { DirectiveTree } from '../types';

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
                label: 'css选择器',
                required: true,
                type: 'string'
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
    page.locator(selector)
        .setTimeout(timeout * 1000)
        .click();
};

export { config, impl };
