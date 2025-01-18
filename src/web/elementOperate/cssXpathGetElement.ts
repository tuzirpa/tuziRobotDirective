import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.cssXpathGetElement',
    sort: 3,
    displayName: 'CSS/XPath获取元素(带过滤)',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中获取元素${selector}，并根据${filterType}过滤条件${filterValue}筛选元素，保存到${element}',
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
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                elementLibrarySupport: true,
                placeholder: '请输入CSS或XPath选择器 (例如: #id, .class, //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        },
        filterType: {
            name: 'filterType',
            value: 'width',
            type: 'string',
            addConfig: {
                required: true,
                label: '过滤条件',
                type: 'select',
                options: [
                    { label: '宽度 过滤值：(数字)', value: 'width' },
                    { label: '高度 过滤值：(数字)', value: 'height' },
                    { label: '可见性 过滤值：(可见/不可见)', value: 'visibility' },
                    { label: '透明度 过滤值：(0-1)', value: 'opacity' },
                    { label: '背景颜色 过滤值：(颜色值)', value: 'backgroundColor' },
                    { label: '文本颜色 过滤值：(颜色值)', value: 'color' },
                    { label: '字体大小 过滤值：(数字)', value: 'fontSize' },
                    { label: 'CSS属性值 过滤值：(属性值)', value: 'cssProperty' }
                ]
            }
        },
        filterValue: {
            name: 'filterValue',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '过滤值',
                placeholder: '请输入要匹配的值',
                type: 'string'
            }
        },
        cssPropertyName: {
            name: 'cssPropertyName',
            value: '',
            type: 'string',
            addConfig: {
                label: 'CSS属性名称',
                placeholder: '当过滤条件选择"CSS属性值"时需要填写',
                type: 'string',
                filters: 'this.inputs.filterType.value === "cssProperty"'
            }
        }
    },
    outputs: {
        element: {
            name: 'element',
            type: 'web.Element',
            display: '元素对象',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'element'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector,
    filterType,
    filterValue,
    cssPropertyName
}: {
    browserPage: Page | Frame;
    selector: string;
    filterType: string;
    filterValue: string;
    cssPropertyName?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        // 转换XPath选择器
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }

        // 获取所有匹配的元素
        const elements = await browserPage.$$(selector);
        
        // 根据过滤条件筛选元素
        for (const element of elements) {
            let matchCondition = false;
            
            switch (filterType) {
                case 'width':
                case 'height': {
                    const boundingBox = await element.boundingBox();
                    if (boundingBox) {
                        const value = filterType === 'width' ? boundingBox.width : boundingBox.height;
                        matchCondition = value === parseFloat(filterValue);
                    }
                    break;
                }
                case 'visibility': {
                    const isVisible = await element.isVisible();
                    matchCondition = (filterValue === '可见' && isVisible) || 
                                   (filterValue === '不可见' && !isVisible);
                    break;
                }
                case 'opacity':
                case 'backgroundColor':
                case 'color':
                case 'fontSize': {
                    const style = await element.evaluate((el, prop) => {
                        return window.getComputedStyle(el).getPropertyValue(prop);
                    }, filterType);
                    matchCondition = style === filterValue;
                    break;
                }
                case 'cssProperty': {
                    if (!cssPropertyName) {
                        throw new Error('使用CSS属性值过滤时，必须提供CSS属性名称');
                    }
                    const propertyValue = await element.evaluate((el, prop) => {
                        return window.getComputedStyle(el).getPropertyValue(prop);
                    }, cssPropertyName);
                    matchCondition = propertyValue === filterValue;
                    break;
                }
            }

            if (matchCondition) {
                return { element };
            }
        }
        console.log(`页面共找到 ${elements.length} 个元素,未找到符合过滤条件的元素: ${filterType}=${filterValue}`);
        
        return { element: null };

    } catch (error) {
        console.error('获取元素失败:', error);
        throw error;
    }
}; 