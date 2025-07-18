import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.startWaitElement',
    sort: 18,
    displayName: '等待元素出现后消失任务(异步)',
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
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '等待出现的超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待超时时间'
            }
        }
    },
    outputs: {
        waitForElement: {
            name: 'waitForElement',
            type: 'web.elementOperate.waitForElement',
            display: '等待元素出现后消失的对象',
            addConfig: {
                label: '等待Promise',
                type: 'variable',
                tip: '等待元素出现后消失的对象'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector,
    timeout
}: {
    browserPage: Page | Frame;
    selector: string;
    timeout: number;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!selector) {
            throw new Error('元素选择器不能为空');
        }
        selector = toSelector(selector);
        console.debug('开始等待元素', selector);
        // 创建等待Promise
        const waitPromise = browserPage.waitForSelector(selector, {
            visible: true,
            timeout: timeout * 1000
        });
        waitPromise.catch((error) => {
            console.error('等待元素出现失败:', error);
            return Promise.reject(error);
        });

        return { waitForElement: {waitPromise ,selector}};

    } catch (error) {
        console.error('创建等待Promise失败:', error);
        throw error;
    }
}; 