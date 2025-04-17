import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.scrollElement',
    sort: 12,
    displayName: '滚动元素(元素要有滚动条)',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中滚动${element ? "元素" : "匹配选择器" + selector + "的元素"}${scrollType === "custom" ? "到指定位置(" + scrollX + "," + scrollY + ")" : scrollType === "top" ? "到顶部" : "到底部"}',
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
                tip: '要滚动的元素对象'
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
        },
        scrollType: {
            name: 'scrollType',
            value: 'custom',
            type: 'string',
            addConfig: {
                label: '滚动类型',
                type: 'select',
                options: [
                    { label: '自定义位置', value: 'custom' },
                    { label: '滚动到顶部', value: 'top' },
                    { label: '滚动到底部', value: 'bottom' }
                ],
                defaultValue: 'custom'
            }
        },
        behavior: {
            name: 'behavior',
            value: 'smooth',
            display: '',
            type: 'string',
            addConfig: {
                label: '滚动行为',
                type: 'select',
                isAdvanced: true,
                options: [
                    { label: '平滑滚动', value: 'smooth' },
                    { label: '瞬间滚动', value: 'instant' }
                ],
                defaultValue: 'smooth'
            }
        },
        scrollX: {
            name: 'scrollX',
            value: '0',
            type: 'number',
            addConfig: {
                label: '水平滚动位置',
                type: 'string',
                defaultValue: '0',
                tip: '水平滚动的像素值',
                filters: 'this.inputs.scrollType.value === "custom"'
            }
        },
        scrollY: {
            name: 'scrollY',
            value: '0',
            type: 'number',
            addConfig: {
                label: '垂直滚动位置',
                type: 'string',
                defaultValue: '0',
                tip: '垂直滚动的像素值',
                filters: 'this.inputs.scrollType.value === "custom"'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ 
    browserPage,
    element,
    selector,
    behavior,
    scrollType,
    scrollX,
    scrollY
}: { 
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
    scrollType: 'custom' | 'top' | 'bottom';
    behavior: 'smooth' | 'instant';
    scrollX?: number;
    scrollY?: number;
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

        await browserPage.evaluate((el, type, x, y,behavior) => {
            if (el) {
                switch (type) {
                    case 'top':
                        el.scrollTo({
                            top: 0,
                            behavior: behavior
                        });
                        break;
                    case 'bottom':
                        el.scrollTo({
                            top: el.scrollHeight,
                            behavior: behavior
                        });
                        break;
                    case 'custom':
                        el.scrollTo({
                            left: x,
                            top: y,
                            behavior: behavior
                        });
                        break;
                }
            }
        }, targetElement, scrollType, scrollX, scrollY,behavior);

    } catch (error) {
        console.error('滚动元素失败:', error);
        throw error;
    }
}; 