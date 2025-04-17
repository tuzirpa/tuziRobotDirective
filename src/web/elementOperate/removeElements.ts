import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.removeElements',
    sort: 11,
    displayName: '批量移除元素',
    icon: 'icon-delete',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中移除${elementHandles ? "指定的元素数组" : "匹配选择器" + selector + "的所有元素"}',
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
        elementHandles: {
            name: 'elementHandles',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素数组',
                placeholder: '请输入要移除的元素数组',
                type: 'variable',
                filtersType: 'web.Element[]',
                tip: '直接传入要移除的元素数组'
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
                tip: '支持CSS或XPath选择器，将移除所有匹配的元素'
            }
        }
    },
    outputs: {
        removedCount: {
            name: 'removedCount',
            type: 'number',
            display: '已移除元素数量',
            addConfig: {
                label: '移除数量',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    elementHandles,
    selector
}: {
    browserPage: Page | Frame;
    elementHandles?: ElementHandle[];
    selector?: string;
}) {
    try {
        if (!browserPage) throw new Error('浏览器页面对象不能为空');
        if (!elementHandles && !selector) throw new Error('元素数组和选择器至少需要提供一个');

        let result;
        let targetElements = elementHandles;

        // 如果没有提供element但提供了selector，则先查找元素
        if (!targetElements && selector) {
            selector = toSelector(selector);
            targetElements = await browserPage.$$(selector);
        }
        if(!targetElements){
            throw new Error('未找到要删除的元素');
        }
        let removedCount = 0;
        for (const element of targetElements) {
            const result = await browserPage.evaluate((element) => {
                try {
                    if (element && element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                    return {
                        success: true,
                    };
                } catch (error: any) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }, element);
            if (result.success) {
                removedCount++;
            }
        }
        return { removedCount: removedCount };

    } catch (error) {
        console.error('批量移除元素失败:', error);
        throw error;
    }
}; 