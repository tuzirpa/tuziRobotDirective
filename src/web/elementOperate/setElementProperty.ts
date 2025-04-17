import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.setElementProperty',
    sort: 15,
    displayName: '设置元素属性',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '设置${element ? "元素" : "匹配选择器" + selector + "的元素"}的${property}属性为${value}',
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
                tip: '要设置属性的元素对象'
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
        property: {
            name: 'property',
            value: '',
            display: '文本内容',
            type: 'string',
            addConfig: {
                required: true,
                label: '选择设置的属性',
                type: 'select',
                options: [
                    {
                        label: '文本内容',
                        value: 'textContent'
                    },
                    {
                        label: 'HTML内容',
                        value: 'innerHTML'
                    },
                    {
                        label: 'value属性',
                        value: 'value'
                    },
                    {
                        label: 'class属性',
                        value: 'className'
                    },
                    {
                        label: 'id属性',
                        value: 'id'
                    },
                    {
                        label: 'name属性',
                        value: 'name'
                    },
                    {
                        label: 'title属性',
                        value: 'title'
                    },
                    {
                        label: 'src属性',
                        value: 'src'
                    },
                    {
                        label: 'href属性',
                        value: 'href'
                    },
                    {
                        label: '自定义属性',
                        value: 'custom'
                    }
                ],
                defaultValue: 'textContent'
            }
        },
        customProperty: {
            name: 'customProperty',
            value: '',
            display: '自定义属性名',
            type: 'string',
            addConfig: {
                required: false,
                filters: 'this.inputs.property.value === "custom"',
                label: '自定义属性名',
                type: 'string',
                placeholder: '请输入自定义属性名'
            }
        },
        value: {
            name: 'value',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '属性值',
                type: 'textarea',
                placeholder: '请输入要设置的属性值'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ 
    browserPage,
    element,
    selector,
    property,
    customProperty,
    value
}: { 
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
    property: string;
    customProperty?: string;
    value: string;
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
            if (selector.startsWith('//')) {
                selector = `::-p-xpath(${selector})`;
            }
            targetElement = await browserPage.$(selector) || undefined;
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
        }

        const actualProperty = property === 'custom' ? (customProperty || property) : property;

        await browserPage.evaluate((el, prop, val) => {
            if (el) {
                if (prop === 'textContent' || prop === 'innerHTML' || prop === 'value') {
                    (el as any)[prop] = val;
                } else {
                    el.setAttribute(prop, val);
                }
            }
        }, targetElement, actualProperty, value);

    } catch (error) {
        console.error('设置元素属性失败:', error);
        throw error;
    }
}; 