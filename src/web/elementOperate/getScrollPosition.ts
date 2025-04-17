import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.getScrollPosition',
    sort: 13,
    displayName: '获取滚动条位置',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '获取${element ? "元素" : "匹配选择器" + selector + "的元素"}的滚动条位置',
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
                autoComplete: true,
                tip: '要获取滚动位置的元素对象'
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
    outputs: {
        scrollInfo: {
            name: 'scrollInfo',
            type: 'web.elementOperate.scrollInfo',
            display: '滚动条信息',
            typeDetails: [
                {
                    type: 'number',
                    display: '水平滚动位置',
                    key: 'scrollLeft'
                },
                {
                    type: 'number',
                    display: '垂直滚动位置',
                    key: 'scrollTop'
                },
                {
                    type: 'number',
                    display: '可滚动宽度',
                    key: 'scrollWidth'
                },
                {
                    type: 'number',
                    display: '可滚动高度',
                    key: 'scrollHeight'
                }
            ],
            addConfig: {
                label: '滚动条信息',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ 
    browserPage,
    element,
    selector
}: { 
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        if (!element && !selector) {
            throw new Error('元素对象和选择器至少需要提供一个');
        }

        let targetElement = element;
        if (!targetElement && selector) {
            selector = toSelector(selector);
            targetElement = await browserPage.$(selector) || undefined;
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
        }

        const scrollInfo = await browserPage.evaluate((el) => {
            if (el) {
                return {
                    scrollLeft: el.scrollLeft,
                    scrollTop: el.scrollTop,
                    scrollWidth: el.scrollWidth,
                    scrollHeight: el.scrollHeight
                };
            }
            return null;
        }, targetElement);

        if (!scrollInfo) {
            throw new Error('获取滚动条信息失败');
        }

        return { scrollInfo };

    } catch (error) {
        console.error('获取滚动条位置失败:', error);
        throw error;
    }
}; 