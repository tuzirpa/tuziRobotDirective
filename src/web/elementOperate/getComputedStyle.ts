
import { Page, Frame, ElementHandle } from 'puppeteer-core';
import { Block, DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.elementOperate.getComputedStyle',
    displayName: '获取元素计算样式',
    icon: 'icon-style',
    isControl: false,
    isControlEnd: false,
    comment: '获取元素${element?element:selector} 的${propertyName}样式属性，保存到${styleValue}',
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
            type: 'variable',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.element',
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
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器'
            }
        },
        propertyName: {
            name: 'propertyName',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '样式属性名',
                type: 'string',
                placeholder: '输入CSS属性名，如：color、display、width等',
                tip: '要获取的CSS样式属性名'
            }
        }
    },
    outputs: {
        styleValue: {
            name: '',
            display: '样式值',
            type: 'string',
            addConfig: {
                label: '样式值',
                type: 'variable',
                defaultValue: 'styleValue'
            }
        }
    }
};

export const impl = async function (
    { 
        browserPage, 
        selector,
        element,
        propertyName
    }: { 
        browserPage: Page | Frame; 
        selector?: string; 
        element?: ElementHandle;
        propertyName: string;
    },
    _block: Block
) {
    console.debug('获取元素计算样式', selector, '属性:', propertyName);
    
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if(!element && !selector) {
            throw new Error('元素对象和选择器至少需要提供一个');
        }

        let targetElement = element;
        if(!targetElement && selector) {
            selector = toSelector(selector);
            targetElement = await browserPage.$(selector) || undefined;
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
        }

        // 获取计算样式
        const styleValue = await browserPage.evaluate(
            (element, property) => {
                if (!element) {
                    return '';
                }
                const computedStyle = window.getComputedStyle(element);
                return computedStyle.getPropertyValue(property);
            },
            targetElement,
            propertyName
        );
        
        return { styleValue: styleValue.trim() };
    } catch (error) {
        console.error('获取元素样式失败:', error);
        throw error;
    }
};