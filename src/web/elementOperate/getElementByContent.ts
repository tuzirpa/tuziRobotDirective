import { ElementHandle, Frame, Page, JSHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { isXpath, toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.elementOperate.getElementByContent',
    sort: 3,
    displayName: '通过内容匹配元素',
    icon: 'icon-web-search',
    isControl: false,
    isControlEnd: false,
    description: '在页面中查找包含指定内容的元素，支持多种过滤条件',
    comment: '在页面${browserPage}中查找包含内容${content}的元素，根据${filterType}过滤条件${filterValue}筛选元素，保存到${element}',
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
        parentElement: {
            name: 'parentElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '父级元素',
                type: 'variable',
                required: false,
                placeholder: '不填默认在整个页面中查找 支持元素传入 也支持 选择器(css,xpath)'
            }
        },
        content: {
            name: 'content',
            value: '',
            display: '',
            type: 'object',
            addConfig: {
                required: true,
                label: '要匹配的内容',
                type: 'textarea',
                placeholder: '请输入要匹配的文本内容'
            }
        },
        matchType: {
            name: 'matchType',
            value: 'contains',
            type: 'string',
            addConfig: {
                required: true,
                label: '匹配方式',
                type: 'select',
                options: [
                    { label: '包含', value: 'contains' },
                    { label: '完全匹配', value: 'exact' },
                    { label: '正则匹配', value: 'regex' }
                ]
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
    content,
    matchType,
    parentElement
}: {
    browserPage: Page | Frame;
    content: string;
    matchType: string;
    parentElement?: ElementHandle<Element> | string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!content) {
            throw new Error('匹配内容不能为空');
        }

        // 在页面中执行元素查找
        let matchingElements;
        if(typeof parentElement === 'string'){
            parentElement = toSelector(parentElement);
            parentElement = await browserPage.$(parentElement) || undefined;
        }
        parentElement = parentElement || await browserPage.evaluateHandle(() => document.body);
   
        const result = await browserPage.evaluateHandle((ele, content, matchType) => {
            function getTextNodesUnderParent(parentElement: Element) {
                const textNodes: Node[] = [];
            
                const walkNodes = (node: Node) => {
                    node.childNodes.forEach(child => {
                        if (child.nodeType === Node.TEXT_NODE) {
                            textNodes.push(child);
                        } else if (child.nodeType === Node.ELEMENT_NODE) {
                            walkNodes(child);
                        }
                    });
                };
            
                walkNodes(parentElement);
                return textNodes;
            }

            //循环获取所有文本节点
            const textNodes = getTextNodesUnderParent(ele);
            
            for (const node of textNodes) {
                const text = node.textContent;
                if (node.parentElement && text) {
                    let isMatch = false;
                    
                    if (matchType === 'contains') {
                        isMatch = text.includes(content);
                    } else if (matchType === 'exact') {
                        isMatch = text === content;
                    } else if (matchType === 'regex') {
                        try {
                            isMatch = new RegExp(content).test(text);
                        } catch (e) {
                            console.error('正则表达式错误:', e);
                        }
                    }

                    if (isMatch) {
                        return node.parentElement;
                    }
                }
            }

            return null;
        }, parentElement, content, matchType);

        const element = result.asElement();
        
        if (element) {
            return { element };
        }

        throw new Error(`未找到匹配的元素 匹配方式：${matchType} 匹配内容：${content}`);

    } catch (error: any) {
        console.error('查找元素失败:', error);
        throw new Error(`查找元素失败: ${error.message || '未知错误'}`);
    }
}; 