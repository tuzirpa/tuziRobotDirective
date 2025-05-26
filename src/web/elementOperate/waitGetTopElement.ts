import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { isXpath, toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.elementOperate.waitGetTopElement',
    sort: 3,
    displayName: '等待选择器获取顶层元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中获取选择器${selector}匹配的最顶层元素，保存到${element}',
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
        checkVisibility: {
            name: 'checkVisibility',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '检查可见性',
                type: 'select',
                options: [
                    { label: '是-检查宽高、display和visibility', value: 'true' },
                    { label: '否', value: 'false' }
                ],
                defaultValue: 'true'
            }
        },
        checkOnTop: {
            name: 'checkOnTop',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '检查是否在最上层',
                type: 'select',
                options: [
                    { label: '是-包含检测在视口内', value: 'true' },
                    { label: '否', value: 'false' }
                ],
                defaultValue: 'true'
            }
        },
        index: {
            name: 'index',
            value: '',
            type: 'number',
            addConfig: {
                label: '索引',
                type: 'string',
                placeholder: '请输入索引 默认0(第一个)',
                defaultValue: '0'
            }
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '等待出现的超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待超时时间'
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
    checkVisibility = true,
    checkOnTop = true,
    index = 0,
    timeout
}: {
    browserPage: Page | Frame;
    selector: string;
    checkVisibility?: boolean;
    checkOnTop?: boolean;
    index?: number;
    timeout?: number
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        timeout = timeout??30;
        // 转换XPath选择器
        const isXPath = isXpath(selector);
        
        // 在页面中执行元素过滤函数
        const filteredElement = await browserPage.waitForFunction(({
            selector,
            isXPath,
            checkVisibility,
            checkOnTop,
            index
        }) => {
            // 检查元素的可见性
            function isVisible(element: Element): boolean {
                const rect = element.getBoundingClientRect();
                return (
                    rect.width > 0 &&
                    rect.height > 0 &&
                    window.getComputedStyle(element).display !== 'none' &&
                    window.getComputedStyle(element).visibility !== 'hidden'
                );
            }

            // 判断元素是否在最上层
            function isOnTop(element: Element): boolean {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // 确保中心点在视口内
                if (centerX < 0 || centerY < 0 || centerX > window.innerWidth || centerY > window.innerHeight) {
                    return false;
                }
                
                const topElement = document.elementFromPoint(centerX, centerY);
                return element === topElement || element.contains(topElement);
            }

            // 根据选择器获取元素
            let elements: Element[];
            if (isXPath) {
                const result = document.evaluate(
                    selector,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );
                elements = [];
                for (let i = 0; i < result.snapshotLength; i++) {
                    const node = result.snapshotItem(i);
                    if (node instanceof Element) {
                        elements.push(node);
                    }
                }
            } else {
                elements = Array.from(document.querySelectorAll(selector));
            }
            console.log('获取顶层 elements', elements,checkVisibility,checkOnTop);
            // 过滤元素
            const filteredElements = elements.filter(element => {
                return (!checkVisibility || isVisible(element)) && (!checkOnTop || isOnTop(element));
            });

            console.log('获取顶层 filteredElements', filteredElements);
            // 返回指定索引的元素
            const result = filteredElements.length > 0 ? filteredElements[index] : null;
            console.log('获取顶层 result', result);
            return result;
        }, {
            timeout: timeout * 1000
        },{
            selector,
            isXPath,
            checkVisibility,
            checkOnTop,
            index
        });
        console.log('获取顶层 result', filteredElement);
        if (!filteredElement.asElement()) {
            console.log(`未找到匹配选择器 ${selector} 的可见顶层元素`);
            return { element: null };
        }
        
        return { element: filteredElement };

    } catch (error) {
        console.error('获取顶层元素失败:', error);
        throw error;
    }
};