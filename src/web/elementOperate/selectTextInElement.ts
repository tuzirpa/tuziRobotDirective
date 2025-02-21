import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.selectTextInElement',
    sort: 10,
    displayName: '选中元素中的文本',
    icon: 'icon-text-select',
    isControl: false,
    isControlEnd: false,
    comment: '在元素${elementHandle || selector}中选中文本"${targetText}"',
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
        elementHandle: {
            name: 'elementHandle',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                placeholder: '请输入元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                tip: '直接传入元素对象'
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
        targetText: {
            name: 'targetText',
            value: '',
            type: 'string',
            addConfig: {
                label: '目标文本',
                placeholder: '请输入要选中的文本',
                type: 'textarea',
                required: true
            }
        }
    },
    outputs: {
        selectedText: {
            name: 'selectedText',
            type: 'string',
            display: '选中的文本内容',
            addConfig: {
                label: '选中文本',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    elementHandle,
    selector,
    targetText
}: {
    browserPage: Page | Frame;
    elementHandle?: ElementHandle;
    selector?: string;
    targetText: string;
}) {
    try {
        if (!browserPage) throw new Error('浏览器页面对象不能为空');
        if (!targetText) throw new Error('目标文本不能为空');

        let el = elementHandle;

        // 如果没有传入元素对象，尝试通过选择器查找
        if (!el && selector) {
            if (selector.startsWith('//')) {
                selector = `::-p-xpath(${selector})`;
            }
            const foundElement = await browserPage.$(selector);
            if (!foundElement) {
                throw new Error('未找到指定元素');
            }
            el = foundElement;
        }

        if (!el) {
            throw new Error('未找到指定元素，请检查元素对象或选择器是否正确');
        }

        const result = await browserPage.evaluate(async (element, text) => {
            // 获取所有文本节点
            function getTextNodes(node: Node): Text[] {
                const textNodes: Text[] = [];
                const walker = document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT,
                    null
                );

                let currentNode;
                while (currentNode = walker.nextNode()) {
                    textNodes.push(currentNode as Text);
                }
                return textNodes;
            }

            // 在文本节点中查找目标文本
            function findTextInNodes(textNodes: Text[], searchText: string) {
                let totalOffset = 0;
                for (let i = 0; i < textNodes.length; i++) {
                    const node = textNodes[i];
                    const content = node.textContent || '';
                    const index = content.indexOf(searchText);
                    
                    if (index !== -1) {
                        return {
                            startNode: node,
                            startOffset: index,
                            endNode: node,
                            endOffset: index + searchText.length
                        };
                    }
                    totalOffset += content.length;
                }
                return null;
            }

            try {
                const selection = window.getSelection();
                if (!selection) throw new Error('无法获取选择器对象');

                const textNodes = getTextNodes(element);
                const position = findTextInNodes(textNodes, text);

                if (!position) {
                    throw new Error(`未在元素中找到文本："${text}"`);
                }

                // 创建新的选区
                const range = document.createRange();
                range.setStart(position.startNode, position.startOffset);
                range.setEnd(position.endNode, position.endOffset);

                // 应用选区
                selection.removeAllRanges();
                selection.addRange(range);

                // 触发选中事件
                document.dispatchEvent(new Event('selectionchange', { bubbles: true }));

                return {
                    success: true,
                    selectedText: selection.toString()
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }, el, targetText);

        if (!result.success) {
            throw new Error(result.error);
        }

        return { selectedText: result.selectedText };

    } catch (error) {
        console.error('选中文本失败:', error);
        throw error;
    }
}; 