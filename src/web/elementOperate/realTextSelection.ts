import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.realTextSelection',
    sort: 9,
    displayName: '真实文本选中',
    icon: 'icon-text-select-real',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中，在元素${elementHandle}或${selector},选中${selectionType === "all" ? "全部" : "起始偏移量为 " + startOffset + " ,结束偏移量为 " + endOffset } 范围的文本内容，保存到变量${selectedText}中。',
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
                label: '选择器',
                placeholder: '请输入 CSS 或 XPath 选择器',
                type: 'string',
                tip: '支持 CSS 或 XPath 选择器'
            }
        },
        selectionType: {
            name: 'selectionType',
            value: 'all',
            type: 'string',
            addConfig: {
                label: '选中范围',
                type: 'select',
                options: [
                    { label: '全选', value: 'all' },
                    { label: '部分选中', value: 'partial' }
                ],
                defaultValue: 'all'
            }
        },
        startOffset: {
            name: 'startOffset',
            value: '0',
            type: 'number',
            addConfig: {
                type: 'string',
                label: '起始位置',
                placeholder: '请输入起始偏移量',
                filters: 'this.inputs.selectionType.value === "partial"'
            }
        },
        endOffset: {
            name: 'endOffset',
            value: '0',
            type: 'number',
            addConfig: {
                type: 'string',
                label: '结束位置',
                placeholder: '请输入结束偏移量',
                filters: 'this.inputs.selectionType.value === "partial"'
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
    selectionType,
    startOffset,
    endOffset
}: {
    browserPage: Page | Frame;
    elementHandle: ElementHandle | null;
    selector: string;
    selectionType: string;
    startOffset: string;
    endOffset: string;
}) {
    try {
        if (!browserPage) throw new Error('浏览器页面对象不能为空');

        let el: ElementHandle | null = elementHandle;

        // 元素查找逻辑
        if (!el && selector) {
            selector = toSelector(selector);
            el = await browserPage.$(selector);
        }

        if (!el) throw new Error('未找到指定元素');

        // 执行真实选中操作
        const result = await browserPage.evaluate(async (element, config) => {
            // 安全获取原始选区
            const selection = window.getSelection();
            let originalSelection: Range | null = null;
            
            // 检查是否存在有效选区
            if (selection && selection.rangeCount > 0) {
                originalSelection = selection.getRangeAt(0);
            }

            try {
                // 处理不同元素类型
                if (element instanceof HTMLInputElement || 
                    element instanceof HTMLTextAreaElement) {
                    element.select();
                } else {
                    const range = document.createRange();
                    
                    if (config.selectionType === 'all') {
                        range.selectNodeContents(element);
                    } else {
                        const start = Math.min(config.startOffset, element.textContent?.length || 0);
                        const end = Math.min(config.endOffset, element.textContent?.length || 0);
                        range.setStart(element.firstChild || element, start);
                        range.setEnd(element.lastChild || element, end);
                    }

                    selection?.removeAllRanges();
                    selection?.addRange(range);
                }

                // 触发选中样式
                document.dispatchEvent(new Event('selectionchange', { bubbles: true }));

                return {
                    success: true,
                    selectedText: window.getSelection()?.toString() || ''
                };
            } finally {
                // 安全恢复原始选区
                // if (originalSelection && selection) {
                //     selection.removeAllRanges();
                //     try {
                //         selection.addRange(originalSelection);
                //     } catch (err) {
                //         console.warn('恢复选区时发生错误:', err);
                //     }
                // }
            }
        }, el, {
            selectionType,
            startOffset: parseInt(startOffset),
            endOffset: parseInt(endOffset)
        });

        if (!result.success) throw new Error('未能成功选中元素内容');

        return { selectedText: result.selectedText };

    } catch (error) {
        console.error('文本选中失败:', error);
        throw error;
    }
}; 