import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.removeElement',
    sort: 3,
    displayName: '删除页面元素',
    icon: 'icon-delete',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中，删除指定的元素${element}或通过选择器${selector}删除元素',
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
                autoComplete: true,
                required: true
            }
        },
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '要删除的元素',
                placeholder: '请选择要删除的元素 可选',
                type: 'variable',
                filtersType: 'web.Element',
                tip: '通过其他指令获取到的页面元素对象'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                elementLibrarySupport: true,
                placeholder: '请输入CSS或XPath选择器 (例如: #id, .class, //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea',
                tip: '当未提供element时，将使用此选择器查找要删除的元素'
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
                defaultValue: '30',
                tip: '使用选择器查找元素时的超时时间（秒）'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    element,
    selector,
    timeout = 30
}: {
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
    timeout?: number;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        let targetElement = element;

        // 如果没有提供element但提供了selector，则先查找元素
        if (!targetElement && selector) {
            selector = toSelector(selector);
            targetElement = (await browserPage.waitForSelector(selector, {
                timeout: timeout * 1000
            })) || undefined;
        }

        if (!targetElement) {
            throw new Error('未找到要删除的元素');
        }

        // 使用evaluate在页面上下文中删除元素
        await browserPage.evaluate((el) => {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, targetElement);

    } catch (error) {
        console.error('删除元素失败:', error);
        throw error;
    }
}; 