import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementScrollIntoView',
    sort: 2,
    displayName: '将元素滚动到视图中',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将${element ? "元素" : "匹配选择器" + selector + "的元素"}滚动到视图中，使其可见。',
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
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'string',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ browserPage, element, selector }: { 
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
}) {
    try {
        if (!element && !selector) {
            throw new Error('元素对象和选择器至少需要提供一个');
        }

        let targetElement = element;
        if (!targetElement && selector) {
            if (selector.startsWith('//')) {
                selector = `::-p-xpath(${selector})`;
            }
            targetElement = await browserPage.$(selector) || undefined;
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
        }

        await targetElement!.scrollIntoView();
    } catch (error) {
        console.error('将元素滚动到视图中失败:', error);
        throw error;
    }
};
