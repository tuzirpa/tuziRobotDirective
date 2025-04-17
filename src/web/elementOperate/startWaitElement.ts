import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.startWaitElement',
    sort: 18,
    displayName: '创建等待元素出现后消失任务(异步)',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中开始等待${selector}元素',
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
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器'
            }
        }
    },
    outputs: {
        waitPromise: {
            name: 'waitPromise',
            type: 'web.elementOperate.waitForElement',
            display: '等待Promise',
            addConfig: {
                label: '等待Promise',
                type: 'variable'
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
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!selector) {
            throw new Error('元素选择器不能为空');
        }

        // 转换XPath选择器
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }
        console.debug('开始等待元素', selector);
        // 创建等待Promise
        const waitPromise = browserPage.waitForSelector(selector, {
            visible: true
        });

        console.log('开始等待元素出现...');
        return { waitPromise };

    } catch (error) {
        console.error('创建等待Promise失败:', error);
        throw error;
    }
}; 