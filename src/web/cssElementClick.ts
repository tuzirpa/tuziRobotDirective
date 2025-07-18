import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from './utils';

const config: DirectiveTree = {
    name: 'web.cssElementClick',
    sort: 2,
    displayName: 'CSS或XPATH点击元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面对象${browserPage}中获取元素${selector} 并点击，元素超时时间${timeout}秒',
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
                label: '元素选择器',
                placeholder: '支持 CSS 例:#id .class 或 xpath 例://div[text()="hello"]',
                elementLibrarySupport: true,
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
    browserPage,
    selector,
    timeout
}: {
    browserPage: Page | Frame;
    selector: string;
    timeout: number;
}) {
    selector = toSelector(selector);
    try {
        await browserPage.locator(selector)
            .setTimeout(timeout * 1000)
            .click();
    } catch (error) {
        console.error('CSS或XPATH点击元素失败, selector:', selector);
        throw error;
    }
};

export { config, impl };
