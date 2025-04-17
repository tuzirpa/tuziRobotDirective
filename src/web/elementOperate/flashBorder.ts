import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';
export const config: DirectiveTree = {
    name: 'web.elementOperate.flashBorder',
    sort: 7,
    displayName: '给元素边框闪烁',
    icon: 'icon-flash-border',
    isControl: false,
    isControlEnd: false,
    
    comment: '在指定的页面对象${browserPage}中, 对特定元素的边框进行闪烁操作。选择器为${selector}，边框颜色为${borderColor}。',
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
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持 CSS 或 XPath 选择器'
            }
        },
        borderColor: {
            name: 'borderColor',
            value: 'red',
            type: 'string',
            addConfig: {
                label: '边框颜色',
                placeholder: '请输入边框颜色',
                type: 'string'
            }
        },
        duration: {
            name: 'duration',
            value: '1000',
            type: 'string',
            addConfig: {
                label: '闪烁持续时间 (毫秒)',
                placeholder: '请输入闪烁持续时间',
                type: 'string'
            }
        },
        repeatCount: {
            name: 'repeatCount',
            value: '5',
            type: 'string',
            addConfig: {
                label: '闪烁次数',
                placeholder: '请输入闪烁次数',
                type: 'string'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    elementHandle,
    selector,
    borderColor,
    duration,
    repeatCount
}: {
    browserPage: Page | Frame;
    elementHandle: ElementHandle | null; // 元素对象
    selector: string; // CSS 或 XPath 选择器
    borderColor: string; // 边框颜色
    duration: string; // 闪烁持续时间
    repeatCount: string; // 闪烁次数
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        let el: ElementHandle | null = elementHandle;

        // 如果没有传入元素对象，则尝试使用选择器查找元素
        if (!el && selector) {
            // 转换XPath选择器
            selector = toSelector(selector);

            // 尝试使用 CSS 选择器查找元素
            el = await browserPage.$(selector); // 使用 Puppeteer 的 $ 方法
           
        }

        if (!el) {
            throw new Error('未找到指定的元素');
        }

        // 在页面上下文中给元素边框闪烁
        await browserPage.evaluate(async (el, color, dur, count) => {
            const element = el as HTMLElement;
            const originalBorder = element.style.border;
            let isFlashing = true;
            let flashes = 0;

            const flash = async () => {
                if (flashes < count) {
                    element.style.border = `2px solid ${color}`;
                    await new Promise(resolve => setTimeout(resolve, parseInt(dur)));
                    element.style.border = originalBorder;
                    await new Promise(resolve => setTimeout(resolve, parseInt(dur)));
                    flashes++;
                    await flash(); // 递归调用
                } else {
                    isFlashing = false;
                }
            };

            await flash(); // 开始闪烁

            // 恢复原始边框
            element.style.border = originalBorder;

        }, el, borderColor, duration, parseInt(repeatCount));

    } catch (error) {
        console.error('给元素边框闪烁失败:', error);
        throw error;
    }
}; 