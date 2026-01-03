import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';

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
                    { label: '在屏幕中（完全在屏幕中）并可见 过滤值：(是/否)', value: 'isOnScreen' },
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
                placeholder: '支持精确匹配、范围匹配和比较操作符。例如: 100, >100, <50, >=100, <=200, 100-200',
                type: 'string',
                tip: '数字类型支持: 精确值(100)、大于(>100)、小于(<50)、大于等于(>=100)、小于等于(<=200)、范围(100-200)'
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

/**
 * 解析过滤值，支持范围表达式
 * 支持格式: 精确值(100)、大于(>100)、小于(<50)、大于等于(>=100)、小于等于(<=200)、范围(100-200)
 */
function parseFilterValue(filterValue: string): {
    type: 'exact' | 'greater' | 'less' | 'greaterEqual' | 'lessEqual' | 'range';
    value1: number;
    value2?: number;
} {
    const trimmed = filterValue.trim();
    
    // 范围匹配: 100-200
    const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
    if (rangeMatch) {
        return {
            type: 'range',
            value1: parseFloat(rangeMatch[1]),
            value2: parseFloat(rangeMatch[2])
        };
    }
    
    // 大于等于: >=100
    const greaterEqualMatch = trimmed.match(/^>=\s*(\d+(?:\.\d+)?)$/);
    if (greaterEqualMatch) {
        return {
            type: 'greaterEqual',
            value1: parseFloat(greaterEqualMatch[1])
        };
    }
    
    // 小于等于: <=200
    const lessEqualMatch = trimmed.match(/^<=\s*(\d+(?:\.\d+)?)$/);
    if (lessEqualMatch) {
        return {
            type: 'lessEqual',
            value1: parseFloat(lessEqualMatch[1])
        };
    }
    
    // 大于: >100
    const greaterMatch = trimmed.match(/^>\s*(\d+(?:\.\d+)?)$/);
    if (greaterMatch) {
        return {
            type: 'greater',
            value1: parseFloat(greaterMatch[1])
        };
    }
    
    // 小于: <50
    const lessMatch = trimmed.match(/^<\s*(\d+(?:\.\d+)?)$/);
    if (lessMatch) {
        return {
            type: 'less',
            value1: parseFloat(lessMatch[1])
        };
    }
    
    // 精确匹配: 100
    const exactValue = parseFloat(trimmed);
    if (!isNaN(exactValue)) {
        return {
            type: 'exact',
            value1: exactValue
        };
    }
    
    // 如果无法解析，返回精确匹配（用于字符串比较）
    return {
        type: 'exact',
        value1: NaN
    };
}

/**
 * 检查数值是否匹配过滤条件
 */
function matchNumericFilter(actualValue: number, filter: ReturnType<typeof parseFilterValue>): boolean {
    if (isNaN(actualValue)) {
        return false;
    }
    
    switch (filter.type) {
        case 'exact':
            return Math.abs(actualValue - filter.value1) < 0.001; // 浮点数比较
        case 'greater':
            return actualValue > filter.value1;
        case 'less':
            return actualValue < filter.value1;
        case 'greaterEqual':
            return actualValue >= filter.value1;
        case 'lessEqual':
            return actualValue <= filter.value1;
        case 'range':
            if (filter.value2 === undefined) return false;
            return actualValue >= filter.value1 && actualValue <= filter.value2;
        default:
            return false;
    }
}

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
        selector = toSelector(selector);

        // 获取所有匹配的元素
        const elements = await browserPage.$$(selector);
        
        // 解析过滤值（对于数字类型）
        const isNumericFilter = ['width', 'height', 'fontSize', 'opacity'].includes(filterType);
        const parsedFilter = isNumericFilter ? parseFilterValue(filterValue) : null;
        
        // 根据过滤条件筛选元素
        for (const element of elements) {
            let matchCondition = false;
            
            switch (filterType) {
                case 'width':
                case 'height': {
                    const boundingBox = await element.boundingBox();
                    if (boundingBox && parsedFilter) {
                        const value = filterType === 'width' ? boundingBox.width : boundingBox.height;
                        matchCondition = matchNumericFilter(value, parsedFilter);
                    }
                    break;
                }
                case 'visibility': {
                    const isVisible = await element.isVisible();
                    matchCondition = (filterValue === '可见' && isVisible) || 
                                   (filterValue === '不可见' && !isVisible);
                    break;
                }
                case 'opacity': {
                    const style = await element.evaluate((el) => {
                        return window.getComputedStyle(el).getPropertyValue('opacity');
                    });
                    const opacityValue = parseFloat(style);
                    if (parsedFilter && !isNaN(opacityValue)) {
                        matchCondition = matchNumericFilter(opacityValue, parsedFilter);
                    } else {
                        // 如果无法解析为数字，使用精确匹配
                        matchCondition = style === filterValue;
                    }
                    break;
                }
                case 'fontSize': {
                    const style = await element.evaluate((el) => {
                        const fontSize = window.getComputedStyle(el).getPropertyValue('font-size');
                        // 提取数字部分（去除px等单位）
                        const match = fontSize.match(/(\d+(?:\.\d+)?)/);
                        return match ? parseFloat(match[1]) : NaN;
                    });
                    if (parsedFilter && !isNaN(style)) {
                        matchCondition = matchNumericFilter(style, parsedFilter);
                    } else {
                        // 如果无法解析为数字，使用精确匹配
                        const fullStyle = await element.evaluate((el) => {
                            return window.getComputedStyle(el).getPropertyValue('font-size');
                        });
                        matchCondition = fullStyle === filterValue;
                    }
                    break;
                }
                case 'backgroundColor':
                case 'color': {
                    const style = await element.evaluate((el, prop) => {
                        return window.getComputedStyle(el).getPropertyValue(prop);
                    }, filterType);
                    matchCondition = style === filterValue;
                    break;
                }
                case 'isOnScreen': {
                    const boundingBox = await element.boundingBox();
                    
                    if (boundingBox) {
                        const viewport = await browserPage.evaluate(() => {
                            return {
                                width: window.innerWidth,
                                height: window.innerHeight
                            };
                        });
                        console.log('viewport',viewport);
                        let isOnScreen = boundingBox.width > 0 && boundingBox.height > 0;
                        isOnScreen = isOnScreen && boundingBox.y >= 0 && boundingBox.y + boundingBox.height <= viewport.height 
                        && boundingBox.x >= 0 && boundingBox.x + boundingBox.width <= viewport.width;
                        console.log('isOnScreen',isOnScreen);
                        const isVisible = await element.isVisible();
                        console.log('isVisible',isVisible);
                        console.log('filterValue',filterValue);
                        matchCondition = (filterValue === '是' && isOnScreen && isVisible) || 
                                        (filterValue === '否' && (!isOnScreen || !isVisible));
                        console.log('matchCondition',matchCondition);
                    }
                    break;
                }
                case 'cssProperty': {
                    if (!cssPropertyName) {
                        throw new Error('使用CSS属性值过滤时，必须提供CSS属性名称');
                    }
                    const propertyValue = await element.evaluate((el, prop) => {
                        return window.getComputedStyle(el).getPropertyValue(prop);
                    }, cssPropertyName);
                    
                    // 尝试解析为数字并应用范围过滤
                    const numericValue = parseFloat(propertyValue);
                    if (!isNaN(numericValue) && parsedFilter) {
                        matchCondition = matchNumericFilter(numericValue, parsedFilter);
                    } else {
                        // 如果无法解析为数字，使用精确匹配
                        matchCondition = propertyValue === filterValue;
                    }
                    break;
                }
            }

            if (matchCondition) {
                console.log('找到符合条件的元素:', element);
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