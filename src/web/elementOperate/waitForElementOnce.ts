import { Frame, Page, ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.waitForElementOnce',
    sort: 18,
    displayName: '等待元素出现后消失',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中等待${selector}元素出现后消失',
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
        triggerElement: {
            name: 'triggerElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '触发元素',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '点击此元素来触发弹框'
            }
        },
        triggerSelector: {
            name: 'triggerSelector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '触发元素选择器',
                placeholder: '请输入触发元素的CSS或XPath选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '点击此选择器匹配的元素来触发弹框'
            }
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待超时时间'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector,
    triggerElement,
    triggerSelector,
    timeout = 30
}: {
    browserPage: Page | Frame;
    selector: string;
    triggerElement?: ElementHandle;
    triggerSelector?: string;
    timeout?: number;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!selector) {
            throw new Error('元素选择器不能为空');
        }

        if (!triggerElement && !triggerSelector) {
            throw new Error('触发元素和触发选择器至少需要提供一个');
        }

        // 转换XPath选择器
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }

        // 执行触发动作
        if (triggerElement) {
            await triggerElement.click();
        } else if (triggerSelector) {
            if (triggerSelector.startsWith('//')) {
                triggerSelector = `::-p-xpath(${triggerSelector})`;
            }
            await browserPage.click(triggerSelector);
        }

        // 等待元素出现
        console.log('等待元素出现...');
        await browserPage.waitForSelector(selector, {
            visible: true,
            timeout: timeout * 1000
        });
        console.log('元素已出现');

        // 等待元素消失
        console.log('等待元素消失...');
        await Promise.race([
            browserPage.waitForSelector(selector, {
                hidden: true,
                timeout: timeout * 1000
            }),
            browserPage.waitForFunction(
                (sel) => !document.querySelector(sel),
                { timeout: timeout * 1000 },
                selector
            )
        ]);
        console.log('元素已消失');

    } catch (error) {
        console.error('等待元素出现后消失失败:', error);
        throw error;
    }
}; 